'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { User, Mail, Briefcase, BookText, Image, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { NavTile } from '@/components/NavTile';
import { Clock } from '@/components/Clock';

const pathToTitle = {
    '/about': 'About',
    '/contact': 'Contact',
    '/projects': 'Projects & Works',
    '/blog': 'Blog',
    '/photos': 'Photos'
};

const NAV_ITEMS = [
    { name: 'About', path: '/about', icon: User, color: 'group-hover:stroke-sky-500' },
    { name: 'Contact', path: '/contact', icon: Mail, color: 'group-hover:stroke-emerald-500' },
    { name: 'Projects', path: '/projects', icon: Briefcase, color: 'group-hover:stroke-red-500' },
    { name: 'Blog', path: '/blog', icon: BookText, color: 'group-hover:stroke-yellow-500' },
    { name: 'Photos', path: '/photos', icon: Image, color: 'group-hover:stroke-purple-500' }
];

export default function MainLayout({ children }) {
    const [title, setTitle] = useState('');
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const dockRef = useRef(null);
    const headerRef = useRef(null);

    useScrollDirection(dockRef, headerRef);

    useEffect(() => {
        setTitle(pathToTitle[pathname] || '');
        setMounted(true);
    }, [pathname]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
                <div className="flex min-h-screen flex-col items-center">
                    <div className="max-w-[1200px] w-full flex flex-col items-center px-5 md:px-8">
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
            <header
                ref={headerRef}
                className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200/50 dark:border-neutral-800/50 transition-[backdrop-filter] duration-200 backdrop-blur-[0px] data-[scrolled=true]:backdrop-blur-[12px]"
            >
                <div className="max-w-[1200px] mx-auto px-5 md:px-8">
                    <div className="flex flex-row justify-between w-full md:p-3 p-1">
                        <div className="w-[130px] flex flex-col justify-center">
                            <p className="font-light text-neutral-600 dark:text-neutral-400 text-sm md:text-base font-sans">Joan's Website</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <h1 className="text-xl font-medium md:block hidden text-neutral-900 dark:text-white font-serif"> {title} </h1>
                        </div>
                        <div className="w-[130px] flex flex-col items-end justify-center">
                            <div className="flex items-center gap-6">
                                <Clock />
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {theme === 'light' ? (
                                        <Moon size={20} className="text-neutral-600" />
                                    ) : (
                                        <Sun size={20} className="text-neutral-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen flex-col items-center pt-16">
                <div className="max-w-[1200px] w-full flex flex-col items-center px-5 md:px-8">
                    <div className="flex flex-col max-w-screen overflow-visible w-full py-2 items-center">
                        {children}
                    </div>
                    <div className="w-full h-24 md:h-32"></div>
                </div>
                <div className="w-full flex flex-col items-center pointer-events-none">
                    <div
                        ref={dockRef}
                        className="fixed bottom-8 flex flex-col justify-end transition-transform duration-300 translate-y-0 data-[hidden=true]:translate-y-[200%]"
                    >
                        <div className="z-10 pointer-events-auto">
                            <div className="gap-2 flex flex-row bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-lg rounded-2xl p-[8px]">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.path || (item.path !== '/about' && pathname.startsWith(item.path));

                                    return (
                                        <NavTile
                                            key={item.name}
                                            href={item.path}
                                            icon={item.icon}
                                            name={item.name}
                                            colorClass={item.color}
                                            isActive={isActive}
                                            theme={theme}
                                            fluidMode="thermodynamic"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
