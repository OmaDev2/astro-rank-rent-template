import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Configuration
const TARGET_DIR = 'public/images';
const MAX_WIDTH = 1600; // Safe max width for web
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80; // Uses pngquant-like compression
const MIN_SIZE_TO_OPTIMIZE = 200 * 1024; // Optimize anything over 200KB

async function optimizeImages() {
    console.log(`🚀 Starting image optimization in ${TARGET_DIR}...`);

    async function getFiles(dir) {
        try {
            const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? getFiles(res) : res;
            }));
            return files.flat();
        } catch (e) {
            if (e.code === 'ENOENT') return [];
            throw e;
        }
    }

    const allFiles = await getFiles(path.resolve(process.cwd(), TARGET_DIR));
    const imageFiles = allFiles.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

    if (imageFiles.length === 0) {
        console.log("No images found to optimize.");
        return;
    }

    let totalSaved = 0;

    for (const file of imageFiles) {
        try {
            const stat = await fs.promises.stat(file);
            if (stat.size > MIN_SIZE_TO_OPTIMIZE) {
                const relPath = path.relative(process.cwd(), file);
                console.log(`📸 Processing: ${relPath} (${(stat.size / 1024).toFixed(0)} KB)`);

                const image = sharp(file);
                const metadata = await image.metadata();

                let didResize = false;
                if (metadata.width && metadata.width > MAX_WIDTH) {
                    console.log(`   Running resize: ${metadata.width}px -> ${MAX_WIDTH}px`);
                    image.resize(MAX_WIDTH);
                    didResize = true;
                }

                // Apply compression relative to format
                const buffer = await image
                    .png({
                        quality: PNG_QUALITY,
                        compressionLevel: 8,
                        palette: true // Attempt to use palette for 8-bit optimization (huge savings for simpler PNGs)
                    })
                    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
                    .webp({ quality: JPEG_QUALITY })
                    .toBuffer();

                // Only overwrite if we actually saved space (sometimes re-compressing small highly optimized files adds size)
                if (buffer.length < stat.size) {
                    await fs.promises.writeFile(file, buffer);
                    const saved = stat.size - buffer.length;
                    totalSaved += saved;
                    console.log(`   ✅ Optimized! Saved ${(saved / 1024).toFixed(0)} KB. New size: ${(buffer.length / 1024).toFixed(0)} KB`);
                } else {
                    console.log(`   ⏭️ Skipped (Optimization result was larger or same)`);
                }
            }
        } catch (err) {
            console.error(`   ❌ Error optimizing ${file}:`, err.message);
        }
    }

    console.log(`\n🎉 Optimization Complete! Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
