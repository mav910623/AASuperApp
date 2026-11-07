'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, Upload, Loader2, Check } from 'lucide-react';
import { uploadMediaAction } from '@/app/actions/adminActions';
import { parseTimeRangeTo24h, formatTimeRange } from '@/lib/calendarGenerator';
import type { CalendarEvent } from '@/types/app';

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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [venue, setVenue] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleCn, setTitleCn] = useState('');
  const [titleBm, setTitleBm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setDate(event.date || '');
      const parsedTime = parseTimeRangeTo24h(event.time);
      setStartTime(parsedTime.start);
      setEndTime(parsedTime.end);
      setSpeaker(event.speaker || '');
      setVenue(event.venue || '');
      setLocationOrLink(event.location_or_link || '');
      setDescription(event.description || '');
      setImageUrl(event.image_url || '');
      setTitleEn(event.title?.en || '');
      setTitleCn(event.title?.cn || '');
      setTitleBm(event.title?.bm || '');
    } else {
      setDate('');
      setStartTime('');
      setEndTime('');
      setSpeaker('');
      setVenue('');
      setLocationOrLink('');
      setDescription('');
      setImageUrl('');
      setTitleEn('');
      setTitleCn('');
      setTitleBm('');
    }
    setError(null);
  }, [event, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadMediaAction(formData);
      if (res.success && res.url) {
        setImageUrl(res.url);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) {
      setError('English title is required');
      return;
    }
    if (!date.trim()) {
      setError('Date is required (YYYY-MM-DD)');
      return;
    }

    const formattedTime = formatTimeRange(startTime, endTime);

    const newEvent: CalendarEvent = {
      id: event?.id || `event-${Date.now()}`,
      date: date.trim(),
      time: formattedTime,
      speaker: speaker.trim(),
      venue: venue.trim(),
      location_or_link: locationOrLink.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      title: {
        en: titleEn.trim(),
        bm: titleBm.trim() || titleEn.trim(),
        cn: titleCn.trim() || titleEn.trim(),
        ta: titleEn.trim(),
      },
    };

    onSave(newEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              {event ? 'Edit Special Event' : 'Add Special Event'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              English Title *
            </label>
            <input
              type="text"
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. AA Annual Champions Rally & Gala"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Chinese Title (optional)
              </label>
              <input
                type="text"
                value={titleCn}
                onChange={(e) => setTitleCn(e.target.value)}
                placeholder="e.g. AA 团队年度领袖总动员"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                BM Title (optional)
              </label>
              <input
                type="text"
                value={titleBm}
                onChange={(e) => setTitleBm(e.target.value)}
                placeholder="e.g. Perhimpunan Juara AA"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Date (YYYY-MM-DD) *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-11-28"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Start Time <span className="text-amber-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                End Time <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          {startTime && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Formatted: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatTimeRange(startTime, endTime)}</span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Speaker / Host
              </label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="e.g. President Council"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Sunway Pyramid Convention"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Address (for Google Maps / Waze) or Zoom URL
            </label>
            <input
              type="text"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder="Sunway Pyramid Convention Centre, Petaling Jaya"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Rich Description (supports line breaks)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event agenda, keynote topics, ticketing info..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Attached Event Image URL (optional)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <span>Upload Image</span>
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded cover"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
