'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { Section, Tool, TeamCalendar } from '@/types/app';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { SectionControls } from '@/components/SectionControls';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { CalendarTab } from '@/components/CalendarTab';
import { ShareAppTab } from '@/components/ShareAppTab';
import {
  Star,
  FolderX,
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
  Megaphone,
  FileText,
} from 'lucide-react';

const SECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface MainViewProps {
  initialSections: Section[];
  initialTools: Tool[];
  initialCalendar: TeamCalendar;
}

export function MainView({
  initialSections,
  initialTools,
  initialCalendar,
}: MainViewProps) {
  const {
    lang,
    getLocalized,
    contentLangFilter,
    setContentLangFilter,
    savedToolIds,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('all');

  // Filter visible sections dynamically from Supabase
  const visibleSections = useMemo(() => {
    return (initialSections || []).filter((s) => s.is_visible !== false);
  }, [initialSections]);

  // Dynamic tool count per section
  const sectionToolCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialTools.length };
    visibleSections.forEach((sec) => {
      counts[sec.id] = initialTools.filter((t) => t.section_id === sec.id && t.is_visible !== false).length;
    });
    return counts;
  }, [visibleSections, initialTools]);

  // Current active section object (if specific section selected)
  const activeSection = useMemo(() => {
    if (activeSectionId === 'all') return null;
    return visibleSections.find((s) => s.id === activeSectionId) || null;
  }, [visibleSections, activeSectionId]);

  // Tools in the active section (before search query)
  const activeSectionTools = useMemo(() => {
    if (activeSectionId === 'all') {
      return initialTools.filter((t) => t.is_visible !== false);
    }
    return initialTools.filter(
      (t) => t.section_id === activeSectionId && t.is_visible !== false
    );
  }, [initialTools, activeSectionId]);

  // Real-time filtered tools list
  // If search query is present, search across ALL sections instantly by title or speaker name!
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // Search across ALL sections when user types in search bar
    const pool = q
      ? initialTools.filter((t) => t.is_visible !== false)
      : activeSectionTools;

    const result = pool.filter((tool) => {
      // 1. Content Language Filter
      if (
        contentLangFilter !== 'all' &&
        (!tool.available_languages || !tool.available_languages.includes(contentLangFilter))
      ) {
        return false;
      }

      // 2. Real-time Search Filter across Title and Speaker Name
      if (q) {
        const matchSpeaker = tool.speaker_name?.toLowerCase().includes(q);
        const matchTitle = Object.values(tool.title || {}).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q)
        );
        const matchDesc = Object.values(tool.description || {}).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q)
        );
        const matchTopics = Object.values(tool.topics || {}).some((arr) =>
          Array.isArray(arr) && arr.some((item) => item?.toLowerCase().includes(q))
        );

        if (!matchSpeaker && !matchTitle && !matchDesc && !matchTopics) {
          return false;
        }
      }

      return true;
    });

    // 3. Featured tools ALWAYS sort to the top, then by sort_order
    result.sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return a.is_featured ? -1 : 1;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return result;
  }, [
    initialTools,
    activeSectionTools,
    searchQuery,
    contentLangFilter,
  ]);

  // "WhatsApp Full Section" formatted sharing
  const handleShareFullSection = () => {
    const targetTools = activeSectionTools;
    if (targetTools.length === 0) return;

    const secTitle = activeSection
      ? getLocalized(activeSection.title) || activeSection.slug
      : t('all', 'All Resources');
    const secDesc = activeSection ? getLocalized(activeSection.description) : '';

    const header = `🔥 *${secTitle}*${secDesc ? `\n_${secDesc}_\n` : '\n'}\n`;

    const toolsList = targetTools
      .map((tool, idx) => {
        const toolTitle = getLocalized(tool.title) || 'Resource';
        const toolUrl = getLocalized(tool.url);
        const speaker = tool.speaker_name ? ` (${tool.speaker_name})` : '';
        return `${idx + 1}. *${toolTitle}*${speaker}\n👉 ${toolUrl}`;
      })
      .join('\n\n');

    const fullMsg = `${header}${toolsList}\n\n_Shared via AA Team Hub_`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
    window.location.href = waUrl;
  };

  // Saved Tools List
  const savedTools = useMemo(() => {
    return initialTools
      .filter((tool) => savedToolIds.includes(tool.id))
      .sort((a, b) => {
        if (a.is_featured !== b.is_featured) {
          return a.is_featured ? -1 : 1;
        }
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });
  }, [initialTools, savedToolIds]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 antialiased selection:bg-amber-500 selection:text-white">
      <Header />
      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-xl flex-1 pb-28">
        {/* Tab 1: Tools (Main View) */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <SectionControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              visibleSections={visibleSections}
              activeSectionId={activeSectionId}
              onSelectSection={setActiveSectionId}
              contentLangFilter={contentLangFilter}
              onContentLangChange={setContentLangFilter}
              sectionToolCounts={sectionToolCounts}
              totalToolsCount={initialTools.length}
              activeSection={activeSection}
              activeSectionToolsCount={activeSectionTools.length}
              onShareFullSection={handleShareFullSection}
              filteredCount={filteredTools.length}
            />

            <div className="space-y-4 px-4">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 text-center bg-white/50 dark:bg-zinc-900/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 mb-3">
                    <FolderX className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {t('empty_section', 'No tools match your filter.')}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                    Try adjusting your search query or content language filter.
                  </p>
                  {(searchQuery || contentLangFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setContentLangFilter('all');
                      }}
                      className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Saved (Starred Tools) */}
        {activeTab === 'saved' && (
          <div className="space-y-4 px-4 py-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl">
                {t('favorites', 'Saved Tools')}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Quick access to tools you have starred for offline prospecting and review.
              </p>
            </div>

            {savedTools.length > 0 ? (
              <div className="space-y-4">
                {savedTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 text-center bg-white/50 dark:bg-zinc-900/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/50 dark:text-amber-400 mb-3">
                  <Star className="h-7 w-7 fill-amber-400 text-amber-500" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t('no_favorites', 'No saved tools yet.')}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                  Tap the star icon on any tool card in the Tools tab to save it here for instant access.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className="mt-4 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 transition-colors"
                >
                  Browse Tools
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Calendar */}
        {activeTab === 'calendar' && (
          <CalendarTab calendar={initialCalendar} />
        )}

        {/* Tab 4: Share App */}
        {activeTab === 'share' && <ShareAppTab />}
      </main>
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedToolIds.length}
      />
    </div>
  );
}
