'use client';

import { useState, useEffect, useCallback, Component } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { useLightbox, useThumbnailRegistryContext } from './LightboxProvider';
import { LightboxImage } from './LightboxImage';
import { LightboxControls } from './LightboxControls';
import { usePreloadImages } from '@/hooks/usePreloadImages';
import { cn, formatDate } from '@/lib/utils';

const SPRING_MORPH = { type: 'spring', stiffness: 130, damping: 19, mass: 1 };

class LightboxErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lightbox error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      this.props.onError?.();
      return null;
    }
    return this.props.children;
  }
}

export function LightboxOverlay() {
  const { isOpen, currentIndex, getPhotos, closeLightbox, navigate } = useLightbox();
  const photos = getPhotos();

  const photo = isOpen && currentIndex !== null ? photos[currentIndex] : null;

  usePreloadImages(photos, currentIndex, isOpen);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {isOpen && photo && (
          <LightboxOverlayBody
            photo={photo}
            photos={photos}
            currentIndex={currentIndex}
            closeLightbox={closeLightbox}
            navigate={navigate}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

function LightboxOverlayBody({ photo, photos, currentIndex, closeLightbox, navigate }) {
  const { getElement } = useThumbnailRegistryContext();
  const [settled, setSettled] = useState(false);

  const handleClose = useCallback(async () => {
    const el = getElement(`photo-${photo.id}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const isOffScreen = rect.bottom < 0 || rect.top > window.innerHeight;
      if (isOffScreen) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      }
    }

    closeLightbox();
  }, [photo.id, closeLightbox, getElement]);

  const handleDismiss = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleErrorBoundary = useCallback(() => {
    closeLightbox();
  }, [closeLightbox]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigate(1);
          break;
        case 'Tab':
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, handleClose]);

  return (
    <LightboxErrorBoundary onError={handleErrorBoundary}>
      <m.div
        key="lightbox-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label={`Photo: ${photo.title}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <m.div
          className={cn('absolute inset-0 bg-black/90', settled && 'backdrop-blur-md')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => setSettled(true)}
          onClick={handleClose}
        />

        <div className="sr-only" aria-live="polite">
          {`Photo ${currentIndex + 1} of ${photos.length}: ${photo.title}`}
        </div>

        <m.div
          layoutId={`photo-${photo.id}`}
          className="relative z-10 w-[90vw] h-[85vh] md:w-[85vw] md:h-[85vh] max-w-6xl"
          style={{ borderRadius: 16 }}
          transition={{ layout: SPRING_MORPH }}
        >
          <LightboxImageSlot key={photo.id} photo={photo} onDismiss={handleDismiss} />
        </m.div>

        <LightboxControls
          currentIndex={currentIndex}
          totalCount={photos.length}
          onPrevious={() => navigate(-1)}
          onNext={() => navigate(1)}
          onClose={handleClose}
          canGoPrevious={currentIndex > 0}
          canGoNext={currentIndex < photos.length - 1}
        />

        <m.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20
                     text-center pointer-events-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        >
          <h2
            className="text-white text-base font-medium font-serif mb-0.5"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}
          >
            {photo.title}
          </h2>
          <div
            className="flex items-center justify-center gap-2 text-xs text-white/60 font-sans"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}
          >
            <span>{formatDate(photo.date)}</span>
            {photo.width && photo.height && (
              <>
                <span>·</span>
                <span>
                  {photo.width} × {photo.height}
                </span>
              </>
            )}
            {photo.exif?.camera && (
              <>
                <span>·</span>
                <span>{photo.exif.camera}</span>
              </>
            )}
            {photo.exif?.aperture && (
              <>
                <span>·</span>
                <span>{photo.exif.aperture}</span>
              </>
            )}
            {photo.exif?.iso && (
              <>
                <span>·</span>
                <span>ISO {photo.exif.iso}</span>
              </>
            )}
          </div>
        </m.div>
      </m.div>
    </LightboxErrorBoundary>
  );
}

function LightboxImageSlot({ photo, onDismiss }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-2xl">
        <span className="text-white/50">Failed to load image</span>
      </div>
    );
  }

  return <LightboxImage photo={photo} onDismiss={onDismiss} onImageError={handleImageError} />;
}
