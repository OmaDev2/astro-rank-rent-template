#!/usr/bin/env node
/**
 * init-niche — Inicializa un nuevo nicho en el template rank & rent.
 * Rellena business/global.yaml y crea los primeros archivos de servicio y zona.
 *
 * Uso: npm run init-niche
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Helpers ────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // quitar tildes
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ask(rl, question, fallback = '') {
  return new Promise(resolve => {
    const hint = fallback ? ` (enter = ${fallback})` : '';
    rl.question(`  ${question}${hint}: `, answer => {
      resolve(answer.trim() || fallback);
    });
  });
}

function writeIfAbsent(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`  ⚠  Ya existe, no se sobreescribe: ${path.relative(ROOT, filePath)}`);
    return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

// ── Templates ──────────────────────────────────────────────────────────────

function globalYaml({ siteName, niche, city, phone, whatsapp, email, siteUrl, slogan }) {
  return `_spintax: ''
siteName: '${siteName}'
niche: '${niche}'
businessType: LocalBusiness
siteUrl: '${siteUrl}'
ctaText: Pedir Presupuesto
phone: '${phone}'
whatsapp: '${whatsapp}'
email: '${email}'
city: '${city}'
coordinates:
  lat: ''
  lng: ''
schedule: ''
nif: ''
ownerName: ''
seo: '{"title":"","description":""}'
slogan: '${slogan}'
foundingDate: ''
areaServed: []
serviceRadius: 0
priceRange: €€
paymentAccepted:
  - Cash
  - Credit Card
servicePriority: []
locationPriority: []
ctaTagline: Presupuesto gratuito · Sin compromiso
openingHours:
  - dayOfWeek:
      - Monday
      - Tuesday
      - Wednesday
      - Thursday
      - Friday
    opens: '09:00'
    closes: '18:00'
`;
}

function serviceMdx({ title, shortDesc }) {
  return `---
title: '${title}'
icon: Wrench
shortDesc: '${shortDesc}'
featured: true
blocks: []
---
`;
}

function locationMdx({ name }) {
  return `---
name: '${name}'
type: residencial
zipCodes: []
blocks: []
---
`;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  init-niche — Rank & Rent Template');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const siteName  = await ask(rl, 'Nombre del negocio');
  const niche     = await ask(rl, 'Servicio principal (ej: fontanería, pintura)');
  const city      = await ask(rl, 'Ciudad principal');
  const phone     = await ask(rl, 'Teléfono');
  const whatsapp  = await ask(rl, 'WhatsApp', phone);
  const email     = await ask(rl, 'Email');
  const siteUrl   = await ask(rl, 'URL del sitio (opcional)');
  const slogan    = await ask(rl, 'Slogan corto (opcional)');

  rl.close();

  const citySlug    = toSlug(city);
  const nicheSlug   = toSlug(niche);
  const serviceSlug = `${nicheSlug}-${citySlug}`;

  console.log('\n');

  // 1. global.yaml
  const globalPath = path.join(ROOT, 'src/content/business/global.yaml');
  fs.writeFileSync(globalPath, globalYaml({ siteName, niche, city, phone, whatsapp, email, siteUrl, slogan }), 'utf-8');
  console.log('  ✓  src/content/business/global.yaml actualizado');

  // 2. Servicio starter
  const serviceTitle = `${niche.charAt(0).toUpperCase() + niche.slice(1)} en ${city}`;
  const serviceDesc  = `Especialistas en ${niche} en ${city}. Presupuesto gratuito y garantía incluida.`;
  const servicePath  = path.join(ROOT, `src/content/services/${serviceSlug}.mdx`);
  const created = writeIfAbsent(servicePath, serviceMdx({ title: serviceTitle, shortDesc: serviceDesc }));
  if (created) console.log(`  ✓  src/content/services/${serviceSlug}.mdx creado`);

  // 3. Location starter
  const locationPath = path.join(ROOT, `src/content/locations/${citySlug}.mdx`);
  const locCreated = writeIfAbsent(locationPath, locationMdx({ name: city }));
  if (locCreated) console.log(`  ✓  src/content/locations/${citySlug}.mdx creado`);

  console.log('\n  Listo. Arranca el servidor y abre Keystatic para completar el contenido.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
