'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Folder, Loader2, AlertCircle } from 'lucide-react';
import { LANGUAGES } from './ToolBasicInfo';
import type { Section, LanguageCode } from '@/types/app';

const COMMON_ICONS = [
  'UserPlus',
  'Rocket',
  'Award',
  'Sparkles',
  'Folder',
  'BookOpen',
  'Video',
  'Calendar',
  'Star',
  'Compass',
  'Megaphone',
  'FileText',
];

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Partial<Section>) => Promise<boolean>;
  section?: Section | null;
}

export function SectionModal({ isOpen, onClose, onSave, section }: SectionModalProps) {
  const [titles, setTitles] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [descriptions, setDescriptions] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('Folder');
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<LanguageCode>('en');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (section) {
      setTitles({
        en: section.title?.en || '',
        bm: section.title?.bm || '',
        cn: section.title?.cn || '',
        ta: section.title?.ta || '',
      });
      setDescriptions({
        en: section.description?.en || '',
        bm: section.description?.bm || '',
        cn: section.description?.cn || '',
        ta: section.description?.ta || '',
      });
      setSlug(section.slug || '');
      setIconName(section.icon_name || 'Folder');
      setIsVisible(section.is_visible !== false);
    } else {
      setTitles({ en: '', bm: '', cn: '', ta: '' });
      setDescriptions({ en: '', bm: '', cn: '', ta: '' });
      setSlug('');
      setIconName('Folder');
      setIsVisible(true);
    }
    setError(null);
    setActiveTab('en');
  }, [section, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titles.en?.trim()) {
      setError('Section title in English is required.');
      setActiveTab('en');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Partial<Section> = {
      ...(section?.id ? { id: section.id } : {}),
      slug: slug.trim() || undefined,
      icon_name: iconName,
      is_visible: isVisible,
      title: titles,
      description: descriptions,
    };

    const success = await onSave(payload);
    setSaving(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to save section. Please check all fields.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Folder className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50">
              {section ? 'Edit Section' : 'Add New Section'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Icon Name
              </label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {COMMON_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Custom Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isVisible
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700'
              }`}
            >
              <span>{isVisible ? 'Section Visible to Users' : 'Section Hidden from Users'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-800">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setActiveTab(l.code)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === l.code
                      ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title ({activeTab.toUpperCase()}) {activeTab === 'en' && '*'}
                </label>
                <input
                  type="text"
                  value={titles[activeTab] || ''}
                  onChange={(e) => setTitles({ ...titles, [activeTab]: e.target.value })}
                  placeholder={`Section title in ${activeTab.toUpperCase()}...`}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description ({activeTab.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={descriptions[activeTab] || ''}
                  onChange={(e) => setDescriptions({ ...descriptions, [activeTab]: e.target.value })}
                  placeholder={`Section description in ${activeTab.toUpperCase()}...`}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{section ? 'Update Section' : 'Create Section'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
