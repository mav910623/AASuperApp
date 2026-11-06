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
  FileText,
  Volume2,
  Video,
  Eye,
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

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
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

  const topics = useMemo(() => {
    if (!tool.topics) return [];
    const list = tool.topics[lang] || tool.topics.en || [];
    return Array.isArray(list) ? list : [];
  }, [tool.topics, lang]);

  const youtubeId = useMemo(() => {
    if (tool.type !== 'youtube') return null;
    return getYouTubeId(url);
  }, [tool.type, url]);

  const shareText = useMemo(() => {
    if (whatsappScript && whatsappScript.trim()) {
      return `${whatsappScript.trim()}\n\n${title}\n${url}`;
    }
    return `${title}\n${url}`;
  }, [whatsappScript, title, url]);

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

  const mediaBadge = useMemo(() => {
    switch (tool.type) {
      case 'youtube':
        return { icon: Video, color: 'text-red-500', label: tool.duration || 'Video' };
      case 'video':
        return { icon: Video, color: 'text-blue-500', label: tool.duration || 'Video' };
      case 'soundcloud':
        return { icon: Volume2, color: 'text-amber-500', label: tool.duration || 'Audio' };
      case 'image':
        return { icon: Eye, color: 'text-emerald-500', label: tool.duration || 'Image' };
      case 'pdf':
        return { icon: FileText, color: 'text-indigo-500', label: tool.duration || 'PDF' };
      case 'link':
      default:
        return { icon: ExternalLink, color: 'text-cyan-500', label: tool.duration || 'Link' };
    }
  }, [tool.type, tool.duration]);

  const MediaIcon = mediaBadge.icon;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Media Player Area */}
      <div className="relative w-full overflow-hidden bg-zinc-950">
        {tool.type === 'youtube' && (
          <div className="relative aspect-video w-full">
            {isPlayingInline && youtubeId ? (
              <div className="relative h-full w-full">
                <button
                  type="button"
                  onClick={() => setIsPlayingInline(false)}
                  aria-label="Close inline video"
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black"
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
                className="relative h-full w-full cursor-pointer group/thumb"
                onClick={() => setIsPlayingInline(true)}
              >
                {tool.thumbnail_url ? (
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover/thumb:bg-black/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform duration-200 group-hover/thumb:scale-110 active:scale-95">
                    <Play className="h-6 w-6 fill-white ml-0.5" />
                  </div>
                </div>
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

        {tool.type === 'soundcloud' && (
          <div className="p-3 bg-zinc-900">
            {url ? (
              <iframe
                width="100%"
                height="140"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                title={title}
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                  url
                )}&color=%23f97316&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                className="w-full rounded-xl"
              />
            ) : (
              <div className="flex h-28 items-center justify-center text-sm text-zinc-400">
                Audio preview unavailable
              </div>
            )}
          </div>
        )}
        {tool.type === 'image' && (
          <div
            className="relative aspect-[16/10] w-full cursor-pointer group/img"
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
              <div className="h-full w-full bg-zinc-800" />
            )}
            <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Eye className="h-3.5 w-3.5" />
                <span>Tap to zoom</span>
              </span>
            </div>
          </div>
        )}

        {(tool.type === 'pdf' || tool.type === 'link') && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
            {tool.thumbnail_url && (
              <Image
                src={tool.thumbnail_url}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover opacity-35"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
              <a
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 text-xs font-bold shadow-lg hover:bg-zinc-200 transition-all active:scale-95"
              >
                {tool.type === 'pdf' ? (
                  <FileText className="h-4 w-4 text-indigo-600" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-cyan-600" />
                )}
                <span>{t('btn_open', 'Watch / Open')}</span>
              </a>
            </div>
          </div>
        )}

        {/* Pinned / Featured Badge Overlay */}
        {tool.is_featured && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md">
            <Sparkles className="h-3 w-3 fill-white" />
            <span>{t('badge_featured', 'Featured')}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Badges Row: Media Duration + Available Languages */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <MediaIcon className={`h-3.5 w-3.5 ${mediaBadge.color}`} />
            <span>{mediaBadge.label}</span>
          </span>

          {tool.available_languages && tool.available_languages.length > 0 && (
            <div className="flex items-center gap-1">
              {tool.available_languages.map((l) => (
                <span
                  key={l}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    lang === l
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {LANG_LABELS[l] || l}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-zinc-950 dark:text-zinc-50">
          {title}
        </h3>

        {/* Speaker Name */}
        {tool.speaker_name && tool.speaker_name.trim() && (
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span>🎙️</span>
            <span>{tool.speaker_name}</span>
          </div>
        )}

        {/* Localized Description */}
        {description && (
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
            {description}
          </p>
        )}

        {/* Topic Chips */}
        {topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topics.map((tItem, idx) => (
              <span
                key={idx}
                className="rounded-md bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
              >
                #{tItem}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Action Bar (4 thumb-friendly buttons in 1 row) */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-4 gap-1">
          {/* 1. WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            aria-label="Share via WhatsApp"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold">{t('btn_whatsapp', 'WhatsApp')}</span>
          </button>

          {/* 2. Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy link"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors active:scale-95"
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
            <span className={`text-[11px] font-semibold ${copied ? 'text-emerald-600 font-bold' : ''}`}>
              {copied ? t('btn_copied', 'Copied!') : t('btn_copy', 'Copy')}
            </span>
          </button>

          {/* 3. QR Code */}
          <button
            type="button"
            onClick={() => setIsQrOpen(true)}
            aria-label="Show QR Code"
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <QrCode className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold">{t('btn_qr', 'QR')}</span>
          </button>

          {/* 4. Star / Save Icon */}
          <button
            type="button"
            onClick={() => toggleSavedTool(tool.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save tool'}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 px-1 text-zinc-700 hover:bg-amber-50 hover:text-amber-700 dark:text-zinc-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-400 transition-colors active:scale-95"
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
            <span className={`text-[11px] font-semibold ${isSaved ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}`}>
              {isSaved ? t('nav_saved', 'Saved') : t('favorites', 'Save')}
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

