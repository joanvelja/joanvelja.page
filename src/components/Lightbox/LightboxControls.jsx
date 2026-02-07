'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function LightboxControls({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onClose,
  canGoPrevious,
  canGoNext,
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="lightbox-focusable absolute top-4 right-4 z-20 p-2 rounded-full
                   bg-black/40 backdrop-blur-sm text-white/90 hover:text-white
                   hover:bg-black/60 transition-colors"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {canGoPrevious && (
        <div
          className="lightbox-nav-zone absolute left-0 top-0 bottom-0 w-1/4 z-10
                     flex items-center justify-start pl-4 cursor-pointer"
          onClick={onPrevious}
          aria-label="Previous photo"
        >
          <div className="lightbox-nav-arrow p-2 rounded-full bg-black/40
                          backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors">
            <ChevronLeft size={28} />
          </div>
        </div>
      )}

      {canGoNext && (
        <div
          className="lightbox-nav-zone absolute right-0 top-0 bottom-0 w-1/4 z-10
                     flex items-center justify-end pr-4 cursor-pointer"
          onClick={onNext}
          aria-label="Next photo"
        >
          <div className="lightbox-nav-arrow p-2 rounded-full bg-black/40
                          backdrop-blur-sm text-white/90 hover:bg-black/60 transition-colors">
            <ChevronRight size={28} />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20
                      text-white/70 text-sm font-mono tabular-nums
                      bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
        {currentIndex + 1} / {totalCount}
      </div>
    </>
  );
}
