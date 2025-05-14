import fs from 'fs';
import path from 'path';
import probe from 'probe-image-size';

// Parse title and date from filename
// Format: "Title, Date.ext" or "Title.ext"
function parsePhotoInfo(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const parts = nameWithoutExt.split(',').map(part => part.trim());
    
    let title = parts[0];
    let date = parts[1] || null;

    // If no explicit date in filename, try to parse date-like patterns
    if (!date && title.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/)) {
        const match = title.match(/^(.+?)(?:\s*,\s*(.*))$/);
        if (match) {
            title = match[1];
            date = match[2];
        }
    }

    return {
        title: title
            .split(/[-_\s]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        date: date ? new Date(date) : null
    };
}

export async function getPhotos() {
    const photosDir = path.join(process.cwd(), 'public', 'images', 'photos');
    const files = fs.readdirSync(photosDir);
    
    // Filter for image files - adjust to exclude .HEIC or ensure .jpg twin exists
    const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file) // Only process web-friendly formats directly
    );

    // Get image dimensions and create photo objects
    const photos = await Promise.all(imageFiles.map(async (file) => {
        const filePath = path.join(photosDir, file);
        const stats = fs.statSync(filePath);
        
        try {
            // Get image dimensions using the original filePath
            const dimensions = await probe(fs.createReadStream(filePath));
            
            // Parse title and date from filename
            const { title, date } = parsePhotoInfo(file);

            // Use the original filePath for publicPath
            const publicPath = filePath
                .replace(process.cwd(), '')
                .replace('/public', '')
                .replace(/\\/g, '/');

            return {
                src: publicPath,
                alt: title,
                title: title,
                date: date || stats.mtime,
                aspectRatio: `${dimensions.width}/${dimensions.height}`,
                dimensions: {
                    width: dimensions.width,
                    height: dimensions.height
                }
            };
        } catch (error) {
            console.warn(`Warning: Could not process image: ${file}`, error);
            return null;
        }
    }));

    // Filter out null entries and sort by date
    return photos
        .filter(photo => photo !== null)
        .sort((a, b) => b.date - a.date);
} 