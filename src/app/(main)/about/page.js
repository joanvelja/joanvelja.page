import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/lib/projectsData';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/mdx';
import { HeroReveal, HeroItem } from '@/components/HeroReveal';
import { ScrollReveal } from '@/components/ScrollReveal';
import { renderTextWithLinks } from '@/lib/utils';

export const metadata = {
    title: 'About | Joan Velja',
    description: 'Learn more about Joan Velja and his work.'
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
                <HeroReveal className="flex flex-row items-start gap-6 md:gap-10">
                    <HeroItem className="w-[40%] flex-shrink-0">
                        <div className="rounded-2xl overflow-hidden">
                            <Image
                                alt="Joan Velja"
                                src="/pfp/joan.png"
                                width={302}
                                height={403}
                                priority
                                className="shadow-md object-cover w-full h-auto"
                                style={{ aspectRatio: '4/5' }}
                            />
                        </div>
                    </HeroItem>

                    <HeroItem className="space-y-4">
                        <h1 className="text-4xl md:text-display-large font-serif-display font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                            Hi, I'm Joan.
                        </h1>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed font-serif text-neutral-700 dark:text-neutral-300">
                                {renderTextWithLinks(`I'm a PhD student at the **University of Oxford**, supervised by [Alessandro Abate](https://www.cs.ox.ac.uk/people/alessandro.abate/). I work on AI alignment — specifically, how to reliably supervise systems smarter than the supervisor. This is the *scalable oversight problem*. I'm funded by the [Alignment Project](https://alignmentproject.aisi.gov.uk/) (UK AISI) to work on adversarial elicitation — building on the [unexploitable search problem](https://www.alignmentforum.org/posts/CuneN5HmLnztsLRzD/unexploitable-search-blocking-malicious-use-of-free-1).`)}
                            </p>
                        </div>
                    </HeroItem>
                </HeroReveal>

                <hr className="border-oxford-200 dark:border-oxford-800/60 w-16 mx-auto my-14" />

                <div className="text-neutral-900 dark:text-neutral-200 w-full">
                    {featuredWorks.length > 0 && (
                        <ScrollReveal className="mt-12">
                            <h2 className="text-lg font-medium italic text-oxford-700 dark:text-oxford-300 font-serif-display mb-2">Selected Research</h2>
                            <hr className="border-oxford-200 dark:border-oxford-800/60 mb-6" />
                            <div className="divide-y divide-oxford-100 dark:divide-oxford-900/40">
                                {featuredWorks.map((work) => (
                                    <div key={work.title} className="group py-5 first:pt-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-xl font-medium font-serif-display text-neutral-900 dark:text-white group-hover:text-oxford-700 dark:group-hover:text-oxford-300 transition-colors">
                                                {work.title}
                                            </h3>
                                            {work.links && work.links[0] && (
                                                <a href={work.links[0].url} target="_blank" rel="noopener noreferrer" className="text-oxford-400 dark:text-oxford-500 hover:text-oxford-700 dark:hover:text-oxford-300 transition-colors mt-1">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-serif leading-relaxed line-clamp-3">
                                            {renderTextWithLinks(work.description)}
                                        </p>
                                        <span className="inline-block mt-3 text-xs font-medium px-2 py-0.5 bg-oxford-50 dark:bg-oxford-900/30 rounded border border-oxford-200 dark:border-oxford-800 text-oxford-700 dark:text-oxford-300 font-sans">
                                            {work.publication_venue}
                                        </span>
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
                            <h2 className="text-lg font-medium italic text-oxford-700 dark:text-oxford-300 font-serif-display mb-2">Latest Writing</h2>
                            <hr className="border-oxford-200 dark:border-oxford-800/60 mb-6" />
                            <Link href={`/blog/${featuredPost.slug}`} className="block group border-l-2 border-l-oxford-600 dark:border-l-oxford-400 pl-5 py-1 hover:border-l-oxford-800 dark:hover:border-l-oxford-200 transition-colors">
                                <h3 className="text-xl font-medium font-serif-display text-neutral-900 dark:text-white group-hover:text-oxford-700 dark:group-hover:text-oxford-300 transition-colors">
                                    {featuredPost.title}
                                </h3>
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
                            <p className="text-base font-serif text-neutral-500 dark:text-neutral-400 mb-4">I like talking to people working on alignment, RL, forecasting, or anything I'd find on my own reading list.</p>
                            <a
                                href="https://calendar.app.google/4SE9NkamgzSWytEXA"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-oxford-800 text-white dark:bg-oxford-100 dark:text-oxford-900 rounded-full font-sans font-medium hover:bg-oxford-700 dark:hover:bg-oxford-200 transition-colors duration-200"
                            >
                                Schedule a call
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </main>
    );
}
