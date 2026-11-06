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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TeamCalendar } from '@/types/app';
import { getEventsForCalendar, type GeneratedScheduleEvent } from '@/lib/calendarGenerator';
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

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12

  const [activeView, setActiveView] = useState<'dynamic' | 'flyer'>(
    calendar?.default_view || 'dynamic'
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GeneratedScheduleEvent | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const monthLabel = getLocalized(calendar?.month_label) || t('upcoming_events', 'Team Calendar');
  const imageUrl = getLocalized(calendar?.image_url);

  // Generate schedule for the active year/month
  const monthlyEvents = useMemo(() => {
    return getEventsForCalendar(calendar, currentYear, currentMonth);
  }, [calendar, currentYear, currentMonth]);

  // Group events by date string for dots in calendar grid
  const eventsByDate = useMemo(() => {
    const map: Record<string, GeneratedScheduleEvent[]> = {};
    for (const ev of monthlyEvents) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [monthlyEvents]);

  // Grid calculation: days in month, starting day of week
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleShareFlyer = () => {
    const shareText = `${monthLabel}\n\n${t('share_flyer', 'Check out our monthly team calendar and upcoming events:')}\n${imageUrl || (typeof window !== 'undefined' ? window.location.href : '')}`;
    window.location.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  };

  const handleDownloadFlyer = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayedEvents = selectedDate
    ? monthlyEvents.filter((e) => e.date === selectedDate)
    : monthlyEvents;

  return (
    <div className="w-full space-y-5 px-4 py-4 animate-in fade-in duration-200">
      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveView('dynamic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'dynamic' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-amber-500" />
          <span>📅 Dynamic Calendar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('flyer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'flyer' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span className="text-base leading-none">🖼️</span>
          <span>Monthly Flyer</span>
        </button>
      </div>

      {activeView === 'dynamic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h3>
              <p className="text-[11px] text-zinc-500">{monthlyEvents.length} meetings scheduled</p>
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="grid grid-cols-7 text-center mb-1.5">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="text-[10px] font-bold uppercase text-zinc-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateStr] || [];
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate === dateStr;
                const isToday = now.getFullYear() === currentYear && now.getMonth() + 1 === currentMonth && now.getDate() === dayNum;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate((prev) => (prev === dateStr ? null : dateStr))}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 relative transition-all ${
                      isSelected ? 'bg-amber-500 text-white font-bold shadow-md scale-105' : isToday ? 'border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 font-bold' : hasEvents ? 'bg-zinc-50 dark:bg-zinc-800/60 font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    <span className="text-xs">{dayNum}</span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <span key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : e.is_recurring ? 'bg-amber-500' : 'bg-red-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold">Showing: <strong className="text-amber-600">{selectedDate}</strong></span>
                <button type="button" onClick={() => setSelectedDate(null)} className="text-amber-600 font-bold hover:underline">Show all ({monthlyEvents.length})</button>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              Meetings ({displayedEvents.length}) - Tap to open details
            </h4>
            {displayedEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
                <p className="text-xs text-zinc-500">No meetings scheduled for this date.</p>
              </div>
            ) : (
              displayedEvents.map((ev) => {
                const titleStr = getLocalized(ev.title);
                const isZoom = ev.location_or_link?.includes('zoom');
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="group cursor-pointer p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.99] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          {ev.date}
                        </span>
                        {ev.time && (
                          <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>{ev.time}</span>
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                            ev.is_recurring ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {ev.is_recurring ? 'Recurring' : 'Special'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 group-hover:text-amber-600 transition-colors leading-snug">
                        {titleStr}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 flex-wrap">
                        {ev.speaker && <span>🎙️ {ev.speaker}</span>}
                        {ev.venue ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>{ev.venue}</span>
                          </span>
                        ) : isZoom ? (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Video className="w-3 h-3" />
                            <span>Zoom Online</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="self-center flex-shrink-0 text-amber-500 text-xs font-bold opacity-80 group-hover:opacity-100">
                      View →
                    </div>
                  </div>
                );
              })
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

      <EventDetailsModal isOpen={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} event={selectedEvent} />
      {imageUrl && <ImageLightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} imageUrl={imageUrl} title={monthLabel} />}
    </div>
  );
}
