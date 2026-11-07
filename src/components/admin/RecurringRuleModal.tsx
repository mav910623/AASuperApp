'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Loader2, Upload } from 'lucide-react';
import { uploadMediaAction } from '@/app/actions/adminActions';
import type { MeetingSeries, MeetingFrequency } from '@/types/app';

interface RecurringRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: MeetingSeries) => void;
  rule?: MeetingSeries | null;
}

const DOW_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const NTH_OPTIONS = [
  { value: 1, label: '1st Week' },
  { value: 2, label: '2nd Week' },
  { value: 3, label: '3rd Week' },
  { value: 4, label: '4th Week' },
  { value: 5, label: 'Last Week' },
];

export function RecurringRuleModal({ isOpen, onClose, onSave, rule }: RecurringRuleModalProps) {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<MeetingFrequency>('weekly');
  const [date, setDate] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(4);
  const [nthWeek, setNthWeek] = useState(3);
  const [dayOfMonth, setDayOfMonth] = useState(15);
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rule) {
      setTitle(rule.title || '');
      setFrequency(rule.frequency || 'weekly');
      setDate(rule.date || '');
      setDayOfWeek(rule.day_of_week ?? 4);
      setNthWeek(rule.nth_week ?? 3);
      setDayOfMonth(rule.day_of_month ?? 15);
      setTime(rule.time || '');
      setVenue(rule.venue || '');
      const isHttp = rule.address_or_link?.startsWith('http');
      setZoomLink(rule.zoom_link || (isHttp ? rule.address_or_link : ''));
      setLocationAddress(rule.location_address || (!isHttp ? rule.address_or_link : ''));
      setSpeaker(rule.speaker || '');
      setDescription(rule.description || '');
      setImageUrl(rule.image_url || '');
      setIsActive(rule.is_active !== false);
    } else {
      setTitle('');
      setFrequency('weekly');
      setDate('');
      setDayOfWeek(4);
      setNthWeek(3);
      setDayOfMonth(15);
      setTime('');
      setVenue('');
      setZoomLink('');
      setLocationAddress('');
      setSpeaker('');
      setDescription('');
      setImageUrl('');
      setIsActive(true);
    }
  }, [rule, isOpen]);

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
    if (!title.trim()) return;

    const cleanZoom = zoomLink.trim();
    const cleanAddress = locationAddress.trim();
    const cleanVenue = venue.trim();

    onSave({
      id: rule?.id || `rule-${Date.now()}`,
      title: title.trim(),
      frequency,
      date: frequency === 'once' ? date.trim() : undefined,
      day_of_week:
        frequency === 'weekly' || frequency === 'monthly_nth_weekday' ? dayOfWeek : undefined,
      nth_week: frequency === 'monthly_nth_weekday' ? nthWeek : undefined,
      day_of_month: frequency === 'monthly_date' ? dayOfMonth : undefined,
      time: time.trim(),
      venue: cleanVenue,
      zoom_link: cleanZoom,
      location_address: cleanAddress,
      address_or_link: cleanZoom || cleanAddress || cleanVenue || '',
      speaker: speaker.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      is_active: isActive,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
            {rule ? 'Edit Recurring Meeting' : 'Add Recurring Meeting'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Core Check-in (DCC) or Weekly ASAP"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Pattern / Frequency *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  frequency === 'daily' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  frequency === 'weekly' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly_nth_weekday')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  frequency === 'monthly_nth_weekday' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Monthly Nth Day
              </button>
              <button
                type="button"
                onClick={() => setFrequency('once')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  frequency === 'once' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                One-Time
              </button>
            </div>
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setFrequency('monthly_date')}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold border transition-all ${
                  frequency === 'monthly_date' ? 'bg-amber-500 text-white border-amber-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                Or Day X of Month
              </button>
            </div>
          </div>

          {frequency === 'once' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Date (YYYY-MM-DD) *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
          )}

          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Day of Week</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
                {DOW_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </div>
          )}

          {frequency === 'monthly_nth_weekday' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Which Week</label>
                <select value={nthWeek} onChange={(e) => setNthWeek(Number(e.target.value))} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
                  {NTH_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label} Week</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Day of Week</label>
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs">
                  {DOW_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            </div>
          )}

          {frequency === 'monthly_date' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Day of Month (1 - 31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="7:30 AM - 8:00 AM" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Speaker</label>
              <input type="text" value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="COEV Leaders" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs" />
            </div>
          </div>

          {/* Hybrid Meeting / Location Details */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                📍 Location & Meeting Links
              </span>
              {zoomLink && (locationAddress || venue) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  ⚡ Hybrid Meeting
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Online Zoom / Meeting URL
              </label>
              <input
                type="text"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/... or online meeting link"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Nu Skin Plaza KL"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Physical Venue Address
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. Jalan Ampang, KL (for Maps/Waze)"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Rich Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agenda and notes..." className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Attached Image URL (optional)</label>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1">
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <span>Upload</span>
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs" />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-amber-500" />
              <span>Active in monthly calendar expansion</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95">
              <Check className="w-3.5 h-3.5" />
              <span>Save Recurring Meeting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
