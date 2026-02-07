'use client';

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LightboxProvider, useLightbox, useThumbnailRegistryContext } from '@/components/Lightbox/LightboxProvider';
import { LightboxOverlay } from '@/components/Lightbox/LightboxOverlay';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';
import { formatDate } from '@/lib/utils';
import { thumbHashToDataURL } from 'thumbhash';

function decodeThumbhash(base64) {
  if (!base64) return null;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return thumbHashToDataURL(bytes);
  } catch {
    return null;
  }
}

function PhotoGridItem({ photo, index, isFullSpan, isCentered, openLightbox }) {
  const { register } = useThumbnailRegistryContext();
  const { ref: lazyRef, isVisible, hasLoaded, onLoad } = useImageLazyLoad();
  const elementRef = useRef(null);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [width, height] = (photo.aspectRatio || '1/1').split('/').map(Number);
  const paddingTop = `${(height / width) * 100}%`;
  const blurDataURL = useMemo(() => decodeThumbhash(photo.thumbhash), [photo.thumbhash]);

  const setRef = useCallback((el) => {
    elementRef.current = el;
    lazyRef.current = el;
    register(`photo-${photo.id}`, el);
  }, [photo.id, register, lazyRef]);

  useEffect(() => {
    return () => register(`photo-${photo.id}`, null);
  }, [photo.id, register]);

  const handleClick = useCallback(() => {
    setOverlayVisible(false);
    requestAnimationFrame(() => {
      openLightbox(index, undefined);
      setTimeout(() => setOverlayVisible(true), 400);
    });
  }, [index, openLightbox]);

  return (
    <motion.div
      ref={setRef}
      layoutId={`photo-${photo.id}`}
      onClick={handleClick}
      className={`photo-grid-item relative cursor-pointer group ${
        isFullSpan ? 'col-span-2 md:col-span-3' : ''
      } ${
        isCentered ? 'md:col-start-2' : ''
      }`}
      style={{ paddingTop, borderRadius: 16 }}
    >
      {blurDataURL && !hasLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          aria-hidden="true"
        />
      )}

      {isVisible && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className={`absolute inset-0 object-cover rounded-2xl transition-opacity duration-500 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={isFullSpan
            ? '(max-width: 768px) 100vw, 1200px'
            : '(max-width: 768px) 50vw, 33vw'
          }
          onLoad={onLoad}
        />
      )}

      <div
        className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 rounded-2xl flex flex-col
                    justify-end p-4 ${!overlayVisible ? '!opacity-0' : ''}`}
      >
        <p className="text-white font-medium text-sm font-serif">
          {photo.title}
        </p>
        <p className="text-white/80 text-xs font-sans">
          {formatDate(photo.date)}
        </p>
      </div>
    </motion.div>
  );
}

function PhotoGrid({ photos }) {
  const { setPhotos, openLightbox } = useLightbox();

  useEffect(() => {
    setPhotos(photos);
  }, [photos, setPhotos]);

  const shouldSpanFull = (photo) => {
    const [width, height] = (photo.aspectRatio || '1/1').split('/').map(Number);
    return width > height;
  };

  const shouldCenter = (photo, index) => {
    if (shouldSpanFull(photo)) return false;
    const prevPhoto = photos[index - 1];
    const nextPhoto = photos[index + 1];
    const prevSpans = prevPhoto && shouldSpanFull(prevPhoto);
    const nextSpans = nextPhoto && shouldSpanFull(nextPhoto);
    return (prevSpans && (!nextPhoto || nextSpans)) || (!prevPhoto && nextSpans);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        No photos to display.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[1fr]">
      {photos.map((photo, index) => (
        <PhotoGridItem
          key={photo.id}
          photo={photo}
          index={index}
          isFullSpan={shouldSpanFull(photo)}
          isCentered={shouldCenter(photo, index)}
          openLightbox={openLightbox}
        />
      ))}
    </div>
  );
}

export function PhotoGallery({ photos }) {
  return (
    <section className="w-full max-w-[1200px] px-4 py-8">
      <LightboxProvider>
        <PhotoGrid photos={photos} />
        <LightboxOverlay />
      </LightboxProvider>
    </section>
  );
}
