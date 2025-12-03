"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("relative w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse", className)} 
           style={aspectRatio ? { aspectRatio } : undefined} 
      />
    );
  }

  const isDarkMode = resolvedTheme === 'dark';

  // Strategies for dark mode adaptation
  const getStrategyStyles = () => {
    const base = { transition: 'filter 0.3s ease, box-shadow 0.3s ease' };
    if (!isDarkMode) return base;

    switch (strategy) {
      case 'subtle':
        return { ...base, filter: 'brightness(0.92) contrast(0.92) saturate(0.95)', boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)' };
      case 'invert':
        return { ...base, filter: 'invert(0.9) hue-rotate(180deg)' };
      case 'dim':
        return { ...base, filter: 'brightness(0.7) contrast(0.85) saturate(0.85)' };
      case 'frame':
        return { ...base, border: '8px solid rgba(30, 30, 30, 0.8)', boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)' };
      case 'blend':
        return { ...base, mixBlendMode: 'difference' };
      case 'counter-invert':
        return base; // Native dark mode image, do nothing
      default:
        return base;
    }
  };

  const styles = strategy === 'counter-invert' && !isDarkMode 
    ? { filter: 'invert(1) brightness(1.02) contrast(0.98)', transition: 'filter 0.3s ease' }
    : getStrategyStyles();

  return (
    <div className={cn("relative transition-all duration-300 ease-in-out", className)}
         style={aspectRatio ? { aspectRatio } : undefined}>
      {width && height ? (
        <Image
          src={src}
          alt={alt || "Image"}
          width={width}
          height={height}
          priority={priority}
          style={{ ...styles, objectFit, width: '100%', height: 'auto', ...customStyles }}
          className={cn("transition-all duration-300 ease-in-out", strategy === 'frame' ? 'rounded-lg' : '')}
          {...nextProps}
        />
      ) : (
        <img
          src={src}
          alt={alt || "Image"}
          style={{ ...styles, objectFit, width: '100%', height: 'auto', ...customStyles }}
          className={cn("w-full transition-all duration-300 ease-in-out", strategy === 'frame' ? 'rounded-lg' : '')}
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