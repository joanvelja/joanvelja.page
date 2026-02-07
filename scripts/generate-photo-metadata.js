const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const probe = require('probe-image-size');

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'images', 'photos');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'photo-manifest.json');
const IMAGE_PATTERN = /\.(jpg|jpeg|png|webp)$/i;

function parsePhotoInfo(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    const parts = nameWithoutExt.split(',').map(part => part.trim());

    let title = parts[0];
    let date = parts[1] || null;

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

function slugify(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    return nameWithoutExt
        .toLowerCase()
        .replace(/[\s,]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function formatShutterSpeed(exposureTime) {
    if (!exposureTime) return null;
    if (exposureTime >= 1) return `${exposureTime}s`;
    return `1/${Math.round(1 / exposureTime)}`;
}

async function loadSharp() {
    try {
        return require('sharp');
    } catch {
        return null;
    }
}

async function generateThumbhash(filePath, sharp) {
    if (!sharp) return null;

    const { rgbaToThumbHash } = await import('thumbhash');
    const { data, info } = await sharp(filePath)
        .resize(100, 100, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const hash = rgbaToThumbHash(info.width, info.height, data);
    return Buffer.from(hash).toString('base64');
}

async function processImage(file, sharp, exifr) {
    const filePath = path.join(PHOTOS_DIR, file);

    const dimensions = await probe(fs.createReadStream(filePath));

    const exifData = await exifr.parse(filePath, {
        pick: ['Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime']
    }).catch(() => null);

    let thumbhash = null;
    try {
        thumbhash = await generateThumbhash(filePath, sharp);
    } catch (err) {
        console.warn(`  Warning: thumbhash generation failed for ${file}: ${err.message}`);
    }

    const { title, date } = parsePhotoInfo(file);
    const id = slugify(file);

    const publicPath = `/images/photos/${file}`;

    const exif = exifData ? {
        camera: [exifData.Make, exifData.Model].filter(Boolean).join(' ') || null,
        lens: exifData.LensModel || null,
        iso: exifData.ISO || null,
        aperture: exifData.FNumber ? `f/${parseFloat(exifData.FNumber.toFixed(2))}` : null,
        shutterSpeed: formatShutterSpeed(exifData.ExposureTime)
    } : null;

    return {
        id,
        src: publicPath,
        thumbhash,
        title,
        date: date ? date.toISOString() : null,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio: `${dimensions.width}/${dimensions.height}`,
        exif
    };
}

async function main() {
    const sharp = await loadSharp();
    if (!sharp) {
        console.warn('Warning: sharp not available. Thumbhash generation will be skipped.');
        console.warn('Install sharp as a devDependency for blur placeholders: bun add -d sharp');
    }

    const exifrModule = await import('exifr');
    const exifr = exifrModule.default || exifrModule;
    const files = await fsp.readdir(PHOTOS_DIR);
    const imageFiles = files.filter(file => IMAGE_PATTERN.test(file));

    console.log(`Processing ${imageFiles.length} images...`);

    const results = [];
    for (const file of imageFiles) {
        try {
            const entry = await processImage(file, sharp, exifr);
            results.push(entry);
            console.log(`  ${file}`);
        } catch (err) {
            console.error(`  Error processing ${file}: ${err.message}`);
        }
    }

    results.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

    await fsp.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fsp.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2) + '\n');

    console.log(`\nWrote ${results.length} entries to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
