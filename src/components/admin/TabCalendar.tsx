'use client';

import React, { useState, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Upload,
  Loader2,
  Check,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { EventHighlightModal } from './EventHighlightModal';
import { LANGUAGES } from './ToolBasicInfo';
import { updateCalendarAction, uploadMediaAction } from '@/app/actions/adminActions';
import type { TeamCalendar, CalendarEvent, LanguageCode } from '@/types/app';

interface TabCalendarProps {
  calendar: TeamCalendar;
  setCalendar: React.Dispatch<React.SetStateAction<TeamCalendar>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabCalendar({ calendar, setCalendar, onNotify }: TabCalendarProps) {
  const [monthLabels, setMonthLabels] = useState(calendar.month_label || { en: '', bm: '', cn: '', ta: '' });
  const [imageUrls, setImageUrls] = useState(calendar.image_url || { en: '', bm: '', cn: '', ta: '' });
  const [events, setEvents] = useState<CalendarEvent[]>(calendar.events || []);

  const [activeLangTab, setActiveLangTab] = useState<LanguageCode>('en');
  const [isMasterImage, setIsMasterImage] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadMediaAction(formData);

      if (res.success && res.url) {
        if (isMasterImage) {
          setImageUrls({
            en: res.url,
            bm: res.url,
            cn: res.url,
            ta: res.url,
          });
          onNotify('Flyer image uploaded and applied to all languages');
        } else {
          setImageUrls((prev) => ({ ...prev, [activeLangTab]: res.url || '' }));
          onNotify(`Flyer image uploaded for ${activeLangTab.toUpperCase()}`);
        }
      } else {
        onNotify('Image upload failed', true);
      }
    } catch {
      onNotify('Upload service error', true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveCalendar = async () => {
    setSaving(true);
    const payload: Partial<TeamCalendar> = {
      ...(calendar.id ? { id: calendar.id } : {}),
      month_label: monthLabels,
      image_url: imageUrls,
      events,
    };

    const res = await updateCalendarAction(payload);
    setSaving(false);

    if (res.success && res.data) {
      setCalendar(res.data);
      onNotify('Monthly calendar saved successfully');
    } else {
      onNotify('Failed to save calendar', true);
    }
  };

  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [...prev, savedEvent];
    });
    onNotify('Event highlight updated');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    onNotify('Event highlight removed');
  };

  const currentImageUrl = imageUrls[activeLangTab] || imageUrls.en || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <span>Monthly Calendar Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Update monthly flyer image and upcoming Zoom/event highlights.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveCalendar}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Calendar...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Save Monthly Calendar</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              1. Month Label (Multilingual)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((l) => (
                <div key={l.code}>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {l.flag} {l.label}
                  </label>
                  <input
                    type="text"
                    value={monthLabels[l.code] || ''}
                    onChange={(e) => setMonthLabels({ ...monthLabels, [l.code]: e.target.value })}
                    placeholder="e.g. November 2026"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                2. Monthly Calendar Flyer
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={isMasterImage}
                  onChange={(e) => setIsMasterImage(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>One Master Image for All</span>
              </label>
            </div>

            {!isMasterImage && (
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setActiveLangTab(l.code)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeLangTab === l.code
                        ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrls[activeLangTab] || ''}
                  onChange={(e) => setImageUrls({ ...imageUrls, [activeLangTab]: e.target.value })}
                  placeholder="https://... or upload flyer image"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Flyer</span>
                    </>
                  )}
                </button>
              </div>

              {currentImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 max-h-56 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImageUrl}
                    alt="Monthly Calendar Flyer"
                    className="w-full h-full object-contain max-h-52 rounded-xl"
                  />
                </div>
              ) : (
                <div className="h-36 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 gap-1.5">
                  <ImageIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                  <span className="text-xs">No flyer image uploaded yet</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Event Highlights */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  3. Upcoming Event Highlights ({events.length})
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Clickable Zoom meetings, trainings & rallies
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setEventModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
              <div className="text-center py-10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-500">No event highlights scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {ev.date}
                        </span>
                        {ev.time && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {ev.time}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 mt-1 line-clamp-1">
                        {ev.title?.en || 'Untitled Event'}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 flex-wrap">
                        {ev.speaker && <span>Host: {ev.speaker}</span>}
                        {ev.location_or_link && (
                          <a
                            href={ev.location_or_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-600 hover:underline"
                          >
                            <span>Link / Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEvent(ev);
                          setEventModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title="Edit event"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventHighlightModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent}
      />
    </div>
  );
}
