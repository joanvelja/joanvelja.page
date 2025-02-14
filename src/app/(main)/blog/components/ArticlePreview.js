export function ArticlePreview({ post }) {
    return (
        <div className="absolute left-full ml-4 w-64 p-4 rounded-lg bg-white dark:bg-neutral-800 
                        shadow-lg border border-neutral-200 dark:border-neutral-700
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-10">
            <div className="space-y-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {post.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                    <span>{post.readingTime} min read</span>
                    {post.views && (
                        <>
                            <span>•</span>
                            <span>{post.views.toLocaleString()} views</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 