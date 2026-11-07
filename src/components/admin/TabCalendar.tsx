'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Upload,
  Loader2,
  Check,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Ban,
  Clock,
  MapPin,
  RotateCcw,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Video,
} from 'lucide-react';
import { RecurringRuleModal } from './RecurringRuleModal';
import { InstanceOverrideModal } from './InstanceOverrideModal';
import { updateCalendarAction, uploadMediaAction } from '@/app/actions/adminActions';
import type {
  TeamCalendar,
  CalendarEvent,
  MeetingSeries,
  MeetingException,
  BlackoutDate,
} from '@/types/app';
import {
  generateMonthSchedule,
  type GeneratedScheduleEvent,
} from '@/lib/calendarGenerator';
import { useApp } from '@/context/AppContext';

interface MeetingRuleCardProps {
  rule: MeetingSeries;
  onToggleActive: (id: string) => void;
  onEdit: (rule: MeetingSeries) => void;
  onDelete: (id: string) => void;
}

function MeetingRuleCard({ rule, onToggleActive, onEdit, onDelete }: MeetingRuleCardProps) {
  const isDaily = rule.frequency === 'daily';
  const freqLabel =
    rule.frequency === 'daily'
      ? '🔁 Daily'
      : rule.frequency === 'weekly'
      ? `Weekly (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rule.day_of_week ?? 0]})`
      : rule.frequency === 'monthly_nth_weekday'
      ? `Monthly (${rule.nth_week ?? 1}th ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rule.day_of_week ?? 0]})`
      : rule.frequency === 'monthly_date'
      ? `Monthly (Day ${rule.day_of_month ?? 15})`
      : `One-Time (${rule.date || 'Once'})`;

  const isHybrid = Boolean(rule.zoom_link && (rule.location_address || rule.venue));

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
        rule.is_active
          ? 'bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs'
          : 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/50 opacity-60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                isDaily ? 'bg-amber-500 text-white shadow-2xs' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {freqLabel}
            </span>
            {isHybrid && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Zap className="w-2.5 h-2.5" />
                <span>Hybrid</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleActive(rule.id)}
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
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
          {rule.time && (
            <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{rule.time}</span>
            </span>
          )}
          {rule.speaker && <span>🎙️ {rule.speaker}</span>}
          {rule.venue && <span>📍 {rule.venue}</span>}
          {rule.zoom_link && !rule.venue && <span>💻 Zoom Online</span>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onEdit(rule)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
        >
          <Edit className="w-3.5 h-3.5 text-amber-500" />
          <span>Edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(rule.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

interface ScheduleOccurrenceRowProps {
  ev: GeneratedScheduleEvent;
  titleStr: string;
  onOpenOverride: (ev: GeneratedScheduleEvent) => void;
  onSkip: (ev: GeneratedScheduleEvent) => void;
  onRestore: (seriesId: string, originalDate: string) => void;
}

function ScheduleOccurrenceRow({
  ev,
  titleStr,
  onOpenOverride,
  onSkip,
  onRestore,
}: ScheduleOccurrenceRowProps) {
  const hasException = Boolean(ev.is_modified);

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        hasException
          ? 'border-purple-300 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs'
          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            {ev.date}
          </span>
          {ev.time && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{ev.time}</span>
            </span>
          )}
          {hasException && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">
              Rescheduled ({ev.reason || 'Overridden'})
            </span>
          )}
        </div>

        <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">{titleStr}</h4>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
          {ev.speaker && <span>🎙️ {ev.speaker}</span>}
          {ev.venue && <span>📍 {ev.venue}</span>}
          {ev.zoom_link && !ev.venue && <span>💻 Zoom Online</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onOpenOverride(ev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all active:scale-95"
        >
          <Edit className="w-3 h-3 text-amber-500" />
          <span>Reschedule / Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onSkip(ev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold transition-all active:scale-95"
        >
          <Ban className="w-3 h-3" />
          <span>Skip Date</span>
        </button>

        {hasException && ev.original_date && (
          <button
            type="button"
            onClick={() => onRestore(ev.series_id || ev.rule_id || '', ev.original_date!)}
            title="Restore original date"
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface TabCalendarProps {
  calendar: TeamCalendar;
  setCalendar: React.Dispatch<React.SetStateAction<TeamCalendar>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabCalendar({ calendar, setCalendar, onNotify }: TabCalendarProps) {
  const { getLocalized } = useApp();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const needsMonthReview = calendar.last_reviewed_month !== currentYearMonth;

  // Single-view layout state
  const [showOverridesAccordion, setShowOverridesAccordion] = useState(false);

  const [monthLabels, setMonthLabels] = useState(calendar.month_label || { en: '', bm: '', cn: '', ta: '' });
  const [imageUrls, setImageUrls] = useState(calendar.image_url || { en: '', bm: '', cn: '', ta: '' });
  const [defaultView, setDefaultView] = useState<'dynamic' | 'flyer'>(calendar.default_view || 'dynamic');

  const [recurringRules, setRecurringRules] = useState<MeetingSeries[]>(calendar.recurring_rules || []);
  const [exceptions, setExceptions] = useState<MeetingException[]>(calendar.exceptions || []);
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>(calendar.blackout_dates || []);
  const [events, setEvents] = useState<CalendarEvent[]>(calendar.events || []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-persist calendar state directly to Supabase
  const persistCalendar = async (updates: Partial<TeamCalendar>) => {
    setSaving(true);
    const payload: Partial<TeamCalendar> = {
      ...(calendar.id ? { id: calendar.id } : {}),
      month_label: updates.month_label ?? monthLabels,
      image_url: updates.image_url ?? imageUrls,
      default_view: updates.default_view ?? defaultView,
      recurring_rules: updates.recurring_rules ?? recurringRules,
      exceptions: updates.exceptions ?? exceptions,
      blackout_dates: updates.blackout_dates ?? blackoutDates,
      events: updates.events ?? events,
      last_reviewed_month: updates.last_reviewed_month ?? calendar.last_reviewed_month ?? currentYearMonth,
      flyer_uploaded_at: updates.flyer_uploaded_at !== undefined ? updates.flyer_uploaded_at : calendar.flyer_uploaded_at,
    };

    const res = await updateCalendarAction(payload);
    setSaving(false);

    if (res.success && res.data) {
      setCalendar(res.data);
      return res.data;
    }
    return null;
  };

  // Meeting Rule Modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<MeetingSeries | null>(null);

  // Instance Override Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<GeneratedScheduleEvent | null>(null);

  // Blackout Date Inline Form
  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [newBlackoutReason, setNewBlackoutReason] = useState('');
  const [newBlackoutRuleId, setNewBlackoutRuleId] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current month schedule preview (excluding daily spam, displayed separately)
  const currentMonthSchedule = useMemo(() => {
    return generateMonthSchedule(
      currentYear,
      currentMonth,
      recurringRules,
      blackoutDates,
      events,
      exceptions,
      { excludeDaily: true }
    );
  }, [currentYear, currentMonth, recurringRules, blackoutDates, events, exceptions]);

  // Active Daily Rules
  const dailyRules = useMemo(() => {
    return recurringRules.filter((r) => r.is_active && r.frequency === 'daily');
  }, [recurringRules]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadMediaAction(formData);

      if (res.success && res.url) {
        const nextImages = {
          en: res.url,
          bm: res.url,
          cn: res.url,
          ta: res.url,
        };
        setImageUrls(nextImages);
        const saved = await persistCalendar({
          image_url: nextImages,
          flyer_uploaded_at: new Date().toISOString(),
        });
        if (saved) {
          onNotify('Flyer image uploaded and saved successfully');
        } else {
          onNotify('Flyer image uploaded, local sync only', true);
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

  const handleRemoveFlyer = async () => {
    const emptyImages = { en: '', bm: '', cn: '', ta: '' };
    setImageUrls(emptyImages);
    const saved = await persistCalendar({
      image_url: emptyImages,
      flyer_uploaded_at: undefined,
    });
    if (saved) onNotify('Monthly flyer removed and saved');
  };

  const handleToggleDefaultView = async (view: 'dynamic' | 'flyer') => {
    setDefaultView(view);
    const saved = await persistCalendar({ default_view: view });
    if (saved) onNotify(`Default view set to ${view === 'dynamic' ? 'Dynamic Calendar' : 'Monthly Flyer'}`);
  };

  const handleUrlChange = (val: string) => {
    setImageUrls({ en: val, bm: val, cn: val, ta: val });
  };

  const handleUrlBlur = async () => {
    if (imageUrls.en !== (calendar.image_url?.en || '')) {
      await persistCalendar({ image_url: imageUrls });
      onNotify('Flyer URL saved');
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
      exceptions,
      blackout_dates: blackoutDates,
      events,
      last_reviewed_month: calendar.last_reviewed_month || currentYearMonth,
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

  const handleConfirmMonthReview = async () => {
    setSaving(true);
    const payload: Partial<TeamCalendar> = {
      ...(calendar.id ? { id: calendar.id } : {}),
      month_label: monthLabels,
      image_url: imageUrls,
      default_view: defaultView,
      recurring_rules: recurringRules,
      exceptions,
      blackout_dates: blackoutDates,
      events,
      last_reviewed_month: currentYearMonth,
    };

    const res = await updateCalendarAction(payload);
    setSaving(false);

    if (res.success && res.data) {
      setCalendar(res.data);
      onNotify(`Month schedule confirmed and saved for ${currentYearMonth}!`);
    } else {
      onNotify('Failed to save month confirmation', true);
    }
  };

  const handleSaveRule = async (savedRule: MeetingSeries) => {
    const nextRules = recurringRules.some((r) => r.id === savedRule.id)
      ? recurringRules.map((r) => (r.id === savedRule.id ? savedRule : r))
      : [...recurringRules, savedRule];
    setRecurringRules(nextRules);
    setRuleModalOpen(false);
    setEditingRule(null);
    const res = await persistCalendar({ recurring_rules: nextRules });
    if (res) onNotify('Meeting rule saved');
    else onNotify('Meeting rule saved locally', true);
  };

  const handleDeleteRule = async (id: string) => {
    const nextRules = recurringRules.filter((r) => r.id !== id);
    setRecurringRules(nextRules);
    const res = await persistCalendar({ recurring_rules: nextRules });
    if (res) onNotify('Meeting rule removed');
    else onNotify('Failed to remove meeting rule', true);
  };

  const handleToggleRuleActive = async (id: string) => {
    const nextRules = recurringRules.map((r) =>
      r.id === id ? { ...r, is_active: !r.is_active } : r
    );
    setRecurringRules(nextRules);
    await persistCalendar({ recurring_rules: nextRules });
  };

  const handleOpenOverride = (instance: GeneratedScheduleEvent) => {
    setEditingInstance(instance);
    setOverrideModalOpen(true);
  };

  const handleSaveException = async (exception: MeetingException) => {
    const nextExceptions = [
      ...exceptions.filter(
        (e) => !(e.series_id === exception.series_id && e.original_date === exception.original_date)
      ),
      exception,
    ];
    setExceptions(nextExceptions);
    setOverrideModalOpen(false);
    setEditingInstance(null);
    const res = await persistCalendar({ exceptions: nextExceptions });
    if (res) onNotify('Schedule override applied and saved');
    else onNotify('Failed to save override', true);
  };

  const handleSkipInstance = async (instance: GeneratedScheduleEvent) => {
    const skipEx: MeetingException = {
      id: `ex-${Date.now()}`,
      series_id: instance.series_id || instance.rule_id || 'all',
      original_date: instance.original_date || instance.date,
      action: 'cancel',
      reason: 'Skipped for this date',
    };
    const nextExceptions = [
      ...exceptions.filter(
        (e) => !(e.series_id === skipEx.series_id && e.original_date === skipEx.original_date)
      ),
      skipEx,
    ];
    setExceptions(nextExceptions);
    const res = await persistCalendar({ exceptions: nextExceptions });
    if (res) onNotify(`Meeting on ${instance.date} skipped and saved`);
    else onNotify('Failed to save skip', true);
  };

  const handleRestoreInstance = async (seriesId: string, originalDate: string) => {
    const nextExceptions = exceptions.filter(
      (e) => !(e.series_id === seriesId && e.original_date === originalDate)
    );
    setExceptions(nextExceptions);
    const res = await persistCalendar({ exceptions: nextExceptions });
    if (res) onNotify(`Restored occurrence for ${originalDate}`);
  };

  const handleAddBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackoutDate.trim()) return;
    const newEntry: BlackoutDate = {
      id: `blackout-${Date.now()}`,
      date: newBlackoutDate.trim(),
      reason: newBlackoutReason.trim() || 'Meeting Cancelled / Rescheduled',
      rule_id: newBlackoutRuleId,
    };
    const nextBlackouts = [...blackoutDates, newEntry];
    setBlackoutDates(nextBlackouts);
    setNewBlackoutDate('');
    setNewBlackoutReason('');
    setNewBlackoutRuleId('all');
    const res = await persistCalendar({ blackout_dates: nextBlackouts });
    if (res) onNotify('Blackout date added and saved');
    else onNotify('Failed to save blackout date', true);
  };

  const handleDeleteBlackout = async (id: string) => {
    const nextBlackouts = blackoutDates.filter((b) => b.id !== id);
    setBlackoutDates(nextBlackouts);
    const res = await persistCalendar({ blackout_dates: nextBlackouts });
    if (res) onNotify('Blackout date removed');
  };

  const handleSaveEvent = async (savedEvent: CalendarEvent) => {
    const exists = events.some((e) => e.id === savedEvent.id);
    const nextEvents = exists
      ? events.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [...events, savedEvent];
    setEvents(nextEvents);
    await persistCalendar({ events: nextEvents });
    onNotify('Special event updated');
  };

  const handleDeleteEvent = async (id: string) => {
    const nextEvents = events.filter((e) => e.id !== id);
    setEvents(nextEvents);
    await persistCalendar({ events: nextEvents });
    onNotify('Special event removed');
  };

  return (
    <div className="space-y-6">
      {/* Monthly Review Prompt Banner */}
      {needsMonthReview && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-600/50 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
                🔔 Review Month Schedule ({currentYearMonth})
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Please review this month&apos;s schedule preview below, reschedule or skip any occurrences, and confirm the month schedule.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmMonthReview}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 flex-shrink-0 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Confirm &amp; Save Month Schedule</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-500" />
            <span>Monthly Calendar &amp; Schedule Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage meeting rules, monthly schedule overrides, blackout dates, and the flyer.
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
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Save Calendar &amp; Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Prominent Monthly Calendar Flyer & Default View Card */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <span>🖼️</span>
              <span>Monthly Calendar Flyer &amp; Default View</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upload this month&apos;s flyer poster and toggle which view regular members see first.
            </p>
          </div>

          {/* Default View Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleToggleDefaultView('dynamic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                defaultView === 'dynamic'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span>📅 Dynamic Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleDefaultView('flyer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                defaultView === 'flyer'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span>🖼️ Monthly Flyer</span>
            </button>
          </div>
        </div>

        {/* Flyer Upload & URL Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Flyer Image URL or Upload
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={imageUrls.en || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://... image URL (or upload below)"
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Monthly Flyer Image</span>
                  </>
                )}
              </button>
            </div>
            {imageUrls.en && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRemoveFlyer}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Flyer</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Thumbnail Preview */}
          <div className="lg:col-span-5">
            {imageUrls.en ? (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 max-h-48 flex items-center justify-center group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrls.en}
                  alt="Monthly Flyer Preview"
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
            ) : (
              <div className="h-28 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 p-4 text-center">
                <Upload className="w-5 h-5 mb-1 opacity-50" />
                <span className="text-xs">No monthly flyer uploaded yet</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 2-COLUMN LAYOUT: CARD 2 (LEFT) & CARD 3 (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* CARD 2 (Left Column): Recurring & One-Time Meetings Setup */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  🔄 Meeting Rules &amp; Series
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {recurringRules.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Set up Daily, Weekly, Monthly, and One-Time meeting rules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingRule(null);
                setRuleModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meeting</span>
            </button>
          </div>

          <div className="space-y-3">
            {recurringRules.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                No meeting rules set up yet. Click &quot;Add Meeting&quot; above to create one.
              </div>
            ) : (
              recurringRules.map((rule) => (
                <MeetingRuleCard
                  key={rule.id}
                  rule={rule}
                  onToggleActive={handleToggleRuleActive}
                  onEdit={(r) => {
                    setEditingRule(r);
                    setRuleModalOpen(true);
                  }}
                  onDelete={handleDeleteRule}
                />
              ))
            )}
          </div>
        </div>

        {/* CARD 3 (Right Column): This Month's Schedule & Date Overrides */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  📅 This Month&apos;s Schedule ({currentYearMonth})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {currentMonthSchedule.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Reschedule or skip any date for this month without affecting future months.
              </p>
            </div>
          </div>

          {/* Active Daily Meetings 1-Line Callout Banner */}
          {dailyRules.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base leading-none">🔁</span>
                <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
                  Daily Meetings ({dailyRules.length}):
                </span>
                <span className="text-amber-800 dark:text-amber-300 truncate">
                  {dailyRules.map((r) => `${r.title} (${r.time})`).join(', ')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex-shrink-0">
                Runs Daily
              </span>
            </div>
          )}

          {/* Chronological List of Generated Dates (Excludes Daily Spam) */}
          <div className="space-y-2.5">
            {currentMonthSchedule.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                No meeting dates generated for this month.
              </div>
            ) : (
              currentMonthSchedule.map((ev) => (
                <ScheduleOccurrenceRow
                  key={ev.id}
                  ev={ev}
                  titleStr={getLocalized(ev.title)}
                  onOpenOverride={handleOpenOverride}
                  onSkip={handleSkipInstance}
                  onRestore={handleRestoreInstance}
                />
              ))
            )}
          </div>

          {/* Collapsible Active Overrides & Blackout Dates at Bottom */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowOverridesAccordion((prev) => !prev)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🚫</span>
                <span>Active Date Overrides &amp; Blackouts ({exceptions.length + blackoutDates.length})</span>
              </div>
              {showOverridesAccordion ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {showOverridesAccordion && (
              <div className="mt-3 space-y-3 pl-1 pr-1 animate-in fade-in duration-150">
                {/* Inline Blackout Form */}
                <form
                  onSubmit={handleAddBlackout}
                  className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col sm:flex-row items-center gap-2 shadow-2xs"
                >
                  <input
                    type="date"
                    required
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    className="w-full sm:w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newBlackoutReason}
                    onChange={(e) => setNewBlackoutReason(e.target.value)}
                    placeholder="Reason (e.g. Public Holiday)"
                    className="w-full sm:flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blackout</span>
                  </button>
                </form>

                {/* Overrides & Blackouts List */}
                <div className="space-y-2">
                  {exceptions.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                          {ex.original_date} {ex.new_date ? `→ ${ex.new_date}` : '(Skipped)'}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 truncate">
                          {ex.reason || 'Override'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreInstance(ex.series_id, ex.original_date)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}

                  {blackoutDates.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-red-600 dark:text-red-400">
                          {b.date}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 truncate">
                          {b.reason}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlackout(b.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {exceptions.length === 0 && blackoutDates.length === 0 && (
                    <p className="text-center py-3 text-xs text-zinc-500">
                      No active overrides or blackout dates.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecurringRuleModal
        isOpen={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        onSave={handleSaveRule}
        rule={editingRule}
      />

      <InstanceOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setEditingInstance(null);
        }}
        instance={editingInstance}
        onSave={handleSaveException}
      />
    </div>
  );
}
