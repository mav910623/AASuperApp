'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import type { Section, Tool, TeamCalendar } from '@/types/app';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { ToolCard } from '@/components/ToolCard';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { CalendarTab } from '@/components/CalendarTab';
import { ShareAppTab } from '@/components/ShareAppTab';
import { Star, FolderX } from 'lucide-react';

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
    contentLangFilter,
    setContentLangFilter,
    savedToolIds,
    t,
    dictionary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // Check if Tamil dictionary entries are populated
  const hasTamil = useMemo(() => {
    return Object.values(dictionary).some(
      (item) => typeof item.ta === 'string' && item.ta.trim().length > 0
    );
  }, [dictionary]);

  // Extract dynamic topic tags from tools in the current section
  const topicTags = useMemo(() => {
    const relevantTools =
      activeSectionId === 'all'
        ? initialTools
        : initialTools.filter((tItem) => tItem.section_id === activeSectionId);

    const tagSet = new Set<string>();
    relevantTools.forEach((tool) => {
      const list = tool.topics?.[lang] || tool.topics?.en || [];
      if (Array.isArray(list)) {
        list.forEach((tag) => {
          if (tag && tag.trim()) tagSet.add(tag.trim());
        });
      }
    });

    return Array.from(tagSet);
  }, [initialTools, activeSectionId, lang]);

  // Real-time filtered tools list
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = initialTools.filter((tool) => {
      // 1. Section Filter
      if (activeSectionId !== 'all' && tool.section_id !== activeSectionId) {
        return false;
      }

      // 2. Content Language Filter
      if (
        contentLangFilter !== 'all' &&
        (!tool.available_languages || !tool.available_languages.includes(contentLangFilter))
      ) {
        return false;
      }

      // 3. Dynamic Topic Filter
      if (activeTopic) {
        const topicsInLang = tool.topics?.[lang] || tool.topics?.en || [];
        const hasTopic =
          Array.isArray(topicsInLang) &&
          topicsInLang.some(
            (tItem) => tItem.toLowerCase() === activeTopic.toLowerCase()
          );
        if (!hasTopic) return false;
      }

      // 4. Real-time Search Filter across Title, Description, Speaker Name, and Topics in all languages
      if (q) {
        const matchSpeaker = tool.speaker_name?.toLowerCase().includes(q);
        const matchTitle = Object.values(tool.title || {}).some((v) =>
          typeof v === 'string' && v.toLowerCase().includes(q)
        );
        const matchDesc = Object.values(tool.description || {}).some((v) =>
          typeof v === 'string' && v.toLowerCase().includes(q)
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

    // 5. Featured tools ALWAYS sort to the top of the section, then by sort_order
    result.sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return a.is_featured ? -1 : 1;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return result;
  }, [
    initialTools,
    activeSectionId,
    contentLangFilter,
    activeTopic,
    searchQuery,
    lang,
  ]);

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
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sections={initialSections}
              activeSectionId={activeSectionId}
              onSelectSection={(id) => {
                setActiveSectionId(id);
                setActiveTopic(null);
              }}
              contentLang={contentLangFilter}
              onContentLangChange={setContentLangFilter}
              topicTags={topicTags}
              activeTopic={activeTopic}
              onSelectTopic={setActiveTopic}
              hasTamil={hasTamil}
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
                    Try adjusting your search query, content language, or topic selection.
                  </p>
                  {(searchQuery || activeTopic || contentLangFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTopic(null);
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
