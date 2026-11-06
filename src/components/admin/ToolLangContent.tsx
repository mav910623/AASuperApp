'use client';

import React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { LANGUAGES } from './ToolBasicInfo';
import type { LanguageCode } from '@/types/app';

export interface ToolLangContentProps {
  activeLangTab: LanguageCode;
  setActiveLangTab: (tab: LanguageCode) => void;
  availableLanguages: LanguageCode[];
  titles: Record<LanguageCode, string>;
  setTitles: React.Dispatch<React.SetStateAction<Record<LanguageCode, string>>>;
  descriptions: Record<LanguageCode, string>;
  setDescriptions: React.Dispatch<React.SetStateAction<Record<LanguageCode, string>>>;
  topicsStr: Record<LanguageCode, string>;
  setTopicsStr: React.Dispatch<React.SetStateAction<Record<LanguageCode, string>>>;
  urls: Record<LanguageCode, string>;
  setUrls: React.Dispatch<React.SetStateAction<Record<LanguageCode, string>>>;
  whatsappScripts: Record<LanguageCode, string>;
  setWhatsappScripts: React.Dispatch<React.SetStateAction<Record<LanguageCode, string>>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export function ToolLangContent(props: ToolLangContentProps) {
  const {
    activeLangTab,
    setActiveLangTab,
    availableLanguages,
    titles,
    setTitles,
    descriptions,
    setDescriptions,
    topicsStr,
    setTopicsStr,
    urls,
    setUrls,
    whatsappScripts,
    setWhatsappScripts,
    fileInputRef,
    handleFileUpload,
    uploading,
  } = props;

  return (
    <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          2. Multilingual Content
        </h3>
        <span className="text-[11px] text-zinc-400">
          Editing: <strong className="text-amber-500 uppercase">{activeLangTab}</strong>
        </span>
      </div>

      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-800">
        {LANGUAGES.map((l) => {
          const isActive = activeLangTab === l.code;
          const isAvailable = availableLanguages.includes(l.code);
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLangTab(l.code)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {isAvailable && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Selected" />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3.5 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Title ({activeLangTab.toUpperCase()}) {activeLangTab === 'en' && '*'}
          </label>
          <input
            type="text"
            value={titles[activeLangTab] || ''}
            onChange={(e) => setTitles((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
            placeholder={`Enter ${activeLangTab.toUpperCase()} title...`}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Short Description ({activeLangTab.toUpperCase()})
          </label>
          <textarea
            rows={2}
            value={descriptions[activeLangTab] || ''}
            onChange={(e) => setDescriptions((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
            placeholder={`Brief summary in ${activeLangTab.toUpperCase()}...`}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Topic Tags (comma-separated)
          </label>
          <input
            type="text"
            value={topicsStr[activeLangTab] || ''}
            onChange={(e) => setTopicsStr((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
            placeholder="e.g. Cold Market, Scripts, Invitation"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Media URL ({activeLangTab.toUpperCase()})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urls[activeLangTab] || ''}
              onChange={(e) => setUrls((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
              placeholder="https://... or upload PDF / image"
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.mp3"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 flex-shrink-0 shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Optional WhatsApp Share Script ({activeLangTab.toUpperCase()})
          </label>
          <textarea
            rows={2}
            value={whatsappScripts[activeLangTab] || ''}
            onChange={(e) => setWhatsappScripts((prev) => ({ ...prev, [activeLangTab]: e.target.value }))}
            placeholder="Pre-composed invitation pitch for one-tap WhatsApp sharing..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
