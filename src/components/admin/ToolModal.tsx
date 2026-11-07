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
  ImageIcon,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { uploadMediaAction } from '@/app/actions/adminActions';
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
  { type: 'pdf', label: 'PDF Document', icon: <FileText className="w-3.5 h-3.5 text-amber-500" /> },
  { type: 'soundcloud', label: 'SoundCloud', icon: <Music className="w-3.5 h-3.5 text-orange-500" /> },
  { type: 'video', label: 'Direct Video', icon: <Video className="w-3.5 h-3.5 text-blue-500" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> },
  { type: 'link', label: 'Web Link', icon: <LinkIcon className="w-3.5 h-3.5 text-purple-500" /> },
];

const TOOL_LANG_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'cn', label: '中文' },
  { code: 'bm', label: 'BM' },
];

export function ToolModal({ isOpen, onClose, onSave, tool, sections }: ToolModalProps) {
  const [sectionId, setSectionId] = useState('');
  const [type, setType] = useState<ToolType>('youtube');
  const [toolLang, setToolLang] = useState<LanguageCode>('en');
  const [title, setTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Optional power-user accordion
  const [showAccordion, setShowAccordion] = useState(false);
  const [description, setDescription] = useState('');
  const [whatsappScript, setWhatsappScript] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tool) {
      setSectionId(tool.section_id || sections[0]?.id || '');
      setType(tool.type || 'youtube');
      const primaryLang = tool.available_languages?.[0] || 'en';
      setToolLang(primaryLang === 'cn' || primaryLang === 'bm' ? primaryLang : 'en');
      setTitle(tool.title?.[primaryLang] || tool.title?.en || '');
      setSpeakerName(tool.speaker_name || '');
      setMediaUrl(tool.url?.[primaryLang] || tool.url?.en || '');
      setIsFeatured(Boolean(tool.is_featured));
      setIsVisible(tool.is_visible !== false);
      const desc = tool.description?.[primaryLang] || tool.description?.en || '';
      const script = tool.whatsapp_script?.[primaryLang] || tool.whatsapp_script?.en || '';
      setDescription(desc);
      setWhatsappScript(script);
      if (desc || script) setShowAccordion(true);
    } else {
      setSectionId(sections[0]?.id || '');
      setType('youtube');
      setToolLang('en');
      setTitle('');
      setSpeakerName('');
      setMediaUrl('');
      setIsFeatured(false);
      setIsVisible(true);
      setDescription('');
      setWhatsappScript('');
      setShowAccordion(false);
    }
    setError(null);
  }, [tool, sections, isOpen]);

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
        setMediaUrl(res.url);
      } else {
        const msg = !res.success ? res.error : 'Upload failed';
        setError(msg);
      }
    } catch {
      setError('File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tool Title is required.');
      return;
    }
    if (!mediaUrl.trim()) {
      setError('Media URL or File Upload is required.');
      return;
    }
    if (!sectionId) {
      setError('Please select a section.');
      return;
    }

    setSaving(true);
    setError(null);

    const cleanTitle = title.trim();
    const cleanUrl = mediaUrl.trim();
    const cleanDesc = description.trim();
    const cleanScript = whatsappScript.trim();

    const payload: Partial<Tool> = {
      ...(tool?.id ? { id: tool.id } : {}),
      section_id: sectionId,
      type,
      speaker_name: speakerName.trim(),
      duration: type === 'pdf' ? '📄 PDF Guide' : type === 'soundcloud' ? '🎧 Audio' : '',
      is_featured: isFeatured,
      is_visible: isVisible,
      available_languages: [toolLang],
      title: {
        en: cleanTitle,
        bm: cleanTitle,
        cn: cleanTitle,
        ta: cleanTitle,
      },
      url: {
        en: cleanUrl,
        bm: cleanUrl,
        cn: cleanUrl,
        ta: cleanUrl,
      },
      description: {
        en: cleanDesc,
        bm: cleanDesc,
        cn: cleanDesc,
        ta: cleanDesc,
      },
      whatsapp_script: {
        en: cleanScript,
        bm: cleanScript,
        cn: cleanScript,
        ta: cleanScript,
      },
      topics: {
        en: speakerName ? [speakerName.trim()] : [],
        bm: speakerName ? [speakerName.trim()] : [],
        cn: speakerName ? [speakerName.trim()] : [],
        ta: [],
      },
      thumbnail_url: tool?.thumbnail_url || '',
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
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
                {tool ? 'Edit Resource / Tool' : 'Add New Resource / Tool'}
              </h3>
              <p className="text-[11px] text-zinc-500">Quick single-screen creator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Section *
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.en} ({s.title.cn || s.title.bm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Media Type *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {TOOL_TYPES.map((t) => {
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setType(t.type)}
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-500 font-bold shadow-2xs'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {t.icon}
                    <span className="text-[10px] truncate max-w-full">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Tool Language *
            </label>
            <div className="flex gap-2">
              {TOOL_LANG_OPTIONS.map((opt) => {
                const isSelected = toolLang === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setToolLang(opt.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-2xs font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tool Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. W.O.W (KL) - COEV Rayne"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Speaker Name
            </label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="e.g. COEV Rayne, Robert Kiyosaki, Selenium..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Media URL or File Upload *
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="video/*,audio/*,application/pdf,image/*"
                onChange={handleFileUpload}
              />
            </div>
            <input
              type="text"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://youtu.be/... or uploaded file link"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                isFeatured
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span className="text-xs">Featured at top</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isFeatured ? 'border-amber-500 bg-amber-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                {isFeatured && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                isVisible
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {isVisible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-xs">Visible to users</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isVisible ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                {isVisible && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/40">
            <button
              type="button"
              onClick={() => setShowAccordion(!showAccordion)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <span>Optional: Short Description & Custom WhatsApp Script</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showAccordion ? 'rotate-180 text-amber-500' : ''}`} />
            </button>
            {showAccordion && (
              <div className="p-4 pt-1 space-y-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence teaser about this tool..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Custom WhatsApp Script</label>
                  <textarea
                    rows={2}
                    value={whatsappScript}
                    onChange={(e) => setWhatsappScript(e.target.value)}
                    placeholder="e.g. Check out this essential training before our call:"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
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
