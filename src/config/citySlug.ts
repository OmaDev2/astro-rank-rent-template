// Vite inlines this YAML as a string at build time — works in browser too
import yamlRaw from '../content/business/global.yaml?raw';

function extractCitySlug(): string {
    const match = yamlRaw.match(/^city:\s*['"]?([^'"#\n]+?)['"]?\s*$/m);
    if (!match) return 'ciudad';
    return match[1]
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita tildes: á→a, é→e…
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const citySlug = extractCitySlug();
