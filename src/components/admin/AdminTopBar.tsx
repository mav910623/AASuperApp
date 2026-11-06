'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Crown,
  ShieldCheck,
  Edit,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import type { AdminSession, AccessPinRole } from '@/types/app';

interface AdminTopBarProps {
  session: AdminSession;
  onLogout: () => void;
  loggingOut?: boolean;
}

export function AdminTopBar({ session, onLogout, loggingOut }: AdminTopBarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  const roleConfig: Record<
    AccessPinRole,
    { label: string; badgeClass: string; icon: React.ReactNode }
  > = {
    superadmin: {
      label: 'Super Admin',
      badgeClass:
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/60',
      icon: <Crown className="w-3.5 h-3.5 flex-shrink-0" />,
    },
    admin: {
      label: 'Admin',
      badgeClass:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/60',
      icon: <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />,
    },
    editor: {
      label: 'Editor',
      badgeClass:
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
      icon: <Edit className="w-3.5 h-3.5 flex-shrink-0" />,
    },
  };

  const currentRole = roleConfig[session.role] || roleConfig.editor;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand & User identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 font-black text-white shadow-sm flex-shrink-0">
            <span className="text-sm tracking-tight font-extrabold">TH</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                {session.label || 'Team Leader'}
              </span>

              {/* Role Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${currentRole.badgeClass}`}
              >
                {currentRole.icon}
                <span>{currentRole.label}</span>
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-zinc-500 dark:text-zinc-400">
              Admin Control Center
            </span>
          </div>
        </div>

        {/* Right actions: View Live App + Theme Toggle + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Live App */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Open Live App in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden xs:inline sm:inline">View Live App</span>
            <span className="xs:hidden sm:hidden">Live</span>
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-600" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            title="Log out of admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
