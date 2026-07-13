#!/usr/bin/env node
/**
 * design-dna — "ADN de diseño" para que cada clon nazca visualmente distinto.
 *
 * Problema que resuelve: el template tiene 21 temas × 9 fuentes × 6 heros ×
 * separadores/texturas… pero todos los clones nacen con el default (mismo hero,
 * mismo tema) y las webs de la red acaban pareciéndose demasiado.
 *
 * Este módulo define RECETAS curadas (combinaciones coherentes de tema + fuentes +
 * hero + efectos) y las escribe en src/content/design/global.yaml.
 *
 * Uso standalone:
 *   node scripts/utils/design-dna.mjs            # propone una al azar (interactivo)
 *   node scripts/utils/design-dna.mjs --list     # lista las recetas
 *   node scripts/utils/design-dna.mjs --apply forja_oscura   # aplica una concreta
 *
 * También lo usa `npm run init-niche` como paso final del asistente.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

// ── Recetas curadas ──────────────────────────────────────────────────────────
// Cada receta es una combinación probada de valores VÁLIDOS de design/global.yaml.
// theme → clave de src/config/themes.ts | fontPair → clave de src/config/fonts.ts

export const RECIPES = [
    {
        key: 'taller_clasico', nombre: 'Taller clásico (cálido, artesano)',
        theme: 'classic_workshop', fontPair: 'artisan_warm', heroStyle: 'image',
        navbarStyle: 'solid', headingStyle: 'underline', sectionSpacing: 'normal',
        borderRadius: 'rounded', buttonStyle: 'solid', shadowStyle: 'elevated',
        sectionDivider: 'none', bgTexture: 'none', animationStyle: 'subtle', heroOverlayOpacity: 0.65,
    },
    {
        key: 'industrial_fuerte', nombre: 'Industrial fuerte (naranja/gris, robusto)',
        theme: 'industrial', fontPair: 'robust', heroStyle: 'split_photo',
        navbarStyle: 'solid', headingStyle: 'uppercase', sectionSpacing: 'compact',
        borderRadius: 'sharp', buttonStyle: 'solid', shadowStyle: 'flat',
        sectionDivider: 'diagonal', bgTexture: 'grid', animationStyle: 'subtle', heroOverlayOpacity: 0.7,
    },
    {
        key: 'forja_oscura', nombre: 'Forja oscura (metal, dramático)',
        theme: 'forge_dark', fontPair: 'forge', heroStyle: 'image',
        navbarStyle: 'glass', headingStyle: 'uppercase', sectionSpacing: 'normal',
        borderRadius: 'subtle', buttonStyle: 'gradient', shadowStyle: 'elevated',
        sectionDivider: 'arrow', bgTexture: 'noise', animationStyle: 'full', heroOverlayOpacity: 0.75,
    },
    {
        key: 'corporativo_azul', nombre: 'Corporativo azul (serio, confiable)',
        theme: 'corporate', fontPair: 'modern', heroStyle: 'split_form',
        navbarStyle: 'glass', headingStyle: 'normal', sectionSpacing: 'normal',
        borderRadius: 'rounded', buttonStyle: 'solid', shadowStyle: 'subtle',
        sectionDivider: 'none', bgTexture: 'none', animationStyle: 'subtle', heroOverlayOpacity: 0.8,
    },
    {
        key: 'cercano_claro', nombre: 'Cercano claro (fondo blanco, amable)',
        theme: 'clean_light', fontPair: 'friendly', heroStyle: 'split_form_clean',
        navbarStyle: 'minimal', headingStyle: 'normal', sectionSpacing: 'spacious',
        borderRadius: 'smooth', buttonStyle: 'solid', shadowStyle: 'subtle',
        sectionDivider: 'wave', bgTexture: 'dots', animationStyle: 'subtle', heroOverlayOpacity: 0.5,
    },
    {
        key: 'tierra_calida', nombre: 'Tierra cálida (terracota, mediterráneo)',
        theme: 'sand_terra', fontPair: 'artisan_natural', heroStyle: 'split_photo',
        navbarStyle: 'solid', headingStyle: 'normal', sectionSpacing: 'spacious',
        borderRadius: 'smooth', buttonStyle: 'outline', shadowStyle: 'subtle',
        sectionDivider: 'curve', bgTexture: 'none', animationStyle: 'subtle', heroOverlayOpacity: 0.55,
    },
    {
        key: 'naturaleza', nombre: 'Naturaleza (verde/piedra, sereno)',
        theme: 'forest_stone', fontPair: 'artisan_classic', heroStyle: 'image',
        navbarStyle: 'glass', headingStyle: 'normal', sectionSpacing: 'normal',
        borderRadius: 'rounded', buttonStyle: 'solid', shadowStyle: 'elevated',
        sectionDivider: 'wave', bgTexture: 'none', animationStyle: 'subtle', heroOverlayOpacity: 0.6,
    },
    {
        key: 'tech_limpio', nombre: 'Tech limpio (moderno, nítido)',
        theme: 'tech', fontPair: 'tech', heroStyle: 'centered',
        navbarStyle: 'glass', headingStyle: 'uppercase', sectionSpacing: 'normal',
        borderRadius: 'subtle', buttonStyle: 'gradient', shadowStyle: 'floating',
        sectionDivider: 'zigzag', bgTexture: 'grid', animationStyle: 'full', heroOverlayOpacity: 0.7,
    },
    {
        key: 'premium_sobrio', nombre: 'Premium sobrio (navy/dorado, elegante)',
        theme: 'navy_gold_light', fontPair: 'elegant', heroStyle: 'split_form',
        navbarStyle: 'solid', headingStyle: 'normal', sectionSpacing: 'spacious',
        borderRadius: 'subtle', buttonStyle: 'outline', shadowStyle: 'elevated',
        sectionDivider: 'none', bgTexture: 'none', animationStyle: 'subtle', heroOverlayOpacity: 0.7,
    },
    {
        key: 'urgencias', nombre: 'Urgencias (rojo, acción inmediata)',
        theme: 'urgent', fontPair: 'robust', heroStyle: 'split_form',
        navbarStyle: 'solid', headingStyle: 'uppercase', sectionSpacing: 'compact',
        borderRadius: 'rounded', buttonStyle: 'solid', shadowStyle: 'elevated',
        sectionDivider: 'diagonal', bgTexture: 'none', animationStyle: 'full', heroOverlayOpacity: 0.75,
    },
];

// ── Colores del tema (desde src/config/themes.ts, sin importar TS) ──────────

function rgbToHex(rgb) {
    const parts = String(rgb).trim().split(/\s+/).map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return rgb; // ya es hex u otro formato
    return '#' + parts.map((n) => n.toString(16).padStart(2, '0')).join('');
}

export function loadThemeColors(themeKey, root = ROOT) {
    const src = fs.readFileSync(path.join(root, 'src/config/themes.ts'), 'utf-8');
    const blockRe = new RegExp(`\\b${themeKey}:\\s*\\{([\\s\\S]*?)\\n\\s{4}\\}`);
    const block = src.match(blockRe);
    if (!block) throw new Error(`Tema "${themeKey}" no encontrado en src/config/themes.ts`);
    const colors = {};
    for (const m of block[1].matchAll(/(\w+):\s*'([\d\s]+)'/g)) {
        if (m[1] === 'heroOverlay') continue;
        colors[m[1]] = rgbToHex(m[2]);
    }
    if (!colors.primary) throw new Error(`El tema "${themeKey}" no tiene colores parseables`);
    return colors;
}

// ── Aplicar receta a design/global.yaml ─────────────────────────────────────

export function applyDna(recipe, root = ROOT) {
    const designPath = path.join(root, 'src/content/design/global.yaml');
    const current = fs.existsSync(designPath)
        ? parse(fs.readFileSync(designPath, 'utf-8')) || {}
        : {};

    const colors = loadThemeColors(recipe.theme, root);

    const next = {
        identity: {
            ...(current.identity || {}),
            themeSettings: JSON.stringify({ theme: recipe.theme, colors }),
            fontPair: recipe.fontPair,
        },
        layout: {
            ...(current.layout || {}),
            navbarStyle: recipe.navbarStyle,
            footerStyle: current.layout?.footerStyle || 'full',
            heroStyle: recipe.heroStyle,
            headingStyle: recipe.headingStyle,
            sectionSpacing: recipe.sectionSpacing,
        },
        effects: {
            ...(current.effects || {}),
            borderRadius: recipe.borderRadius,
            buttonStyle: recipe.buttonStyle,
            shadowStyle: recipe.shadowStyle,
            heroOverlayOpacity: recipe.heroOverlayOpacity,
            animationStyle: recipe.animationStyle,
            sectionDivider: recipe.sectionDivider,
            bgTexture: recipe.bgTexture,
        },
        contact: current.contact || {
            stickyPhoneMobile: true, stickyPhoneDesktop: false,
            whatsappMobile: true, whatsappDesktop: true,
        },
        advanced: current.advanced || {},
    };

    fs.writeFileSync(designPath, stringify(next), 'utf-8');
    return designPath;
}

export function describeDna(r) {
    return [
        `  🎨 ${r.nombre}`,
        `     tema: ${r.theme} · fuentes: ${r.fontPair} · hero: ${r.heroStyle}`,
        `     menú: ${r.navbarStyle} · títulos: ${r.headingStyle} · esquinas: ${r.borderRadius}`,
        `     botones: ${r.buttonStyle} · separadores: ${r.sectionDivider} · textura: ${r.bgTexture}`,
    ].join('\n');
}

export function randomRecipe(excludeKeys = []) {
    const pool = RECIPES.filter((r) => !excludeKeys.includes(r.key));
    const list = pool.length ? pool : RECIPES;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Paso interactivo reutilizable (lo usa init-niche): propone recetas hasta que
 * el usuario acepte (Enter), pida otra (r) o salte (s). Devuelve la receta
 * aplicada o null si se saltó.
 */
export async function proposeDnaInteractive(rl, root = ROOT) {
    const seen = [];
    let recipe = randomRecipe(seen);
    for (;;) {
        console.log('\n  Propuesta de diseño para este clon:\n');
        console.log(describeDna(recipe));
        const answer = await new Promise((res) =>
            rl.question('\n  ¿Aplicar? (Enter = sí · r = otra propuesta · s = saltar): ', (a) => res(a.trim().toLowerCase()))
        );
        if (answer === 's') return null;
        if (answer === 'r') {
            seen.push(recipe.key);
            if (seen.length >= RECIPES.length) seen.length = 0;
            recipe = randomRecipe(seen);
            continue;
        }
        applyDna(recipe, root);
        console.log(`\n  ✓  Diseño "${recipe.nombre}" aplicado a src/content/design/global.yaml`);
        return recipe;
    }
}

// ── CLI standalone ───────────────────────────────────────────────────────────

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
    const args = process.argv.slice(2);
    if (args.includes('--list')) {
        console.log('\nRecetas de diseño disponibles:\n');
        for (const r of RECIPES) console.log(describeDna(r) + `\n     → node scripts/utils/design-dna.mjs --apply ${r.key}\n`);
        process.exit(0);
    }
    const applyIdx = args.indexOf('--apply');
    if (applyIdx !== -1) {
        const key = args[applyIdx + 1];
        const recipe = RECIPES.find((r) => r.key === key);
        if (!recipe) { console.error(`✗ Receta "${key}" no existe. Usa --list para verlas.`); process.exit(1); }
        applyDna(recipe);
        console.log(`✓ Diseño "${recipe.nombre}" aplicado.`);
        process.exit(0);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    proposeDnaInteractive(rl).then(() => rl.close());
}
