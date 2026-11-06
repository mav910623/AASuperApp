'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { GeneratedScheduleEvent } from '@/lib/calendarGenerator';
import type { MeetingException } from '@/types/app';
import { useApp } from '@/context/AppContext';

interface InstanceOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: GeneratedScheduleEvent | null;
  onSave: (exception: MeetingException) => void;
}

export function InstanceOverrideModal({
  isOpen,
  onClose,
  instance,
  onSave,
}: InstanceOverrideModalProps) {
  const { getLocalized } = useApp();

  const [targetDate, setTargetDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [venue, setVenue] = useState('');
  const [addressOrLink, setAddressOrLink] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (instance) {
      setTargetDate(instance.date || '');
      setTime(instance.time || '');
      setTitle(getLocalized(instance.title) || '');
      setSpeaker(instance.speaker || '');
      setVenue(instance.venue || '');
      setAddressOrLink(instance.location_or_link || '');
      setReason(instance.reason || 'Rescheduled for this month');
    }
  }, [instance, getLocalized, isOpen]);

  if (!isOpen || !instance) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate.trim()) return;

    const exception: MeetingException = {
      id: `ex-${Date.now()}`,
      series_id: instance.series_id || instance.rule_id || 'all',
      original_date: instance.original_date || instance.date,
      action: 'modify',
      new_date: targetDate.trim(),
      new_time: time.trim() || undefined,
      new_title: title.trim() || undefined,
      new_speaker: speaker.trim() || undefined,
      new_venue: venue.trim() || undefined,
      new_address_or_link: addressOrLink.trim() || undefined,
      reason: reason.trim() || undefined,
    };

    onSave(exception);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
              ✏️ Reschedule / Override This Occurrence
            </h3>
            <p className="text-[11px] text-zinc-500">
              Applies ONLY to this month ({instance.original_date || instance.date})
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <strong>Single Instance Override:</strong> Moving or editing this occurrence will NOT affect future months or break the recurring rule.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Original Date
              </label>
              <input
                type="text"
                disabled
                value={instance.original_date || instance.date}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2 text-xs font-mono text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                New Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Title for this Date
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 8:00 PM - 9:30 PM"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Speaker
              </label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Map Address / Zoom Link
            </label>
            <input
              type="text"
              value={addressOrLink}
              onChange={(e) => setAddressOrLink(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Reason / Admin Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Moved 1 week later due to holiday"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}