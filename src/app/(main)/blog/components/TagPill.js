export function TagPill({ tag, onClick, active }) {
    return (
        <button
            onClick={() => onClick(tag)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 
                font-serif tracking-wide
                border ${active
                    ? 'bg-oxford-50/80 dark:bg-oxford-900/30 border-oxford-200/70 dark:border-oxford-800/70 text-oxford-800 dark:text-oxford-200 shadow-sm'
                    : 'bg-white/50 dark:bg-neutral-900/50 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-600 dark:text-neutral-400'
                }
                hover:bg-white dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 backdrop-blur-sm`}
        >
            {tag}
        </button>
    );
} 