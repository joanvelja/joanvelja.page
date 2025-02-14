

export function TagPill({ tag, onClick, active }) {
    return (
        <button
            onClick={() => onClick(tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors
                ${active 
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }
                hover:bg-neutral-200 dark:hover:bg-neutral-700`}
        >
            {tag}
        </button>
    );
} 