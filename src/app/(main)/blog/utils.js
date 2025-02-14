export function estimateReadingTime(content) {
    const WORDS_PER_MINUTE = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
    return Math.max(1, readingTime); // Minimum 1 minute read
} 