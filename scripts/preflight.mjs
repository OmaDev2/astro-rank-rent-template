#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────
 * PREFLIGHT CHECK — npm run check:site
 * Valida la configuración esencial antes de hacer build/deploy.
 * ─────────────────────────────────────────────────────────────
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yaml';

const ROOT = resolve(process.cwd());
const red   = (t) => `\x1b[31m✗ ${t}\x1b[0m`;
const green = (t) => `\x1b[32m✓ ${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m⚠ ${t}\x1b[0m`;

const errors = [];
const warnings = [];

function check(condition, msg, level = 'error') {
    if (!condition) {
        if (level === 'warn') warnings.push(msg);
        else errors.push(msg);
    }
}

// ── 1. Leer business/global.yaml ─────────────────────────────
const businessPath = resolve(ROOT, 'src/content/business/global.yaml');
let biz = {};
if (existsSync(businessPath)) {
    try { biz = parse(readFileSync(businessPath, 'utf-8')) || {}; }
    catch (e) { errors.push(`No se pudo parsear business/global.yaml: ${e.message}`); }
} else {
    errors.push('Falta src/content/business/global.yaml');
}

// ── 2. Campos obligatorios ───────────────────────────────────
check(biz.siteUrl && biz.siteUrl !== 'https://localhost:4321',
    'siteUrl no configurada o es localhost');
check(biz.siteUrl && !biz.siteUrl.endsWith('/'),
    'siteUrl no debe terminar en / (causa canonicals duplicados)', 'warn');
check(biz.phone && !/^600\s?000/.test(biz.phone),
    'Teléfono no configurado o es placeholder (600 000 000)');
check(biz.whatsapp && biz.whatsapp !== '34600000000',
    'WhatsApp no configurado o es placeholder');
check(biz.city && biz.city.trim() !== 'Tu Ciudad',
    'Ciudad no configurada');
check(biz.email && biz.email !== 'contacto@ejemplo.com',
    'Email no configurado o es placeholder');
check(biz.siteName && biz.siteName.trim() !== 'Mi Negocio Local',
    'siteName no configurado');

// SEO title/description
try {
    const seo = biz.seo ? JSON.parse(biz.seo) : {};
    check(seo.title && seo.title.length > 10,
        'SEO title falta o es demasiado corto');
    check(seo.description && seo.description.length > 30,
        'SEO description falta o es demasiado corta');
    check(!seo.description || seo.description.length <= 160,
        'SEO description supera 160 caracteres', 'warn');
} catch { errors.push('Campo seo no es JSON válido'); }

// Coordenadas reales
check(biz.coordinates?.lat && biz.coordinates.lat !== '40.4168',
    'Coordenadas por defecto (Madrid) — actualiza lat/lng para tu ciudad', 'warn');

// Slogan placeholder
check(!biz.slogan || !/fontaner|ejemplo|placeholder/i.test(biz.slogan),
    'Slogan contiene texto placeholder o de otro nicho', 'warn');

// Address placeholder
check(!biz.address || !/Calle Mayor 10, Madrid/i.test(biz.address),
    'Dirección es placeholder (Calle Mayor 10, Madrid)', 'warn');

// ── 3. Leer design/global.yaml ───────────────────────────────
const designPath = resolve(ROOT, 'src/content/design/global.yaml');
if (!existsSync(designPath)) {
    warnings.push('Falta src/content/design/global.yaml (usará defaults)');
}

// ── 4. Verificar .env (PUBLIC_SITE_ENV) ──────────────────────
const envPath = resolve(ROOT, '.env');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    check(envContent.includes('PUBLIC_SITE_ENV'),
        'Variable PUBLIC_SITE_ENV no definida en .env (necesaria para noindex en staging)', 'warn');
}

// ── 5. Buscar placeholders comunes en contenido ──────────────
const contentDirs = [
    'src/content/services',
    'src/content/locations',
];

const placeholderPatterns = [
    /XXX/g,
    /\[PENDIENTE/gi,
    /Lorem ipsum/gi,
    /fontaner[oí]a/gi, // Restos del template original
    /Carabanchel|Vallecas|Leganés|Getafe/gi, // Barrios de Madrid
];

for (const dir of contentDirs) {
    const dirPath = resolve(ROOT, dir);
    if (!existsSync(dirPath)) continue;
    
    const { readdirSync } = await import('fs');
    const files = readdirSync(dirPath).filter(f => f.endsWith('.mdx') || f.endsWith('.yaml'));
    
    for (const file of files) {
        const content = readFileSync(resolve(dirPath, file), 'utf-8');
        for (const pattern of placeholderPatterns) {
            const match = content.match(pattern);
            if (match) {
                warnings.push(`${dir}/${file} — contiene posible placeholder: "${match[0]}"`);
                break; // Solo un warning por archivo
            }
        }
    }
}

// ── 6. Verificar favicon ─────────────────────────────────────
const defaultFavicon = resolve(ROOT, 'public/favicon.svg');
check(existsSync(defaultFavicon) || biz.favicon,
    'No hay favicon (ni public/favicon.svg ni configurado en design)', 'warn');

// ── RESULTADO ────────────────────────────────────────────────
console.log('\n🔍 PREFLIGHT CHECK — Validación pre-build\n');
console.log('─'.repeat(50));

if (warnings.length) {
    console.log(`\n${yellow(`${warnings.length} advertencia(s):`)}`);
    warnings.forEach(w => console.log(`  ${yellow(w)}`));
}

if (errors.length) {
    console.log(`\n${red(`${errors.length} error(es) crítico(s):`)}`);
    errors.forEach(e => console.log(`  ${red(e)}`));
    console.log(`\n${red('BUILD BLOQUEADO — Corrige los errores antes de desplegar.')}\n`);
    process.exit(1);
} else {
    console.log(`\n${green('Todo OK — Listo para build/deploy.')}\n`);
}
