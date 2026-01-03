import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/lib/projectsData';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/mdx';

export const metadata = {
    title: 'About | Joan Velja',
    description: 'Learn more about Joan Velja and his work.'
};

// Helper for bold, italic text and links
const renderTextWithLinks = (text) => {
    if (!text) return null;

    // Split by bold (**text**) and italic (*text*) patterns
    // Bold first (greedy), then italic (non-greedy to avoid matching bold)
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
        // Check if this part is bold
        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch) {
            return <strong key={index} className="font-semibold text-neutral-900 dark:text-white">{boldMatch[1]}</strong>;
        }

        // Check if this part is italic
        const italicMatch = part.match(/^\*([^*]+)\*$/);
        if (italicMatch) {
            return <em key={index} className="italic">{italicMatch[1]}</em>;
        }

        // If not bold/italic, check for links [text](url)
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
                        className="text-crimson-600 hover:text-crimson-700 dark:text-crimson-400 dark:hover:text-crimson-300 underline decoration-crimson-200 dark:decoration-crimson-800 underline-offset-2 transition-colors"
                    >
                        {linkText}
                    </a>
                );
            }
            return subPart;
        });
    });
};


/* Make title dynamic */


export default async function AboutPage() {
    // Collect featured works
    const featuredWorks = [...projects.present, ...projects.past]
        .flatMap(p => p.relatedWorks || [])
        .filter(w => w.featured);

    // Fetch blog posts
    const allPosts = await getAllPosts();
    // Prioritize "Just make the straw bigger", otherwise get latest
    const featuredPost = allPosts.find(p => p.title.includes('Just make the straw bigger')) || allPosts[0];

    return (
        <main className="flex flex-col items-center justify-start w-full animate-fade-in max-w-2xl mx-auto">
            {/* Hero Section - Side by Side */}
            <section className="w-full px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 animate-slide-up">
                    {/* Profile Image - Left */}
                    <div className="flex-shrink-0">
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

                    {/* Content - Right */}
                    <div className="space-y-4">
                        <h1 className="text-2xl md:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">
                            Hi, I'm Joan.
                        </h1>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed font-serif text-neutral-700 dark:text-neutral-300">
                                {renderTextWithLinks(`I'm a PhD student at the **University of Oxford**, supervised by [Alessandro Abate](https://www.cs.ox.ac.uk/people/alessandro.abate/). My research focuses on AI alignment and safety—in particular, understanding how we can ensure supervision of increasingly powerful AI systems, in what is called the *scalable* (or amplified) *oversight problem*. I'm particularly interested in the role of priors and generalization in this endeavour. I also co-supervise research on red-teaming untrusted monitoring at **LASR Labs**.`)}
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-neutral-200 dark:border-neutral-800 w-1/4 mx-auto my-10" />

                {/* Content Sections */}
                <div className="space-y-10 text-neutral-900 dark:text-neutral-200 w-full animate-slide-up" style={{ animationDelay: '100ms' }}>

                    {/* Selected Research */}
                    {featuredWorks.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-serif font-medium text-neutral-900 dark:text-white">Selected Research</h2>
                            <div className="grid gap-4">
                                {featuredWorks.map((work) => (
                                    <div key={work.title} className="group bg-white dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-crimson-200 dark:hover:border-crimson-900/50 hover:shadow-md transition-all duration-300">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-medium font-serif text-neutral-900 dark:text-white group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
                                                {work.title}
                                            </h3>
                                            {work.links && work.links[0] && (
                                                <a href={work.links[0].url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-crimson-600 transition-colors">
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
                            <div className="flex justify-center">
                                <Link href="/projects" className="text-sm font-medium text-crimson-600 hover:text-crimson-700 dark:text-crimson-400 hover:underline font-sans flex items-center gap-1">
                                    View all projects <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Latest Writing */}
                    {featuredPost && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-serif font-medium text-neutral-900 dark:text-white">Latest Writing</h2>
                            <Link href={`/blog/${featuredPost.slug}`} className="block group bg-white dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-crimson-200 dark:hover:border-crimson-900/50 hover:shadow-md transition-all duration-300">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-lg font-medium font-serif text-neutral-900 dark:text-white group-hover:text-crimson-700 dark:group-hover:text-crimson-400 transition-colors">
                                        {featuredPost.title}
                                    </h3>
                                    <ArrowRight size={18} className="text-neutral-400 group-hover:text-crimson-600 transition-colors transform group-hover:translate-x-1" />
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-serif leading-relaxed line-clamp-2">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                                    <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>{featuredPost.readingTime} min read</span>
                                </div>
                            </Link>
                            <div className="flex justify-center">
                                <Link href="/blog" className="text-sm font-medium text-crimson-600 hover:text-crimson-700 dark:text-crimson-400 hover:underline font-sans flex items-center gap-1">
                                    Read more posts <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Contact CTA */}
                    <div className="pt-4 flex justify-center">
                        <Link
                            href="/contact"
                            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-300"
                        >
                            <span className="font-sans font-medium text-neutral-900 dark:text-white">Get in touch</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}