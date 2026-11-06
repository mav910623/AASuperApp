'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { LanguageCode, LocalizedString, UiDictionary } from '@/types/app';
import { DEFAULT_LANGUAGE } from '@/types/app';
import { DEFAULT_UI_DICTIONARY } from '@/lib/dictionary';

export type ContentLangFilter = 'all' | LanguageCode;

export interface AppContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  contentLangFilter: ContentLangFilter;
  setContentLangFilter: (filter: ContentLangFilter) => void;
  savedToolIds: string[];
  toggleSavedTool: (id: string) => void;
  isToolSaved: (id: string) => boolean;
  t: (key: string, fallback?: string) => string;
  getLocalized: (obj?: Partial<LocalizedString> | null, targetLang?: LanguageCode) => string;
  dictionary: Record<string, UiDictionary>;
  isHydrated: boolean;
}

const LANG_KEY = 'teamhub_lang';
const SAVED_TOOLS_KEY = 'teamhub_saved_tools';
const FILTER_KEY = 'teamhub_content_filter';
const STORAGE_EVENT = 'teamhub_storage_update';

function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

function subscribeStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

let cachedSavedToolsRaw: string | null = null;
let cachedSavedTools: string[] = [];
const SERVER_SAVED_TOOLS: string[] = [];

function getSavedToolsSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_TOOLS_KEY);
    if (raw !== cachedSavedToolsRaw) {
      cachedSavedToolsRaw = raw;
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedSavedTools = Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === 'string')
          : [];
      } else {
        cachedSavedTools = [];
      }
    }
  } catch {
    cachedSavedTools = [];
  }
  return cachedSavedTools;
}

export function getLocalized(
  obj?: Partial<LocalizedString> | null,
  targetLang?: LanguageCode,
  activeLang: LanguageCode = DEFAULT_LANGUAGE
): string {
  if (!obj) return '';
  const langToUse = targetLang || activeLang;
  const val = obj[langToUse]?.trim();
  if (val) return val;

  if (obj.en?.trim()) return obj.en.trim();
  if (obj.bm?.trim()) return obj.bm.trim();
  if (obj.cn?.trim()) return obj.cn.trim();
  if (obj.ta?.trim()) return obj.ta.trim();
  return '';
}

export interface AppProviderProps {
  children: ReactNode;
  initialDictionary?: UiDictionary[] | Record<string, UiDictionary>;
  defaultLang?: LanguageCode;
  defaultContentFilter?: ContentLangFilter;
}

export function AppProvider({
  children,
  initialDictionary,
  defaultLang = DEFAULT_LANGUAGE,
  defaultContentFilter = 'all',
}: AppProviderProps) {
  const getLangSnapshot = useCallback((): LanguageCode => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored && ['en', 'bm', 'cn', 'ta'].includes(stored)) {
        return stored as LanguageCode;
      }
    } catch {}
    return defaultLang;
  }, [defaultLang]);

  const getFilterSnapshot = useCallback((): ContentLangFilter => {
    try {
      const stored = localStorage.getItem(FILTER_KEY);
      if (stored && ['all', 'en', 'bm', 'cn', 'ta'].includes(stored)) {
        return stored as ContentLangFilter;
      }
    } catch {}
    return defaultContentFilter;
  }, [defaultContentFilter]);

  const lang = useSyncExternalStore(subscribeStorage, getLangSnapshot, () => defaultLang);
  const contentLangFilter = useSyncExternalStore(
    subscribeStorage,
    getFilterSnapshot,
    () => defaultContentFilter
  );
  const savedToolIds = useSyncExternalStore(
    subscribeStorage,
    getSavedToolsSnapshot,
    () => SERVER_SAVED_TOOLS
  );
  const isHydrated = useSyncExternalStore(subscribeStorage, () => true, () => false);

  const dictionaryMap = useMemo<Record<string, UiDictionary>>(() => {
    const map: Record<string, UiDictionary> = { ...DEFAULT_UI_DICTIONARY };
    if (Array.isArray(initialDictionary)) {
      for (const row of initialDictionary) {
        if (row?.key) map[row.key] = row;
      }
    } else if (initialDictionary && typeof initialDictionary === 'object') {
      Object.assign(map, initialDictionary);
    }
    return map;
  }, [initialDictionary]);

  const setLang = useCallback((newLang: LanguageCode) => {
    try {
      localStorage.setItem(LANG_KEY, newLang);
      notifyStorageChange();
    } catch (err) {
      console.warn('[AppContext] Persist lang error:', err);
    }
  }, []);

  const setContentLangFilter = useCallback((filter: ContentLangFilter) => {
    try {
      localStorage.setItem(FILTER_KEY, filter);
      notifyStorageChange();
    } catch (err) {
      console.warn('[AppContext] Persist filter error:', err);
    }
  }, []);

  const toggleSavedTool = useCallback((id: string) => {
    const current = getSavedToolsSnapshot();
    const exists = current.includes(id);
    const next = exists ? current.filter((item) => item !== id) : [...current, id];
    try {
      localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(next));
      notifyStorageChange();
    } catch (err) {
      console.warn('[AppContext] Persist tools error:', err);
    }
  }, []);

  const isToolSaved = useCallback(
    (id: string) => savedToolIds.includes(id),
    [savedToolIds]
  );

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const row = dictionaryMap[key];
      if (row) {
        const activeVal = row[lang]?.trim();
        if (activeVal) return activeVal;
        const enVal = row.en?.trim();
        if (enVal) return enVal;
        const bmVal = row.bm?.trim();
        if (bmVal) return bmVal;
        const cnVal = row.cn?.trim();
        if (cnVal) return cnVal;
        const taVal = row.ta?.trim();
        if (taVal) return taVal;
      }
      return fallback !== undefined ? fallback : key;
    },
    [dictionaryMap, lang]
  );

  const boundGetLocalized = useCallback(
    (obj?: Partial<LocalizedString> | null, targetLang?: LanguageCode): string => {
      return getLocalized(obj, targetLang, lang);
    },
    [lang]
  );

  const contextValue = useMemo<AppContextType>(
    () => ({
      lang,
      setLang,
      contentLangFilter,
      setContentLangFilter,
      savedToolIds,
      toggleSavedTool,
      isToolSaved,
      t,
      getLocalized: boundGetLocalized,
      dictionary: dictionaryMap,
      isHydrated,
    }),
    [
      lang,
      setLang,
      contentLangFilter,
      setContentLangFilter,
      savedToolIds,
      toggleSavedTool,
      isToolSaved,
      t,
      boundGetLocalized,
      dictionaryMap,
      isHydrated,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { DEFAULT_UI_DICTIONARY };

export const AppContext = createContext<AppContextType | undefined>(undefined);
