import fs from 'fs';
import path from 'path';
import probe from 'probe-image-size';
import sharp from 'sharp';

async function convertHeicToJpeg(filePath) {
    const outputPath = filePath.replace(/\.HEIC$/i, '.jpg');
    
    // Only attempt conversion in development
    if (process.env.NODE_ENV === 'development') {
        if (!fs.existsSync(outputPath)) {
            try {
                await sharp(filePath)
                    .jpeg({ quality: 90 })
                    .toFile(outputPath);
            } catch (error) {
                console.warn(`Warning: Could not convert HEIC file: ${filePath}`, error);
                return null;
            }
        }
        return outputPath;
    }
    
    // In production, check if a JPG version exists
    if (fs.existsSync(outputPath)) {
        return outputPath;
    }
    
    return null;
}

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
    
    // Filter for image files
    const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    // Get image dimensions and create photo objects
    const photos = await Promise.all(imageFiles.map(async (file) => {
        const filePath = path.join(photosDir, file);
        const stats = fs.statSync(filePath);
        
        // Handle HEIC files
        let processedPath = filePath;
        if (/\.HEIC$/i.test(file)) {
            const jpegPath = await convertHeicToJpeg(filePath);
            if (!jpegPath) {
                // Skip this photo if we can't process it
                return null;
            }
            processedPath = jpegPath;
        }
        
        try {
            // Get image dimensions
            const dimensions = await probe(fs.createReadStream(processedPath));
            
            // Parse title and date from filename
            const { title, date } = parsePhotoInfo(file);

            // Use the JPEG path for HEIC images
            const publicPath = processedPath
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