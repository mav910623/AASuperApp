'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AALogo } from '@/components/AALogo';

export function ShareAppTab() {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  const appUrl = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== 'undefined' ? window.location.origin : 'https://teamhub.app'),
    () => 'https://teamhub.app'
  );

  const appTitle = t('app_title', 'Team Hub');
  const shareDesc = t('share_app_desc', 'Scan this QR code with a phone camera or share via WhatsApp to onboard team members and prospects instantly.');

  const whatsappMessage = `${appTitle} - Super App\n\n${shareDesc}\n\n👉 ${appUrl}`;

  const handleWhatsAppShare = () => {
    window.location.href = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = appUrl;
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
    <div className="w-full space-y-6 px-4 py-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="text-center">
        <AALogo size="lg" className="mx-auto mb-2" />
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('share_app_title', 'Share Team Hub')}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {shareDesc}
        </p>
      </div>

      {/* Full-Screen / Prominent QR Code Card */}
      <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col items-center">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-inner border border-zinc-200 w-full max-w-[270px]">
          <QRCodeSVG
            value={appUrl}
            size={230}
            level="Q"
            marginSize={1}
            className="h-auto w-full max-w-[230px]"
          />
          <p className="mt-3 text-center text-[11px] font-semibold text-zinc-500">
            {t('scan_to_view', 'Scan with camera or phone to view')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 w-full space-y-2.5">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 text-sm font-bold shadow-md transition-all active:scale-98"
          >
            <Share2 className="h-4 w-4" />
            <span>{t('btn_whatsapp', 'Share via WhatsApp')}</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 py-3.5 px-4 text-sm font-bold transition-all active:scale-98"
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
                <Copy className="h-4 w-4" />
                <span>{t('btn_copy', 'Copy App Link')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Onboarding Tip Card */}
      <div className="mx-auto max-w-sm rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
        <div className="rounded-xl bg-amber-500 p-2 text-white flex-shrink-0">
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <p className="font-bold mb-0.5">{t('add_to_home_screen', 'Instant Mobile App')}</p>
          <p>{t('pwa_banner_desc', 'Team members can install this app directly onto their phone home screens without the App Store.')}</p>
        </div>
      </div>
    </div>
  );
}
