'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AALogo } from '@/components/AALogo';
import type { LanguageCode } from '@/types/app';

export { AALogo };

export function Header() {
  const { lang, setLang, t, dictionary } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Show Tamil pill only if Tamil dictionary entries are populated
  const hasTamil = useMemo(() => {
    return Object.values(dictionary).some(
      (item) => typeof item.ta === 'string' && item.ta.trim().length > 0
    );
  }, [dictionary]);

  const languages: { code: LanguageCode; label: string }[] = useMemo(() => [
    { code: 'en', label: 'EN' },
    { code: 'bm', label: 'BM' },
    { code: 'cn', label: '中文' },
    ...(hasTamil ? [{ code: 'ta' as LanguageCode, label: 'தமிழ்' }] : []),
  ], [hasTamil]);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4 sm:px-6">
        {/* App Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <AALogo size="md" />
          <h1 className="truncate text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-xl">
            {t('app_title', 'Team Hub')}
          </h1>
        </div>

        {/* Right Section: Language Switcher + Theme Toggle + Discreet Lock */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* UI Language Pill Switcher */}
          <nav
            aria-label="UI Language Switcher"
            className="flex items-center rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            {languages.map((l) => {
              const isActive = lang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  aria-pressed={isActive}
                  className={`min-h-[34px] min-w-[36px] rounded-full px-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950 font-bold'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </nav>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {/* Discreet Lock Icon linking to /admin */}
          <Link
            href="/admin"
            aria-label="Admin Portal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
