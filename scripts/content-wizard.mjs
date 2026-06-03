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

// ── Business context ─────────────────────────────────────────────────────────

function loadGlobalYaml() {
  const globalPath = path.join(ROOT, 'src/content/business/global.yaml');
  if (!fs.existsSync(globalPath)) return null;
  try {
    const raw = fs.readFileSync(globalPath, 'utf-8');
    const get = (key) => {
      const m = raw.match(new RegExp(`^${key}:\\s*['\"]?([^'\"#\\n]+?)['\"]?\\s*$`, 'm'));
      return m ? m[1].trim() : null;
    };
    return {
      siteName:   get('siteName'),
      niche:      get('niche'),
      city:       get('city'),
      slogan:     get('slogan'),
      priceRange: get('priceRange'),
      ctaTagline: get('ctaTagline'),
    };
  } catch {
    return null;
  }
}

function loadAvatar() {
  const avatarPath = path.join(ROOT, 'src/content/business/avatar.yaml');
  if (!fs.existsSync(avatarPath)) return null;
  try {
    const raw = fs.readFileSync(avatarPath, 'utf-8');
    const m = raw.match(/^summary:\s*[>|]-?\s*\n((?:[ \t]+.+\n?)+)/m);
    return m ? m[1].replace(/^[ \t]+/gm, '').trim() : raw.slice(0, 500);
  } catch {
    return null;
  }
}

function generateAvatar({ siteName, niche, city, slogan }) {
  console.log('  → Claude: generando avatar del cliente ideal...');
  const prompt = `Eres un especialista en marketing para negocios de servicios locales en España.

NEGOCIO:
- Nombre: ${siteName || 'Negocio local'}
- Servicio: ${niche}
- Ciudad: ${city}
${slogan ? `- Slogan: ${slogan}` : ''}

Define el avatar del cliente ideal para este negocio con este formato exacto.
Devuelve SOLO un objeto JSON válido (sin markdown, sin explicaciones):

{
  "summary": "Párrafo de 3-4 frases que describe quién es este cliente, qué situación le lleva a buscar el servicio y qué espera encontrar. Escrito en tercera persona, específico y concreto.",
  "demographics": "Edad, situación (propietario/inquilino/empresa), poder adquisitivo en una frase.",
  "desires": ["deseo concreto 1", "deseo concreto 2", "deseo concreto 3"],
  "fears": ["miedo o objeción 1", "miedo o objeción 2", "miedo o objeción 3"],
  "searchVocabulary": ["cómo busca en Google 1", "cómo busca en Google 2", "cómo busca en Google 3", "cómo busca en Google 4"],
  "decisionFactors": ["qué le haría elegir este negocio 1", "factor 2", "factor 3"]
}`;

  const text = callClaude(prompt);
  const match = text.match(/\{[\s\S]+\}/);
  if (!match) throw new Error(`Claude no devolvió JSON válido para el avatar`);
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    throw new Error(`JSON inválido del avatar: ${e.message}`);
  }
}

function saveAvatar(avatar, { siteName, niche, city }) {
  const avatarPath = path.join(ROOT, 'src/content/business/avatar.yaml');
  const content = `# Avatar del cliente ideal
# Generado automáticamente por content-wizard
# Edita este archivo para personalizar el copy de tu contenido

negocio: '${ys(siteName || niche)}'
ciudad: '${ys(city)}'
generado: '${new Date().toISOString().split('T')[0]}'

summary: >-
  ${avatar.summary.replace(/\n/g, '\n  ')}

demographics: '${ys(avatar.demographics)}'

desires:
${avatar.desires.map(d => `  - '${ys(d)}'`).join('\n')}

fears:
${avatar.fears.map(f => `  - '${ys(f)}'`).join('\n')}

searchVocabulary:
${avatar.searchVocabulary.map(s => `  - '${ys(s)}'`).join('\n')}

decisionFactors:
${avatar.decisionFactors.map(d => `  - '${ys(d)}'`).join('\n')}
`;
  fs.writeFileSync(avatarPath, content, 'utf-8');
  console.log('  ✓  Avatar guardado en src/content/business/avatar.yaml');
}

function buildAvatarStr(avatarData) {
  return [
    avatarData.summary,
    `Perfil: ${avatarData.demographics}`,
    `Busca en Google: ${avatarData.searchVocabulary.join(', ')}`,
    `Deseos: ${avatarData.desires.join(' · ')}`,
    `Miedos: ${avatarData.fears.join(' · ')}`,
    `Le haría elegirnos: ${avatarData.decisionFactors.join(' · ')}`,
  ].join('\n');
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
    .map(i => ({
      title: i.title,
      description: i.description?.slice(0, 160),
      url: i.url,
      domain: i.domain,
    }));
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

// ── Competitor analysis ───────────────────────────────────────────────────────

async function fetchCompetitorStructure(url) {
  const prompt = `Usa la herramienta web_fetch para obtener el contenido de esta URL: ${url}

Extrae ÚNICAMENTE la jerarquía de encabezados (H1, H2, H3) y las secciones
principales de la página. Ignora navegación, footer, cookies y banners.

Devuelve SOLO un objeto JSON válido (sin markdown, sin explicaciones):
{
  "url": "${url}",
  "h1": "texto del H1 o null si no existe",
  "h2s": ["texto H2 1", "texto H2 2"],
  "h3s": ["texto H3 relevante 1"],
  "sections": ["nombre sección 1", "nombre sección 2"],
  "wordCount": número aproximado de palabras del contenido principal,
  "hasFaq": true,
  "hasTestimonials": true,
  "hasProcess": true,
  "hasPricing": false
}`;

  try {
    const text = callClaude(prompt);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function analyzeCompetitors(topResults) {
  if (!topResults.length) return null;

  const urlsToAnalyze = topResults
    .filter(r => r.url)
    .filter(r => !r.url.match(/habitissimo|milanuncios|infojobs|paginas-amarillas|yelp|tripadvisor|google\.|facebook\.|instagram\./i))
    .slice(0, 3);

  if (!urlsToAnalyze.length) return null;

  console.log(`  → Analizando ${urlsToAnalyze.length} competidores...`);

  const analyses = [];
  for (const result of urlsToAnalyze) {
    process.stdout.write(`    · ${result.domain || result.url.slice(0, 40)}...`);
    const analysis = await fetchCompetitorStructure(result.url);
    if (analysis) {
      analyses.push(analysis);
      console.log(' ✓');
    } else {
      console.log(' ✗ (saltado)');
    }
  }

  return analyses.length ? analyses : null;
}

function buildCompetitorContext(analyses) {
  if (!analyses?.length) return '';

  const parts = analyses.map((a, i) => {
    const lines = [`Competidor ${i + 1}: ${a.url}`];
    if (a.h1) lines.push(`  H1: "${a.h1}"`);
    if (a.h2s?.length) lines.push(`  H2s: ${a.h2s.map(h => `"${h}"`).join(', ')}`);
    if (a.h3s?.length) lines.push(`  H3s relevantes: ${a.h3s.slice(0, 4).map(h => `"${h}"`).join(', ')}`);

    const features = [
      a.hasFaq ? 'FAQ' : null,
      a.hasTestimonials ? 'Testimonios' : null,
      a.hasProcess ? 'Proceso paso a paso' : null,
      a.hasPricing ? 'Precios' : null,
    ].filter(Boolean);
    if (features.length) lines.push(`  Secciones: ${features.join(', ')}`);
    if (a.wordCount) lines.push(`  ~${a.wordCount} palabras`);

    return lines.join('\n');
  });

  const hasFaqAll = analyses.every(a => a.hasFaq);
  const hasProcessAll = analyses.every(a => a.hasProcess);
  const avgWords = Math.round(
    analyses.filter(a => a.wordCount).reduce((s, a) => s + a.wordCount, 0) /
    (analyses.filter(a => a.wordCount).length || 1)
  );

  const insights = [];
  if (hasFaqAll) insights.push('Todos incluyen FAQ — es un requisito para competir');
  if (hasProcessAll) insights.push('Todos explican el proceso — incluirlo es necesario');
  if (!analyses.some(a => a.hasPricing)) insights.push('Ninguno muestra precios — oportunidad de diferenciación');
  if (avgWords > 0) insights.push(`Media de ~${avgWords} palabras — superar este volumen ayuda`);

  return `ANÁLISIS DE COMPETIDORES (top ${analyses.length} en Google):
${parts.join('\n\n')}

INSIGHTS:
${insights.map(i => `  - ${i}`).join('\n')}

INSTRUCCIÓN: Crea una jerarquía de contenido que mejore a estos competidores.
Cubre lo que hacen bien, añade lo que les falta, y usa un H1 más específico
y orientado al cliente que los de la competencia.`;
}

async function generateContent({ keyword, city, niche, contentType, kw, business, avatar, competitorAnalysis }) {
  const relatedStr = kw.related.length
    ? `Keywords relacionadas con volumen:\n${kw.related.map(r => `  - "${r.keyword}" (${r.volume}/mes)`).join('\n')}`
    : '';
  const paaStr = kw.paaQuestions.length
    ? `Preguntas "People Also Ask" en Google:\n${kw.paaQuestions.map(q => `  - ${q}`).join('\n')}`
    : '';
  const serpStr = kw.topResults.length
    ? `Top 3 competidores en SERP:\n${kw.topResults.map((r, i) => `  ${i + 1}. ${r.title} — ${r.description ?? ''}`).join('\n')}`
    : '';

  const businessStr = business
    ? `NEGOCIO:
- Nombre: ${business.siteName || niche}
- Servicio principal: ${business.niche || niche}
- Ciudad base: ${business.city || city}
${business.slogan ? `- Slogan: ${business.slogan}` : ''}
${business.priceRange ? `- Rango de precio: ${business.priceRange}` : ''}
${business.ctaTagline ? `- CTA tagline: ${business.ctaTagline}` : ''}`
    : '';

  const avatarStr = avatar
    ? `CLIENTE IDEAL:
${avatar}

Usa este perfil para:
- Elegir el vocabulario que usa este cliente (no el vocabulario técnico del profesional)
- Responder a sus miedos y objeciones en las features y el copy
- Formular las FAQ como preguntas reales que haría este cliente
- Redactar el CTA apelando a sus deseos, no solo al servicio`
    : '';

  const competitorStr = competitorAnalysis
    ? buildCompetitorContext(competitorAnalysis)
    : '';

  const isService = contentType === 'service';

  const prompt = `Eres un especialista en SEO local para negocios de servicios en España.
Genera el contenido para una página ${isService ? 'de servicio' : 'de zona geográfica'}.

DATOS:
- Keyword principal: "${keyword}" (${kw.monthlySearches ? kw.monthlySearches + ' búsquedas/mes en España' : 'volumen no disponible'})
- Ciudad/zona: ${city}
- Nicho: ${niche}
${businessStr ? '\n' + businessStr : ''}${avatarStr ? '\n' + avatarStr : ''}${competitorStr ? '\n' + competitorStr : (serpStr ? '\n' + serpStr : '')}${relatedStr ? '\n' + relatedStr : ''}${paaStr ? '\n' + paaStr : ''}

REGLAS:
1. Escribe en español, tono profesional y cercano — NO corporativo
2. Integra la keyword y "${keyword} ${city}" de forma natural, sin saturar
3. Las respuestas del FAQ deben ser "answer-first" (respuesta directa en la primera frase)
4. Los textos deben ser específicos y verificables — NO frases vacías como "somos los mejores"
5. Adapta el contenido al contexto local (${city})
6. Usa el vocabulario del cliente ideal definido en CLIENTE IDEAL — no el vocabulario técnico del profesional
7. Las FAQ deben responder a los miedos y objeciones del cliente ideal, no solo preguntas técnicas
8. Si se proporciona ANÁLISIS DE COMPETIDORES, supera en profundidad y especificidad a los competidores. El H1 debe ser más específico que el de la competencia. Incluye al menos una sección que los competidores no tengan

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
  "faqSeo": [
    { "question": "pregunta transaccional que escribe en Google (ej: ¿cuánto cuesta X en Y?)", "answer": "respuesta directa answer-first en 2-3 frases. Primera frase = respuesta concreta." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "faqGeo": [
    { "question": "pregunta conversacional que haría a un amigo o a ChatGPT (ej: ¿cómo sé si un X es de confianza?)", "answer": "respuesta cercana y conversacional en 3-4 frases. Menciona el negocio de forma natural al menos una vez." },
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

INSTRUCCIONES PARA LAS FAQ:

faqSeo — 5 preguntas transaccionales para Google:
- Usa las preguntas PAA disponibles como base cuando las haya
- Formato "answer-first": la primera frase responde directamente
- Incluye la keyword y la ciudad de forma natural
- Ejemplos: "¿Cuánto cuesta X en Y?", "¿Cuánto tarda X?", "¿Tenéis garantía?", "¿Trabajáis en Y?", "¿Hacéis presupuesto gratis?"

faqGeo — 5 preguntas conversacionales para LLMs (ChatGPT, Perplexity):
- Preguntas que alguien haría a un amigo de confianza o a una IA
- Respuestas cercanas, como explicándolo en persona
- Menciona el nombre del negocio o "nuestro equipo" de forma natural en al menos 3 de las 5 respuestas
- NO repitas preguntas que ya estén en faqSeo
- Ejemplos: "¿Cómo sé si un X es de confianza?", "¿Qué debería preguntarle a un X antes de contratarle?", "¿Cuándo es urgente llamar a un X?", "¿Qué diferencia a un buen X de uno malo?", "¿Vale la pena contratar un X profesional?"`;


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
  const {
    seoTitle, seoDescription, shortDesc,
    hero, trustStrip, featuresSection,
    faq, faqSeo, faqGeo,
    cta,
  } = content;

  const seoJson = JSON.stringify({ title: seoTitle, description: seoDescription });

  const heroFeatures = Array.isArray(hero.features)
    ? hero.features.map(f => `      - '${ys(f)}'`).join('\n')
    : String(hero.features).split('\n').map(f => `      - '${ys(f.trim())}'`).join('\n');

  const featureItems = featuresSection.items
    .map(item => [
      `      - title: '${ys(item.title)}'`,
      `        description: '${ys(item.description)}'`,
      `        icon: ${item.icon}`,
    ].join('\n'))
    .join('\n');

  const trustItems = trustStrip
    .map(item => `        - icon: ${item.icon}\n          label: '${ys(item.label)}'\n          description: ''`)
    .join('\n');

  const allFaq = (faqSeo?.length && faqGeo?.length)
    ? [...faqSeo, ...faqGeo]
    : (faq || []);

  const faqItems = allFaq.map(f => {
    const answerLines = f.answer.split(/\n/).map(l => `            ${l}`).join('\n');
    return `        - question: '${ys(f.question)}'\n          answer: >-\n${answerLines}`;
  }).join('\n');

  const ctaFeatures = [
    `      - Visita gratuita`,
    `      - Presupuesto cerrado`,
    `      - Garantía incluida`,
  ].join('\n');

  return `---
title: '${ys(seoTitle)}'
icon: Wrench
shortDesc: '${ys(shortDesc)}'
featured: true
seo: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: '${ys(hero.heading)}'
      headingHighlight: '${ys(hero.headingHighlight)}'
      subheading: '${ys(hero.subheading)}'
      ctaPrimaryText: '${ys(hero.ctaPrimaryText)}'
      ctaSecondaryText: WhatsApp
      ctaPrimaryLink: '#contacto'
      ctaSecondaryLink: ''
      titleTag: h1
      features:
${heroFeatures}

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
      title: '${ys(featuresSection.title)}'
      titleTag: h2
      variant: grid
      features:
${featureItems}

  - discriminant: faq
    value:
      title: 'Preguntas frecuentes sobre ${ys(keyword)} en ${ys(city)}'
      variant: accordion
      faqs:
${faqItems}

  - discriminant: cta
    value:
      title: '${ys(cta.title)}'
      subtitle: '${ys(cta.subtitle)}'
      titleTag: h2
      buttonText: '${ys(cta.buttonText)}'
      buttonLink: /contacto/
      style: gradient
      features:
${ctaFeatures}
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

  // ── Step 0: Business context & avatar ───────────────────────────────────

  const business = loadGlobalYaml();
  if (business?.siteName) {
    console.log(`  Negocio:   ${business.siteName}`);
  }

  let avatar = loadAvatar();

  if (args['regen-avatar'] && business) {
    console.log('  → Regenerando avatar del cliente ideal...');
    try {
      const avatarData = generateAvatar({
        siteName: business.siteName,
        niche: business.niche || niche,
        city: business.city || city,
        slogan: business.slogan,
      });
      saveAvatar(avatarData, {
        siteName: business.siteName,
        niche: business.niche || niche,
        city: business.city || city,
      });
      avatar = buildAvatarStr(avatarData);
    } catch (err) {
      console.warn(`  ⚠  No se pudo regenerar el avatar: ${err.message}`);
    }
  } else if (!avatar && !dryRun && !args['skip-avatar'] && business) {
    try {
      const avatarData = generateAvatar({
        siteName: business.siteName,
        niche: business.niche || niche,
        city: business.city || city,
        slogan: business.slogan,
      });
      saveAvatar(avatarData, {
        siteName: business.siteName,
        niche: business.niche || niche,
        city: business.city || city,
      });
      avatar = buildAvatarStr(avatarData);
    } catch (err) {
      console.warn(`  ⚠  No se pudo generar el avatar: ${err.message}`);
    }
  } else if (avatar) {
    console.log('  ✓  Avatar cargado desde avatar.yaml');
  }

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

  // ── Step 1.5: Competitor analysis (--analyze-serp) ──────────────────────

  let competitorAnalysis = null;

  if (args['analyze-serp'] && kw.topResults.length && !dryRun) {
    try {
      competitorAnalysis = await analyzeCompetitors(kw.topResults);
      if (competitorAnalysis) {
        console.log(`  ✓  ${competitorAnalysis.length} competidores analizados`);
      }
    } catch (err) {
      console.warn(`  ⚠  Análisis de competidores falló: ${err.message}`);
    }
  } else if (args['analyze-serp'] && !kw.topResults.length) {
    console.log('  ⚠  --analyze-serp requiere DataForSEO para obtener las URLs');
  }

  // ── Step 2: Claude ───────────────────────────────────────────────────────

  const content = await generateContent({ keyword, city, niche, contentType, kw, business, avatar, competitorAnalysis });
  console.log(`  ✓  SEO title:  ${content.seoTitle}`);
  console.log(`  ✓  SEO desc:   ${content.seoDescription}`);
  const faqCount = ((content.faqSeo?.length ?? 0) + (content.faqGeo?.length ?? 0)) || (content.faq?.length ?? 0);
  const faqLabel = (content.faqSeo?.length && content.faqGeo?.length)
    ? `${content.faqSeo.length} SEO + ${content.faqGeo.length} GEO`
    : `${faqCount} preguntas`;
  console.log(`  ✓  FAQ:        ${faqLabel}`);

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
