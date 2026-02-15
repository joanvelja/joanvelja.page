import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/lib/projectsData';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/mdx';
import { HeroReveal, HeroItem } from '@/components/HeroReveal';
import { ScrollReveal } from '@/components/ScrollReveal';

export const metadata = {
    title: 'About | Joan Velja',
    description: 'Learn more about Joan Velja and his work.'
};

const renderTextWithLinks = (text) => {
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
};


export default async function AboutPage() {
    const featuredWorks = [...projects.present, ...projects.past]
        .flatMap(p => p.relatedWorks || [])
        .filter(w => w.featured);

    const allPosts = await getAllPosts();
    const featuredPost = allPosts.find(p => p.title.includes('Just make the straw bigger')) || allPosts[0];

    return (
        <main className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto">
            <section className="w-full px-4 py-12">
                <HeroReveal className="flex flex-col md:flex-row md:items-start gap-8 md:gap-10">
                    <HeroItem className="flex-shrink-0">
                        <div className="rounded-2xl overflow-hidden">
                            <Image
                                alt="Joan Velja"
                                src="/pfp/joan.png"
                                width={302}
                                height={403}
                                priority
                                className="shadow-md object-cover"
                                style={{ aspectRatio: '4/5' }}
                            />
                        </div>
                    </HeroItem>

                    <HeroItem className="space-y-4">
                        <h1 className="text-3xl md:text-display font-serif-display font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                            Hi, I'm Joan.
                        </h1>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed font-serif text-neutral-700 dark:text-neutral-300">
                                {renderTextWithLinks(`I'm a PhD student at the **University of Oxford**, supervised by [Alessandro Abate](https://www.cs.ox.ac.uk/people/alessandro.abate/). My research focuses on AI alignment and safety—in particular, understanding how we can ensure supervision of increasingly powerful AI systems, in what is called the *scalable* (or amplified) *oversight problem*. I'm particularly interested in the role of priors and generalization in this endeavour. I also co-supervise research on red-teaming untrusted monitoring at **LASR Labs**.`)}
                            </p>
                        </div>
                    </HeroItem>
                </HeroReveal>

                <hr className="border-neutral-200/50 dark:border-neutral-800/50 w-1/3 mx-auto my-12" />

                <div className="text-neutral-900 dark:text-neutral-200 w-full">
                    {featuredWorks.length > 0 && (
                        <ScrollReveal className="mt-12">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-sans mb-4">Selected Research</h2>
                            <div className="grid gap-4">
                                {featuredWorks.map((work) => (
                                    <div key={work.title} className="group bg-white dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-oxford-200 dark:hover:border-oxford-900/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-medium font-serif-display text-neutral-900 dark:text-white group-hover:text-oxford-700 dark:group-hover:text-oxford-300 transition-colors">
                                                {work.title}
                                            </h3>
                                            {work.links && work.links[0] && (
                                                <a href={work.links[0].url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-oxford-700 transition-all group-hover:rotate-[-3deg]">
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-serif leading-relaxed line-clamp-3">
                                            {renderTextWithLinks(work.description)}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs font-medium px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400 font-sans">
                                                {work.publication_venue}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center mt-6">
                                <Link href="/projects" className="text-sm font-medium text-oxford-700 hover:text-oxford-800 dark:text-oxford-300 hover:underline font-sans flex items-center gap-1">
                                    View all projects <ArrowRight size={14} />
                                </Link>
                            </div>
                        </ScrollReveal>
                    )}

                    {featuredPost && (
                        <ScrollReveal className="mt-12">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-sans mb-4">Latest Writing</h2>
                            <Link href={`/blog/${featuredPost.slug}`} className="block group bg-white dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-oxford-200 dark:hover:border-oxford-900/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-medium font-serif-display text-neutral-900 dark:text-white group-hover:text-oxford-700 dark:group-hover:text-oxford-300 transition-colors">
                                        {featuredPost.title}
                                    </h3>
                                    <ArrowRight size={18} className="text-neutral-400 group-hover:text-oxford-700 transition-all group-hover:translate-x-1" />
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-serif leading-relaxed line-clamp-2">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                                    <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <span>&middot;</span>
                                    <span>{featuredPost.readingTime} min read</span>
                                </div>
                            </Link>
                            <div className="flex justify-center mt-6">
                                <Link href="/blog" className="text-sm font-medium text-oxford-700 hover:text-oxford-800 dark:text-oxford-300 hover:underline font-sans flex items-center gap-1">
                                    Read more posts <ArrowRight size={14} />
                                </Link>
                            </div>
                        </ScrollReveal>
                    )}

                    <ScrollReveal className="mt-16">
                        <div className="flex flex-col items-center">
                            <p className="text-base font-serif text-neutral-500 dark:text-neutral-400 mb-4">Want to collaborate?</p>
                            <a
                                href="https://calendar.app.google/4SE9NkamgzSWytEXA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-full font-sans font-medium hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                            >
                                Schedule a call
                                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                            </a>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
