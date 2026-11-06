'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Play,
  Share2,
  Copy,
  Check,
  QrCode,
  Star,
  ExternalLink,
  BookOpen,
  Headphones,
  Globe,
  ImageIcon,
  Video,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Tool, LanguageCode } from '@/types/app';
import { QRCodeModal } from '@/components/QRCodeModal';
import { ImageLightbox } from '@/components/ImageLightbox';

interface ToolCardProps {
  tool: Tool;
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

const LANG_LABELS: Record<LanguageCode, string> = {
  en: 'EN',
  bm: 'BM',
  cn: '中文',
  ta: 'தமிழ்',
};

export function ToolCard({ tool }: ToolCardProps) {
  const { lang, getLocalized, isToolSaved, toggleSavedTool, t } = useApp();

  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const title = getLocalized(tool.title) || 'Untitled Resource';
  const description = getLocalized(tool.description);
  const url = getLocalized(tool.url);
  const whatsappScript = getLocalized(tool.whatsapp_script);
  const isSaved = isToolSaved(tool.id);

  const youtubeId = useMemo(() => {
    if (tool.type !== 'youtube') return null;
    return getYouTubeId(url);
  }, [tool.type, url]);

  const displayLangBadge = useMemo(() => {
    if (tool.available_languages && tool.available_languages.length > 0) {
      return tool.available_languages
        .map((code) => LANG_LABELS[code] || code.toUpperCase())
        .join(' • ');
    }
    return 'EN';
  }, [tool.available_languages]);

  const shareText = useMemo(() => {
    const speakerSuffix = tool.speaker_name ? ` (${tool.speaker_name})` : '';
    if (whatsappScript && whatsappScript.trim()) {
      return `${whatsappScript.trim()}\n\n*${title}*${speakerSuffix}\n👉 ${url}`;
    }
    return `*${title}*${speakerSuffix}\n👉 ${url}`;
  }, [whatsappScript, title, tool.speaker_name, url]);

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      const copyPayload = url || shareText;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(copyPayload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = copyPayload;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy error', err);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Media Player Area */}
      <div className="relative w-full overflow-hidden bg-zinc-950">
        {tool.type === 'youtube' && (
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
            {isPlayingInline && youtubeId ? (
              <div className="relative h-full w-full">
                <button
                  type="button"
                  onClick={() => setIsPlayingInline(false)}
                  aria-label="Close inline video"
                  className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            ) : (
              <div
                className="relative h-full w-full cursor-pointer group/thumb select-none"
                onClick={() => setIsPlayingInline(true)}
              >
                {youtubeId ? (
                  <Image
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                ) : tool.thumbnail_url ? (
                  <Image
                    src={tool.thumbnail_url}
                    alt={title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-zinc-900 to-zinc-800" />
                )}

                <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
                  {tool.is_featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm backdrop-blur-xs">
                      <Sparkles className="h-3 w-3" />
                      <span>{t('badge_featured', 'Featured')}</span>
                    </span>
                  ) : <span />}

                  <span className="rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white backdrop-blur-xs">
                    {displayLangBadge}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover/thumb:bg-black/15">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-950/40 transition-transform duration-200 group-hover/thumb:scale-110 active:scale-95">
                    <Play className="h-6 w-6 fill-white ml-1" />
                  </div>
                </div>

                {tool.duration && (
                  <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    {tool.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {tool.type === 'video' && (
          <div className="relative aspect-video w-full bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              poster={tool.thumbnail_url}
              className="h-full w-full object-cover"
            >
              {url && <source src={url} type="video/mp4" />}
              Your browser does not support HTML5 video.
            </video>
          </div>
        )}
      </div>

      {/* 2. DIRECT VIDEO EXTRA INFO */}
      {tool.type === 'video' && (
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Video
            </span>
            <span className="rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 text-[10px] font-bold">
              {displayLangBadge}
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 line-clamp-2 leading-snug">
            {title}
          </h3>
          {tool.speaker_name && (
            <p className="mt-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {tool.speaker_name}
            </p>
          )}
        </div>
      )}

      {/* 3. DEDICATED PDF EBOOK / DOC CARD DESIGN (NO VIDEO BOX) */}
      {tool.type === 'pdf' && (
        <div className="p-4 pb-2">
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-500/10 to-blue-600/10 text-red-600 dark:from-red-950/40 dark:to-blue-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 shadow-xs">
              <BookOpen className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-700 dark:bg-red-950/80 dark:text-red-300">
                  PDF eBook
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {displayLangBadge}
                </span>
                {tool.is_featured && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Featured</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 line-clamp-2 leading-tight">
                {title}
              </h3>

              {tool.speaker_name && (
                <p className="mt-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                  By {tool.speaker_name}
                </p>
              )}
            </div>
          </div>

          {description && (
            <p className="mt-2.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E40AF] hover:bg-blue-800 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/20 active:scale-[0.98] transition-all select-none"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t('read_pdf', 'Read PDF eBook')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80 ml-0.5" />
          </a>
        </div>
      )}

      {/* 4. DEDICATED SOUNDCLOUD / AUDIO CARD DESIGN (NO VIDEO BOX) */}
      {tool.type === 'soundcloud' && (
        <div className="p-4 pb-2">
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500/10 to-amber-500/10 text-orange-600 dark:from-orange-950/40 dark:to-amber-950/40 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 shadow-xs">
              <Headphones className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 dark:bg-orange-950/80 dark:text-orange-300">
                  Audio
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {displayLangBadge}
                </span>
                {tool.duration && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {tool.duration}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 line-clamp-2 leading-tight">
                {title}
              </h3>

              {tool.speaker_name && (
                <p className="mt-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                  Speaker: {tool.speaker_name}
                </p>
              )}
            </div>
          </div>

          {description && (
            <p className="mt-2.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all select-none"
          >
            <Headphones className="h-4 w-4" />
            <span>{t('listen_audio', 'Listen Audio')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80 ml-0.5" />
          </a>
        </div>
      )}

      {/* 5. LINK CARD DESIGN */}
      {tool.type === 'link' && (
        <div className="p-4 pb-2">
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 shadow-xs">
              <Globe className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                  Link
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {displayLangBadge}
                </span>
              </div>

              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 line-clamp-2 leading-tight">
                {title}
              </h3>

              {tool.speaker_name && (
                <p className="mt-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate">
                  {tool.speaker_name}
                </p>
              )}
            </div>
          </div>

          {description && (
            <p className="mt-2.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 py-2.5 text-xs font-bold text-white shadow-sm active:scale-[0.98] transition-all select-none"
          >
            <Globe className="h-4 w-4" />
            <span>{t('btn_open', 'Open Link')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80 ml-0.5" />
          </a>
        </div>
      )}

      {/* 6. IMAGE CARD DESIGN */}
      {tool.type === 'image' && (
        <div className="relative w-full">
          <div
            className="relative aspect-[16/10] w-full cursor-pointer group/img select-none overflow-hidden bg-zinc-900"
            onClick={() => setIsLightboxOpen(true)}
          >
            {tool.thumbnail_url || url ? (
              <Image
                src={tool.thumbnail_url || url}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover transition-transform duration-300 group-hover/img:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-500">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Tap to zoom</span>
              </span>
            </div>
          </div>

          <div className="p-4 pb-2">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 line-clamp-2 leading-tight">
              {title}
            </h3>
            {tool.speaker_name && (
              <p className="mt-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                {tool.speaker_name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM ACTION ROW ON EVERY CARD */}
      <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800/80 p-2 sm:p-2.5">
        <div className="grid grid-cols-4 gap-1.5">
          {/* 1. WhatsApp Button (Green) */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            aria-label="Share via WhatsApp"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors active:scale-95 select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm shadow-emerald-500/25">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
              {t('btn_whatsapp', 'WhatsApp')}
            </span>
          </button>

          {/* 2. Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy link"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors active:scale-95 select-none"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </div>
            <span
              className={`text-[11px] font-semibold ${
                copied ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
              }`}
            >
              {copied ? t('btn_copied', 'Copied!') : t('btn_copy', 'Copy')}
            </span>
          </button>

          {/* 3. QR Code Button */}
          <button
            type="button"
            onClick={() => setIsQrOpen(true)}
            aria-label="Show QR Code"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors active:scale-95 select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold">{t('btn_qr', 'QR')}</span>
          </button>

          {/* 4. Star / Save Icon Button */}
          <button
            type="button"
            onClick={() => toggleSavedTool(tool.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save tool'}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition-colors active:scale-95 select-none"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                isSaved
                  ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <Star className={`h-4 w-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
            </div>
            <span
              className={`text-[11px] font-semibold ${
                isSaved ? 'text-amber-600 dark:text-amber-400 font-bold' : ''
              }`}
            >
              {isSaved ? t('nav_saved', 'Saved') : t('favorites', 'Star')}
            </span>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={title}
        speakerName={tool.speaker_name}
        language={tool.available_languages?.[0]?.toUpperCase()}
        url={url || shareText}
      />

      {/* Fullscreen Lightbox for Images */}
      {(tool.type === 'image' || tool.thumbnail_url) && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={url || tool.thumbnail_url}
          title={title}
        />
      )}
    </article>
  );
}

