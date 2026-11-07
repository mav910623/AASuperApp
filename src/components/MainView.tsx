'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import type { Section, Tool, TeamCalendar } from '@/types/app';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { SectionControls } from '@/components/SectionControls';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { CalendarTab } from '@/components/CalendarTab';
import { ShareAppTab } from '@/components/ShareAppTab';
import { EventDetailsModal } from '@/components/EventDetailsModal';
import {
  getEventsForCalendar,
  getActiveDailyMeetings,
  hasMeetingPassed,
  type GeneratedScheduleEvent,
} from '@/lib/calendarGenerator';
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
  const [bannerEventModal, setBannerEventModal] = useState<GeneratedScheduleEvent | null>(null);

  // Deep-linking: ?tab=calendar and ?section=<slug_or_id>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'calendar' || tabParam === 'share' || tabParam === 'saved' || tabParam === 'tools') {
      setActiveTab(tabParam as NavTab);
    }
    const sectionParam = params.get('section');
    if (sectionParam) {
      const found = (initialSections || []).find(
        (s) => s.id === sectionParam || s.slug?.toLowerCase() === sectionParam.toLowerCase()
      );
      if (found) {
        setActiveSectionId(found.id);
      }
    }
  }, [initialSections]);

  // Today's / Next Meeting Live Banner calculation
  const liveMeetingBanner = useMemo(() => {
    if (!initialCalendar) return null;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Get events for current month (excluding daily from grid) & active daily meetings
    const monthlyEvents = getEventsForCalendar(initialCalendar, year, month, { excludeDaily: true });
    const dailyMeetings = getActiveDailyMeetings(initialCalendar);

    // 1. Check if there's a specific meeting today that has not passed
    const upcomingTodayEvents = monthlyEvents.filter(
      (e) => e.date === todayStr && !hasMeetingPassed(todayStr, e.time, now)
    );
    if (upcomingTodayEvents.length > 0) {
      return { event: upcomingTodayEvents[0], isToday: true, label: 'Today' };
    }

    // 2. Fall back to active daily meeting today that has not passed
    const upcomingDaily = dailyMeetings.filter((dm) => !hasMeetingPassed(todayStr, dm.time, now));
    if (upcomingDaily.length > 0) {
      const dailyToday: GeneratedScheduleEvent = {
        ...upcomingDaily[0],
        date: todayStr,
      };
      return { event: dailyToday, isToday: true, label: 'Today (Daily)' };
    }

    // 3. Or next upcoming meeting this month
    const nextUpcoming = monthlyEvents.find((e) => e.date > todayStr);
    if (nextUpcoming) {
      return { event: nextUpcoming, isToday: false, label: nextUpcoming.date };
    }

    return null;
  }, [initialCalendar]);

  // Filter visible sections dynamically from Supabase, sorted by sort_order
  const visibleSections = useMemo(() => {
    return (initialSections || [])
      .filter((s) => s.is_visible !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [initialSections]);

  // Section sort order lookup map (sec.id -> sec.sort_order)
  const sectionOrderMap = useMemo(() => {
    const map: Record<string, number> = {};
    visibleSections.forEach((sec, idx) => {
      map[sec.id] = typeof sec.sort_order === 'number' ? sec.sort_order : idx + 1;
    });
    return map;
  }, [visibleSections]);

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

    // 3. Keep sections in order and respect tool sort_order strictly
    result.sort((a, b) => {
      const secA = sectionOrderMap[a.section_id] ?? 999;
      const secB = sectionOrderMap[b.section_id] ?? 999;
      if (secA !== secB) {
        return secA - secB;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    return result;
  }, [
    initialTools,
    activeSectionTools,
    searchQuery,
    contentLangFilter,
    sectionOrderMap,
  ]);

  // "WhatsApp Full Section" formatted sharing for a specific section
  const handleShareSection = (targetSection: Section, toolsToShare: Tool[]) => {
    if (toolsToShare.length === 0) return;

    const secTitle = getLocalized(targetSection.title) || targetSection.slug;
    const secDesc = getLocalized(targetSection.description) || '';

    const header = `🔥 *${secTitle}*${secDesc ? `\n_${secDesc}_\n` : '\n'}\n`;

    const toolsList = toolsToShare
      .map((tool, idx) => {
        const toolTitle = getLocalized(tool.title) || 'Resource';
        const toolUrl = getLocalized(tool.url);
        const speaker = tool.speaker_name ? ` (${tool.speaker_name})` : '';
        return `${idx + 1}. *${toolTitle}*${speaker}\n👉 ${toolUrl}`;
      })
      .join('\n\n');

    const sectionLink = typeof window !== 'undefined'
      ? `\n\n🔗 Open Section: ${window.location.origin}?section=${encodeURIComponent(targetSection.slug || targetSection.id)}`
      : '';

    const fullMsg = `${header}${toolsList}${sectionLink}\n\n_Shared via AA Team Hub_`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
    window.location.href = waUrl;
  };

  const handleShareFullSection = () => {
    if (activeSection) {
      handleShareSection(activeSection, activeSectionTools);
    } else {
      const targetTools = activeSectionTools;
      if (targetTools.length === 0) return;

      const secTitle = t('all', 'All Resources');
      const header = `🔥 *${secTitle}*\n\n`;

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
    }
  };

  // Saved Tools List - strictly respects sort_order
  const savedTools = useMemo(() => {
    return initialTools
      .filter((tool) => savedToolIds.includes(tool.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [initialTools, savedToolIds]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50 antialiased selection:bg-amber-500 selection:text-white">
      <Header />
      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-xl flex-1 pb-28">
        {/* Tab 1: Tools (Main View) */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Feature #3: One-Tap "Today's / Next Meeting" Live Banner */}
            {liveMeetingBanner && (
              <div className="px-4 pt-1">
                <button
                  type="button"
                  onClick={() => setBannerEventModal(liveMeetingBanner.event)}
                  className="w-full group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 hover:from-red-500/15 hover:via-amber-500/15 hover:to-blue-500/15 dark:from-red-950/40 dark:via-amber-950/30 dark:to-blue-950/40 border border-red-500/30 dark:border-red-500/40 shadow-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      <span className="text-red-600 dark:text-red-400 font-extrabold mr-1.5">
                        {liveMeetingBanner.isToday ? '🔴 Today' : `📅 ${liveMeetingBanner.label}`}
                        {liveMeetingBanner.event.time ? ` • ${liveMeetingBanner.event.time}` : ''}:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {getLocalized(liveMeetingBanner.event.title)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>View / Join</span>
                    <span aria-hidden="true">&rarr;</span>
                  </div>
                </button>
              </div>
            )}

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
              tools={initialTools}
            />

            <div className="space-y-4 px-4">
              {activeSectionId === 'all' && !searchQuery.trim() ? (
                filteredTools.length > 0 ? (
                  <div className="space-y-6">
                    {visibleSections.map((sec) => {
                      const secTools = filteredTools
                        .filter((t) => t.section_id === sec.id)
                        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

                      if (secTools.length === 0) return null;

                      const SecIcon = SECTION_ICON_MAP[sec.icon_name] || Folder;
                      const secTitle = getLocalized(sec.title) || sec.slug;

                      return (
                        <div key={sec.id} className="space-y-3">
                          {/* Sleek section divider header */}
                          <div className="flex items-center justify-between gap-2 pt-2 pb-1.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1E40AF] dark:bg-blue-950/60 dark:text-blue-300 flex-shrink-0">
                                <SecIcon className="h-3.5 w-3.5" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 truncate">
                                {secTitle}
                              </h3>
                              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                                ({secTools.length})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleShareSection(sec, secTools)}
                              className="px-2.5 py-1 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold inline-flex items-center gap-1 flex-shrink-0 shadow-xs active:scale-95 transition-all select-none"
                            >
                              <Share2 className="h-3 w-3" />
                              <span>Share Set</span>
                            </button>
                          </div>

                          {/* Section Tools */}
                          <div className="space-y-3.5">
                            {secTools.map((tool) => (
                              <ToolCard key={tool.id} tool={tool} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                )
              ) : filteredTools.length > 0 ? (
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

      {/* 1-Tap Home Meeting Live Banner Details Modal */}
      <EventDetailsModal
        isOpen={Boolean(bannerEventModal)}
        onClose={() => setBannerEventModal(null)}
        event={bannerEventModal}
      />
    </div>
  );
}
