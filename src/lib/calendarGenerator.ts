import type {
  MeetingSeries,
  MeetingException,
  BlackoutDate,
  CalendarEvent,
  TeamCalendar,
} from '@/types/app';

export interface GeneratedScheduleEvent extends CalendarEvent {
  series_id?: string;
  rule_id?: string;
  is_recurring?: boolean;
  venue?: string;
  zoom_link?: string;
  location_address?: string;
  is_modified?: boolean;
  is_blackout?: boolean;
  original_date?: string;
  reason?: string;
}

/**
 * Calculates the ISO cutoff date (YYYY-MM-01) for the first day of two months prior.
 */
export function getTwoMonthsPriorCutoff(baseDate: Date = new Date()): string {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const cutoff = new Date(year, month - 2, 1);
  const cutoffYear = cutoff.getFullYear();
  const cutoffMonth = String(cutoff.getMonth() + 1).padStart(2, '0');
  return `${cutoffYear}-${cutoffMonth}-01`;
}

/**
 * Prunes one-time meeting series, exceptions, blackout dates, and legacy events
 * older than the 2-month prior cutoff.
 * Also checks if flyer_uploaded_at is older than 60 days, and if so clears image_url.
 */
export function pruneCalendarData(calendar: Partial<TeamCalendar>): Partial<TeamCalendar> {
  const cutoff = getTwoMonthsPriorCutoff();

  const recurringRules = (calendar.recurring_rules || []).filter((series) => {
    if (series.frequency === 'once') {
      return !series.date || series.date >= cutoff;
    }
    return true;
  });

  const exceptions = (calendar.exceptions || []).filter((ex) => {
    const checkDate = ex.new_date || ex.original_date;
    return !checkDate || checkDate >= cutoff;
  });

  const blackoutDates = (calendar.blackout_dates || []).filter((b) => {
    return !b.date || b.date >= cutoff;
  });

  const events = (calendar.events || []).filter((e) => {
    return !e.date || e.date >= cutoff;
  });

  let imageUrl = calendar.image_url;
  let flyerUploadedAt = calendar.flyer_uploaded_at;
  if (calendar.flyer_uploaded_at) {
    const flyerAgeMs = Date.now() - new Date(calendar.flyer_uploaded_at).getTime();
    if (flyerAgeMs > 60 * 24 * 60 * 60 * 1000) {
      imageUrl = { en: '', bm: '', cn: '', ta: '' };
      flyerUploadedAt = undefined;
    }
  }

  return {
    ...calendar,
    recurring_rules: recurringRules,
    exceptions,
    blackout_dates: blackoutDates,
    events,
    image_url: imageUrl,
    flyer_uploaded_at: flyerUploadedAt,
  };
}

/**
 * Helper to get active daily meeting rules formatted as GeneratedScheduleEvent objects
 */
export function getActiveDailyMeetings(
  calendar: TeamCalendar | null | undefined
): GeneratedScheduleEvent[] {
  if (!calendar || !calendar.recurring_rules) return [];
  return calendar.recurring_rules
    .filter((series) => series.is_active && series.frequency === 'daily')
    .map((series) => {
      const isHttp = series.address_or_link?.startsWith('http');
      const zoomLink = series.zoom_link || (isHttp ? series.address_or_link : '');
      const locationAddress = series.location_address || (!isHttp ? series.address_or_link : '');

      return {
        id: `daily-${series.id}`,
        series_id: series.id,
        rule_id: series.id,
        date: '',
        time: series.time,
        title: { en: series.title, bm: series.title, cn: series.title, ta: series.title },
        speaker: series.speaker || '',
        venue: series.venue || '',
        zoom_link: zoomLink,
        location_address: locationAddress,
        location_or_link: series.address_or_link || zoomLink || locationAddress || '',
        description: series.description || '',
        image_url: series.image_url || '',
        is_recurring: true,
      };
    });
}

/**
 * Expands active meeting series for a given year & month (1-indexed),
 * applies schedule overrides & blackout dates, merges events, and sorts.
 */
export function generateMonthSchedule(
  year: number,
  month: number,
  meetingSeries: MeetingSeries[] = [],
  blackoutDates: BlackoutDate[] = [],
  oneOffEvents: CalendarEvent[] = [],
  exceptions: MeetingException[] = [],
  options?: { excludeDaily?: boolean }
): GeneratedScheduleEvent[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule: GeneratedScheduleEvent[] = [];
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const excludeDaily = Boolean(options?.excludeDaily);

  const exceptionMap = new Map<string, MeetingException>();
  for (const ex of exceptions) {
    exceptionMap.set(`${ex.series_id}::${ex.original_date}`, ex);
  }

  // 1. Expand recurring & once rules for each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const nthWeek = Math.floor((day - 1) / 7) + 1;
    const isLastNthWeek = day + 7 > daysInMonth;

    for (const series of meetingSeries) {
      if (!series.is_active) continue;
      if (excludeDaily && series.frequency === 'daily') continue;

      let matchesDay = false;
      if (series.frequency === 'once') {
        matchesDay = series.date === dateStr;
      } else if (series.frequency === 'daily') {
        matchesDay = true;
      } else if (series.frequency === 'weekly') {
        matchesDay = series.day_of_week === dayOfWeek;
      } else if (series.frequency === 'monthly_nth_weekday') {
        matchesDay =
          series.day_of_week === dayOfWeek &&
          (series.nth_week === nthWeek || (series.nth_week === 5 && isLastNthWeek));
      } else if (series.frequency === 'monthly_date') {
        matchesDay = series.day_of_month === day;
      }

      if (!matchesDay) continue;

      const exception =
        exceptionMap.get(`${series.id}::${dateStr}`) ||
        exceptionMap.get(`all::${dateStr}`);

      if (exception?.action === 'cancel') continue;
      if (exception?.action === 'modify' && exception.new_date && exception.new_date !== dateStr) {
        continue;
      }

      const isBlackedOut = blackoutDates.some((b) => {
        if (b.date !== dateStr) return false;
        return !b.rule_id || b.rule_id === 'all' || b.rule_id === series.id;
      });
      if (isBlackedOut) continue;

      const titleEn = exception?.new_title || series.title;

      const seriesHttp = series.address_or_link?.startsWith('http');
      const defaultZoom = series.zoom_link || (seriesHttp ? series.address_or_link : '');
      const defaultLoc = series.location_address || (!seriesHttp ? series.address_or_link : '');

      const zoomLink = exception?.new_zoom_link !== undefined ? exception.new_zoom_link : defaultZoom;
      const locationAddress = exception?.new_location_address !== undefined ? exception.new_location_address : defaultLoc;

      const resolvedLocOrLink =
        exception?.new_address_or_link !== undefined
          ? exception.new_address_or_link
          : series.address_or_link || zoomLink || locationAddress || '';

      schedule.push({
        id: `rec-${series.id}-${dateStr}`,
        series_id: series.id,
        rule_id: series.id,
        date: dateStr,
        time: exception?.new_time || series.time,
        title: { en: titleEn, bm: titleEn, cn: titleEn, ta: titleEn },
        speaker: exception?.new_speaker !== undefined ? exception.new_speaker : series.speaker || '',
        venue: exception?.new_venue !== undefined ? exception.new_venue : series.venue || '',
        zoom_link: zoomLink,
        location_address: locationAddress,
        location_or_link: resolvedLocOrLink,
        description:
          exception?.new_description !== undefined ? exception.new_description : series.description || '',
        image_url:
          exception?.new_image_url !== undefined ? exception.new_image_url : series.image_url || '',
        is_recurring: series.frequency !== 'once',
        is_modified: Boolean(exception),
        original_date: dateStr,
        reason: exception?.reason,
      });
    }
  }

  // 2. Add rescheduled instances that were moved INTO this month
  for (const ex of exceptions) {
    if (ex.action !== 'modify' || !ex.new_date || !ex.new_date.startsWith(monthPrefix)) {
      continue;
    }
    if (ex.new_date === ex.original_date) {
      continue;
    }

    const parentSeries = meetingSeries.find((s) => s.id === ex.series_id);
    const baseTitle = ex.new_title || parentSeries?.title || 'Rescheduled Meeting';
    const baseSpeaker = ex.new_speaker !== undefined ? ex.new_speaker : parentSeries?.speaker || '';
    const baseVenue = ex.new_venue !== undefined ? ex.new_venue : parentSeries?.venue || '';
    const parentHttp = parentSeries?.address_or_link?.startsWith('http');
    const zoomLink =
      ex.new_zoom_link !== undefined
        ? ex.new_zoom_link
        : parentSeries?.zoom_link || (parentHttp ? parentSeries?.address_or_link : '');
    const locationAddress =
      ex.new_location_address !== undefined
        ? ex.new_location_address
        : parentSeries?.location_address || (!parentHttp ? parentSeries?.address_or_link : '');
    const baseLink =
      ex.new_address_or_link !== undefined
        ? ex.new_address_or_link
        : parentSeries?.address_or_link || zoomLink || locationAddress || '';
    const baseDesc =
      ex.new_description !== undefined ? ex.new_description : parentSeries?.description || '';
    const baseImg = ex.new_image_url !== undefined ? ex.new_image_url : parentSeries?.image_url || '';

    schedule.push({
      id: `mod-${ex.id}-${ex.new_date}`,
      series_id: ex.series_id,
      rule_id: ex.series_id,
      date: ex.new_date,
      time: ex.new_time || parentSeries?.time || '',
      title: {
        en: baseTitle,
        bm: baseTitle,
        cn: baseTitle,
        ta: baseTitle,
      },
      speaker: baseSpeaker,
      venue: baseVenue,
      zoom_link: zoomLink,
      location_address: locationAddress,
      location_or_link: baseLink,
      description: baseDesc,
      image_url: baseImg,
      is_recurring: true,
      is_modified: true,
      original_date: ex.original_date,
      reason: ex.reason,
    });
  }

  // 3. Merge legacy one-off events occurring in this month
  for (const evt of oneOffEvents) {
    if (evt.date && evt.date.startsWith(monthPrefix)) {
      const isHttp = evt.location_or_link?.startsWith('http');
      schedule.push({
        ...evt,
        zoom_link: evt.zoom_link || (isHttp ? evt.location_or_link : ''),
        location_address: evt.location_address || (!isHttp ? evt.location_or_link : ''),
        is_recurring: false,
      });
    }
  }

  // 4. Sort chronologically by date then time
  schedule.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return (a.time || '').localeCompare(b.time || '');
  });

  return schedule;
}

/**
 * Convenient wrapper from a TeamCalendar object
 */
export function getEventsForCalendar(
  calendar: TeamCalendar | null | undefined,
  year: number,
  month: number,
  options?: { excludeDaily?: boolean }
): GeneratedScheduleEvent[] {
  if (!calendar) return [];
  return generateMonthSchedule(
    year,
    month,
    calendar.recurring_rules || [],
    calendar.blackout_dates || [],
    calendar.events || [],
    calendar.exceptions || [],
    options
  );
}

/**
 * Time-awareness and formatting helpers
 */

function parseSingleTimeTo24h(str: string): { hour: number; minute: number; str24: string } | null {
  if (!str) return null;
  const match = str.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const str24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { hour, minute, str24 };
}

/**
 * Parses time range string (e.g. "8:00 PM - 9:30 PM" or "20:00 - 21:30") into 24h { start, end }.
 */
export function parseTimeRangeTo24h(timeStr?: string): { start: string; end: string } {
  if (!timeStr || !timeStr.trim()) {
    return { start: '', end: '' };
  }
  const parts = timeStr.trim().split(/\s*(?:-|–|—|\bto\b)\s*/i);
  const startObj = parts[0] ? parseSingleTimeTo24h(parts[0]) : null;
  const endObj = parts[1] ? parseSingleTimeTo24h(parts[1]) : null;

  return {
    start: startObj ? startObj.str24 : '',
    end: endObj ? endObj.str24 : '',
  };
}

function formatSingleTime12h(time24: string): string {
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  if (isNaN(hour)) return time24;

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${min} ${period}`;
}

/**
 * Formats 24h start/end into clean 12h AM/PM range e.g. "8:00 PM - 9:30 PM".
 */
export function formatTimeRange(start24: string, end24?: string): string {
  if (!start24 || !start24.trim()) return '';
  const formattedStart = formatSingleTime12h(start24.trim());
  if (end24 && end24.trim()) {
    const formattedEnd = formatSingleTime12h(end24.trim());
    return `${formattedStart} - ${formattedEnd}`;
  }
  return formattedStart;
}

/**
 * Checks if a meeting has passed based on dateStr and timeStr compared to now.
 * - Date < todayIso: passed (true)
 * - Date > todayIso: upcoming (false)
 * - Date === todayIso (or empty date for today's daily): checks time range.
 */
export function hasMeetingPassed(
  dateStr: string,
  timeStr?: string,
  now: Date = new Date()
): boolean {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayIso = `${year}-${month}-${day}`;

  if (dateStr && dateStr < todayIso) return true;
  if (dateStr && dateStr > todayIso) return false;

  // When dateStr === todayIso or !dateStr (e.g. daily meeting checked for today)
  if (!timeStr || !timeStr.trim()) return false;

  const parsed = parseTimeRangeTo24h(timeStr);
  let targetMinutes: number;

  if (parsed.end) {
    const [h, m] = parsed.end.split(':').map((v) => parseInt(v, 10));
    targetMinutes = h * 60 + m;
  } else if (parsed.start) {
    const [h, m] = parsed.start.split(':').map((v) => parseInt(v, 10));
    // Start time + 60 min buffer
    targetMinutes = h * 60 + m + 60;
  } else {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes > targetMinutes;
}

/**
 * Divides generated events into:
 * 1) The next 2 upcoming meetings (from today's date forward, filtering out passed meetings)
 * 2) The rest of the meetings for this month
 */
export function splitUpcomingMeetings(
  events: GeneratedScheduleEvent[],
  todayIsoDate: string,
  now: Date = new Date()
): {
  nextTwo: GeneratedScheduleEvent[];
  remaining: GeneratedScheduleEvent[];
} {
  const upcoming = events.filter(
    (e) => e.date >= todayIsoDate && !hasMeetingPassed(e.date, e.time, now)
  );
  const nextTwo = upcoming.slice(0, 2);
  const remaining = upcoming.slice(2);
  return { nextTwo, remaining };
}

/**
 * Unpacks any packed metadata from events JSONB if database columns were not migrated.
 */
export function unpackCalendar(cal: TeamCalendar): TeamCalendar {
  const meta = (cal.events || []).find((e) => e.id === '_meta_calendar');
  const cleanEvents = (cal.events || []).filter((e) => e.id !== '_meta_calendar');
  if (meta && meta.description) {
    try {
      const parsed = JSON.parse(meta.description);
      return {
        ...cal,
        events: cleanEvents,
        recurring_rules:
          cal.recurring_rules && cal.recurring_rules.length > 0
            ? cal.recurring_rules
            : parsed.recurring_rules || [],
        exceptions:
          cal.exceptions && cal.exceptions.length > 0 ? cal.exceptions : parsed.exceptions || [],
        blackout_dates:
          cal.blackout_dates && cal.blackout_dates.length > 0
            ? cal.blackout_dates
            : parsed.blackout_dates || [],
        default_view: cal.default_view || parsed.default_view || 'dynamic',
        last_reviewed_month: cal.last_reviewed_month || parsed.last_reviewed_month || '',
      };
    } catch {
      // ignore
    }
  }
  return {
    ...cal,
    events: cleanEvents,
  };
}

