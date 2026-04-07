import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function throttle(fn, ms) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= ms) {
            lastCall = now;
            return fn.apply(this, args);
        }
    };
}

const DATE_FORMATS = {
  'month-year': { month: 'long', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  short: { month: 'short', day: 'numeric', year: 'numeric' },
};

export function formatDate(date, style = 'month-year') {
  return new Date(date).toLocaleDateString('en-US', DATE_FORMATS[style]);
}

export function estimateReadingTime(text) {
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
}

function getNodeText(node) {
    if (['string', 'number'].includes(typeof node)) return node;
    if (node instanceof Array) return node.map(getNodeText).join('');
    if (typeof node === 'object' && node) return getNodeText(node.props?.children);
    return '';
}

export function slugify(text) {
    const str = typeof text === 'string' ? text : getNodeText(text);
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function getOptimizedSrc(src) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;
}

export function renderTextWithLinks(text) {
    if (!text) return null;

    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch) {
            return <strong key={index} className="font-semibold text-neutral-900 dark:text-white">{boldMatch[1]}</strong>;
        }

        const italicMatch = part.match(/^\*([^*]+)\*$/);
        if (italicMatch) {
            return <em key={index} className="italic">{italicMatch[1]}</em>;
        }

        const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);

        return linkParts.map((subPart, subIndex) => {
            const linkMatch = subPart.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
                const [_, linkText, linkUrl] = linkMatch;
                return (
                    <a
                        key={`${index}-${subIndex}`}
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-oxford-700 hover:text-oxford-800 dark:text-oxford-300 dark:hover:text-oxford-200 underline decoration-oxford-200 dark:decoration-oxford-800 underline-offset-2 transition-colors"
                    >
                        {linkText}
                    </a>
                );
            }
            return subPart;
        });
    });
}
