'use client';

import { memo } from 'react';
import Link from 'next/link';

export const NavTile = memo(function NavTile({
    href,
    icon: Icon,
    name,
    colorClass,
    isActive,
}) {
    return (
        <div className="flex flex-col items-center group relative">
            <Link
                href={href}
                aria-label={name}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center p-[10px] rounded-lg
                bg-transparent border border-transparent
                transition-colors duration-200
                hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80
                active:bg-neutral-200/80 dark:active:bg-neutral-700/80
                ${isActive ? 'bg-neutral-100/60 dark:bg-neutral-800/60' : ''}`}
            >
                <Icon
                    size={26}
                    className={`stroke-neutral-600 dark:stroke-neutral-400 transition-colors duration-200 ${colorClass} relative z-10`}
                />
            </Link>
            {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-oxford-600 dark:bg-oxford-400" />
            )}
        </div>
    );
});
