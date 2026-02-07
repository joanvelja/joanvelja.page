'use client';

import { useState, useEffect, useCallback, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { isOpen, currentIndex, photos, closeLightbox, navigate } = useLightbox();
  const { getElement } = useThumbnailRegistryContext();
  const [settled, setSettled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const previousFocusRef = useRef(null);
  const prevOpenRef = useRef(false);
  const prevIndexRef = useRef(null);

  const photo = isOpen && currentIndex !== null ? photos[currentIndex] : null;

  usePreloadImages(photos, currentIndex, isOpen);

  if (isOpen && !prevOpenRef.current) {
    if (settled) setSettled(false);
    if (imageError) setImageError(false);
  }
  if (currentIndex !== prevIndexRef.current && prevIndexRef.current !== null) {
    if (imageError) setImageError(false);
  }
  prevOpenRef.current = isOpen;
  prevIndexRef.current = currentIndex;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('lightbox-open');
    } else {
      document.body.classList.remove('lightbox-open');
    }
    return () => document.body.classList.remove('lightbox-open');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleClose = useCallback(async () => {
    if (!photo) {
      closeLightbox();
      return;
    }

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
  }, [photo, closeLightbox, getElement]);

  const handleDismiss = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleErrorBoundary = useCallback(() => {
    closeLightbox();
  }, [closeLightbox]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, navigate, handleClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && photo && (
        <LightboxErrorBoundary onError={handleErrorBoundary}>
          <motion.div
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
            <motion.div
              className={cn(
                'absolute inset-0 bg-black/90',
                settled && 'backdrop-blur-md'
              )}
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

            <motion.div
              layoutId={`photo-${photo.id}`}
              className="relative z-10 w-[90vw] h-[85vh] md:w-[85vw] md:h-[85vh] max-w-6xl"
              style={{ borderRadius: 16 }}
              transition={{ layout: SPRING_MORPH }}
            >
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-2xl">
                  <span className="text-white/50">Failed to load image</span>
                </div>
              ) : (
                <LightboxImage
                  photo={photo}
                  onDismiss={handleDismiss}
                  onImageError={handleImageError}
                />
              )}
            </motion.div>

            <LightboxControls
              currentIndex={currentIndex}
              totalCount={photos.length}
              onPrevious={() => navigate(-1)}
              onNext={() => navigate(1)}
              onClose={handleClose}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < photos.length - 1}
            />

            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20
                         text-center pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <h2 className="text-white text-base font-medium font-serif mb-0.5"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
                {photo.title}
              </h2>
              <div className="flex items-center justify-center gap-2 text-xs text-white/60 font-sans"
                   style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)' }}>
                <span>{formatDate(photo.date)}</span>
                {photo.width && photo.height && (
                  <>
                    <span>·</span>
                    <span>{photo.width} × {photo.height}</span>
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
            </motion.div>
          </motion.div>
        </LightboxErrorBoundary>
      )}
    </AnimatePresence>
  );
}
