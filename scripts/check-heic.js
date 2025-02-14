const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const heicConvert = require('heic-convert');

async function getStagedFiles() {
    try {
        // Get staged files
        const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
        return output.split('\n').filter(Boolean);
    } catch (error) {
        console.error('Error getting staged files:', error);
        return [];
    }
}

async function convertHeicToJpeg(filePath) {
    const outputPath = filePath.replace(/\.HEIC$/i, '.jpg');
    
    try {
        // Check if JPG already exists
        try {
            await fs.access(outputPath);
            return true;
        } catch {
            // File doesn't exist, proceed with conversion
        }

        // Read HEIC file
        const inputBuffer = await fs.readFile(filePath);
        
        // Convert to JPEG
        const jpegBuffer = await heicConvert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.9
        });

        // Write the output file
        await fs.writeFile(outputPath, jpegBuffer);
        
        // Stage the converted file
        execSync(`git add "${outputPath}"`, { encoding: 'utf-8' });
        
        return true;
    } catch (error) {
        console.error(`Error converting ${filePath}:`, error);
        return false;
    }
}

async function main() {
    const stagedFiles = await getStagedFiles();
    const heicFiles = stagedFiles.filter(file => 
        file.startsWith('public/images/photos/') && /\.HEIC$/i.test(file)
    );

    if (heicFiles.length === 0) {
        console.log('No HEIC files found in staged changes.');
        process.exit(0);
    }

    console.log(`Found ${heicFiles.length} HEIC files in staged changes...`);
    let success = true;

    for (const file of heicFiles) {
        const fullPath = path.join(process.cwd(), file);
        console.log(`Converting ${file} to JPG...`);
        
        if (await convertHeicToJpeg(fullPath)) {
            console.log(`✓ Successfully converted ${file}`);
        } else {
            console.error(`✗ Failed to convert ${file}`);
            success = false;
        }
    }

    if (!success) {
        console.error('Some HEIC conversions failed. Please check the errors above.');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
}); 