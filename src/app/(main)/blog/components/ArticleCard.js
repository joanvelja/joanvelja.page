import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from './ArticlePreview';
import { format } from 'date-fns';

export function ArticleCard({ post }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800
                      transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="relative aspect-[1.85/1] w-full overflow-hidden">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                />
            </div>
            
            <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 
                                     text-neutral-600 dark:text-neutral-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-1 line-clamp-2">
                    {post.title}
                </h2>

                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {post.description}
                </p>
                <br></br>

                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                </p>
                {/* Add time to read  (very small text) bottom right corner of the card */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {post.readingTime} min read
                </p>
                
            </div>

            {/* Preview on hover */}
            <ArticlePreview post={post} />
        </Link>
    );
} 