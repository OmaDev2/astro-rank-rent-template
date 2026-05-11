#!/usr/bin/env node
/**
 * content-wizard — Genera páginas de servicio y zona SEO-optimizadas.
 *
 * Uso interactivo:
 *   node scripts/content-wizard.mjs
 *
 * Uso con flags:
 *   node scripts/content-wizard.mjs --type service --keyword "fontanería urgente" --city "Sevilla"
 *   node scripts/content-wizard.mjs --type location --city "Triana" --niche "fontanería"
 *   node scripts/content-wizard.mjs --keyword "carpintería" --city "Madrid" --dry-run
 *
 * Requiere:
 *   - claude CLI instalado y con sesión activa (el que ya tienes)
 *   - DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD en .env (opcional)
 */

import { spawnSync } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      out[key] = (!next || next.startsWith('--')) ? true : argv[++i];
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

// Escape for single-quoted YAML scalar
function ys(str) {
  return String(str ?? '').replace(/'/g, "''");
}

// ── DataForSEO ────────────────────────────────────────────────────────────────

async function dfsPost(endpoint, body, login, password) {
  const auth = Buffer.from(`${login}:${password}`).toString('base64');
  const res = await fetch(`https://api.dataforseo.com${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DataForSEO HTTP ${res.status}`);
  return res.json();
}

async function fetchKeywordData(keyword, city, login, password) {
  process.stdout.write('  → DataForSEO: volumen');

  // 1. Search volume (Spain = 2724)
  const volRes = await dfsPost(
    '/v3/keywords_data/google_ads/search_volume/live',
    [{ keywords: [keyword], location_code: 2724, language_code: 'es' }],
    login, password
  );
  const vol = volRes?.tasks?.[0]?.result?.[0] ?? {};

  process.stdout.write(', keywords relacionadas');

  // 2. Related keywords
  const relRes = await dfsPost(
    '/v3/keywords_data/google_ads/keywords_for_keywords/live',
    [{ keywords: [keyword], location_code: 2724, language_code: 'es', limit: 12 }],
    login, password
  );
  const related = (relRes?.tasks?.[0]?.result ?? [])
    .filter(r => r.keyword !== keyword && (r.search_volume ?? 0) > 0)
    .slice(0, 8)
    .map(r => ({ keyword: r.keyword, volume: r.search_volume }));

  process.stdout.write(', SERP');

  // 3. SERP top + PAA
  const serpRes = await dfsPost(
    '/v3/serp/google/organic/live/advanced',
    [{
      keyword: `${keyword} ${city}`,
      location_code: 2724,
      language_code: 'es',
      device: 'desktop',
      depth: 10,
    }],
    login, password
  );
  const serpItems = serpRes?.tasks?.[0]?.result?.[0]?.items ?? [];
  const topResults = serpItems
    .filter(i => i.type === 'organic')
    .slice(0, 3)
    .map(i => ({ title: i.title, description: i.description?.slice(0, 160) }));
  const paaQuestions = serpItems
    .filter(i => i.type === 'people_also_ask')
    .slice(0, 6)
    .map(i => i.title || i.question)
    .filter(Boolean);

  console.log(' ✓');

  return {
    monthlySearches: vol.search_volume ?? null,
    competition: vol.competition_level ?? null,
    cpc: vol.cpc ?? null,
    related,
    topResults,
    paaQuestions,
  };
}

// ── Claude CLI ────────────────────────────────────────────────────────────────

function callClaude(prompt) {
  const result = spawnSync('claude', ['--print'], {
    input: prompt,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120_000,
  });
  if (result.error) throw new Error(`No se pudo ejecutar claude CLI: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`claude CLI error: ${result.stderr?.slice(0, 300)}`);
  return result.stdout ?? '';
}

async function generateContent({ keyword, city, niche, contentType, kw }) {
  const relatedStr = kw.related.length
    ? `Keywords relacionadas con volumen:\n${kw.related.map(r => `  - "${r.keyword}" (${r.volume}/mes)`).join('\n')}`
    : '';
  const paaStr = kw.paaQuestions.length
    ? `Preguntas "People Also Ask" en Google:\n${kw.paaQuestions.map(q => `  - ${q}`).join('\n')}`
    : '';
  const serpStr = kw.topResults.length
    ? `Top 3 competidores en SERP:\n${kw.topResults.map((r, i) => `  ${i + 1}. ${r.title} — ${r.description ?? ''}`).join('\n')}`
    : '';

  const isService = contentType === 'service';

  const prompt = `Eres un especialista en SEO local para negocios de servicios en España.
Genera el contenido para una página ${isService ? 'de servicio' : 'de zona geográfica'}.

DATOS:
- Keyword principal: "${keyword}" (${kw.monthlySearches ? kw.monthlySearches + ' búsquedas/mes en España' : 'volumen no disponible'})
- Ciudad/zona: ${city}
- Nicho: ${niche}
${relatedStr ? '\n' + relatedStr : ''}${paaStr ? '\n' + paaStr : ''}${serpStr ? '\n' + serpStr : ''}

REGLAS:
1. Escribe en español, tono profesional y cercano — NO corporativo
2. Integra la keyword y "${keyword} ${city}" de forma natural, sin saturar
3. Las respuestas del FAQ deben ser "answer-first" (respuesta directa en la primera frase)
4. Los textos deben ser específicos y verificables — NO frases vacías como "somos los mejores"
5. Adapta el contenido al contexto local (${city})

Devuelve SOLO un objeto JSON válido (sin markdown, sin explicaciones):

{
  "seoTitle": "string — máx 60 caracteres, incluye keyword + ciudad",
  "seoDescription": "string — máx 155 caracteres, incluye keyword, ciudad y llamada a la acción",
  "shortDesc": "string — máx 115 caracteres para tarjeta de servicio",
  "hero": {
    "heading": "string — keyword principal o variante de cola corta",
    "headingHighlight": "string — beneficio o ciudad destacada",
    "subheading": "string — 1-2 frases que refuercen el servicio en la ciudad",
    "features": ["beneficio concreto 1", "beneficio concreto 2", "beneficio concreto 3"],
    "ctaPrimaryText": "string — texto del botón principal"
  },
  "trustStrip": [
    { "icon": "NombreIconoLucide", "label": "texto corto" },
    { "icon": "NombreIconoLucide", "label": "texto corto" },
    { "icon": "NombreIconoLucide", "label": "texto corto" },
    { "icon": "NombreIconoLucide", "label": "texto corto" }
  ],
  "featuresSection": {
    "title": "string — incluye keyword",
    "items": [
      { "title": "string", "description": "string — 1-2 frases específicas", "icon": "NombreIconoLucide" },
      { "title": "string", "description": "string — 1-2 frases específicas", "icon": "NombreIconoLucide" },
      { "title": "string", "description": "string — 1-2 frases específicas", "icon": "NombreIconoLucide" }
    ]
  },
  "faq": [
    { "question": "pregunta exacta que haría el usuario", "answer": "respuesta directa y completa en 2-4 frases" },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "cta": {
    "title": "string — pregunta o llamada de acción con keyword",
    "subtitle": "string — refuerza la propuesta de valor",
    "buttonText": "string — texto del botón"
  }
}

Para trustStrip y featuresSection usa SOLO iconos Lucide válidos: ShieldCheck, Clock, Users, Gift, FileCheck, Star, MapPin, Wrench, CheckCircle, Phone, Zap, Award, Hammer, Paintbrush, Home, Building, Key, Truck, Drill, Scissors, Cpu, Leaf.
El FAQ debe tener exactamente 5 preguntas. Si hay preguntas PAA disponibles, úsalas como base.`;

  console.log('  → Claude: generando contenido...');
  const text = callClaude(prompt);

  const match = text.match(/\{[\s\S]+\}/);
  if (!match) throw new Error(`Claude no devolvió JSON válido.\nRespuesta: ${text.slice(0, 300)}`);

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    throw new Error(`JSON inválido de Claude: ${e.message}\nFragmento: ${match[0].slice(0, 300)}`);
  }
}

// ── MDX Builders ──────────────────────────────────────────────────────────────

function buildServiceMdx({ slug, content, keyword, city }) {
  const { seoTitle, seoDescription, shortDesc, hero, trustStrip, featuresSection, faq, cta } = content;

  const heroJson = JSON.stringify({
    heading: hero.heading,
    headingHighlight: hero.headingHighlight,
    subheading: hero.subheading,
    ctaPrimaryText: hero.ctaPrimaryText,
    ctaSecondaryText: 'WhatsApp',
    features: hero.features.join('\n'),
    bgColor: '#0a0a0a',
    titleTag: 'h1',
  });

  const featuresJson = JSON.stringify({
    title: featuresSection.title,
    features: featuresSection.items,
    titleTag: 'h2',
  });

  const ctaJson = JSON.stringify({
    title: cta.title,
    subtitle: cta.subtitle,
    buttonText: cta.buttonText,
    buttonLink: '/contacto/',
    features: 'Visita gratuita\nPresupuesto cerrado\nGarantía incluida',
    style: 'gradient',
    titleTag: 'h2',
  });

  const seoJson = JSON.stringify({ title: seoTitle, description: seoDescription });

  const trustItems = trustStrip
    .map(item => `        - icon: ${item.icon}\n          label: '${ys(item.label)}'\n          description: ''`)
    .join('\n');

  const faqItems = faq.map(f => {
    // Use block scalar for answer to avoid quote escaping headaches
    const answerLines = f.answer.split(/\n/).map(l => `            ${l}`).join('\n');
    return `        - question: '${ys(f.question)}'\n          answer: >-\n${answerLines}`;
  }).join('\n');

  return `---
title: '${ys(seoTitle)}'
icon: Wrench
shortDesc: '${ys(shortDesc)}'
featured: true
seo: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      content: >-
        ${heroJson}

  - discriminant: trust_strip
    value:
      title: ''
      subtitle: ''
      titleTag: h2
      variant: bar
      items:
${trustItems}

  - discriminant: features
    value:
      content: >-
        ${featuresJson}
      variant: grid

  - discriminant: faq
    value:
      title: 'Preguntas frecuentes sobre ${ys(keyword)} en ${ys(city)}'
      variant: accordion
      faqs:
${faqItems}

  - discriminant: cta
    value:
      content: >-
        ${ctaJson}
---
`;
}

function buildLocationMdx({ content, city }) {
  const { seoTitle, seoDescription, faq } = content;
  const seoJson = JSON.stringify({ title: seoTitle, description: seoDescription });

  const faqItems = faq.map(f => {
    const answerLines = f.answer.split(/\n/).map(l => `      ${l}`).join('\n');
    return `  - question: '${ys(f.question)}'\n    answer: >-\n${answerLines}`;
  }).join('\n');

  return `---
name: '${ys(city)}'
type: residencial
zipCodes: []
seo: '${ys(seoJson)}'
faq:
${faqItems}
blocks: []
---
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const env = loadEnv();

  // Resolve credentials (CLI env > .env file)
  const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
  const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;
  const dryRun = !!(args['dry-run'] || args.dry);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  content-wizard — Rank & Rent Template');
  if (dryRun) console.log('  [DRY RUN — no se escribirán archivos]');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Collect inputs
  let { type: contentType, keyword, city, niche } = args;

  if (!contentType || !keyword || !city) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!contentType) contentType = await ask(rl, 'Tipo de contenido (service/location)', 'service');
    if (!keyword) keyword = await ask(rl, 'Keyword principal  (ej: fontanería urgente)');
    if (!city)    city    = await ask(rl, 'Ciudad / zona      (ej: Sevilla)');
    if (!niche)   niche   = await ask(rl, 'Nicho              (ej: fontanería)', keyword.split(' ')[0]);
    rl.close();
  }
  if (!niche) niche = keyword.split(' ')[0];
  if (contentType !== 'location') contentType = 'service';

  const slug = contentType === 'service'
    ? toSlug(`${keyword}-${city}`)
    : toSlug(city);

  const outputPath = contentType === 'service'
    ? path.join(ROOT, `src/content/services/${slug}.mdx`)
    : path.join(ROOT, `src/content/locations/${slug}.mdx`);

  console.log(`  Keyword:   ${keyword}`);
  console.log(`  Ciudad:    ${city}`);
  console.log(`  Tipo:      ${contentType}`);
  console.log(`  Salida:    ${path.relative(ROOT, outputPath)}\n`);

  // ── Step 1: DataForSEO ───────────────────────────────────────────────────

  let kw = {
    monthlySearches: null,
    competition: null,
    cpc: null,
    related: [],
    topResults: [],
    paaQuestions: [],
  };

  if (dfLogin && dfPassword) {
    try {
      kw = await fetchKeywordData(keyword, city, dfLogin, dfPassword);
      const stats = [
        kw.monthlySearches != null ? `volumen ${kw.monthlySearches}/mes` : null,
        kw.competition ? `competencia ${kw.competition}` : null,
        kw.cpc ? `CPC €${kw.cpc}` : null,
        kw.related.length ? `${kw.related.length} related` : null,
        kw.paaQuestions.length ? `${kw.paaQuestions.length} PAA` : null,
      ].filter(Boolean);
      console.log(`  ✓  ${stats.join('  ·  ')}`);
    } catch (err) {
      console.warn(`  ⚠  DataForSEO falló (${err.message}) — generando sin datos`);
    }
  } else {
    console.log('  ⚠  Sin credenciales DataForSEO — generando sin datos de volumen');
  }

  // ── Step 2: Claude ───────────────────────────────────────────────────────

  const content = await generateContent({ keyword, city, niche, contentType, kw });
  console.log(`  ✓  SEO title:  ${content.seoTitle}`);
  console.log(`  ✓  SEO desc:   ${content.seoDescription}`);
  console.log(`  ✓  FAQ:        ${content.faq?.length ?? 0} preguntas`);

  // ── Step 3: Build MDX ────────────────────────────────────────────────────

  const mdx = contentType === 'service'
    ? buildServiceMdx({ slug, content, keyword, city })
    : buildLocationMdx({ content, city });

  if (dryRun) {
    console.log('\n  ────── PREVIEW ──────\n');
    console.log(mdx.length > 2000 ? mdx.slice(0, 2000) + '\n  ... (truncado)' : mdx);
    console.log('  ────── FIN ──────\n');
    return;
  }

  // ── Step 4: Write file ───────────────────────────────────────────────────

  if (fs.existsSync(outputPath) && !args.force) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await ask(rl, `\n  El archivo ya existe. ¿Sobreescribir? (s/N)`, 'N');
    rl.close();
    if (ans.toLowerCase() !== 's') { console.log('  Cancelado.\n'); return; }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, mdx, 'utf-8');

  console.log(`\n  ✓  Archivo creado: ${path.relative(ROOT, outputPath)}`);
  console.log('  Abre Keystatic para revisar y publicar el contenido.\n');
}

main().catch(err => {
  console.error(`\n  ✗  ${err.message}`);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
