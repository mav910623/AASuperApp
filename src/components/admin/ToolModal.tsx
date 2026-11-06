'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Loader2,
  Check,
  Star,
  Eye,
  EyeOff,
  Video,
  FileText,
  Music,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { uploadMediaAction } from '@/app/actions/adminActions';
import { ToolBasicInfo } from './ToolBasicInfo';
import { ToolLangContent } from './ToolLangContent';
import type { Tool, Section, ToolType, LanguageCode } from '@/types/app';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Partial<Tool>) => Promise<boolean>;
  tool?: Tool | null;
  sections: Section[];
}

const TOOL_TYPES: { type: ToolType; label: string; icon: React.ReactNode }[] = [
  { type: 'youtube', label: 'YouTube', icon: <Video className="w-3.5 h-3.5 text-red-500" /> },
  { type: 'soundcloud', label: 'SoundCloud', icon: <Music className="w-3.5 h-3.5 text-orange-500" /> },
  { type: 'video', label: 'Direct Video', icon: <Video className="w-3.5 h-3.5 text-blue-500" /> },
  { type: 'pdf', label: 'PDF Document', icon: <FileText className="w-3.5 h-3.5 text-amber-500" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> },
  { type: 'link', label: 'Web Link', icon: <LinkIcon className="w-3.5 h-3.5 text-purple-500" /> },
];

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bm', label: 'BM', flag: '🇲🇾' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
];

export function ToolModal({ isOpen, onClose, onSave, tool, sections }: ToolModalProps) {
  const [sectionId, setSectionId] = useState('');
  const [type, setType] = useState<ToolType>('link');
  const [speakerName, setSpeakerName] = useState('');
  const [duration, setDuration] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageCode[]>(['en']);

  const [activeLangTab, setActiveLangTab] = useState<LanguageCode>('en');

  const [titles, setTitles] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [descriptions, setDescriptions] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [urls, setUrls] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [topicsStr, setTopicsStr] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [whatsappScripts, setWhatsappScripts] = useState<Record<LanguageCode, string>>({ en: '', bm: '', cn: '', ta: '' });
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tool) {
      setSectionId(tool.section_id || sections[0]?.id || '');
      setType(tool.type || 'link');
      setSpeakerName(tool.speaker_name || '');
      setDuration(tool.duration || '');
      setIsFeatured(Boolean(tool.is_featured));
      setIsVisible(tool.is_visible !== false);
      setAvailableLanguages(tool.available_languages?.length ? tool.available_languages : ['en']);

      setTitles({ en: tool.title?.en || '', bm: tool.title?.bm || '', cn: tool.title?.cn || '', ta: tool.title?.ta || '' });
      setDescriptions({ en: tool.description?.en || '', bm: tool.description?.bm || '', cn: tool.description?.cn || '', ta: tool.description?.ta || '' });
      setUrls({ en: tool.url?.en || '', bm: tool.url?.bm || '', cn: tool.url?.cn || '', ta: tool.url?.ta || '' });
      setTopicsStr({
        en: (tool.topics?.en || []).join(', '),
        bm: (tool.topics?.bm || []).join(', '),
        cn: (tool.topics?.cn || []).join(', '),
        ta: (tool.topics?.ta || []).join(', '),
      });
      setWhatsappScripts({
        en: tool.whatsapp_script?.en || '',
        bm: tool.whatsapp_script?.bm || '',
        cn: tool.whatsapp_script?.cn || '',
        ta: tool.whatsapp_script?.ta || '',
      });
      setThumbnailUrl(tool.thumbnail_url || '');
    } else {
      setSectionId(sections[0]?.id || '');
      setType('youtube');
      setSpeakerName('');
      setDuration('');
      setIsFeatured(false);
      setIsVisible(true);
      setAvailableLanguages(['en']);
      setTitles({ en: '', bm: '', cn: '', ta: '' });
      setDescriptions({ en: '', bm: '', cn: '', ta: '' });
      setUrls({ en: '', bm: '', cn: '', ta: '' });
      setTopicsStr({ en: '', bm: '', cn: '', ta: '' });
      setWhatsappScripts({ en: '', bm: '', cn: '', ta: '' });
      setThumbnailUrl('');
    }
    setError(null);
    setActiveLangTab('en');
  }, [tool, sections, isOpen]);

  const toggleLanguage = (code: LanguageCode) => {
    setAvailableLanguages((prev) => {
      const exists = prev.includes(code);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadMediaAction(formData);

      if (res.success && res.url) {
        setUrls((prev) => ({ ...prev, [activeLangTab]: res.url || '' }));
      } else {
        const msg = !res.success ? res.error : 'File upload failed';
        setError(msg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Media upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titles.en?.trim()) {
      setError('English title is required.');
      setActiveLangTab('en');
      return;
    }
    if (!sectionId) {
      setError('Please select a section.');
      return;
    }

    setSaving(true);
    setError(null);

    const parseTopics = (str: string) =>
      str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const enTitle = titles.en.trim();
    const enUrl = urls.en.trim();
    const enDesc = descriptions.en.trim();
    const enScript = whatsappScripts.en.trim();

    const normalizedTitles: Record<LanguageCode, string> = {
      en: enTitle,
      bm: titles.bm.trim() || enTitle,
      cn: titles.cn.trim() || enTitle,
      ta: titles.ta.trim() || enTitle,
    };

    const normalizedUrls: Record<LanguageCode, string> = {
      en: enUrl,
      bm: urls.bm.trim() || enUrl,
      cn: urls.cn.trim() || enUrl,
      ta: urls.ta.trim() || enUrl,
    };

    const normalizedDescriptions: Record<LanguageCode, string> = {
      en: enDesc,
      bm: descriptions.bm.trim() || enDesc,
      cn: descriptions.cn.trim() || enDesc,
      ta: descriptions.ta.trim() || enDesc,
    };

    const normalizedScripts: Record<LanguageCode, string> = {
      en: enScript,
      bm: whatsappScripts.bm.trim() || enScript,
      cn: whatsappScripts.cn.trim() || enScript,
      ta: whatsappScripts.ta.trim() || enScript,
    };

    const payload: Partial<Tool> = {
      ...(tool?.id ? { id: tool.id } : {}),
      section_id: sectionId,
      type,
      speaker_name: speakerName.trim(),
      duration: duration.trim(),
      is_featured: isFeatured,
      is_visible: isVisible,
      available_languages: availableLanguages,
      title: normalizedTitles,
      description: normalizedDescriptions,
      url: normalizedUrls,
      topics: {
        en: parseTopics(topicsStr.en),
        bm: parseTopics(topicsStr.bm),
        cn: parseTopics(topicsStr.cn),
        ta: parseTopics(topicsStr.ta),
      },
      whatsapp_script: normalizedScripts,
      thumbnail_url: thumbnailUrl.trim(),
    };

    const success = await onSave(payload);
    setSaving(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to save tool. Please check all fields.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50">
              {tool ? 'Edit Tool' : 'Add New Tool'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <ToolBasicInfo
            sections={sections}
            sectionId={sectionId}
            setSectionId={setSectionId}
            type={type}
            setType={setType}
            speakerName={speakerName}
            setSpeakerName={setSpeakerName}
            duration={duration}
            setDuration={setDuration}
            isFeatured={isFeatured}
            setIsFeatured={setIsFeatured}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            availableLanguages={availableLanguages}
            toggleLanguage={toggleLanguage}
          />

          <ToolLangContent
            activeLangTab={activeLangTab}
            setActiveLangTab={setActiveLangTab}
            availableLanguages={availableLanguages}
            titles={titles}
            setTitles={setTitles}
            descriptions={descriptions}
            setDescriptions={setDescriptions}
            topicsStr={topicsStr}
            setTopicsStr={setTopicsStr}
            urls={urls}
            setUrls={setUrls}
            whatsappScripts={whatsappScripts}
            setWhatsappScripts={setWhatsappScripts}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            uploading={uploading}
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Thumbnail Image URL (Optional)
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded cover"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Tool...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{tool ? 'Update Tool' : 'Create Tool'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
