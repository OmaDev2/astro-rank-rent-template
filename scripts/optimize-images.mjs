import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const TARGET_DIRS = [
    'public/images/services',
    'public/images/locations',
    'public/images/blog',
    'public/images/projects',
    'public/images/testimonials',
    'public/images/uploads'
];

const MAX_WIDTH = 1200;
const QUALITY = 85;

async function optimizeImages() {
    console.log('🚀 INICIANDO OPTIMIZACIÓN DE IMÁGENES A WEBP...');

    for (const dir of TARGET_DIRS) {
        const fullPath = path.resolve(process.cwd(), dir);
        try {
            const stats = await fs.stat(fullPath).catch(() => null);
            if (!stats) continue;

            const files = await fs.readdir(fullPath);
            const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

            if (imageFiles.length === 0) continue;

            console.log(`\n📂 Procesando: ${dir}`);

            for (const file of imageFiles) {
                const filePath = path.join(fullPath, file);
                const webpPath = path.join(fullPath, `${path.parse(file).name}.webp`);

                try {
                    await sharp(filePath)
                        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                        .webp({ quality: QUALITY })
                        .toFile(webpPath);
                    
                    console.log(`  ✅ ${file} -> ${path.parse(file).name}.webp`);
                } catch (err) {
                    console.error(`  ❌ Error con ${file}:`, err.message);
                }
            }
        } catch (error) {
            console.error(`❌ Error en directorio ${dir}:`, error.message);
        }
    }

    console.log('\n✨ OPTIMIZACIÓN COMPLETADA.');
}

optimizeImages();
