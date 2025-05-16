import { getAllPosts } from '@/lib/mdx';
import { ReadingProgress } from './components/ReadingProgress';
import { ClientContent } from './components/ClientContent';

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
    const posts = await getAllPosts();
    
    // Get unique tags from all posts
    const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

    return (
        <div className="w-full max-w-[800px] mx-auto px-4 py-8 animate-fade-in">
            <ReadingProgress />
            <ClientContent initialPosts={posts} allTags={allTags} />
        </div>
    );
} 