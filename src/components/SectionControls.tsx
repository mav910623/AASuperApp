'use client';

import React from 'react';
import {
  Search,
  X,
  Share2,
  Layers,
  UserPlus,
  Rocket,
  Award,
  Sparkles,
  Compass,
  Folder,
  BookOpen,
  Video,
  Calendar,
  Star,
  Megaphone,
  FileText,
} from 'lucide-react';
import { useApp, type ContentLangFilter } from '@/context/AppContext';
import type { Section } from '@/types/app';

export const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  Rocket,
  Award,
  Sparkles,
  Layers,
  Compass,
  Folder,
  BookOpen,
  Video,
  Calendar,
  Star,
  Megaphone,
  FileText,
};

interface SectionControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  visibleSections: Section[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  contentLangFilter: ContentLangFilter;
  onContentLangChange: (lang: ContentLangFilter) => void;
  sectionToolCounts: Record<string, number>;
  totalToolsCount: number;
  activeSection: Section | null;
  activeSectionToolsCount: number;
  onShareFullSection: () => void;
  filteredCount?: number;
}

export function SectionControls({
  searchQuery,
  onSearchChange,
  visibleSections,
  activeSectionId,
  onSelectSection,
  contentLangFilter,
  onContentLangChange,
  sectionToolCounts,
  totalToolsCount,
  activeSection,
  activeSectionToolsCount,
  onShareFullSection,
  filteredCount = 0,
}: SectionControlsProps) {
  const { t, getLocalized } = useApp();

  return (
    <div className="space-y-3.5 pt-1">
      {/* 1) Single Smart Bar */}
      <div className="flex items-center gap-2 px-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_placeholder', 'Search topic, speaker, or tool...')}
            className="h-11 w-full rounded-2xl border border-zinc-200/90 bg-white pl-10 pr-9 text-xs sm:text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:border-[#1E40AF] focus:outline-none focus:ring-1 focus:ring-[#1E40AF] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Compact 3-Button Content Language Toggle */}
        <div className="flex items-center rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex-shrink-0">
          {[
            { id: 'all' as ContentLangFilter, label: t('all', 'All') },
            { id: 'en' as ContentLangFilter, label: 'EN' },
            { id: 'cn' as ContentLangFilter, label: '中文' },
          ].map((item) => {
            const isSelected = contentLangFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onContentLangChange(item.id)}
                className={`h-9 min-w-[36px] sm:min-w-[42px] px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2) Dynamic Section Selector Grid / Segmented Cards */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-1">
        {/* All Section Card */}
        <button
          type="button"
          onClick={() => onSelectSection('all')}
          className={`flex flex-shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
            activeSectionId === 'all'
              ? 'bg-[#1E40AF] text-white shadow-sm ring-1 ring-[#1E40AF]'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-xs'
          }`}
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-lg ${
              activeSectionId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span>{t('all', 'All')}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
              activeSectionId === 'all'
                ? 'bg-white text-[#1E40AF]'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {totalToolsCount}
          </span>
        </button>

        {/* Dynamic Visible Sections from Supabase */}
        {visibleSections.map((sec) => {
          const isActive = activeSectionId === sec.id;
          const IconComp = SECTION_ICON_MAP[sec.icon_name] || Folder;
          const sectionTitle = getLocalized(sec.title) || sec.slug;
          const count = sectionToolCounts[sec.id] || 0;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#1E40AF] text-white shadow-sm ring-1 ring-[#1E40AF]'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-800 shadow-xs'
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                <IconComp className="h-3.5 w-3.5" />
              </div>
              <span className="truncate max-w-[130px]">{sectionTitle}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  isActive
                    ? 'bg-white text-[#1E40AF]'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3) Section Header + "WhatsApp Full Section" Button */}
      {!searchQuery && (
        <div className="px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-blue-950/20 border border-blue-100/90 dark:border-zinc-800 p-4 shadow-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-zinc-50 truncate">
                  {activeSection
                    ? getLocalized(activeSection.title) || activeSection.slug
                    : t('all', 'All Resources')}
                </h2>
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  ({activeSectionToolsCount})
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {activeSection
                  ? getLocalized(activeSection.description) ||
                    'Browse curated resources and tools for this category'
                  : 'Access all team onboarding, prospecting, eBooks, and audios'}
              </p>
            </div>

            {/* WhatsApp Full Section Button */}
            {activeSectionToolsCount > 0 && (
              <button
                type="button"
                onClick={onShareFullSection}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex-shrink-0 select-none"
              >
                <Share2 className="h-4 w-4" />
                <span>{t('btn_share_section', 'WhatsApp Full Section')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Active Notification */}
      {searchQuery && (
        <div className="flex items-center justify-between px-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>
            Searching &quot;{searchQuery}&quot; across all sections ({filteredCount} results)
          </span>
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
