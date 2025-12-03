'use client';

import { useState } from 'react';
import { Link } from 'lucide-react';

export function HeadingWithAnchor({ as: Component = 'h1', id, children, className }) {
    const [showCopied, setShowCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(url);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    return (
        <Component id={id} className={`group relative ${className}`}>
            <span className="inline-block">{children}</span>
            <button
                onClick={handleCopy}
                className="inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                         ml-2 -translate-y-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 
                         dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400
                         dark:focus:ring-neutral-500 rounded"
                aria-label="Copy link to section"
            >
                <Link size={14} strokeWidth={2.5} />
                {showCopied && (
                    <span className="absolute left-full ml-2 px-2 py-1 text-xs text-white 
                                   bg-neutral-800 dark:bg-neutral-700 rounded shadow-lg whitespace-nowrap">
                        Copied to clipboard!
                    </span>
                )}
            </button>
        </Component>
    );
} 