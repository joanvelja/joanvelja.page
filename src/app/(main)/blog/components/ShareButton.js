'use client';

import { Share } from 'lucide-react';
import { useState } from 'react';

export function ShareButton({ post }) {
    const [showTooltip, setShowTooltip] = useState(false);

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.description,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    fallbackShare();
                }
            }
        } else {
            fallbackShare();
        }
    };

    const fallbackShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    return (
        <div className="relative">
            <button
                onClick={share}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800
                          transition-colors duration-200"
                aria-label="Share article"
            >
                <Share className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
                              bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                              text-sm rounded shadow-lg whitespace-nowrap">
                    Link copied!
                </div>
            )}
        </div>
    );
} 