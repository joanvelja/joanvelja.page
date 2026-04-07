'use client';

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { m } from 'framer-motion';
import { LightboxProvider, useLightbox, useThumbnailRegistryContext } from '@/components/Lightbox/LightboxProvider';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';

const LightboxOverlay = dynamic(
  () => import('@/components/Lightbox/LightboxOverlay').then(m => m.LightboxOverlay),
  { ssr: false }
);

function distributeToColumns(photos, numCols) {
  const columns = Array.from({ length: numCols }, () => ({ items: [], height: 0 }));
  photos.forEach((photo, index) => {
    const [w, h] = (photo.aspectRatio || '1/1').split('/').map(Number);
    const shortest = columns.reduce((min, col, i) =>
      col.height < columns[min].height ? i : min, 0);
    columns[shortest].items.push({ photo, index });
    columns[shortest].height += h / w;
  });
  return columns.map(col => col.items);
}

function useColumnCount() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 768 ? 3 : 2);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

const ABOVE_FOLD_COUNT = 6;

function PhotoGridItem({ photo, index, openLightbox }) {
  const { register } = useThumbnailRegistryContext();
  const isAboveFold = index < ABOVE_FOLD_COUNT;
  const { ref: lazyRef, isVisible, hasLoaded, onLoad } = useImageLazyLoad();
  const elementRef = useRef(null);

  const [width, height] = (photo.aspectRatio || '1/1').split('/').map(Number);

  const setRef = useCallback((el) => {
    elementRef.current = el;
    lazyRef.current = el;
    register(`photo-${photo.id}`, el);
  }, [photo.id, register, lazyRef]);

  useEffect(() => {
    return () => register(`photo-${photo.id}`, null);
  }, [photo.id, register]);

  const handleClick = useCallback(() => {
    openLightbox(index, undefined);
  }, [index, openLightbox]);

  const shouldRender = isAboveFold || isVisible;

  return (
    <m.div
      ref={setRef}
      layoutId={`photo-${photo.id}`}
      onClick={handleClick}
      className="photo-grid-item relative cursor-pointer group"
      style={{ aspectRatio: `${width}/${height}`, borderRadius: 16 }}
    >
      {photo.blurDataURL && !hasLoaded && (
        <img
          src={photo.blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          aria-hidden="true"
        />
      )}

      {shouldRender && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={isAboveFold}
          className={`absolute inset-0 object-cover rounded-2xl transition-opacity duration-500 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 768px) 50vw, min(400px, 33vw)"
          onLoad={onLoad}
        />
      )}

    </m.div>
  );
}

function PhotoGrid({ photos }) {
  const { setPhotos, openLightbox } = useLightbox();
  const numCols = useColumnCount();

  useEffect(() => {
    setPhotos(photos);
  }, [photos, setPhotos]);

  const columns = useMemo(
    () => distributeToColumns(photos, numCols),
    [photos, numCols]
  );

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        No photos to display.
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {columns.map((colItems, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4">
          {colItems.map(({ photo, index }) => (
            <PhotoGridItem
              key={photo.id}
              photo={photo}
              index={index}
              openLightbox={openLightbox}
            />
          ))}
        </div>
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
