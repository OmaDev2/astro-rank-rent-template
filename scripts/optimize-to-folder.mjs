import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = 'incoming-images';
const OUTPUT_DIR = 'optimized-images';

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

async function getFiles(dir) {
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      })
    );

    return files.flat();
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

function cleanName(file) {
  const ext = path.extname(file);
  const base = path.basename(file, ext);

  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function optimizeToFolder() {
  console.log(`🚀 Optimizing images from ${INPUT_DIR} to ${OUTPUT_DIR}...`);

  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const allFiles = await getFiles(path.resolve(process.cwd(), INPUT_DIR));
  const imageFiles = allFiles.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log(`No images found in ${INPUT_DIR}.`);
    return;
  }

  for (const file of imageFiles) {
    const name = cleanName(file);

    const jpgOutput = path.join(OUTPUT_DIR, `${name}.jpg`);
    const webpOutput = path.join(OUTPUT_DIR, `${name}.webp`);

    const originalStat = await fs.promises.stat(file);

    await sharp(file)
      .rotate()
      .resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: JPEG_QUALITY,
        progressive: true,
        mozjpeg: true,
      })
      .toFile(jpgOutput);

    await sharp(file)
      .rotate()
      .resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
      })
      .webp({
        quality: WEBP_QUALITY,
      })
      .toFile(webpOutput);

    const jpgStat = await fs.promises.stat(jpgOutput);

    console.log(
      `✅ ${path.basename(file)} → ${name}.jpg | ${(originalStat.size / 1024).toFixed(0)} KB → ${(jpgStat.size / 1024).toFixed(0)} KB`
    );
  }

  console.log(`\n🎉 Done. Files saved in ${OUTPUT_DIR}/`);
}

optimizeToFolder();