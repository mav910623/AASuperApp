'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Download,
  Share2,
  Video,
  MapPin,
  ExternalLink,
  Clock,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { TeamCalendar } from '@/types/app';
import { ImageLightbox } from '@/components/ImageLightbox';

interface CalendarTabProps {
  calendar: TeamCalendar;
}

export function CalendarTab({ calendar }: CalendarTabProps) {
  const { t, getLocalized } = useApp();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const monthLabel = getLocalized(calendar?.month_label) || t('upcoming_events', 'Team Calendar');
  const imageUrl = getLocalized(calendar?.image_url);
  const events = calendar?.events || [];

  const handleShareCalendar = () => {
    const shareText = `${monthLabel}\n\n${t('share_flyer', 'Check out our monthly team calendar and upcoming events:')}\n${imageUrl || (typeof window !== 'undefined' ? window.location.href : '')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFlyer = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full space-y-6 px-4 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl">
          {monthLabel}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          {t('tap_to_enlarge', 'Tap flyer to enlarge or share with your team')}
        </p>
      </div>

      {/* Monthly Flyer Card */}
      {imageUrl ? (
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div
            className="group relative aspect-[16/9] sm:aspect-[21/9] w-full cursor-pointer overflow-hidden bg-zinc-950"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image
              src={imageUrl}
              alt={monthLabel}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end justify-end p-3 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <Eye className="h-3.5 w-3.5" />
                <span>{t('tap_to_enlarge', 'Tap flyer to enlarge')}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleDownloadFlyer}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-2.5 px-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-colors active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>{t('download_flyer', 'Download Flyer')}</span>
            </button>
            <button
              type="button"
              onClick={handleShareCalendar}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 text-xs font-bold transition-colors active:scale-95 shadow-xs"
            >
              <Share2 className="h-4 w-4" />
              <span>{t('share_flyer', 'Share Calendar')}</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Upcoming Events Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-amber-500" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            {t('upcoming_events', 'Upcoming Events')}
          </h3>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('no_events', 'No upcoming events scheduled right now.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => {
              const eventTitle = getLocalized(evt.title);
              const isUrl = evt.location_or_link.startsWith('http');
              const isZoom = evt.location_or_link.includes('zoom.us');

              const destinationUrl = isUrl
                ? evt.location_or_link
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    evt.location_or_link
                  )}`;

              return (
                <div
                  key={evt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5">
                        {evt.date}
                      </span>
                      {evt.time && (
                        <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{evt.time}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="mt-1.5 text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                      {eventTitle}
                    </h4>

                    {evt.speaker && (
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        🎙️ <span className="font-medium">{evt.speaker}</span>
                      </p>
                    )}
                  </div>

                  {evt.location_or_link && (
                    <a
                      href={destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-4 py-2.5 text-xs font-bold transition-all active:scale-95 shadow-xs"
                    >
                      {isZoom ? (
                        <>
                          <Video className="h-3.5 w-3.5 text-blue-400 dark:text-blue-600" />
                          <span>Zoom</span>
                        </>
                      ) : isUrl ? (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>{t('join_event', 'Join')}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-red-500" />
                          <span>{t('join_event', 'Location')}</span>
                        </>
                      )}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for flyer */}
      {imageUrl && (
        <ImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={imageUrl}
          title={monthLabel}
        />
      )}
    </div>
  );
}
