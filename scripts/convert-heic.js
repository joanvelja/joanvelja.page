const fs = require('fs').promises;
const path = require('path');
const heicConvert = require('heic-convert');

async function convertHeicFiles() {
    const photosDir = path.join(process.cwd(), 'public', 'images', 'photos');
    const files = await fs.readdir(photosDir);
    
    const heicFiles = files.filter(file => /\.HEIC$/i.test(file));
    
    console.log(`Found ${heicFiles.length} HEIC files to convert...`);
    
    for (const file of heicFiles) {
        const inputPath = path.join(photosDir, file);
        const outputPath = inputPath.replace(/\.HEIC$/i, '.jpg');
        
        try {
            // Check if JPG already exists
            try {
                await fs.access(outputPath);
                console.log(`Skipping ${file} - JPG version already exists`);
                continue;
            } catch {
                // File doesn't exist, proceed with conversion
            }

            console.log(`Converting ${file} to JPG...`);
            
            // Read HEIC file
            const inputBuffer = await fs.readFile(inputPath);
            
            // Convert to JPEG
            const jpegBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 0.9
            });

            // Write the output file
            await fs.writeFile(outputPath, jpegBuffer);
            
            console.log(`✓ Successfully converted ${file}`);
        } catch (error) {
            console.error(`✗ Failed to convert ${file}:`, error);
        }
    }
}

convertHeicFiles().catch(console.error); 