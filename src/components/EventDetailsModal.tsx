'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Navigation,
  Share2,
  ExternalLink,
} from 'lucide-react';
import type { GeneratedScheduleEvent } from '@/lib/calendarGenerator';
import { useApp } from '@/context/AppContext';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: GeneratedScheduleEvent | null;
}

export function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  const { getLocalized } = useApp();

  if (!isOpen || !event) return null;

  const title = getLocalized(event.title);
  const locationOrLink = event.location_or_link || '';
  const isUrl = locationOrLink.startsWith('http');
  const isZoom = locationOrLink.includes('zoom.us') || locationOrLink.includes('zoom');
  const venueName = event.venue || (isUrl ? 'Online Meeting' : locationOrLink);
  const physicalAddress = !isUrl ? locationOrLink || event.venue || '' : '';

  const handleShareWhatsApp = () => {
    const lines = [
      `📅 *${title}*`,
      `🗓️ ${event.date} | ⏰ ${event.time}`,
      event.speaker ? `🎙️ Speaker: ${event.speaker}` : '',
      venueName ? `📍 Venue: ${venueName}` : '',
      locationOrLink && !isUrl ? `🗺️ Map: https://maps.google.com/?q=${encodeURIComponent(locationOrLink)}` : '',
      isUrl ? `🔗 Link: ${locationOrLink}` : '',
      event.description ? `\n📝 ${event.description}` : '',
      `\n_Shared via AA Team Hub_`,
    ].filter(Boolean);

    const text = lines.join('\n');
    window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(physicalAddress)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(physicalAddress)}`;
  const embedMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(physicalAddress)}&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {event.image_url ? (
          <div className="relative h-44 sm:h-52 w-full bg-zinc-950 flex-shrink-0">
            <Image
              src={event.image_url}
              alt={title}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider mb-1">
                {event.is_recurring ? 'Recurring Meeting' : 'Special Event'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight">
                {title}
              </h2>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex-shrink-0">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-0.5">
                {event.is_recurring ? 'Recurring Meeting' : 'Special Event'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            {event.speaker && (
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="text-base leading-none">🎙️</span>
                <span>{event.speaker}</span>
              </div>
            )}
            {venueName && (
              <div className="col-span-1 sm:col-span-2 flex items-start gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{venueName}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Meeting Details
              </h4>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-white dark:bg-zinc-900">
                {event.description}
              </p>
            </div>
          )}

          {physicalAddress && (
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Location & Navigation
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Waze</span>
                </a>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 h-44 w-full">
                <iframe
                  title="Venue Map Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={embedMapsUrl}
                />
              </div>
            </div>
          )}

          {isUrl && (
            <div className="pt-1">
              <a
                href={locationOrLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-98"
              >
                {isZoom ? <Video className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                <span>Join Online Meeting</span>
              </a>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-600/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
