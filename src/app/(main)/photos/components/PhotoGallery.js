'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { LightboxProvider, useLightbox, useThumbnailRegistryContext } from '@/components/Lightbox/LightboxProvider';
import { useImageLazyLoad } from '@/hooks/useImageLazyLoad';

const LightboxOverlay = dynamic(
  () => import('@/components/Lightbox/LightboxOverlay').then(mod => mod.LightboxOverlay),
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
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia('(min-width: 768px)');
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(min-width: 768px)').matches ? 3 : 2,
    () => 3
  );
}

function useImageReadyFallback(isAboveFold, onLoad) {
  useEffect(() => {
    if (!isAboveFold) return;
    const timeout = window.setTimeout(onLoad, 1800);
    return () => window.clearTimeout(timeout);
  }, [isAboveFold, onLoad]);
}

const ABOVE_FOLD_COUNT = 6;

const PhotoGridItem = memo(function PhotoGridItem({ photo, index, openLightbox }) {
  const { register } = useThumbnailRegistryContext();
  const isAboveFold = index < ABOVE_FOLD_COUNT;
  const { ref: lazyRef, isVisible, hasLoaded, onLoad } = useImageLazyLoad({
    rootMargin: '500px 0px',
  });
  const elementRef = useRef(null);

  const [width, height] = (photo.aspectRatio || '1/1').split('/').map(Number);
  const imageSrc = photo.gridSrc || photo.src;

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
  useImageReadyFallback(isAboveFold, onLoad);

  return (
    <button
      ref={setRef}
      type="button"
      onClick={handleClick}
      className="photo-grid-item group relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 text-left shadow-sm transition-transform duration-300 ease-out hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-oxford-500 dark:bg-neutral-800"
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {shouldRender && (
        <Image
          src={imageSrc}
          alt={photo.alt}
          fill
          unoptimized
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          placeholder={photo.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={photo.blurDataURL || undefined}
          className={`absolute inset-0 object-cover transition duration-500 ease-out group-hover:scale-[1.02] ${
            hasLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
          }`}
          sizes="(max-width: 767px) calc((100vw - 56px) / 2), (max-width: 1279px) calc((100vw - 112px) / 3), 368px"
          onLoad={onLoad}
        />
      )}
    </button>
  );
});

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
