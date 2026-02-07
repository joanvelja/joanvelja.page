import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A component that adjusts images for dark mode with various strategies.
 * Uses Tailwind dark: classes for theme-aware styling.
 */
export function ImageThemeAdjuster({
  src,
  alt,
  width,
  height,
  className,
  strategy = "subtle",
  customStyles = {},
  showCaption = false,
  caption = "",
  priority = false,
  aspectRatio,
  objectFit = "contain",
  nextProps = {},
}) {
  const imageClasses = cn(
    strategy === 'frame' && 'rounded-lg',
    strategy === 'subtle' && 'dark:brightness-[0.92] dark:contrast-[0.92] dark:saturate-[0.95]',
    strategy === 'invert' && 'dark:invert dark:hue-rotate-180',
    strategy === 'dim' && 'dark:brightness-[0.7] dark:contrast-[0.85] dark:saturate-[0.85]',
    strategy === 'blend' && 'dark:mix-blend-difference',
    strategy === 'counter-invert' && 'invert brightness-[1.02] contrast-[0.98] dark:invert-0'
  );

  const imageStyle = {
    ...customStyles,
    objectFit,
    width: '100%',
    height: 'auto',
  };

  return (
    <div
      className={cn("relative", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {width && height ? (
        <Image
          src={src}
          alt={alt || "Image"}
          width={width}
          height={height}
          priority={priority}
          style={imageStyle}
          className={imageClasses}
          {...nextProps}
        />
      ) : (
        <img
          src={src}
          alt={alt || "Image"}
          style={imageStyle}
          className={cn("w-full", imageClasses)}
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
