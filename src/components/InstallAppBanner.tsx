'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_DISMISSED_KEY = 'teamhub_pwa_dismissed';
const PWA_EVENT = 'teamhub_pwa_event';

function notifyPwaChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PWA_EVENT));
}

function subscribePwa(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(PWA_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(PWA_EVENT, callback);
  };
}

function getDismissedSnapshot(): boolean {
  try {
    return localStorage.getItem(PWA_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

function getIsIosSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

export function InstallAppBanner() {
  const { t, isHydrated } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const isDismissed = useSyncExternalStore(subscribePwa, getDismissedSnapshot, () => true);
  const isStandalone = useSyncExternalStore(subscribePwa, getStandaloneSnapshot, () => true);
  const isIOS = useSyncExternalStore(subscribePwa, getIsIosSnapshot, () => false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(PWA_DISMISSED_KEY, 'true');
      notifyPwaChange();
    } catch (err) {
      console.warn('[InstallAppBanner] Persist failed:', err);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') handleDismiss();
    } catch (err) {
      console.error('[InstallAppBanner] Prompt error:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!isHydrated || isDismissed || isStandalone || (!isIOS && !deferredPrompt)) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t('close')}
          className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-zinc-900 border border-zinc-700/50">
            <Image
              src="/icons/icon.svg"
              alt="Team Hub"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
              {t('install_app')}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('pwa_banner_desc')}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          {isIOS ? (
            <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  1
                </span>
                <span className="flex items-center gap-1 font-medium">
                  {t('pwa_ios_share_step')}
                  <Share className="w-3.5 h-3.5 text-blue-500 inline-block" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                  2
                </span>
                <span className="flex items-center gap-1 font-medium">
                  {t('pwa_ios_add_step')}
                  <PlusSquare className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 inline-block" />
                </span>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 text-xs font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t('add_to_home_screen')}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                {t('dismiss')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">{t('add_to_home_screen')}</span>
              <button
                type="button"
                onClick={handleDismiss}
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                {t('dismiss')}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
