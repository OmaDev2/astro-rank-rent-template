#!/usr/bin/env node
/**
 * init-niche — Inicializa un nuevo nicho en el template rank & rent.
 * Rellena business/global.yaml, reemplaza placeholders en las páginas
 * principales y crea los primeros archivos de servicio y zona con
 * bloques reales listos para ver.
 *
 * Uso: npm run init-niche
 */

import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { proposeDnaInteractive } from './utils/design-dna.mjs';

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

// Escape for single-quoted YAML scalar
function ys(str) {
  return String(str ?? '').replace(/'/g, "''");
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

function replacePlaceholders(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠  No encontrado, saltando: ${path.relative(ROOT, filePath)}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [from, to] of Object.entries(replacements)) {
    content = content.replaceAll(from, to);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ── Templates ──────────────────────────────────────────────────────────────

function globalYaml({ siteName, niche, city, phone, whatsapp, email, siteUrl, slogan }) {
  const nicheTitle = niche.charAt(0).toUpperCase() + niche.slice(1);
  const seoTitle   = `${nicheTitle} en ${city} | ${siteName}`;
  const seoDesc    = `Especialistas en ${niche} en ${city}. Presupuesto gratuito, garantía incluida y precio cerrado sin sorpresas.`;
  const seoJson    = JSON.stringify({ title: seoTitle, description: seoDesc });

  return `_spintax: ''
siteName: '${ys(siteName)}'
niche: '${ys(niche)}'
businessType: LocalBusiness
siteUrl: '${ys(siteUrl)}'
ctaText: Pedir Presupuesto
phone: '${ys(phone)}'
whatsapp: '${ys(whatsapp)}'
email: '${ys(email)}'
city: '${ys(city)}'
coordinates:
  lat: ''
  lng: ''
schedule: ''
nif: ''
ownerName: ''
seo: '${ys(seoJson)}'
slogan: '${ys(slogan)}'
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

function serviceMdx({ title, shortDesc, niche, city, siteName }) {
  const nicheTitle = niche.charAt(0).toUpperCase() + niche.slice(1);
  const seoTitle   = `${nicheTitle} en ${city} | ${siteName}`;
  const seoDesc    = `Especialistas en ${niche} en ${city}. Presupuesto gratuito, garantía incluida y precio cerrado sin sorpresas.`;
  const seoJson    = JSON.stringify({ title: seoTitle, description: seoDesc });

  return `---
title: '${ys(title)}'
icon: Wrench
shortDesc: '${ys(shortDesc)}'
featured: true
seo: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: '${ys(nicheTitle)} en'
      headingHighlight: '${ys(city)}'
      subheading: 'Especialistas en ${ys(niche)} en ${ys(city)}. Presupuesto gratuito y garantía incluida.'
      ctaPrimaryText: Pedir Presupuesto
      ctaPrimaryLink: '#contacto'
      ctaSecondaryText: WhatsApp
      ctaSecondaryLink: ''
      titleTag: h1
      features:
        - Presupuesto gratuito
        - Garantía incluida
        - Precio cerrado

  - discriminant: features
    value:
      title: 'Por qué elegirnos para ${ys(niche)} en ${ys(city)}'
      titleTag: h2
      variant: grid
      features:
        - title: Presupuesto cerrado
          description: Te damos un precio exacto antes de empezar. Sin sorpresas ni costes ocultos.
          icon: ShieldCheck
        - title: Equipo propio
          description: El mismo equipo desde la primera visita hasta el trabajo final. Sin subcontratas.
          icon: Users
        - title: Garantía incluida
          description: Todos nuestros trabajos incluyen garantía por escrito.
          icon: BadgeCheck

  - discriminant: faq
    value:
      title: 'Preguntas frecuentes sobre ${ys(niche)} en ${ys(city)}'
      variant: accordion
      faqs:
        - question: '¿Cuánto cuesta ${ys(niche)} en ${ys(city)}?'
          answer: >-
            El precio depende del tipo de trabajo y las dimensiones. Hacemos
            visita gratuita y te damos presupuesto cerrado sin compromiso.
        - question: '¿Dais garantía?'
          answer: >-
            Sí. Todos nuestros trabajos incluyen garantía por escrito. Si algo
            no está bien, volvemos a arreglarlo sin coste adicional.
        - question: '¿Trabajáis en ${ys(city)} y alrededores?'
          answer: >-
            Sí, cubrimos ${ys(city)} y municipios de la zona. Consúltanos
            tu ubicación y te confirmamos cobertura sin compromiso.

  - discriminant: cta
    value:
      title: '¿Necesitas ${ys(niche)} en ${ys(city)}?'
      subtitle: 'Llámanos o escríbenos. Venimos a medir y te damos presupuesto cerrado sin compromiso.'
      titleTag: h2
      buttonText: Presupuesto gratuito · Sin compromiso
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida
---
`;
}

function locationMdx({ name, niche, siteName }) {
  const nicheTitle = niche.charAt(0).toUpperCase() + niche.slice(1);
  const seoTitle   = `${nicheTitle} en ${name} | ${siteName}`;
  const seoDesc    = `Servicio de ${niche} en ${name}. Desplazamiento incluido, presupuesto gratuito.`;
  const seoJson    = JSON.stringify({ title: seoTitle, description: seoDesc });

  return `---
name: '${ys(name)}'
type: residencial
zipCodes: []
seo: '${ys(seoJson)}'
faq:
  - question: '¿Hacéis ${ys(niche)} en ${ys(name)}?'
    answer: >-
      Sí, cubrimos ${ys(name)} y zona. Nos desplazamos para medir y
      presupuestar sin compromiso.
blocks:
  - discriminant: hero
    value:
      heading: '${ys(nicheTitle)} en'
      headingHighlight: '${ys(name)}'
      subheading: 'Servicio de ${ys(niche)} en ${ys(name)}. Presupuesto gratuito y desplazamiento incluido.'
      ctaPrimaryText: Pedir Presupuesto
      ctaPrimaryLink: '#contacto'
      titleTag: h1
      features:
        - Desplazamiento incluido
        - Presupuesto gratuito
        - Mismo equipo

  - discriminant: faq
    value:
      title: 'Preguntas frecuentes sobre ${ys(niche)} en ${ys(name)}'
      variant: accordion
      faqs:
        - question: '¿Trabajáis en ${ys(name)}?'
          answer: >-
            Sí, cubrimos ${ys(name)} y municipios de la zona. Nos
            desplazamos para medir y presupuestar sin coste adicional.
        - question: '¿Cuánto cuesta ${ys(niche)} en ${ys(name)}?'
          answer: >-
            Depende del trabajo. Hacemos visita gratuita y damos presupuesto
            cerrado sin compromiso.

  - discriminant: cta
    value:
      title: '¿Necesitas ${ys(niche)} en ${ys(name)}?'
      subtitle: 'Contáctanos. Nos desplazamos, miramos el trabajo y te damos precio cerrado.'
      titleTag: h2
      buttonText: Solicitar presupuesto
      buttonLink: /contacto/
      style: gradient
      features:
        - Desplazamiento incluido
        - Presupuesto gratuito
        - Sin compromiso
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

  // ADN de diseño: cada clon nace con una combinación visual distinta
  // (tema + fuentes + hero + efectos) para que las webs de la red no se parezcan.
  const dna = await proposeDnaInteractive(rl, ROOT);

  rl.close();

  const citySlug    = toSlug(city);
  const nicheSlug   = toSlug(niche);
  const serviceSlug = `${nicheSlug}-${citySlug}`;

  console.log('\n');

  // 1. global.yaml
  const globalPath = path.join(ROOT, 'src/content/business/global.yaml');
  fs.writeFileSync(globalPath, globalYaml({ siteName, niche, city, phone, whatsapp, email, siteUrl, slogan }), 'utf-8');
  console.log('  ✓  src/content/business/global.yaml actualizado');

  // 2. Reemplazar placeholders en páginas principales
  const placeholders = {
    'SERVICIO':       niche,
    'CIUDAD':         city,
    'NOMBRE_EMPRESA': siteName,
  };

  const pages = [
    path.join(ROOT, 'src/content/pages/home.mdx'),
    path.join(ROOT, 'src/content/pages/servicios.mdx'),
    path.join(ROOT, 'src/content/pages/zonas.mdx'),
  ];

  for (const page of pages) {
    replacePlaceholders(page, placeholders);
    console.log(`  ✓  ${path.relative(ROOT, page)} — placeholders reemplazados`);
  }

  // 3. Servicio starter
  const serviceTitle = `${niche.charAt(0).toUpperCase() + niche.slice(1)} en ${city}`;
  const serviceDesc  = `Especialistas en ${niche} en ${city}. Presupuesto gratuito y garantía incluida.`;
  const servicePath  = path.join(ROOT, `src/content/services/${serviceSlug}.mdx`);
  const created = writeIfAbsent(servicePath, serviceMdx({ title: serviceTitle, shortDesc: serviceDesc, niche, city, siteName }));
  if (created) console.log(`  ✓  src/content/services/${serviceSlug}.mdx creado`);

  // 4. Location starter
  const locationPath = path.join(ROOT, `src/content/locations/${citySlug}.mdx`);
  const locCreated = writeIfAbsent(locationPath, locationMdx({ name: city, niche, siteName }));
  if (locCreated) console.log(`  ✓  src/content/locations/${citySlug}.mdx creado`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅  Proyecto inicializado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  if (dna) console.log(`  🎨 Diseño aplicado: ${dna.nombre}\n`);
  console.log('  Próximos pasos:');
  console.log(`  1. Añadir coordenadas en business/global.yaml (lat/lng de ${city})`);
  console.log('  2. Subir logo a public/ y referenciarlo en design/global.yaml');
  if (!dna) console.log('  2b. Elegir diseño: node scripts/utils/design-dna.mjs (o desde Keystatic → Diseño)');
  console.log('  3. Subir imagen hero a src/assets/ y configurarla');
  console.log(`  4. npm run seo-wizard contexto → plan → home para generar el contenido con IA`);
  console.log('  5. npm run dev → abrir Keystatic para revisar el contenido');
  console.log('');
  console.log(`  npm run check:site   → verificar configuración antes del deploy`);
  console.log('');
}

main().catch(err => { console.error(err); process.exit(1); });
