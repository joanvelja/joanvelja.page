import Image from 'next/image';

import { cn } from '@/lib/utils';

const EMPTY_OBJECT = Object.freeze({});

export function ImageThemeAdjuster({
  src,
  alt,
  width,
  height,
  className,
  strategy = 'subtle',
  customStyles = EMPTY_OBJECT,
  showCaption = false,
  caption = '',
  priority = false,
  aspectRatio,
  objectFit = 'contain',
  sizes = '(min-width: 768px) 800px, 100vw',
  nextProps = EMPTY_OBJECT,
}) {
  const imageClasses = cn(
    strategy === 'frame' && 'rounded-lg',
    strategy === 'subtle' && 'dark:brightness-[0.92] dark:contrast-[0.92] dark:saturate-[0.95]',
    strategy === 'invert' && 'dark:invert dark:hue-rotate-180',
    strategy === 'dim' && 'dark:brightness-[0.7] dark:contrast-[0.85] dark:saturate-[0.85]',
    strategy === 'blend' && 'dark:mix-blend-difference',
    strategy === 'counter-invert' && 'invert brightness-[1.02] contrast-[0.98] dark:invert-0'
  );

  const hasDimensions = typeof width === 'number' && typeof height === 'number';

  return (
    <div
      className={cn('relative', className)}
      style={!hasDimensions ? { aspectRatio: aspectRatio ?? '16/9' } : undefined}
    >
      {hasDimensions ? (
        <Image
          src={src}
          alt={alt || ''}
          width={width}
          height={height}
          priority={priority}
          className={imageClasses}
          sizes={sizes}
          style={{ ...customStyles, objectFit, width: '100%', height: 'auto' }}
          {...nextProps}
        />
      ) : (
        <Image
          src={src}
          alt={alt || ''}
          fill
          priority={priority}
          className={imageClasses}
          sizes={sizes}
          style={{ ...customStyles, objectFit }}
          {...nextProps}
        />
      )}

      {showCaption && caption && (
        <div className="mt-2 text-xs text-center text-neutral-500 dark:text-neutral-400 italic font-serif">
          {caption}
        </div>
      )}
    </div>
  );
}
