'use client';

import React, { useRef } from 'react';
import {
  Search,
  X,
  UserPlus,
  Rocket,
  Award,
  Sparkles,
  Layers,
  Compass,
  Folder,
  Tag,
} from 'lucide-react';
import { useApp, type ContentLangFilter } from '@/context/AppContext';
import type { Section } from '@/types/app';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sections: Section[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  contentLang: ContentLangFilter;
  onContentLangChange: (lang: ContentLangFilter) => void;
  topicTags: string[];
  activeTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  hasTamil?: boolean;
}

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Rocket,
  Award,
  Sparkles,
  Layers,
  Compass,
  Folder,
};

export function FilterBar({
  searchQuery,
  onSearchChange,
  sections,
  activeSectionId,
  onSelectSection,
  contentLang,
  onContentLangChange,
  topicTags,
  activeTopic,
  onSelectTopic,
  hasTamil = false,
}: FilterBarProps) {
  const { t, getLocalized } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const langFilters: { value: ContentLangFilter; label: string }[] = [
    { value: 'all', label: t('all', 'All') },
    { value: 'en', label: 'EN' },
    { value: 'bm', label: 'BM' },
    { value: 'cn', label: '中文' },
    ...(hasTamil ? [{ value: 'ta' as ContentLangFilter, label: 'தமிழ்' }] : []),
  ];

  return (
    <div className="w-full space-y-3 py-2">
      {/* Search Input Bar */}
      <div className="relative px-4">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder', 'Search topic, speaker, or tool...')}
            className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-10 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:bg-zinc-950 dark:focus:ring-zinc-100 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Horizontal Scrollable Section Pills */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-1">
        {/* All Section Pill */}
        <button
          type="button"
          onClick={() => onSelectSection('all')}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
            activeSectionId === 'all'
              ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{t('all', 'All')}</span>
        </button>

        {/* Dynamic Section Pills */}
        {sections.map((sec) => {
          const isActive = activeSectionId === sec.id;
          const IconComp = SECTION_ICON_MAP[sec.icon_name] || Folder;
          const sectionTitle = getLocalized(sec.title) || sec.slug;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50'
              }`}
            >
              <IconComp className="h-3.5 w-3.5" />
              <span>{sectionTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Filter Row: Compact Content Language Filter + Dynamic Topic Tags */}
      <div className="flex flex-col gap-2 px-4">
        {/* Content Language Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1 flex-shrink-0">
            Lang:
          </span>
          {langFilters.map((lf) => {
            const isSelected = contentLang === lf.value;
            return (
              <button
                key={lf.value}
                type="button"
                onClick={() => onContentLangChange(lf.value)}
                className={`min-h-[28px] rounded-lg px-2.5 text-xs font-bold transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {lf.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Topic Tag Pills */}
        {topicTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-1 flex-shrink-0 flex items-center gap-1">
              <Tag className="h-3 w-3" />
            </span>
            {topicTags.map((topic) => {
              const isSelected = activeTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onSelectTopic(isSelected ? null : topic)}
                  className={`min-h-[26px] flex-shrink-0 rounded-full px-3 text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700/50'
                  }`}
                >
                  #{topic}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
