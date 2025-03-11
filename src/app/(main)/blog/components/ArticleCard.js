import Link from 'next/link';
import Image from 'next/image';
import { ArticlePreview } from './ArticlePreview';
import { format } from 'date-fns';

export function ArticleCard({ post }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group relative overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800/80
                      bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm
                      transform transition-all duration-300 
                      hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
        >
            <div className="relative aspect-[1.85/1] w-full overflow-hidden">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <span className="text-neutral-400 dark:text-neutral-600 font-serif italic">No image</span>
                    </div>
                )}
            </div>
            
            <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-neutral-100/70 dark:bg-neutral-800/70 
                                     text-neutral-600 dark:text-neutral-400 font-serif tracking-wide border border-neutral-200/60 dark:border-neutral-700/60"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                
                <h2 className="text-xl font-medium text-neutral-900 dark:text-white mb-2 line-clamp-2 font-serif tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                </h2>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed mb-4 line-clamp-2">
                    {post.description}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-500 font-serif tracking-wide border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-3">
                    <span className="uppercase">
                        {format(new Date(post.date), 'MMM d, yyyy')}
                    </span>
                    <span>
                        {post.readingTime} min read
                    </span>
                </div>
                
            </div>

            {/* Preview on hover */}
            <ArticlePreview post={post} />
        </Link>
    );
} 