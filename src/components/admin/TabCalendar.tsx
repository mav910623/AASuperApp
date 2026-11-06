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
  Ban,
  Clock,
  MapPin,
} from 'lucide-react';
import { EventHighlightModal } from './EventHighlightModal';
import { RecurringRuleModal } from './RecurringRuleModal';
import { LANGUAGES } from './ToolBasicInfo';
import { updateCalendarAction, uploadMediaAction } from '@/app/actions/adminActions';
import type { TeamCalendar, CalendarEvent, RecurringRule, BlackoutDate, LanguageCode } from '@/types/app';

interface TabCalendarProps {
  calendar: TeamCalendar;
  setCalendar: React.Dispatch<React.SetStateAction<TeamCalendar>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabCalendar({ calendar, setCalendar, onNotify }: TabCalendarProps) {
  const [activeSubTab, setActiveSubTab] = useState<'recurring' | 'blackout' | 'special' | 'flyer'>('recurring');

  const [monthLabels, setMonthLabels] = useState(calendar.month_label || { en: '', bm: '', cn: '', ta: '' });
  const [imageUrls, setImageUrls] = useState(calendar.image_url || { en: '', bm: '', cn: '', ta: '' });
  const [defaultView, setDefaultView] = useState<'dynamic' | 'flyer'>(calendar.default_view || 'dynamic');

  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(calendar.recurring_rules || []);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>(calendar.blackout_dates || []);
  const [events, setEvents] = useState<CalendarEvent[]>(calendar.events || []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Recurring Rule Modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  // Special Event Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Blackout Date Inline Add Form
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newBlackoutReason, setNewBlackoutReason] = useState('');
  const [newBlackoutRuleId, setNewBlackoutRuleId] = useState('all');

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
        setImageUrls({
          en: res.url,
          bm: res.url,
          cn: res.url,
          ta: res.url,
        });
        onNotify('Flyer image uploaded successfully');
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

  const handleSaveAll = async () => {
    setSaving(true);
    const payload: Partial<TeamCalendar> = {
      ...(calendar.id ? { id: calendar.id } : {}),
      month_label: monthLabels,
      image_url: imageUrls,
      default_view: defaultView,
      recurring_rules: recurringRules,
      blackout_dates: blackoutDates,
      events,
    };

    const res = await updateCalendarAction(payload);
    setSaving(false);

    if (res.success && res.data) {
      setCalendar(res.data);
      onNotify('Monthly calendar & schedule saved successfully!');
    } else {
      onNotify('Failed to save calendar', true);
    }
  };

  const handleSaveRule = (savedRule: RecurringRule) => {
    setRecurringRules((prev) => {
      const exists = prev.some((r) => r.id === savedRule.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRule.id ? savedRule : r));
      }
      return [...prev, savedRule];
    });
    onNotify('Recurring meeting saved');
  };

  const handleDeleteRule = (id: string) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== id));
    onNotify('Recurring meeting removed');
  };

  const handleToggleRuleActive = (id: string) => {
    setRecurringRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate.trim()) return;
    const newEntry: BlackoutDate = {
      id: `blackout-${Date.now()}`,
      date: newBlackoutDate.trim(),
      reason: newBlackoutReason.trim() || 'Meeting Cancelled / Rescheduled',
      rule_id: newBlackoutRuleId,
    };
    setBlackoutDates((prev) => [...prev, newEntry]);
    setNewBlackoutDate('');
    setNewBlackoutReason('');
    setNewBlackoutRuleId('all');
    onNotify('Blackout date added');
  };

  const handleDeleteBlackout = (id: string) => {
    setBlackoutDates((prev) => prev.filter((b) => b.id !== id));
    onNotify('Blackout date removed');
  };

  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [...prev, savedEvent];
    });
    onNotify('Special event updated');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    onNotify('Special event removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <span>Monthly Calendar &amp; Schedule Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage recurring meetings, blackout overrides, special events, and the monthly flyer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Calendar...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Save Calendar &amp; Schedule</span>
            </>
          )}
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('recurring')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'recurring' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span>🔄</span>
          <span>Recurring Meetings ({recurringRules.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('blackout')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'blackout' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span>🚫</span>
          <span>Blackout Dates ({blackoutDates.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('special')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'special' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span>⭐</span>
          <span>Special Events ({events.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('flyer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'flyer' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs' : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <span>🖼️</span>
          <span>Flyer &amp; Default View</span>
        </button>
      </div>

      {/* SUB-SECTION 1: RECURRING MEETINGS */}
      {activeSubTab === 'recurring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Recurring Team Meetings</h3>
              <p className="text-xs text-zinc-500">
                Repeats into concrete dates (Daily DCC, Weekly Thursday ASAP, 3rd Saturday BSE 1).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRule(null);
                setRuleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recurring Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurringRules.map((rule) => {
              const freqLabel =
                rule.frequency === 'daily'
                  ? 'Daily'
                  : rule.frequency === 'weekly'
                  ? `Weekly (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rule.day_of_week ?? 0]})`
                  : `Monthly (${rule.nth_week ?? 1}th ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rule.day_of_week ?? 0]})`;

              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    rule.is_active
                      ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {freqLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRuleActive(rule.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          rule.is_active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {rule.is_active ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">{rule.title}</h4>
                    {rule.time && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{rule.time}</span>
                      </p>
                    )}
                    {rule.venue && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className="truncate">{rule.venue}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: BLACKOUT DATES */}
      {activeSubTab === 'blackout' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Blackout Dates &amp; Overrides</h3>
            <p className="text-xs text-zinc-500">
              Cancel or pause recurring meetings on specific holiday or special event dates.
            </p>
          </div>

          <form onSubmit={handleAddBlackout} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              placeholder="Date (YYYY-MM-DD)"
              className="w-full sm:w-40 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono"
            />
            <input
              type="text"
              value={newBlackoutReason}
              onChange={(e) => setNewBlackoutReason(e.target.value)}
              placeholder="Reason (e.g. Public Holiday, Rally)"
              className="w-full sm:flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            />
            <select
              value={newBlackoutRuleId}
              onChange={(e) => setNewBlackoutRuleId(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs"
            >
              <option value="all">All Recurring Meetings</option>
              {recurringRules.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Blackout</span>
            </button>
          </form>

          <div className="space-y-2">
            {blackoutDates.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">No blackout dates added.</p>
              </div>
            ) : (
              blackoutDates.map((b) => {
                const targetRule = recurringRules.find((r) => r.id === b.rule_id);
                const targetText = b.rule_id === 'all' || !b.rule_id ? 'All Recurring Meetings' : targetRule?.title || b.rule_id;
                return (
                  <div key={b.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">{b.date}</span>
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{b.reason}</span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{targetText}</span>
                    </div>
                    <button type="button" onClick={() => handleDeleteBlackout(b.id)} className="p-1 rounded text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: SPECIAL ONE-OFF EVENTS */}
      {activeSubTab === 'special' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Special &amp; One-Off Events</h3>
              <p className="text-xs text-zinc-500">Annual summits, rallies, special guest workshops or rescheduled meetings.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setEventModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Special Event</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {events.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">No special events scheduled yet.</p>
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{ev.date}</span>
                      {ev.time && <span className="text-xs text-zinc-500">{ev.time}</span>}
                    </div>
                    <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">{ev.title?.en || 'Untitled Event'}</h4>
                    {ev.venue && <p className="text-xs text-zinc-500">{ev.venue}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => { setEditingEvent(ev); setEventModalOpen(true); }} className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteEvent(ev.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: FLYER & DEFAULT VIEW */}
      {activeSubTab === 'flyer' && (
        <div className="space-y-5">
          <div className="p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Default Top View for Users
              </h3>
              <p className="text-xs text-zinc-500 mb-3">
                Choose what regular users see first when opening the Calendar tab.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setDefaultView('dynamic')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    defaultView === 'dynamic'
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="text-sm mb-1">📅 Dynamic Calendar</div>
                  <div className="text-[11px] opacity-75">Interactive grid with clickable meeting details</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultView('flyer')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    defaultView === 'flyer'
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="text-sm mb-1">🖼️ Monthly Flyer</div>
                  <div className="text-[11px] opacity-75">Full visual poster with download &amp; share buttons</div>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Monthly Flyer Image
              </h3>
              <div className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  value={imageUrls.en || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrls({ en: val, bm: val, cn: val, ta: val });
                  }}
                  placeholder="https://... or click Upload Flyer"
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Upload Flyer</span>
                </button>
              </div>

              {imageUrls.en && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-md max-h-52 bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrls.en} alt="Flyer Preview" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RecurringRuleModal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        onSave={handleSaveRule}
        rule={editingRule}
      />

      <EventHighlightModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={editingEvent}
      />
    </div>
  );
}
