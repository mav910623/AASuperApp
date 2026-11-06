'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function ImageLightbox({ isOpen, onClose, imageUrl, title }: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll when open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Image preview'}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] max-w-2xl w-full flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div className="mb-3 flex w-full items-center justify-between px-1 text-white">
          <p className="truncate text-sm font-semibold pr-4">{title || 'Preview'}</p>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open image in new tab"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close image"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative max-h-[82vh] w-full overflow-hidden rounded-2xl bg-zinc-950 flex items-center justify-center border border-zinc-800">
          <Image
            src={imageUrl}
            alt={title || 'Enlarged view'}
            width={1200}
            height={900}
            unoptimized
            className="max-h-[82vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
