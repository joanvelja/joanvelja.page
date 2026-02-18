'use client';

import { useState } from 'react';

export function InteractiveEmbed({
  src,
  title = 'Interactive Content',
  height = '500px',
  width = '100%',
  className = '',
  showTitle = false,
  allowFullscreen = true,
  sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms',
  loading = 'lazy',
  showCaption = false,
  caption = '',
  aspectRatio,
}) {
  const [reloadNonce, setReloadNonce] = useState(0);

  return (
    <InteractiveEmbedFrame
      key={`${src}-${reloadNonce}`}
      src={src}
      title={title}
      height={height}
      width={width}
      className={className}
      showTitle={showTitle}
      allowFullscreen={allowFullscreen}
      sandbox={sandbox}
      loading={loading}
      showCaption={showCaption}
      caption={caption}
      aspectRatio={aspectRatio}
      onRetry={() => setReloadNonce((n) => n + 1)}
    />
  );
}

function InteractiveEmbedFrame({
  src,
  title,
  height,
  width,
  className,
  showTitle,
  allowFullscreen,
  sandbox,
  loading,
  showCaption,
  caption,
  aspectRatio,
  onRetry,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`my-8 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white font-serif">
          {title}
        </h3>
      )}

      <div
        className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700
                   bg-white dark:bg-neutral-900 shadow-sm shadow-neutral-300/20 dark:shadow-neutral-900/20 transition-shadow duration-300"
        style={aspectRatio ? { aspectRatio } : { height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 border-t-blue-500 rounded-full"></div>
              <span className="text-neutral-600 dark:text-neutral-400 font-serif text-sm">
                Loading {title.toLowerCase()}...
              </span>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
            <div className="text-center p-4">
              <div className="text-red-500 dark:text-red-400 mb-2">⚠️</div>
              <div className="text-neutral-600 dark:text-neutral-400 font-serif text-sm">
                Failed to load interactive content
              </div>
              <button
                type="button"
                onClick={() => {
                  onRetry();
                }}
                className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          width={width}
          height={aspectRatio ? '100%' : height}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          sandbox={sandbox}
          loading={loading}
          allow={allowFullscreen ? 'fullscreen' : ''}
          allowFullScreen={allowFullscreen}
        />
      </div>

      {showCaption && caption && (
        <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-2 italic font-serif">
          {caption}
        </p>
      )}
    </div>
  );
}
