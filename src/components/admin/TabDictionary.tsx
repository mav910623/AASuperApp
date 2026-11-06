'use client';

import React, { useState } from 'react';
import {
  Languages,
  Search,
  Save,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { updateDictionaryAction } from '@/app/actions/adminActions';
import type { UiDictionary } from '@/types/app';

interface TabDictionaryProps {
  dictionary: UiDictionary[];
  setDictionary: React.Dispatch<React.SetStateAction<UiDictionary[]>>;
  onNotify: (msg: string, isError?: boolean) => void;
}

export function TabDictionary({
  dictionary,
  setDictionary,
  onNotify,
}: TabDictionaryProps) {
  const [search, setSearch] = useState('');
  const [filterMissing, setFilterMissing] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  // New key modal state
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newEn, setNewEn] = useState('');
  const [newBm, setNewBm] = useState('');
  const [newCn, setNewCn] = useState('');
  const [newTa, setNewTa] = useState('');

  const handleCellChange = (key: string, field: 'en' | 'bm' | 'cn' | 'ta', val: string) => {
    setDictionary((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveRow = async (entry: UiDictionary) => {
    setSavingKey(entry.key);
    const res = await updateDictionaryAction(entry);
    setSavingKey(null);

    if (res.success) {
      onNotify(`Translation for "${entry.key}" updated`);
    } else {
      onNotify('Failed to save translation', true);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    const res = await updateDictionaryAction(dictionary);
    setSavingAll(false);

    if (res.success) {
      onNotify('All UI translations saved successfully');
    } else {
      onNotify('Failed to save translations', true);
    }
  };

  const handleCreateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanKey) {
      onNotify('Key name is required', true);
      return;
    }
    if (!newEn.trim()) {
      onNotify('English text is required', true);
      return;
    }

    const newEntry: UiDictionary = {
      key: cleanKey,
      en: newEn.trim(),
      bm: newBm.trim(),
      cn: newCn.trim(),
      ta: newTa.trim(),
    };

    const res = await updateDictionaryAction(newEntry);
    if (res.success) {
      setDictionary((prev) => [newEntry, ...prev]);
      setNewKey('');
      setNewEn('');
      setNewBm('');
      setNewCn('');
      setNewTa('');
      setNewKeyModalOpen(false);
      onNotify(`New key "${cleanKey}" added successfully`);
    } else {
      onNotify('Failed to create new key', true);
    }
  };

  const filteredEntries = dictionary.filter((item) => {
    if (filterMissing) {
      const hasMissing = !item.bm?.trim() || !item.cn?.trim() || !item.ta?.trim();
      if (!hasMissing) return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.key.toLowerCase().includes(q) ||
      item.en?.toLowerCase().includes(q) ||
      item.bm?.toLowerCase().includes(q) ||
      item.cn?.toLowerCase().includes(q) ||
      item.ta?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-500" />
            <span>UI Text & Translations Management</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Searchable, editable table of all dictionary strings across English, Malay, Chinese, and Tamil.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setNewKeyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Key</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={savingAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {savingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving All...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phrase, translation, or key..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMissing(!filterMissing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterMissing
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
            }`}
          >
            {filterMissing ? 'Showing Missing Translations Only' : 'Filter Incomplete Phrases'}
          </button>
          <span className="text-xs text-zinc-400 font-medium">
            {filteredEntries.length} phrases
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-44">Key</th>
                <th className="py-3 px-4">English</th>
                <th className="py-3 px-4">Bahasa Melayu</th>
                <th className="py-3 px-4">中文</th>
                <th className="py-3 px-4">தமிழ்</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {filteredEntries.map((row) => {
                const isSaving = savingKey === row.key;
                return (
                  <tr
                    key={row.key}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 align-top">
                      <span className="font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg break-all">
                        {row.key}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 align-top">
                      <textarea
                        rows={2}
                        value={row.en || ''}
                        onChange={(e) => handleCellChange(row.key, 'en', e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top">
                      <textarea
                        rows={2}
                        value={row.bm || ''}
                        onChange={(e) => handleCellChange(row.key, 'bm', e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top">
                      <textarea
                        rows={2}
                        value={row.cn || ''}
                        onChange={(e) => handleCellChange(row.key, 'cn', e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top">
                      <textarea
                        rows={2}
                        value={row.ta || ''}
                        onChange={(e) => handleCellChange(row.key, 'ta', e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </td>

                    <td className="py-2.5 px-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => handleSaveRow(row)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition-colors disabled:opacity-50"
                        title="Save this row"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        <span>Save</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Key Modal */}
      {newKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  Add New Translation Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewKeyModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewKey} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Unique Key (snake_case) *
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. btn_confirm_action"
                  className="w-full font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  English Text *
                </label>
                <input
                  type="text"
                  value={newEn}
                  onChange={(e) => setNewEn(e.target.value)}
                  placeholder="English phrase..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Bahasa Melayu
                  </label>
                  <input
                    type="text"
                    value={newBm}
                    onChange={(e) => setNewBm(e.target.value)}
                    placeholder="BM..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    中文
                  </label>
                  <input
                    type="text"
                    value={newCn}
                    onChange={(e) => setNewCn(e.target.value)}
                    placeholder="中文..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    தமிழ்
                  </label>
                  <input
                    type="text"
                    value={newTa}
                    onChange={(e) => setNewTa(e.target.value)}
                    placeholder="தமிழ்..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewKeyModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
