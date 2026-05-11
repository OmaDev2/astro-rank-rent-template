import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIRS = [
    'src/content/posts',
    'src/content/services',
    'src/content/locations',
    'src/content/testimonials',
    'src/content/faq',
    'src/content/business',
    'src/content/design',
];

const IGNORE_FILES = ['.gitkeep'];

function cleanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        if (IGNORE_FILES.includes(file)) continue;

        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            cleanDir(fullPath);
            // Delete directory if empty after cleaning
            if (fs.readdirSync(fullPath).length === 0) {
                fs.rmdirSync(fullPath);
                console.log(`Deleted empty directory: ${fullPath}`);
            }
        } else {
            fs.unlinkSync(fullPath);
            console.log(`Deleted file: ${fullPath}`);
        }
    }
}

console.log('🧹 Cleaning content directories...');

CONTENT_DIRS.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    console.log(`Checking ${dir}...`);
    cleanDir(fullPath);
});

console.log('✨ Content cleaned!');
