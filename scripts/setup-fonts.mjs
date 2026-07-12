#!/usr/bin/env node
/**
 * setup-fonts — Self-hostea el par de fuentes elegido (GDPR + mejora LCP).
 *
 * Lee el par activo de src/content/design/global.yaml (campo fontPair),
 * extrae los paquetes @fontsource de src/config/fonts.ts, los instala,
 * genera src/styles/fonts-local.css con los @import correctos y activa
 * selfHostFonts en design/global.yaml para dejar de cargar Google Fonts.
 *
 * Uso:
 *   npm run setup-fonts            # instala y activa
 *   npm run setup-fonts -- --dry   # muestra qué haría, sin instalar ni escribir
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry');

const DESIGN = path.join(ROOT, 'src/content/design/global.yaml');
const FONTS_TS = path.join(ROOT, 'src/config/fonts.ts');
const LOCAL_CSS = path.join(ROOT, 'src/styles/fonts-local.css');

function fail(msg) { console.error(`\x1b[31m✗ ${msg}\x1b[0m`); process.exit(1); }
function ok(msg) { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }

// 1. Par de fuentes elegido
if (!fs.existsSync(DESIGN)) fail(`No existe ${DESIGN}`);
const designRaw = fs.readFileSync(DESIGN, 'utf-8');
const pairMatch = designRaw.match(/fontPair:\s*([\w-]+)/);
const pair = pairMatch ? pairMatch[1] : 'modern';
ok(`Par de fuentes activo: ${pair}`);

// 2. Extraer paquetes e imports de fonts.ts para ese par
const fontsRaw = fs.readFileSync(FONTS_TS, 'utf-8');
const blockRe = new RegExp(`\\b${pair}:\\s*\\{([\\s\\S]*?)\\n\\s{4}\\},`);
const block = fontsRaw.match(blockRe);
if (!block) fail(`No encontré el par "${pair}" en src/config/fonts.ts`);

const pkgMatch = block[1].match(/fontsource:\s*\[([\s\S]*?)\]/);
const impMatch = block[1].match(/fontsourceImports:\s*\[([\s\S]*?)\]/);
if (!pkgMatch || !impMatch) fail(`El par "${pair}" no define fontsource / fontsourceImports`);

const parseArr = (s) => [...s.matchAll(/'([^']+)'/g)].map(m => m[1]);
const packages = parseArr(pkgMatch[1]);
const imports = parseArr(impMatch[1]);
ok(`Paquetes: ${packages.join(', ')}`);
ok(`Imports:  ${imports.length} archivos css`);

// 3. Generar fonts-local.css
const css = `/**
 * FUENTES SELF-HOSTED — generado por \`npm run setup-fonts\` (par: ${pair}).
 * No editar a mano: se regenera al cambiar de par y re-ejecutar el script.
 */
${imports.map(i => `@import "${i}";`).join('\n')}
`;

// 4. Activar selfHostFonts en design/global.yaml
let newDesign = designRaw;
if (/selfHostFonts:\s*\w+/.test(newDesign)) {
    newDesign = newDesign.replace(/selfHostFonts:\s*\w+/, 'selfHostFonts: true');
} else {
    // insertar junto a fontPair, respetando su indentación
    newDesign = newDesign.replace(
        /(^(\s*)fontPair:\s*[\w-]+\s*$)/m,
        `$1\n$2selfHostFonts: true`
    );
}

if (DRY) {
    console.log('\n--- [DRY RUN] fonts-local.css ---\n' + css);
    console.log('--- [DRY RUN] instalaría ---\n  npm install ' + packages.join(' ') + '\n');
    console.log('--- [DRY RUN] selfHostFonts: true en design/global.yaml ---\n');
    process.exit(0);
}

// 5. Instalar paquetes
console.log(`\nInstalando ${packages.length} paquetes @fontsource…`);
execSync(`npm install ${packages.join(' ')}`, { cwd: ROOT, stdio: 'inherit' });

fs.writeFileSync(LOCAL_CSS, css, 'utf-8');
ok(`Escrito src/styles/fonts-local.css`);
fs.writeFileSync(DESIGN, newDesign, 'utf-8');
ok(`Activado selfHostFonts: true en design/global.yaml`);

console.log(`\n\x1b[32m✔ Fuentes self-hosteadas.\x1b[0m Google Fonts ya no se carga. Revisa con \`npm run build\`.`);
