import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { ShareButton } from '../components/ShareButton';
import { ReadingProgress } from '../components/ReadingProgress';
import Image from 'next/image';
import { SidenotesProvider } from '@/components/Sidenotes';
import { Sidenote } from '@/components/Sidenote';
import { SectionObserver } from '@/components/SectionObserver';
import { HeadingWithAnchor } from '@/components/HeadingWithAnchor';
import { TableOfContents } from '@/components/TableOfContents';
import { MarginNote } from '@/components/MarginNote';
import { MarginNotesProvider } from '@/components/MarginNotes';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

// Function to convert heading text to URL-friendly slug
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Custom components for MDX
const components = {
    // Override default elements with custom styling
    h1: ({ children, ...props }) => {
        const id = slugify(children?.toString() || '');
        return (
            <HeadingWithAnchor
                as="h1"
                id={id}
                className="text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif"
                {...props}
            >
                {children}
            </HeadingWithAnchor>
        );
    },
    h2: ({ children, ...props }) => {
        const id = slugify(children?.toString() || '');
        return (
            <HeadingWithAnchor
                as="h2"
                id={id}
                className="text-2xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white font-serif"
                {...props}
            >
                {children}
            </HeadingWithAnchor>
        );
    },
    h3: ({ children, ...props }) => {
        const id = slugify(children?.toString() || '');
        return (
            <HeadingWithAnchor
                as="h3"
                id={id}
                className="text-xl font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif"
                {...props}
            >
                {children}
            </HeadingWithAnchor>
        );
    },
    h4: ({ children, ...props }) => {
        const id = slugify(children?.toString() || '');
        return (
            <HeadingWithAnchor
                as="h4"
                id={id}
                className="text-lg font-bold mt-6 mb-3 text-neutral-900 dark:text-white font-serif"
                {...props}
            >
                {children}
            </HeadingWithAnchor>
        );
    },
    p: (props) => <p {...props} className="mb-4 text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif" />,
    ul: (props) => <ul {...props} className="mb-4 list-disc list-inside space-y-2 text-neutral-700 dark:text-neutral-300 font-serif" />,
    ol: (props) => <ol {...props} className="mb-4 list-decimal list-inside space-y-2 text-neutral-700 dark:text-neutral-300 font-serif" />,
    li: (props) => <li {...props} className="text-neutral-700 dark:text-neutral-300 font-serif" />,
    blockquote: (props) => (
        <blockquote {...props} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 my-4 italic text-neutral-600 dark:text-neutral-400 font-serif" />
    ),
    a: (props) => (
        <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />
    ),
    code: (props) => {
        if (typeof props.children === 'string') {
            return <code {...props} className="bg-neutral-100 dark:bg-neutral-800 rounded px-1 py-0.5 text-sm font-mono" />;
        }
        return <code {...props} />;
    },
    pre: (props) => (
        <pre {...props} className="bg-neutral-900 rounded-lg p-4 mb-4 overflow-x-auto" />
    ),
    img: (props) => (
        <div className="relative aspect-[16/9] my-8">
            <Image
                {...props}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 800px"
            />
        </div>
    ),
    Sidenote,
    MarginNote,
};

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    return (
        <MarginNotesProvider>
            <SidenotesProvider>
                <article className="w-full max-w-[800px] mx-auto px-4 py-8">
                    <ReadingProgress />
                    <SectionObserver />
                    <TableOfContents />
                    
                    {/* Header */}
                    <header className="mb-8">
                        <h1 id="title" className="text-4xl font-bold text-neutral-900 dark:text-white mb-4 font-serif">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-sans">
                            <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                            <div className="flex items-center gap-4">
                                <span>{post.readingTime} min read</span>
                                <ShareButton post={post} />
                            </div>
                        </div>
                    </header>

                    {/* Cover Image */}
                    {post.image && (
                        <div className="relative aspect-[2/1] mb-8">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover rounded-xl"
                                priority
                                sizes="(max-width: 768px) 100vw, 800px"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {post.content}
                    </div>

                    {/* Tags */}
                    {post.tags && (
                        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full text-sm bg-neutral-100 dark:bg-neutral-800 
                                                 text-neutral-600 dark:text-neutral-400 font-sans"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </SidenotesProvider>
        </MarginNotesProvider>
    );
} 