import Image from 'next/image';

import { cn } from '@/lib/utils';

const EMPTY_OBJECT = Object.freeze({});

export function DarkModeImageWrapper({
  src,
  alt,
  className = '',
  rounded = 'rounded-lg',
  softEdge = true,
  borderStyle = 'border border-neutral-200/30 dark:border-neutral-700/30',
  containerStyle = 'bg-neutral-100/30 dark:bg-neutral-800/30',
  isCoverImage = false,
  aspectRatio,
  sizes = '(min-width: 768px) 800px, 100vw',
  priority = isCoverImage,
  imageProps = EMPTY_OBJECT,
}) {
  const containerClasses = cn(
    'relative overflow-hidden',
    rounded,
    borderStyle,
    containerStyle,
    isCoverImage ? 'backdrop-blur-[2px] p-1' : 'p-0.5'
  );

  const hasAspectClass = /\baspect-\[/.test(className);
  const resolvedAspectRatio = aspectRatio ?? (hasAspectClass ? undefined : '16/9');

  const imageClasses = cn(
    rounded,
    softEdge && 'dark-mode-image'
  );

  return (
    <div className={containerClasses}>
      <div
        className={cn('relative w-full', className)}
        style={resolvedAspectRatio ? { aspectRatio: resolvedAspectRatio } : undefined}
      >
        <Image
          src={src}
          alt={alt || ''}
          fill
          priority={priority}
          sizes={sizes}
          className={imageClasses}
          style={{ objectFit: isCoverImage ? 'cover' : 'contain' }}
          {...imageProps}
        />
      </div>
    </div>
  );
}
