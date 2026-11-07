'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Download,
  Share2,
  Video,
  MapPin,
  Clock,
  Eye,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TeamCalendar } from '@/types/app';
import {
  getEventsForCalendar,
  splitUpcomingMeetings,
  getActiveDailyMeetings,
  type GeneratedScheduleEvent,
} from '@/lib/calendarGenerator';
import { ImageLightbox } from '@/components/ImageLightbox';
import { EventDetailsModal } from '@/components/EventDetailsModal';

interface CalendarTabProps {
  calendar: TeamCalendar;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ calendar }: CalendarTabProps) {
  const { t, getLocalized } = useApp();

  // Locked to Current Month Only
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const todayDayNum = now.getDate();
  const todayIsoDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(todayDayNum).padStart(2, '0')}`;

  const [activeView, setActiveView] = useState<'dynamic' | 'flyer'>(
    calendar?.default_view || 'dynamic'
  );

  // Day drawer/modal state
  const [dayDrawerDate, setDayDrawerDate] = useState<string | null>(null);

  // Meeting details modal
  const [selectedEvent, setSelectedEvent] = useState<GeneratedScheduleEvent | null>(null);

  // Lightbox for monthly flyer
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Accordion state for remaining meetings
  const [showRemainingAccordion, setShowRemainingAccordion] = useState(false);

  const monthLabel = getLocalized(calendar?.month_label) || t('upcoming_events', 'Team Calendar');
  const imageUrl = getLocalized(calendar?.image_url);

  // Generate schedule for the locked current year/month (excluding daily from grid spam)
  const monthlyEvents = useMemo(() => {
    return getEventsForCalendar(calendar, currentYear, currentMonth, { excludeDaily: true });
  }, [calendar, currentYear, currentMonth]);

  // Active Daily meetings highlighted separately
  const dailyMeetings = useMemo(() => {
    return getActiveDailyMeetings(calendar);
  }, [calendar]);

  // Group events by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, GeneratedScheduleEvent[]> = {};
    for (const ev of monthlyEvents) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [monthlyEvents]);

  // Split upcoming 2 meetings & remaining meetings
  const { nextTwo, remaining } = useMemo(() => {
    return splitUpcomingMeetings(monthlyEvents, todayIsoDate);
  }, [monthlyEvents, todayIsoDate]);

  // Grid calculation: days in month, starting day of week
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun

  const handleShareFlyer = () => {
    const shareText = `${monthLabel}\n\n${t('share_flyer', 'Check out our monthly team calendar and upcoming events:')}\n${imageUrl || (typeof window !== 'undefined' ? window.location.href : '')}`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  };

  const handleDownloadFlyer = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Day drawer events: include active daily meetings for that specific date (unless blacked out)
  const dayDrawerEvents = useMemo(() => {
    if (!dayDrawerDate) return [];
    const dateEvents = eventsByDate[dayDrawerDate] || [];

    const activeDailyForDay = dailyMeetings.filter((dm) => {
      const isBlackedOut = (calendar?.blackout_dates || []).some((b) => {
        if (b.date !== dayDrawerDate) return false;
        return !b.rule_id || b.rule_id === 'all' || b.rule_id === dm.series_id;
      });
      return !isBlackedOut;
    }).map((dm) => ({ ...dm, date: dayDrawerDate }));

    return [...activeDailyForDay, ...dateEvents];
  }, [dayDrawerDate, eventsByDate, dailyMeetings, calendar]);

  return (
    <div className="w-full space-y-5 px-4 py-4 animate-in fade-in duration-200">
      {/* Top Toggle: Live Calendar vs Monthly Flyer */}
      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveView('dynamic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'dynamic'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-amber-500" />
          <span>📅 Live Calendar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('flyer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'flyer'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span className="text-base leading-none">🖼️</span>
          <span>Monthly Flyer</span>
        </button>
      </div>

      {activeView === 'dynamic' && (
        <div className="space-y-4">
          {/* Current Month Header (Locked to Current Month Only) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Current month schedule • {monthlyEvents.length} meetings
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Active Schedule
            </span>
          </div>

          {/* Dedicated Daily Meetings Highlight Card (Prevents grid & accordion overcrowding) */}
          {dailyMeetings.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-zinc-900 dark:to-orange-950/30 border border-amber-500/30 dark:border-amber-500/40 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🔁</span>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wide">
                    Daily Meetings
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  Runs Daily
                </span>
              </div>

              <div className="space-y-2">
                {dailyMeetings.map((dm) => {
                  const dmTitle = getLocalized(dm.title);
                  return (
                    <div
                      key={dm.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {dm.time}
                          </span>
                          <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {dmTitle}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {dm.speaker && <span>🎙️ {dm.speaker}</span>}
                          {dm.venue && <span>📍 {dm.venue}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEvent({ ...dm, date: todayIsoDate })}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
                      >
                        Details / Join
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month Calendar Grid with Meeting Titles Inside Each Day Box */}
          <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="grid grid-cols-7 text-center mb-2">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="text-[10px] font-bold uppercase text-zinc-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[64px] sm:min-h-[76px] rounded-xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateStr] || [];
                const hasEvents = dayEvents.length > 0;
                const isToday = dayNum === todayDayNum;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setDayDrawerDate(dateStr)}
                    className={`min-h-[64px] sm:min-h-[76px] rounded-xl p-1 sm:p-1.5 flex flex-col justify-start items-start text-left transition-all border ${
                      isToday
                        ? 'border-amber-500 bg-amber-50/60 dark:border-amber-500/80 dark:bg-amber-950/30 ring-1 ring-amber-500/50'
                        : hasEvents
                        ? 'border-blue-200/80 bg-blue-50/30 dark:border-blue-500/30 dark:bg-zinc-800/90 hover:border-blue-400 dark:hover:border-blue-400'
                        : 'border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-600'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-1">
                      <span
                        className={`text-[11px] font-bold ${
                          isToday
                            ? 'inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {hasEvents && (
                        <span className="text-[9px] font-bold text-zinc-400">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Up to 2 Mini Meeting Title Pills inside the day box */}
                    <div className="w-full space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const titleText = getLocalized(ev.title);
                        return (
                          <div
                            key={ev.id}
                            className="w-full text-[9px] sm:text-[10px] font-semibold px-1 py-0.5 rounded bg-blue-600 text-white dark:bg-blue-500/25 dark:text-blue-200 dark:border dark:border-blue-400/30 truncate leading-tight"
                            title={titleText}
                          >
                            {titleText}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="block text-[8px] sm:text-[9px] font-bold text-amber-600 dark:text-amber-400 px-0.5">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Meetings Section (Next 2 Meetings prominent at top) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Next 2 Upcoming Meetings
              </h4>
              <span className="text-[11px] font-medium text-zinc-400">From today onward</span>
            </div>

            {nextTwo.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40">
                <p className="text-xs text-zinc-500">No upcoming meetings remaining this month.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {nextTwo.map((ev, idx) => {
                  const titleStr = getLocalized(ev.title);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all active:scale-[0.99] flex items-start justify-between gap-3 shadow-xs ${
                        idx === 0
                          ? 'border-amber-400/90 dark:border-amber-500/50 bg-gradient-to-r from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white">
                            {ev.date}
                          </span>
                          {ev.time && (
                            <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>{ev.time}</span>
                            </span>
                          )}
                          {ev.is_modified && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              Rescheduled
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50 leading-snug">
                          {titleStr}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                          {ev.speaker && <span>🎙️ {ev.speaker}</span>}
                          {ev.venue && <span>📍 {ev.venue}</span>}
                        </div>
                      </div>
                      <div className="self-center flex-shrink-0 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                        Details →
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of the Month Accordion */}
            {remaining.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemainingAccordion(!showRemainingAccordion)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors text-xs font-bold text-zinc-700 dark:text-zinc-300"
                >
                  <span>Show {remaining.length} more meetings this month</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showRemainingAccordion ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                {showRemainingAccordion && (
                  <div className="space-y-2 mt-2.5 animate-in fade-in duration-200">
                    {remaining.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="cursor-pointer p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-300 transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-amber-600 dark:text-amber-400">{ev.date}</span>
                            {ev.time && <span className="text-zinc-400">• {ev.time}</span>}
                          </div>
                          <h5 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{getLocalized(ev.title)}</h5>
                        </div>
                        <span className="text-amber-500 font-bold">→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'flyer' && (
        <div className="space-y-4">
          {imageUrl ? (
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <div
                className="group relative aspect-[16/9] sm:aspect-[21/9] w-full cursor-pointer overflow-hidden bg-zinc-950"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image src={imageUrl} alt={monthLabel} fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{t('tap_to_enlarge', 'Tap flyer to enlarge')}</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={handleDownloadFlyer} className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 py-2.5 px-3 text-xs font-bold transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Download Flyer</span>
                </button>
                <button type="button" onClick={handleShareFlyer} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 text-xs font-bold transition-colors shadow-xs">
                  <Share2 className="h-4 w-4" />
                  <span>Share Flyer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
              <p className="text-xs text-zinc-500">No flyer image uploaded for this month.</p>
            </div>
          )}
        </div>
      )}

      {/* Day Drawer / Modal */}
      {dayDrawerDate && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
                  📅 {dayDrawerDate}
                </h3>
                <p className="text-xs text-zinc-500">
                  {dayDrawerEvents.length} meeting{dayDrawerEvents.length === 1 ? '' : 's'} scheduled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDayDrawerDate(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {dayDrawerEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No meetings scheduled for this date.
                </div>
              ) : (
                dayDrawerEvents.map((ev) => {
                  const titleStr = getLocalized(ev.title);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                      }}
                      className="cursor-pointer p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 hover:border-amber-400 hover:shadow-xs transition-all flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {ev.time}
                          </span>
                          {ev.is_modified && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              Rescheduled
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 leading-snug">
                          {titleStr}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 flex-wrap">
                          {ev.speaker && <span>🎙️ {ev.speaker}</span>}
                          {ev.venue && <span>📍 {ev.venue}</span>}
                        </div>
                      </div>
                      <span className="self-center text-amber-500 text-xs font-bold">
                        View →
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <EventDetailsModal isOpen={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} event={selectedEvent} />
      {imageUrl && <ImageLightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} imageUrl={imageUrl} title={monthLabel} />}
    </div>
  );
}
