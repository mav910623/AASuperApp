'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  speakerName?: string;
  language?: string;
  url: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  title,
  speakerName,
  language,
  url,
}: QRCodeModalProps) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 text-zinc-950 dark:text-zinc-50 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close', 'Close')}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('btn_qr', 'QR Code')}
          </span>
        </div>

        {/* Title & Metadata */}
        <div className="mb-4">
          <h2 id="qr-modal-title" className="text-base font-bold leading-snug line-clamp-2">
            {title}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            {speakerName && (
              <span className="inline-flex items-center font-medium">
                🎙️ {speakerName}
              </span>
            )}
            {language && (
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 uppercase">
                {language}
              </span>
            )}
          </div>
        </div>

        {/* QR Code Container - High Contrast White Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-inner border border-zinc-200">
          <QRCodeSVG
            value={url || 'https://teamhub.app'}
            size={220}
            level="M"
            marginSize={1}
            className="h-auto w-full max-w-[220px]"
          />
          <p className="mt-3 text-center text-[11px] font-medium text-zinc-500">
            {t('scan_to_view', 'Scan with camera or phone to view')}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-2.5 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {t('btn_copied', 'Copied!')}
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span>{t('btn_copy', 'Copy Link')}</span>
              </>
            )}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-4 py-2.5 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t('btn_open', 'Open')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
