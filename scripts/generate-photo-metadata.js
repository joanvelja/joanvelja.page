const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const probe = require('probe-image-size');

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'images', 'photos');
const GENERATED_DIR = path.join(PHOTOS_DIR, 'generated');
const PUBLIC_GENERATED_DIR = '/images/photos/generated';
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'photo-manifest.json');
const IMAGE_PATTERN = /\.(jpg|jpeg|png|webp)$/i;
const HEIC_PATTERN = /\.heic$/i;
const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
const VARIANTS = {
    grid: { width: 900, quality: 78 },
    full: { width: 1920, quality: 82 },
};

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

    let parsedDate = null;
    if (date) {
        const m = date.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/);
        if (m) {
            parsedDate = new Date(Date.UTC(parseInt(m[2]), MONTHS[m[1]], 1, 12, 0, 0));
        } else {
            parsedDate = new Date(date);
        }
    }

    return {
        title: title
            .split(/[-_\s]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        date: parsedDate
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

async function generateBlurDataURL(filePath, sharp) {
    if (!sharp) return null;

    const buffer = await sharp(filePath)
        .rotate()
        .resize({ width: 12, withoutEnlargement: true })
        .jpeg({ quality: 35, mozjpeg: true })
        .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function ensureVariant(filePath, id, variant, options, sharp) {
    if (!sharp) return null;

    await fsp.mkdir(GENERATED_DIR, { recursive: true });

    const filename = `${id}-${variant}.webp`;
    const outputPath = path.join(GENERATED_DIR, filename);
    const sourceStat = await fsp.stat(filePath);
    const outputStat = await fsp.stat(outputPath).catch(() => null);

    if (!outputStat || outputStat.mtimeMs < sourceStat.mtimeMs) {
        await sharp(filePath)
            .rotate()
            .resize({ width: options.width, withoutEnlargement: true })
            .webp({ quality: options.quality })
            .toFile(outputPath);
    }

    return `${PUBLIC_GENERATED_DIR}/${filename}`;
}

async function generateVariants(filePath, id, sharp) {
    if (!sharp) return null;

    const entries = await Promise.all(
        Object.entries(VARIANTS).map(async ([variant, options]) => [
            `${variant}Src`,
            await ensureVariant(filePath, id, variant, options, sharp),
        ])
    );

    return Object.fromEntries(entries);
}

async function processImage(file, sharp, exifr) {
    const filePath = path.join(PHOTOS_DIR, file);

    const [dimensions, exifData] = await Promise.all([
        probe(fs.createReadStream(filePath)),
        exifr.parse(filePath, {
            pick: ['Orientation', 'Make', 'Model', 'LensModel', 'ISO', 'FNumber', 'ExposureTime']
        }).catch(() => null),
    ]);

    // EXIF orientation: values 5-8 indicate 90°/270° rotation → swap width/height
    const orient = exifData?.Orientation;
    const needsSwap = typeof orient === 'number' ? orient >= 5 && orient <= 8
        : typeof orient === 'string' && (orient.includes('90') || orient.includes('270'));
    const width = needsSwap ? dimensions.height : dimensions.width;
    const height = needsSwap ? dimensions.width : dimensions.height;

    let blurDataURL = null;
    let variants = null;
    const { title, date } = parsePhotoInfo(file);
    const id = slugify(file);

    try {
        blurDataURL = await generateBlurDataURL(filePath, sharp);
        variants = await generateVariants(filePath, id, sharp);
    } catch (err) {
        console.warn(`  Warning: derivative generation failed for ${file}: ${err.message}`);
    }

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
        gridSrc: variants?.gridSrc || publicPath,
        fullSrc: variants?.fullSrc || publicPath,
        blurDataURL,
        title,
        date: date ? date.toISOString() : null,
        width,
        height,
        aspectRatio: `${width}/${height}`,
        exif
    };
}

async function convertHeicFiles() {
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    const files = await fsp.readdir(PHOTOS_DIR);
    const heicFiles = files.filter(file => HEIC_PATTERN.test(file));

    if (heicFiles.length === 0) return;

    console.log(`Converting ${heicFiles.length} HEIC files via sips...`);

    await Promise.all(heicFiles.map(async (heicFile) => {
        const baseName = path.basename(heicFile, path.extname(heicFile));
        const heicPath = path.join(PHOTOS_DIR, heicFile);
        const jpgPath = path.join(PHOTOS_DIR, `${baseName}.jpg`);

        try {
            const [heicStat, jpgStat] = await Promise.all([
                fsp.stat(heicPath),
                fsp.stat(jpgPath).catch(() => null),
            ]);
            if (jpgStat && jpgStat.mtimeMs >= heicStat.mtimeMs) {
                return;
            }

            await execFileAsync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '92', heicPath, '--out', jpgPath]);
            console.log(`  ${heicFile} → ${baseName}.jpg`);
        } catch (err) {
            console.error(`  Error converting ${heicFile}: ${err.message}`);
        }
    }));

    console.log('');
}

async function main() {
    const sharp = await loadSharp();
    if (!sharp) {
        console.warn('Warning: sharp not available. Thumbhash generation will be skipped.');
        console.warn('Install sharp as a devDependency for blur placeholders: bun add -d sharp');
    }

    await convertHeicFiles();

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
