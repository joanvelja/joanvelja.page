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
import { CitationProvider, Citation, Bibliography, Cite } from '@/components/Citation';
import { ProtectedContent } from '../components/ProtectedContent';
import { Lock } from 'lucide-react';
import { DarkModeImageWrapper } from '@/components/DarkModeImageWrapper';
import { ImageThemeAdjuster } from '@/components/ImageThemeAdjuster';
import 'katex/dist/katex.min.css';

// Function to convert heading text to URL-friendly slug
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Generate metadata for social sharing
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joanvelja.page';
    const postUrl = `${baseUrl}/blog/${slug}`;

    // Handle the image URL - ensure it's absolute
    let imageUrl = null;
    if (post.image) {
        imageUrl = post.image.startsWith('http')
            ? post.image
            : `${baseUrl}${post.image}`;
    }

    return {
        title: post.title,
        description: post.excerpt || post.description || 'Read more about this topic on Joan\'s blog.',

        // Open Graph tags for general social sharing
        openGraph: {
            title: post.title,
            description: post.excerpt || post.description || 'Read more about this topic on Joan\'s blog.',
            url: postUrl,
            siteName: 'Joan Velja',
            type: 'article',
            publishedTime: post.date,
            authors: ['Joan Velja'],
            tags: post.tags,
            ...(imageUrl && {
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    }
                ]
            })
        },

        // Twitter Card tags for X/Twitter sharing
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.description || 'Read more about this topic on Joan\'s blog.',
            creator: '@joanvelja',
            site: '@joanvelja',
            ...(imageUrl && {
                images: [imageUrl]
            })
        },

        // Additional meta tags
        alternates: {
            canonical: postUrl,
        },

        // Article-specific metadata
        other: {
            'article:author': 'Joan Velja',
            'article:published_time': post.date,
            ...(post.tags && { 'article:tag': post.tags.join(', ') }),
        }
    };
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
    p: (props) => <p {...props} className="mb-6 text-neutral-700 dark:text-neutral-300 leading-[1.8] tracking-[0.01em] text-[1.05rem] font-serif" />,
    ul: (props) => <ul {...props} className="mb-6 list-disc ml-4 space-y-2 text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
    ol: (props) => <ol {...props} className="mb-6 list-decimal ml-4 space-y-2 text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
    li: (props) => <li {...props} className="text-neutral-700 dark:text-neutral-300 leading-[1.8] text-[1.05rem] font-serif" />,
    blockquote: (props) => (
        <blockquote {...props} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 my-6 italic text-neutral-600 dark:text-neutral-400 leading-[1.8] text-[1.05rem] font-serif" />
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
    img: (props) => {
        // Don't render if src is missing, empty string, or an empty object
        if (!props.src || props.src === '' || (typeof props.src === 'object' && Object.keys(props.src).length === 0)) {
            return null;
        }

        // Use our dark mode image wrapper component for better dark mode support
        return (
            <div className="my-4">
                <DarkModeImageWrapper
                    src={props.src}
                    alt={props.alt || "Image"}
                    className="w-full"
                    rounded="rounded-lg"
                />
                {props.alt && props.alt !== "Image" && (
                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-1 italic font-serif">
                        {props.alt}
                    </p>
                )}
            </div>
        );
    },
    // Add our ImageThemeAdjuster component to be directly usable in MDX
    ImageThemeAdjuster,
    DarkModeImageWrapper,
    Sidenote,
    MarginNote,
    // Citation components
    Citation,
    Cite,
    Bibliography,
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
        <CitationProvider>
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
                                    {!post.isProtected && (
                                        <span>{post.readingTime} min read</span>
                                    )}
                                    {post.isProtected && (
                                        <span className="flex items-center text-amber-600 dark:text-amber-500">
                                            <Lock className="w-4 h-4 mr-1" />
                                            Protected
                                        </span>
                                    )}
                                    <ShareButton post={post} />
                                </div>
                            </div>
                        </header>

                        {/* Cover Image */}
                        {post.image && (
                            <div className="relative mb-8">
                                <DarkModeImageWrapper
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full aspect-[2/1] object-cover"
                                    rounded="rounded-xl"
                                    isCoverImage={true}
                                />
                            </div>
                        )}

                        {/* Content */}
                        {post.isProtected ? (
                            <ProtectedContent post={post} />
                        ) : (
                            <div className="prose prose-neutral dark:prose-invert max-w-none blog-content">
                                {post.content}
                            </div>
                        )}

                        {/* Bibliography */}
                        <Bibliography />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
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
        </CitationProvider>
    );
} 