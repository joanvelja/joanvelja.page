'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Mail, Briefcase, BookText, Image, Moon, Sun } from 'lucide-react';

export default function MainLayout({ children }) {
    const [time, setTime] = useState('');
    const [theme, setTheme] = useState('');
    const [title, setTitle] = useState('');
    const pathname = usePathname();

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

        // Initialize theme based on system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
        }

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

        return () => clearInterval(interval);
    }, [pathname]);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
            <div className="flex min-h-screen flex-col items-center">
                <div className="max-w-[1200px] w-full flex flex-col items-center px-5 md:px-8">
                    <div className="flex flex-row justify-between w-full md:p-3 p-1">
                        <div className="w-[130px]">
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-sans">Joan's Website</p>
                        </div>
                        <h1 className="text-xl font-medium md:block hidden text-neutral-900 dark:text-white font-serif"> {title} </h1>
                        <div className="w-[130px] flex flex-col items-end">
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
                    <div className="flex flex-col max-w-screen overflow-visible w-full py-2 items-center">
                        {children}
                    </div>
                </div>
                <div className="w-full flex flex-col items-center pointer-events-none">
                    <div className="fixed bottom-8 inset-y-0 flex flex-col justify-end">
                        <div className="z-10 pointer-events-auto">
                            <div className="gap-2 flex flex-row bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md shadow-lg rounded-2xl p-[8px]">
                                <div className="flex flex-col items-center group">
                                    <Link title="About" href="/about" className="nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                        transition-all ease-in-out hover:shadow-md hover:rotate-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                        active:scale-125 active:rotate-0 active:-translate-y-3 active:shadow-xl">
                                        <User size={28} className="stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out group-hover:stroke-sky-500" />
                                    </Link>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute translate-y-[42.9px] stroke-neutral-400 dark:stroke-neutral-600"><circle cx="12.1" cy="12.1" r="1"></circle></svg>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <Link title="Contact" href="/contact" className="nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                        transition-all ease-in-out hover:shadow-md hover:rotate-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                        active:scale-125 active:rotate-0 active:-translate-y-3 active:shadow-xl">
                                        <Mail size={28} className="stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out group-hover:stroke-emerald-500" />
                                    </Link>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <Link title="Projects" href="/projects" className="nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                        transition-all ease-in-out hover:shadow-md hover:rotate-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                        active:scale-125 active:rotate-0 active:-translate-y-3 active:shadow-xl">
                                        <Briefcase size={28} className="stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out group-hover:stroke-red-500" />
                                    </Link>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <Link title="Blog" href="/blog" className="nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                        transition-all ease-in-out hover:shadow-md hover:rotate-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                        active:scale-125 active:rotate-0 active:-translate-y-3 active:shadow-xl">
                                        <BookText size={28} className="stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out group-hover:stroke-yellow-500" />
                                    </Link>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <Link title="Photos" href="/photos" className="nomblhighlight flex flex-col items-center justify-center p-[10px] rounded-xl shadow-sm bg-white/90 dark:bg-neutral-900/90 fill-neutral-600/90 border border-neutral-200/80 dark:border-neutral-700/80
                                        transition-all ease-in-out hover:shadow-md hover:rotate-12 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:fill-neutral-500
                                        active:scale-125 active:rotate-0 active:-translate-y-3 active:shadow-xl">
                                        <Image size={28} className="stroke-neutral-700 dark:stroke-neutral-200 transition-all ease-in-out group-hover:stroke-purple-500" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}