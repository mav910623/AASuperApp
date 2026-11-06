'use client';

import React from 'react';
import { Star, Eye, EyeOff, Check, Video, Music, FileText, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import type { ToolType, LanguageCode, Section } from '@/types/app';

export const TOOL_TYPES: { type: ToolType; label: string; icon: React.ReactNode }[] = [
  { type: 'youtube', label: 'YouTube', icon: <Video className="w-3.5 h-3.5 text-red-500" /> },
  { type: 'soundcloud', label: 'SoundCloud', icon: <Music className="w-3.5 h-3.5 text-orange-500" /> },
  { type: 'video', label: 'Direct Video', icon: <Video className="w-3.5 h-3.5 text-blue-500" /> },
  { type: 'pdf', label: 'PDF Document', icon: <FileText className="w-3.5 h-3.5 text-amber-500" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> },
  { type: 'link', label: 'Web Link', icon: <LinkIcon className="w-3.5 h-3.5 text-purple-500" /> },
];

export const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bm', label: 'BM', flag: '🇲🇾' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
];

export interface ToolBasicInfoProps {
  sections: Section[];
  sectionId: string;
  setSectionId: (id: string) => void;
  type: ToolType;
  setType: (type: ToolType) => void;
  speakerName: string;
  setSpeakerName: (name: string) => void;
  duration: string;
  setDuration: (dur: string) => void;
  isFeatured: boolean;
  setIsFeatured: (feat: boolean) => void;
  isVisible: boolean;
  setIsVisible: (vis: boolean) => void;
  availableLanguages: LanguageCode[];
  toggleLanguage: (code: LanguageCode) => void;
}

export function ToolBasicInfo(props: ToolBasicInfoProps) {
  const {
    sections,
    sectionId,
    setSectionId,
    type,
    setType,
    speakerName,
    setSpeakerName,
    duration,
    setDuration,
    isFeatured,
    setIsFeatured,
    isVisible,
    setIsVisible,
    availableLanguages,
    toggleLanguage,
  } = props;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
        1. Basic Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Section *
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title?.en || sec.slug}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Media Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ToolType)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {TOOL_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Speaker / Author
          </label>
          <input
            type="text"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="e.g. Marcus Vance"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Duration / Format
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 5 mins, 📄 PDF (6 Pages)"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setIsFeatured(!isFeatured)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isFeatured
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>⭐ Featured at top</span>
        </button>

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isVisible
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700'
          }`}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isVisible ? 'Visible to Users' : 'Hidden from Users'}</span>
        </button>
      </div>

      <div className="pt-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Available Languages Checkboxes
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const checked = availableLanguages.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => toggleLanguage(l.code)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  checked
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm'
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {checked && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
