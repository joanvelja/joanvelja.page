import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Mail, GraduationCap, FileText } from 'lucide-react';

export const metadata = {
    title: 'Contact | Joan Velja',
    description: 'Get in touch with Joan Velja.'
};

// LessWrong Icon Component
const LessWrongIcon = ({ className = "", size = 24 }) => (
    <img
      src="/png/Lesswrong.png"
      alt="Less Wrong"
      width={size}
      height={size}
      className={className}
      style={{ 
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );

export default function ContactPage() {
    return (
        <main className="flex flex-col items-center justify-start w-full animate-fade-in">
            <section className="w-full max-w-[540px] space-y-12 px-4 py-16">
                {/* Contact Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Twitter */}
                    <a
                        href="https://x.com/joanvelja" // You'll specify the href
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <Twitter className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-sky-500" />
                    </a>

                    {/* GitHub */}
                    <a
                        href="#" // You'll specify the href
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <Github className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-violet-500" />
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:joan.velja22@gmail.com" // You'll specify the href
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <Mail className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-emerald-500" />
                    </a>

                    {/* Google Scholar */}
                    <a
                        href="https://scholar.google.com/citations?user=9WJ1rYkAAAAJ&hl=en" // You'll specify the href
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <GraduationCap className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-blue-500" />
                    </a>

                    {/* LessWrong */}
                    <a
                        href="https://www.lesswrong.com/users/joanv" // You'll specify the href
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <LessWrongIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-orange-500" />
                    </a>

                    {/* CV */}
                    <Link
                        href="/pdf/CV_extended_Velja.pdf"
                        target="_blank"
                        className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                        transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                        group"
                    >
                        <FileText className="w-6 h-6 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-red-500" />
                    </Link>
                </div>
            </section>
        </main>
    );
} 