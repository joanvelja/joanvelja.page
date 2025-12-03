'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Mail, Briefcase, BookText, Image, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function MainLayout({ children }) {
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set title based on current path
        const pathToTitle = {
            '/about': 'About',
            '/contact': 'Contact',
            '/projects': 'Projects & Works',
            '/blog': 'Blog',
            '/photos': 'Photos'
        };
        setTitle(pathToTitle[pathname] || '');

        // Update time every second
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);

        // Mark as mounted
        setMounted(true);

        return () => clearInterval(interval);
    }, [pathname]);

    // Use next-themes toggle
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Handle mounting (prevent hydration mismatch)
    if (!mounted) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
                <div className="flex min-h-screen flex-col items-center">
                    <div className="max-w-[1200px] w-full flex flex-col items-center px-5 md:px-8">
                        {/* Content will be shown after mounting */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50">
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
                                <p className="font-light text-neutral-600 dark:text-neutral-400 text-sm md:text-base font-sans">
                                    {time}
                                </p>
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

            {/* Main Content with top padding to account for fixed header */}
            <div className="flex min-h-screen flex-col items-center pt-16">
                <div className="max-w-[1200px] w-full flex flex-col items-center px-5 md:px-8">
                    <div className="flex flex-col max-w-screen overflow-visible w-full py-2 items-center">
                        {children}
                    </div>
                    <div className="w-full h-24 md:h-32"></div>
                </div>
                <div className="w-full flex flex-col items-center pointer-events-none">
                    <div className="fixed bottom-8 inset-y-0 flex flex-col justify-end">
                        <div className="z-10 pointer-events-auto">
                            <div className="gap-2 flex flex-row bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-lg rounded-2xl p-[8px]">
                                {[
                                    { name: 'About', path: '/about', icon: User, color: 'group-hover:stroke-sky-500' },
                                    { name: 'Contact', path: '/contact', icon: Mail, color: 'group-hover:stroke-emerald-500' },
                                    { name: 'Projects', path: '/projects', icon: Briefcase, color: 'group-hover:stroke-red-500' },
                                    { name: 'Blog', path: '/blog', icon: BookText, color: 'group-hover:stroke-yellow-500' },
                                    { name: 'Photos', path: '/photos', icon: Image, color: 'group-hover:stroke-purple-500' }
                                ].map((item) => {
                                    const isActive = pathname === item.path || (item.path !== '/about' && pathname.startsWith(item.path));
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.name} className="flex flex-col items-center group relative">
                                            <Link
                                                title={item.name}
                                                href={item.path}
                                                className={`nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm 
                                                bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                                transition-all ease-in-out duration-300
                                                hover:shadow-md hover:-translate-y-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                                active:scale-95 active:shadow-sm
                                                ${isActive ? 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600' : ''}`}
                                            >
                                                <Icon size={28} className={`stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out ${item.color}`} />
                                            </Link>
                                            {isActive && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -bottom-6 stroke-neutral-400 dark:stroke-neutral-600 animate-fade-in">
                                                    <circle cx="12.1" cy="12.1" r="1"></circle>
                                                </svg>
                                            )}
                                        </div>
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