'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Calendar,
  Languages,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { AdminTopBar } from './AdminTopBar';
import { TabSectionsTools } from './TabSectionsTools';
import { TabCalendar } from './TabCalendar';
import { TabDictionary } from './TabDictionary';
import { TabAccessPins } from './TabAccessPins';
import { logoutPinAction } from '@/app/actions/adminActions';
import type { Section, Tool, TeamCalendar, UiDictionary, AccessPin, AdminSession } from '@/types/app';

export interface AdminDashboardProps {
  session: AdminSession;
  initialSections: Section[];
  initialTools: Tool[];
  initialCalendar: TeamCalendar;
  initialDictionary: UiDictionary[];
  initialPins?: AccessPin[];
  onLogoutSuccess: () => void;
}

export type AdminTab = 'sections_tools' | 'calendar' | 'dictionary' | 'pins';

export function AdminDashboard({
  session,
  initialSections,
  initialTools,
  initialCalendar,
  initialDictionary,
  initialPins = [],
  onLogoutSuccess,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('sections_tools');
  const [loggingOut, setLoggingOut] = useState(false);

  // Global state across dashboard tabs
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [calendar, setCalendar] = useState<TeamCalendar>(initialCalendar);
  const [dictionary, setDictionary] = useState<UiDictionary[]>(initialDictionary);
  const [pins, setPins] = useState<AccessPin[]>(initialPins);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const notify = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutPinAction();
      onLogoutSuccess();
    } catch {
      onLogoutSuccess();
    } finally {
      setLoggingOut(false);
    }
  };

  // Role-based visible tabs definition
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; allowedRoles: string[] }[] = [
    {
      id: 'sections_tools',
      label: 'Sections & Tools',
      icon: <FolderKanban className="w-4 h-4 text-amber-500" />,
      allowedRoles: ['editor', 'admin', 'superadmin'],
    },
    {
      id: 'calendar',
      label: 'Monthly Calendar',
      icon: <Calendar className="w-4 h-4 text-blue-500" />,
      allowedRoles: ['admin', 'superadmin'],
    },
    {
      id: 'dictionary',
      label: 'UI Text & Translations',
      icon: <Languages className="w-4 h-4 text-emerald-500" />,
      allowedRoles: ['admin', 'superadmin'],
    },
    {
      id: 'pins',
      label: 'PIN & Access Control',
      icon: <KeyRound className="w-4 h-4 text-purple-500" />,
      allowedRoles: ['superadmin'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.allowedRoles.includes(session.role));

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      <AdminTopBar session={session} onLogout={handleLogout} loggingOut={loggingOut} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto no-scrollbar rounded-2xl bg-white dark:bg-zinc-900 p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm gap-1">
          {visibleTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm scale-[1.01]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab View Panels */}
        <div className="transition-all animate-in fade-in duration-200">
          {activeTab === 'sections_tools' && (
            <TabSectionsTools
              sections={sections}
              setSections={setSections}
              tools={tools}
              setTools={setTools}
              onNotify={notify}
            />
          )}

          {activeTab === 'calendar' && (
            <TabCalendar calendar={calendar} setCalendar={setCalendar} onNotify={notify} />
          )}

          {activeTab === 'dictionary' && (
            <TabDictionary
              dictionary={dictionary}
              setDictionary={setDictionary}
              onNotify={notify}
            />
          )}

          {activeTab === 'pins' && session.role === 'superadmin' && (
            <TabAccessPins
              pins={pins}
              setPins={setPins}
              currentSession={session}
              onNotify={notify}
            />
          )}
        </div>
      </main>

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl border border-zinc-700 dark:border-zinc-300 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          {toast.isError ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 p-0.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
