'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import type { Section, Tool } from '@/types/app';

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
  tools?: Tool[];
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
  tools = [],
}: SectionControlsProps) {
  const { t, getLocalized } = useApp();

  // Smooth slide-down sticky section bar on scroll up
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const past = currentScrollY > 140;
      setIsScrolledPast(past);

      if (!past) {
        setShowFloatingBar(false);
      } else {
        const diff = lastScrollY - currentScrollY;
        if (diff > 6) {
          // Scrolling up by > 6px
          setShowFloatingBar(true);
        } else if (diff < -6) {
          // Scrolling down by > 6px
          setShowFloatingBar(false);
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic language filter options based on visible tools
  const hasBm = useMemo(
    () => tools.some((tl) => tl.is_visible !== false && tl.available_languages?.includes('bm')),
    [tools]
  );
  const hasTa = useMemo(
    () => tools.some((tl) => tl.is_visible !== false && tl.available_languages?.includes('ta')),
    [tools]
  );

  const langFilterOptions = useMemo(() => {
    const options: { id: ContentLangFilter; label: string }[] = [
      { id: 'all', label: t('all', 'All') },
      { id: 'en', label: 'EN' },
    ];
    if (hasBm) {
      options.push({ id: 'bm', label: 'BM' });
    }
    options.push({ id: 'cn', label: '中文' });
    if (hasTa) {
      options.push({ id: 'ta', label: 'தமிழ்' });
    }
    return options;
  }, [hasBm, hasTa, t]);

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

        {/* Compact Dynamic Content Language Toggle */}
        <div className="flex items-center rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex-shrink-0">
          {langFilterOptions.map((item) => {
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
      <div className="h-14">
        <div
          className={
            isScrolledPast
              ? `fixed top-16 left-0 right-0 z-30 mx-auto max-w-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-2 border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-md transition-all duration-200 ${
                  showFloatingBar
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-full opacity-0 pointer-events-none'
                }`
              : 'py-2 border-b border-zinc-200/60 dark:border-zinc-800/60'
          }
        >
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4">
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
        </div>
      </div>

      {/* 3) Sleek, Compact Section Header Row */}
      {!searchQuery && (
        <div className="px-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-blue-50/30 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-blue-950/20 border border-blue-100/80 dark:border-zinc-800 px-3.5 py-2.5 shadow-xs">
            {/* Left side: Title + count badge + 1-line subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-zinc-950 dark:text-zinc-50 truncate">
                  {activeSection
                    ? getLocalized(activeSection.title) || activeSection.slug
                    : t('all', 'All Resources')}
                </h2>
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                  ({activeSectionToolsCount})
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate leading-tight">
                {activeSection
                  ? getLocalized(activeSection.description) ||
                    'Browse curated resources and tools for this category'
                  : 'Access all team onboarding, prospecting, eBooks, and audios'}
              </p>
            </div>

            {/* Right side: Small compact pill button */}
            {activeSectionToolsCount > 0 && (
              <button
                type="button"
                onClick={onShareFullSection}
                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold inline-flex items-center gap-1.5 flex-shrink-0 shadow-sm active:scale-95 transition-all select-none"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{t('btn_share_section', 'Share Set')}</span>
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
