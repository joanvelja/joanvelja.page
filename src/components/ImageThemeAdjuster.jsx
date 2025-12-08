"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A component that adjusts images for dark mode with various strategies.
 * 
 * Theme transitions are handled via inline styles (filter, box-shadow).
 * No transition-all - specific properties only.
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
  // Strategy styles with explicit transitions for filter/box-shadow only
  const getStrategyStyles = () => {
    const base = {
      transition: 'filter 0.3s ease, box-shadow 0.3s ease'
    };

    switch (strategy) {
      case 'subtle':
        return {
          ...base,
          '--tw-filter': 'brightness(0.92) contrast(0.92) saturate(0.95)',
        };
      case 'invert':
        return { ...base };
      case 'dim':
        return { ...base };
      case 'frame':
        return { ...base };
      case 'blend':
        return { ...base };
      case 'counter-invert':
        return base;
      default:
        return base;
    }
  };

  const styles = { ...getStrategyStyles(), ...customStyles };

  // Use CSS classes for dark mode effects, not JS-computed styles
  const imageClasses = cn(
    strategy === 'frame' && 'rounded-lg',
    strategy === 'subtle' && 'dark:brightness-[0.92] dark:contrast-[0.92] dark:saturate-[0.95]',
    strategy === 'invert' && 'dark:invert dark:hue-rotate-180',
    strategy === 'dim' && 'dark:brightness-[0.7] dark:contrast-[0.85] dark:saturate-[0.85]',
    strategy === 'blend' && 'dark:mix-blend-difference',
    strategy === 'counter-invert' && 'invert brightness-[1.02] contrast-[0.98] dark:invert-0'
  );

  const imageStyle = {
    ...styles,
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