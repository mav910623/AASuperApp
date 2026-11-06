'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, AlertCircle } from 'lucide-react';
import { LANGUAGES } from './ToolBasicInfo';
import type { CalendarEvent, LanguageCode } from '@/types/app';

interface EventHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  event?: CalendarEvent | null;
}

export function EventHighlightModal({
  isOpen,
  onClose,
  onSave,
  event,
}: EventHighlightModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [titles, setTitles] = useState<Record<LanguageCode, string>>({
    en: '',
    bm: '',
    cn: '',
    ta: '',
  });
  const [activeTab, setActiveTab] = useState<LanguageCode>('en');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setDate(event.date || '');
      setTime(event.time || '');
      setSpeaker(event.speaker || '');
      setLocationOrLink(event.location_or_link || '');
      setTitles({
        en: event.title?.en || '',
        bm: event.title?.bm || '',
        cn: event.title?.cn || '',
        ta: event.title?.ta || '',
      });
    } else {
      setDate('');
      setTime('');
      setSpeaker('');
      setLocationOrLink('');
      setTitles({ en: '', bm: '', cn: '', ta: '' });
    }
    setError(null);
    setActiveTab('en');
  }, [event, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titles.en?.trim()) {
      setError('English title is required');
      setActiveTab('en');
      return;
    }
    if (!date.trim()) {
      setError('Event date is required (e.g. Nov 12, 2026)');
      return;
    }

    const newEvent: CalendarEvent = {
      id: event?.id || `event-${Date.now()}`,
      date: date.trim(),
      time: time.trim(),
      speaker: speaker.trim(),
      location_or_link: locationOrLink.trim(),
      title: titles,
    };

    onSave(newEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              {event ? 'Edit Event Highlight' : 'Add Event Highlight'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date *
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Nov 14, 2026"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 8:00 PM GMT+8"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Speaker / Host
            </label>
            <input
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Zoom or Map Location Link
            </label>
            <input
              type="text"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="https://zoom.us/j/... or Hall Address"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-800">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setActiveTab(l.code)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    activeTab === l.code
                      ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Title ({activeTab.toUpperCase()}) {activeTab === 'en' && '*'}
              </label>
              <input
                type="text"
                value={titles[activeTab] || ''}
                onChange={(e) => setTitles({ ...titles, [activeTab]: e.target.value })}
                placeholder={`Event title in ${activeTab.toUpperCase()}...`}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{event ? 'Update' : 'Add Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
