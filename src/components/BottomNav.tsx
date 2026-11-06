'use client';

import React from 'react';
import { Layers, Star, Calendar, Share2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type NavTab = 'tools' | 'saved' | 'calendar' | 'share';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount?: number;
}

export function BottomNav({ activeTab, onSelectTab, savedCount = 0 }: BottomNavProps) {
  const { t } = useApp();

  const tabs: { id: NavTab; labelKey: string; defaultLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tools', labelKey: 'nav_tools', defaultLabel: 'Tools', icon: Layers },
    { id: 'saved', labelKey: 'nav_saved', defaultLabel: 'Saved', icon: Star },
    { id: 'calendar', labelKey: 'nav_calendar', defaultLabel: 'Calendar', icon: Calendar },
    { id: 'share', labelKey: 'nav_share_app', defaultLabel: 'Share App', icon: Share2 },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/95 transition-colors"
    >
      <div className="mx-auto flex max-w-xl items-center justify-around px-2 pt-2 pb-3 sm:pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = t(tab.labelKey, tab.defaultLabel);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5 min-h-[52px] transition-all active:scale-95 ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                      : 'bg-transparent text-current'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {/* Saved Count Badge */}
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white shadow-xs">
                    {savedCount > 99 ? '99+' : savedCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] tracking-tight leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
