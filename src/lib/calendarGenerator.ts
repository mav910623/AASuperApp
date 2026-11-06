import type { RecurringRule, BlackoutDate, CalendarEvent, TeamCalendar } from '@/types/app';

export interface GeneratedScheduleEvent extends CalendarEvent {
  is_recurring?: boolean;
  rule_id?: string;
  venue?: string;
}

/**
 * Expands active recurring rules for a given year & month (1-indexed, e.g. 11 for Nov),
 * applies blackout dates, merges one-off events, and sorts chronologically.
 */
export function generateMonthSchedule(
  year: number,
  month: number, // 1 to 12
  recurringRules: RecurringRule[] = [],
  blackoutDates: BlackoutDate[] = [],
  oneOffEvents: CalendarEvent[] = []
): GeneratedScheduleEvent[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule: GeneratedScheduleEvent[] = [];
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  // 1. Expand recurring rules for each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const nthWeek = Math.floor((day - 1) / 7) + 1; // 1 to 5

    for (const rule of recurringRules) {
      if (!rule.is_active) continue;

      let matchesDay = false;
      if (rule.frequency === 'daily') {
        matchesDay = true;
      } else if (rule.frequency === 'weekly') {
        matchesDay = rule.day_of_week === dayOfWeek;
      } else if (rule.frequency === 'monthly_nth_weekday') {
        matchesDay = rule.day_of_week === dayOfWeek && rule.nth_week === nthWeek;
      }

      if (!matchesDay) continue;

      // Check if this date/rule is blacked out
      const isBlackedOut = blackoutDates.some((b) => {
        if (b.date !== dateStr) return false;
        return !b.rule_id || b.rule_id === 'all' || b.rule_id === rule.id;
      });

      if (isBlackedOut) continue;

      schedule.push({
        id: `rec-${rule.id}-${dateStr}`,
        date: dateStr,
        time: rule.time,
        title: {
          en: rule.title,
          bm: rule.title,
          cn: rule.title,
          ta: rule.title,
        },
        speaker: rule.speaker || '',
        venue: rule.venue || '',
        location_or_link: rule.address_or_link || '',
        description: rule.description || '',
        image_url: rule.image_url || '',
        is_recurring: true,
        rule_id: rule.id,
      });
    }
  }

  // 2. Merge one-off events occurring in this month
  for (const evt of oneOffEvents) {
    if (evt.date && evt.date.startsWith(monthPrefix)) {
      schedule.push({
        ...evt,
        is_recurring: false,
      });
    }
  }

  // 3. Sort chronologically by date then time
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
  month: number
): GeneratedScheduleEvent[] {
  if (!calendar) return [];
  return generateMonthSchedule(
    year,
    month,
    calendar.recurring_rules || [],
    calendar.blackout_dates || [],
    calendar.events || []
  );
}
