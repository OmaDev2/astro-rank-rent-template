import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

/**
 * Calculates a simple hash for cache keys.
 */
export function calculateHash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Standard delay function.
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Escapes strings for YAML double-quoted values.
 */
export const escapeYaml = (str) => str ? `"${str.replace(/"/g, '\\"')}"` : '""';

/**
 * Indents strings for multi-line YAML values.
 */
export const indentYaml = (str, spaces = 4) => str ? str.replace(/\n/g, '\n' + ' '.repeat(spaces)) : '';

/**
 * Generic prompt loader.
 */
export async function loadPrompt(promptName, variables) {
    try {
        const promptPath = path.join(process.cwd(), 'src/prompts', `${promptName}.prompt.md`);
        let content = await fs.readFile(promptPath, 'utf-8');

        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            let valStr = value;
            if (Array.isArray(value)) valStr = value.join(', ');
            if (typeof value === 'object' && value !== null) valStr = JSON.stringify(value);

            content = content.replace(regex, valStr || '');
        }
        return content;
    } catch (error) {
        console.error(`❌ Error cargando prompt ${promptName}:`, error.message);
        return null;
    }
}

/**
 * Ensures content directories exist.
 */
export async function ensureDirs(dirs) {
    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }
}
