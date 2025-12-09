import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { ShareButton } from '../components/ShareButton';
import { ReadingProgress } from '../components/ReadingProgress';
import { SidenotesProvider } from '@/components/Sidenotes';
import { SectionObserver } from '@/components/SectionObserver';
import { TableOfContents } from '@/components/TableOfContents';
import { MarginNotesProvider } from '@/components/MarginNotes';
import { CitationProvider, Bibliography } from '@/components/Citation';
import { ProtectedContent } from '../components/ProtectedContent';
import { Lock } from 'lucide-react';
import { DarkModeImageWrapper } from '@/components/DarkModeImageWrapper';
import 'katex/dist/katex.min.css';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joanvelja.page';
    const postUrl = `${baseUrl}/blog/${slug}`;

    let imageUrl = null;
    if (post.image) {
        imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`;
    }

    return {
        title: post.title,
        description: post.excerpt || post.description || "Read more about this topic on Joan's blog.",
        openGraph: {
            title: post.title,
            description: post.excerpt || post.description || "Read more about this topic on Joan's blog.",
            url: postUrl,
            siteName: 'Joan Velja',
            type: 'article',
            publishedTime: post.date,
            authors: ['Joan Velja'],
            tags: post.tags,
            ...(imageUrl && {
                images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.description || "Read more about this topic on Joan's blog.",
            creator: '@joanvelja',
            site: '@joanvelja',
            ...(imageUrl && { images: [imageUrl] }),
        },
        alternates: { canonical: postUrl },
        other: {
            'article:author': 'Joan Velja',
            'article:published_time': post.date,
            ...(post.tags && { 'article:tag': post.tags.join(', ') }),
        },
    };
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
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

                        <header className="mb-8">
                            <h1 id="title" className="text-4xl font-bold text-neutral-900 dark:text-white mb-4 font-serif">
                                {post.title}
                            </h1>
                            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-sans">
                                <time dateTime={post.date}>
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </time>
                                <div className="flex items-center gap-4">
                                    {!post.isProtected && <span>{post.readingTime} min read</span>}
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

                        {post.isProtected ? (
                            <ProtectedContent post={post} />
                        ) : (
                            <div className="prose prose-neutral dark:prose-invert max-w-none blog-content">
                                {post.content}
                            </div>
                        )}

                        <Bibliography />

                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
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