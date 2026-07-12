#!/usr/bin/env node
/**
 * indexnow — Notifica a Bing/Yandex/Seznam (y buscadores de IA que consumen IndexNow)
 * las URLs del sitio para indexación casi instantánea. Ejecutar DESPUÉS de desplegar.
 *
 * Configuración (una vez por clon):
 *   1. Genera una clave (32+ hex): p.ej. `openssl rand -hex 16`
 *   2. Ponla en .env:  INDEXNOW_KEY=xxxxxxxx
 *   3. `npm run build` (incluye el key file public/<key>.txt en el deploy)
 *   4. Tras desplegar:  npm run indexnow
 *
 * Sin INDEXNOW_KEY el script no hace nada (no rompe el build).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) {
    console.log('ℹ️  IndexNow desactivado (falta INDEXNOW_KEY en .env). Salto sin error.');
    console.log('   Genera una clave con `openssl rand -hex 16` y añádela a .env para activarlo.');
    process.exit(0);
}

// siteUrl desde business/global.yaml
const bizPath = path.join(ROOT, 'src/content/business/global.yaml');
const biz = parse(fs.readFileSync(bizPath, 'utf-8')) || {};
const siteUrl = (biz.siteUrl || '').replace(/\/$/, '');
if (!siteUrl || /localhost/.test(siteUrl)) {
    console.error('✗ siteUrl no válida en business/global.yaml — no se puede notificar IndexNow.');
    process.exit(1);
}
const host = new URL(siteUrl).host;

// Asegurar el key file en public/ (se sirve para verificación de propiedad)
const keyFile = path.join(ROOT, 'public', `${KEY}.txt`);
if (!fs.existsSync(keyFile)) {
    fs.writeFileSync(keyFile, KEY, 'utf-8');
    console.log(`✓ Creado public/${KEY}.txt — vuelve a desplegar antes de reejecutar para que IndexNow lo verifique.`);
}

// URLs desde el sitemap generado
const sitemapPath = path.join(ROOT, 'dist', 'sitemap-0.xml');
if (!fs.existsSync(sitemapPath)) {
    console.error('✗ No existe dist/sitemap-0.xml — ejecuta `npm run build` primero.');
    process.exit(1);
}
const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
    console.error('✗ El sitemap no contiene URLs.');
    process.exit(1);
}

const payload = {
    host,
    key: KEY,
    keyLocation: `${siteUrl}/${KEY}.txt`,
    urlList,
};

console.log(`→ Notificando ${urlList.length} URLs a IndexNow (host: ${host})…`);
const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
});

if (res.ok || res.status === 202) {
    console.log(`\x1b[32m✔ IndexNow aceptó ${urlList.length} URLs (HTTP ${res.status}).\x1b[0m`);
} else {
    console.error(`✗ IndexNow respondió HTTP ${res.status}. ${await res.text()}`);
    process.exit(1);
}
