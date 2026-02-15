import Link from 'next/link';
import { Twitter, Github, Mail, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import { HeroReveal, HeroItem } from '@/components/HeroReveal';
import { ScrollReveal } from '@/components/ScrollReveal';

export const metadata = {
    title: 'Contact | Joan Velja',
    description: 'Get in touch with Joan Velja.'
};

const LessWrongIcon = ({ className = "", size = 24 }) => (
    <img
      src="/png/Lesswrong.png"
      alt="LessWrong"
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
        <main className="flex flex-col items-center justify-start w-full">
            <section className="w-full max-w-[540px] space-y-12 px-4 py-16">
                <HeroReveal className="space-y-6">
                    <HeroItem>
                        <h1 className="text-2xl md:text-display font-serif-display font-medium text-neutral-900 dark:text-white">
                            Say hello
                        </h1>
                    </HeroItem>
                    <HeroItem>
                        <a
                            href="https://calendar.app.google/4SE9NkamgzSWytEXA"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-full font-sans font-medium hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                        >
                            Schedule a call
                            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </a>
                    </HeroItem>
                </HeroReveal>

                <ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        <a
                            href="https://x.com/joanvelja"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <Twitter className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-sky-500" />
                        </a>

                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <Github className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-violet-500" />
                        </a>

                        <a
                            href="mailto:joan.velja22@gmail.com"
                            className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <Mail className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-emerald-500" />
                        </a>

                        <a
                            href="https://scholar.google.com/citations?user=9WJ1rYkAAAAJ&hl=en"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <GraduationCap className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-blue-500" />
                        </a>

                        <a
                            href="https://www.lesswrong.com/users/joanv"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <LessWrongIcon className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-orange-500" size={28} />
                            <span className="text-xs font-sans text-neutral-400 dark:text-neutral-500">LessWrong</span>
                        </a>

                        <Link
                            href="/pdf/CV_extended_Velja.pdf"
                            target="_blank"
                            className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700
                            transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600
                            group"
                        >
                            <FileText className="w-7 h-7 text-neutral-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-red-500" />
                            <span className="text-xs font-sans text-neutral-400 dark:text-neutral-500">CV</span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </main>
    );
}
