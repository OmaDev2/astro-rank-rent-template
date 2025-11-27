import fs from 'fs';
import path from 'path';

const contentDirs = [
    'src/content/locations',
    'src/content/services',
    'src/content/projects'
];

contentDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath);
    files.forEach(file => {
        if (!file.endsWith('.mdx')) return;

        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const slug = path.basename(file, '.mdx');

        if (content.includes('slug:')) {
            console.log(`Skipping ${file}, slug already exists.`);
            return;
        }

        const newContent = content.replace(/^---/, `---\nslug: ${slug}`);
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${file} with slug: ${slug}`);
    });
});
