#!/usr/bin/env node
/**
 * strategy-wizard — UI web local para planificación SEO completa.
 * Abre automáticamente en http://localhost:3333
 *
 * Uso: npm run strategy-wizard
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import net from 'node:net';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3333;
const UI_FILE = path.join(__dirname, 'strategy-wizard-ui.html');

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(150);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, '127.0.0.1', () => {
      socket.destroy();
      resolve(true);
    });
  });
}

async function findAstroPort() {
  for (let port = 4321; port <= 4330; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  return 4321;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(req.headers['content-type']?.includes('json') ? JSON.parse(raw) : raw);
      } catch { resolve(Buffer.concat(chunks)); }
    });
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
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

function loadGlobalYaml() {
  const p = path.join(ROOT, 'src/content/business/global.yaml');
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, 'utf-8');
  const get = (key) => {
    const m = raw.match(new RegExp(`^${key}:\\s*['\"]?([^'\"#\\n]+?)['\"]?\\s*$`, 'm'));
    return m ? m[1].trim() : '';
  };
  return {
    siteName: get('siteName'),
    niche: get('niche'),
    city: get('city'),
    phone: get('phone'),
    email: get('email'),
    siteUrl: get('siteUrl'),
    slogan: get('slogan'),
    priceRange: get('priceRange'),
    ctaTagline: get('ctaTagline'),
  };
}

function ys(str) {
  return String(str ?? '').replace(/'/g, "''");
}

function toSlug(str) {
  return str.toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function callClaude(prompt, timeoutMs = 180_000) {
  const result = spawnSync('claude', ['--print'], {
    input: prompt,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: timeoutMs,
  });
  if (result.error) throw new Error(`claude CLI: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`claude CLI error: ${result.stderr?.slice(0, 300)}`);
  return result.stdout ?? '';
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function serveUI(req, res) {
  if (!fs.existsSync(UI_FILE)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('strategy-wizard-ui.html no encontrado junto al servidor.');
    return;
  }
  const html = fs.readFileSync(UI_FILE, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function getBusinessData(req, res) {
  const data = loadGlobalYaml();
  const astroPort = await findAstroPort();
  data.keystaticUrl = `http://localhost:${astroPort}/keystatic`;
  json(res, data);
}

async function getAvatar(req, res) {
  const p = path.join(ROOT, 'src/content/business/avatar.yaml');
  if (!fs.existsSync(p)) return json(res, null);
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const getSummary = () => {
      const m = raw.match(/^summary:\s*>-\s*\n((?:[ \t]+.+\n?)+)/m);
      return m ? m[1].replace(/^[ \t]+/gm, '').trim() : '';
    };
    const getScalar = (key) => {
      const m = raw.match(new RegExp(`^${key}:\\s*['>|"-]*\\s*(.+?)\\s*$`, 'm'));
      return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : '';
    };
    const getList = (key) => {
      const m = raw.match(new RegExp(`^${key}:\\n((?:[ \\t]+-[ \\t]+.+\\n?)+)`, 'm'));
      if (!m) return [];
      return m[1].split('\n')
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.replace(/^\s*-\s*['"]?|['"]?\s*$/, '').trim())
        .filter(Boolean);
    };
    json(res, {
      summary: getSummary(),
      demographics: getScalar('demographics'),
      desires: getList('desires'),
      fears: getList('fears'),
      searchVocabulary: getList('searchVocabulary'),
      decisionFactors: getList('decisionFactors'),
    });
  } catch { json(res, null); }
}

async function generateAvatarHandler(req, res) {
  const business = loadGlobalYaml();
  const prompt = `Eres un especialista en marketing para negocios de servicios locales en España.

NEGOCIO:
- Nombre: ${business.siteName || 'Negocio local'}
- Servicio: ${business.niche}
- Ciudad: ${business.city}
${business.slogan ? `- Slogan: ${business.slogan}` : ''}

Define el avatar del cliente ideal. Devuelve SOLO JSON válido (sin markdown):
{
  "summary": "3-4 frases describiendo quién es, qué situación le lleva a buscar el servicio y qué espera encontrar. Tercera persona, específico.",
  "demographics": "edad, situación (propietario/inquilino/empresa), poder adquisitivo en una frase",
  "desires": ["deseo concreto 1", "deseo concreto 2", "deseo concreto 3"],
  "fears": ["miedo o objeción 1", "miedo o objeción 2", "miedo o objeción 3"],
  "searchVocabulary": ["cómo busca en Google 1", "cómo busca 2", "cómo busca 3", "cómo busca 4"],
  "decisionFactors": ["factor decisión 1", "factor 2", "factor 3"]
}`;

  try {
    const text = callClaude(prompt);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) return json(res, { error: 'Claude no devolvió JSON válido' }, 500);
    json(res, JSON.parse(match[0]));
  } catch (e) { json(res, { error: e.message }, 500); }
}

async function saveAvatarHandler(req, res) {
  const avatar = await readBody(req);
  const business = loadGlobalYaml();
  const content = `# Avatar del cliente ideal — generado por strategy-wizard
negocio: '${ys(business.siteName)}'
ciudad: '${ys(business.city)}'
generado: '${new Date().toISOString().split('T')[0]}'

summary: >-
  ${String(avatar.summary || '').replace(/\n/g, '\n  ')}

demographics: '${ys(avatar.demographics)}'

desires:
${(avatar.desires || []).map(d => `  - '${ys(d)}'`).join('\n')}

fears:
${(avatar.fears || []).map(f => `  - '${ys(f)}'`).join('\n')}

searchVocabulary:
${(avatar.searchVocabulary || []).map(s => `  - '${ys(s)}'`).join('\n')}

decisionFactors:
${(avatar.decisionFactors || []).map(d => `  - '${ys(d)}'`).join('\n')}
`;
  fs.writeFileSync(path.join(ROOT, 'src/content/business/avatar.yaml'), content, 'utf-8');
  json(res, { ok: true });
}

async function generateKeywordsHandler(req, res) {
  const { avatar } = await readBody(req);
  const business = loadGlobalYaml();
  const prompt = `Eres un especialista en SEO local para negocios de servicios en España.

NEGOCIO: ${business.siteName} — ${business.niche} en ${business.city}
${avatar?.summary ? `CLIENTE IDEAL: ${avatar.summary}` : ''}
${avatar?.searchVocabulary?.length ? `VOCABULARIO DEL CLIENTE: ${avatar.searchVocabulary.join(', ')}` : ''}

Genera al menos 35 keywords que usa la gente para buscar este servicio en Google.
Prioriza keywords transaccionales (intención de contratar) y long tail (3+ palabras).

Devuelve SOLO JSON válido (sin markdown):
{
  "keywords": [
    { "keyword": "ejemplo keyword transaccional", "type": "transaccional", "notes": "alta intención" },
    { "keyword": "ejemplo consideración", "type": "consideracion", "notes": "" },
    { "keyword": "ejemplo informativa", "type": "informativa", "notes": "" }
  ]
}
Tipos válidos: "transaccional", "consideracion", "informativa"`;

  try {
    const text = callClaude(prompt);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) return json(res, { error: 'Sin JSON válido' }, 500);
    json(res, JSON.parse(match[0]));
  } catch (e) { json(res, { error: e.message }, 500); }
}

async function importCsvHandler(req, res) {
  const body = await readBody(req);
  const { parse } = await import('csv-parse/sync');
  try {
    const records = parse(typeof body === 'string' ? body : body.toString(), {
      columns: true, skip_empty_lines: true, trim: true,
    });
    if (!records.length) return json(res, { keywords: [] });
    const cols = Object.keys(records[0]);
    const kwCol = cols.find(k => /keyword|term|kw/i.test(k));
    const volCol = cols.find(k => /search|volume|avg|vol/i.test(k));
    const keywords = records
      .filter(r => kwCol && r[kwCol]?.trim())
      .map(r => ({
        keyword: r[kwCol].trim().toLowerCase(),
        type: 'importada',
        volume: volCol ? parseInt(r[volCol]?.replace(/[^0-9]/g, '')) || null : null,
        notes: 'CSV',
      }));
    json(res, { keywords });
  } catch (e) { json(res, { error: `CSV error: ${e.message}` }, 400); }
}

async function generateArchitectureHandler(req, res) {
  const { keywords, avatar } = await readBody(req);
  const business = loadGlobalYaml();
  const transactional = (keywords || [])
    .filter(k => k.type === 'transaccional' || k.selected)
    .map(k => k.keyword);

  const prompt = `Eres un SEO experto en arquitecturas web para negocios locales en España.

NEGOCIO: ${business.siteName} — ${business.niche} en ${business.city}

KEYWORDS TRANSACCIONALES:
${transactional.map(k => `  - "${k}"`).join('\n')}

Agrupa keywords por intención, elige la principal de cada grupo, evita canibalización.

Devuelve SOLO JSON válido:
{
  "pages": [
    {
      "keyword": "keyword principal",
      "type": "service",
      "slug": "slug-de-la-pagina",
      "title": "Título de la página",
      "relatedKeywords": ["keyword relacionada"],
      "priority": "alta",
      "notes": "descripción breve"
    }
  ],
  "architecture": {
    "home": "keyword principal del negocio",
    "services": ["slugs de páginas service"],
    "locations": ["slugs de páginas location"]
  }
}
Tipos: "service" o "location". Prioridad: "alta", "media" o "baja".`;

  try {
    const text = callClaude(prompt);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) return json(res, { error: 'Sin JSON válido' }, 500);
    json(res, JSON.parse(match[0]));
  } catch (e) { json(res, { error: e.message }, 500); }
}

async function getExistingPagesHandler(req, res) {
  const sDir = path.join(ROOT, 'src/content/services');
  const lDir = path.join(ROOT, 'src/content/locations');
  const services = fs.existsSync(sDir)
    ? fs.readdirSync(sDir).filter(f => /\.(mdx?|yaml)$/.test(f) && f !== '.gitkeep').map(f => f.replace(/\.(mdx?|yaml)$/, ''))
    : [];
  const locations = fs.existsSync(lDir)
    ? fs.readdirSync(lDir).filter(f => /\.(mdx?|yaml)$/.test(f) && f !== '.gitkeep').map(f => f.replace(/\.(mdx?|yaml)$/, ''))
    : [];
  json(res, { services, locations });
}

async function generatePageHandler(req, res) {
  const { keyword, city, type, niche, analyzeSerp } = await readBody(req);
  const business = loadGlobalYaml();
  const env = loadEnv();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send('status', { message: 'Iniciando generación...' });

    // Avatar
    const avatarPath = path.join(ROOT, 'src/content/business/avatar.yaml');
    let avatarText = '';
    if (fs.existsSync(avatarPath)) {
      const raw = fs.readFileSync(avatarPath, 'utf-8');
      const m = raw.match(/^summary:\s*>-\s*\n((?:[ \t]+.+\n?)+)/m);
      avatarText = m ? m[1].replace(/^[ \t]+/gm, '').trim() : '';
      send('status', { message: 'Avatar cargado ✓' });
    }

    // DataForSEO
    let kw = { paaQuestions: [], topResults: [] };
    const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
    const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;

    if (dfLogin && dfPassword) {
      send('status', { message: 'Consultando DataForSEO...' });
      try {
        const auth = Buffer.from(`${dfLogin}:${dfPassword}`).toString('base64');
        const dfFetch = async (endpoint, body) => {
          const r = await fetch(`https://api.dataforseo.com${endpoint}`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          return r.json();
        };
        const serpRes = await dfFetch('/v3/serp/google/organic/live/advanced', [{
          keyword: `${keyword} ${city}`, location_code: 2724, language_code: 'es',
          device: 'desktop', depth: 10,
        }]);
        const items = serpRes?.tasks?.[0]?.result?.[0]?.items ?? [];
        kw.topResults = items.filter(i => i.type === 'organic').slice(0, 3)
          .map(i => ({ title: i.title, url: i.url, domain: i.domain }));
        kw.paaQuestions = items.filter(i => i.type === 'people_also_ask')
          .slice(0, 6).map(i => i.title).filter(Boolean);
        send('status', { message: `DataForSEO ✓ — ${kw.paaQuestions.length} PAA, ${kw.topResults.length} resultados` });
      } catch (e) {
        send('status', { message: `DataForSEO falló — continuando sin datos` });
      }
    }

    // Análisis competidores
    let competitorContext = '';
    if (analyzeSerp && kw.topResults.length) {
      send('status', { message: 'Analizando competidores...' });
      for (const result of kw.topResults.filter(r => r.url).slice(0, 3)) {
        try {
          const text = callClaude(
            `Usa web_fetch para obtener ${result.url} y extrae solo H1, H2s relevantes. Devuelve JSON: {"h1":"","h2s":[]}`
          );
          const m = text.match(/\{[\s\S]+\}/);
          if (m) {
            const d = JSON.parse(m[0]);
            competitorContext += `\n${result.domain}: H1="${d.h1}" H2s=${JSON.stringify((d.h2s || []).slice(0, 4))}`;
          }
        } catch {}
      }
      if (competitorContext) send('status', { message: 'Competidores analizados ✓' });
    }

    send('status', { message: 'Claude generando contenido...' });

    const isService = type !== 'location';
    const paaStr = kw.paaQuestions.length
      ? `PAA Google:\n${kw.paaQuestions.map(q => `  - ${q}`).join('\n')}` : '';

    const prompt = `Eres un especialista en SEO local para negocios de servicios en España.
Genera contenido para una página ${isService ? 'de servicio' : 'de zona geográfica'}.

NEGOCIO: ${business.siteName || niche} — ${business.niche || niche} en ${business.city || city}
${business.slogan ? `Slogan: ${business.slogan}` : ''}
${avatarText ? `\nCLIENTE IDEAL: ${avatarText}` : ''}
${paaStr ? '\n' + paaStr : ''}
${competitorContext ? '\nCOMPETIDORES:' + competitorContext : ''}

DATOS: Keyword="${keyword}" Ciudad="${city}" Nicho="${niche || business.niche}"

REGLAS:
1. Tono profesional y cercano, NO corporativo
2. Integra la keyword de forma natural
3. FAQ "answer-first" — respuesta directa en la primera frase
4. Textos específicos y verificables
5. Usa el vocabulario del cliente ideal
6. faqSeo: 5 transaccionales para Google — faqGeo: 5 conversacionales para LLMs

Devuelve SOLO JSON válido (sin markdown):
{
  "seoTitle": "máx 60 chars",
  "seoDescription": "máx 155 chars con CTA",
  "shortDesc": "máx 115 chars para tarjeta",
  "hero": {
    "heading": "keyword o variante",
    "headingHighlight": "ciudad o beneficio clave",
    "subheading": "1-2 frases del servicio",
    "features": ["beneficio 1", "beneficio 2", "beneficio 3"],
    "ctaPrimaryText": "texto botón"
  },
  "trustStrip": [
    {"icon":"ShieldCheck","label":"texto"},
    {"icon":"Clock","label":"texto"},
    {"icon":"Users","label":"texto"},
    {"icon":"Gift","label":"texto"}
  ],
  "featuresSection": {
    "title": "título con keyword",
    "items": [
      {"title":"string","description":"1-2 frases","icon":"Award"},
      {"title":"string","description":"1-2 frases","icon":"FileCheck"},
      {"title":"string","description":"1-2 frases","icon":"Star"}
    ]
  },
  "faqSeo": [
    {"question":"pregunta transaccional Google","answer":"answer-first 2-3 frases"},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."}
  ],
  "faqGeo": [
    {"question":"pregunta conversacional LLM","answer":"respuesta cercana mencionando el negocio"},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."}
  ],
  "cta": {
    "title": "pregunta/CTA con keyword",
    "subtitle": "propuesta de valor",
    "buttonText": "texto botón"
  }
}
Iconos Lucide válidos: ShieldCheck, Clock, Users, Gift, FileCheck, Star, MapPin, Wrench, CheckCircle, Phone, Zap, Award, Hammer, Paintbrush, Home, Building, Key, Truck, Drill, BadgeCheck.`;

    const text = callClaude(prompt, 180_000);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) throw new Error('Claude no devolvió JSON válido');
    const content = JSON.parse(match[0]);

    send('status', { message: 'Construyendo YAML...' });

    const slug = toSlug(`${keyword}-${city}`);
    const allFaq = [...(content.faqSeo || []), ...(content.faqGeo || [])];
    const seoJson = JSON.stringify({ title: content.seoTitle, description: content.seoDescription });

    const trustItems = (content.trustStrip || [])
      .map(i => `        - icon: ${i.icon}\n          label: '${ys(i.label)}'\n          description: ''`).join('\n');
    const featureItems = (content.featuresSection?.items || [])
      .map(i => `      - title: '${ys(i.title)}'\n        description: '${ys(i.description)}'\n        icon: ${i.icon}`).join('\n');
    const heroFeatures = (content.hero?.features || [])
      .map(f => `      - '${ys(f)}'`).join('\n');
    const faqItems = allFaq.map(f => {
      const lines = String(f.answer || '').split('\n').map(l => `            ${l}`).join('\n');
      return `        - question: '${ys(f.question)}'\n          answer: >-\n${lines}`;
    }).join('\n');

    const mdx = `---
title: '${ys(content.seoTitle)}'
icon: Wrench
shortDesc: '${ys(content.shortDesc)}'
featured: true
seo: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: '${ys(content.hero?.heading || '')}'
      headingHighlight: '${ys(content.hero?.headingHighlight || '')}'
      subheading: '${ys(content.hero?.subheading || '')}'
      ctaPrimaryText: '${ys(content.hero?.ctaPrimaryText || 'Pedir Presupuesto')}'
      ctaPrimaryLink: '#contacto'
      ctaSecondaryText: WhatsApp
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
      title: '${ys(content.featuresSection?.title || '')}'
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
      title: '${ys(content.cta?.title || '')}'
      subtitle: '${ys(content.cta?.subtitle || '')}'
      titleTag: h2
      buttonText: '${ys(content.cta?.buttonText || 'Pedir Presupuesto')}'
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida
---
`;

    send('content', {
      mdx,
      slug,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      h1: content.hero?.heading,
      features: content.hero?.features || [],
      faqSeoCount: content.faqSeo?.length || 0,
      faqGeoCount: content.faqGeo?.length || 0,
    });
    send('done', { slug, outputPath: `src/content/${isService ? 'services' : 'locations'}/${slug}.mdx` });

  } catch (err) {
    send('error', { message: err.message });
  } finally {
    res.end();
  }
}

async function savePageHandler(req, res) {
  const body = await readBody(req);
  const { slug, mdx, type } = body;
  const customPath = body.customPath;
  if (customPath) {
    const fullPath = path.join(ROOT, customPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, mdx, 'utf-8');
    return json(res, { ok: true, path: customPath });
  }
  const dir = type === 'location' ? 'locations' : 'services';
  const outputPath = path.join(ROOT, `src/content/${dir}/${slug}.mdx`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, mdx, 'utf-8');
  json(res, { ok: true, path: `src/content/${dir}/${slug}.mdx` });
}

async function getHomeStatus(req, res) {
  const homePath = path.join(ROOT, 'src/content/pages/home.mdx');
  if (!fs.existsSync(homePath)) return json(res, { status: 'missing' });
  const content = fs.readFileSync(homePath, 'utf-8');
  const hasPlaceholders = content.includes('SERVICIO') || content.includes('CIUDAD') || content.includes('NOMBRE_EMPRESA');
  const hasJsonEmbedded = content.includes('content: >-') && content.includes('{"heading"');
  json(res, {
    status: hasPlaceholders ? 'placeholder' : hasJsonEmbedded ? 'old-format' : 'generated',
    hasPlaceholders,
    hasJsonEmbedded,
  });
}

async function generateHome(req, res) {
  const {
    keyword,
    city,
    niche,
    services,
    locations,
    analyzeSerp,
  } = await readBody(req);

  const business = loadGlobalYaml();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send('status', { message: 'Cargando contexto...' });

    const avatarPath = path.join(ROOT, 'src/content/business/avatar.yaml');
    let avatarText = '';
    if (fs.existsSync(avatarPath)) {
      const raw = fs.readFileSync(avatarPath, 'utf-8');
      const m = raw.match(/^summary:\s*>-\s*\n((?:[ \t]+.+\n?)+)/m);
      avatarText = m ? m[1].replace(/^[ \t]+/gm, '').trim() : '';
      send('status', { message: 'Avatar cargado ✓' });
    }

    const serviceTitles = [];
    for (const s of (services || [])) {
      const p = path.join(ROOT, `src/content/services/${s.slug}.mdx`);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const m = raw.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
        if (m) serviceTitles.push(m[1].trim());
      }
    }

    const locationNames = (locations || []).map(l => l.name || l.slug);
    send('status', { message: `${serviceTitles.length} servicios · ${locationNames.length} zonas` });

    let competitorContext = '';
    if (analyzeSerp) {
      send('status', { message: 'Analizando competidores para la home...' });
      try {
        const serpText = callClaude(
          `Busca en Google "${keyword} ${city}" y analiza las 3 primeras webs que aparezcan.
Para cada una, usa web_fetch y extrae: H1, H2s principales, qué secciones tiene.
Devuelve JSON: {"competitors": [{"url":"","h1":"","h2s":[],"sections":[]}]}`
        );
        const m = serpText.match(/\{[\s\S]+\}/);
        if (m) {
          const data = JSON.parse(m[0]);
          competitorContext = data.competitors?.map((c, i) =>
            `Competidor ${i+1} (${c.url}): H1="${c.h1}" · Secciones: ${c.sections?.join(', ')}`
          ).join('\n') || '';
          if (competitorContext) send('status', { message: 'Competidores analizados ✓' });
        }
      } catch (e) {
        send('status', { message: 'Análisis competidores falló — continuando sin datos' });
      }
    }

    send('status', { message: 'Claude generando contenido de la home...' });

    const cityVal = city || business.city;
    const nicheVal = niche || business.niche;

    const prompt = `Eres un especialista en SEO y copywriting para negocios de servicios locales en España.
Genera el contenido completo para la HOME de este negocio.

NEGOCIO:
- Nombre: ${business.siteName || 'Negocio local'}
- Servicio principal: ${nicheVal}
- Ciudad principal: ${cityVal}
${business.slogan ? `- Slogan: ${business.slogan}` : ''}
${business.priceRange ? `- Rango de precio: ${business.priceRange}` : ''}

${avatarText ? `CLIENTE IDEAL:\n${avatarText}\n` : ''}
${serviceTitles.length ? `SERVICIOS DEL NEGOCIO:\n${serviceTitles.map(s => `  - ${s}`).join('\n')}\n` : ''}
${locationNames.length ? `ZONAS DE COBERTURA:\n${locationNames.map(l => `  - ${l}`).join('\n')}\n` : ''}
${competitorContext ? `COMPETIDORES:\n${competitorContext}\n` : ''}

REGLAS:
1. Tono profesional y cercano — como habla un experto de confianza, no una corporación
2. La keyword "${keyword} ${cityVal}" debe aparecer de forma natural en hero, intro y about
3. El home_intro es el párrafo SEO más importante — 2-3 frases que describan quién son,
   qué hacen y para quién, con keyword integrada naturalmente
4. Los testimonios deben sonar reales — nombres, fechas, servicios concretos
5. Las áreas de servicio deben usar las zonas reales del negocio si se proporcionaron
6. Stats realistas para el nicho — no inventar números absurdos
7. FAQ mezcla preguntas SEO (transaccionales) y GEO (conversacionales para LLMs)

Devuelve SOLO JSON válido (sin markdown, sin explicaciones):
{
  "seoTitle": "máx 60 chars — keyword + ciudad + diferenciador",
  "seoDescription": "máx 155 chars — qué hacen, ciudad, CTA",
  "hero": {
    "heading": "keyword principal corta",
    "headingHighlight": "ciudad o diferenciador",
    "subheading": "1-2 frases que describen el servicio con propuesta de valor",
    "features": ["beneficio 1", "beneficio 2", "beneficio 3"],
    "ctaPrimaryText": "texto botón principal",
    "ctaSecondaryText": "WhatsApp"
  },
  "homeIntro": {
    "heading": "Especialistas en X en Y — texto con keyword",
    "paragraph": "2-3 frases SEO. Describe quién son, qué hacen, para quién, con ciudad y keyword natural."
  },
  "features": {
    "title": "Por qué elegir ${business.siteName || nicheVal} para X en Y",
    "items": [
      {"title": "razón 1 con keyword", "description": "2 frases específicas", "icon": "Award"},
      {"title": "razón 2", "description": "2 frases específicas", "icon": "ShieldCheck"},
      {"title": "razón 3", "description": "2 frases específicas", "icon": "Users"}
    ]
  },
  "servicesGrid": {
    "title": "Nuestros Servicios",
    "titleHighlight": "en ${cityVal}",
    "subtitle": "1-2 frases que describen la oferta de servicios"
  },
  "stats": {
    "title": "Expertos en X en Y",
    "items": [
      {"label": "Años de experiencia", "value": "10", "suffix": "+", "icon": "Award"},
      {"label": "Proyectos realizados", "value": "500", "suffix": "+", "icon": "CheckCircle"},
      {"label": "Satisfacción clientes", "value": "100", "suffix": "%", "icon": "Star"},
      {"label": "Garantía en trabajos", "value": "100", "suffix": "%", "icon": "BadgeCheck"}
    ]
  },
  "about": {
    "title": "${business.siteName || 'Nombre negocio'} — X en",
    "titleHighlight": "Y",
    "description": "2-3 frases sobre la empresa, años de experiencia, sin subcontratas, equipo propio.",
    "yearsExperience": "10+",
    "projectsCompleted": "500+",
    "features": [
      {"title": "diferenciador 1", "description": "1 frase", "icon": "Users"},
      {"title": "diferenciador 2", "description": "1 frase", "icon": "FileCheck"}
    ],
    "buttonText": "Quiénes somos",
    "buttonLink": "/nosotros/"
  },
  "process": {
    "title": "Cómo trabajamos",
    "subtitle": "Un proceso claro y sin sorpresas de principio a fin.",
    "steps": [
      {"title": "1. Visita y medición", "description": "1-2 frases", "icon": "ClipboardCheck", "duration": "Gratis"},
      {"title": "2. Presupuesto cerrado", "description": "1-2 frases", "icon": "FileText", "duration": "24-48h"},
      {"title": "3. Ejecución del trabajo", "description": "1-2 frases", "icon": "Hammer", "duration": "Según proyecto"},
      {"title": "4. Entrega y garantía", "description": "1-2 frases", "icon": "BadgeCheck", "duration": "Garantía incluida"}
    ]
  },
  "testimonials": {
    "title": "Lo que dicen nuestros clientes",
    "subtitle": "Opiniones reales de personas que han confiado en nosotros.",
    "items": [
      {"quote": "testimonio específico y creíble sobre el servicio", "author": "María G.", "initials": "MG", "location": "${cityVal}", "date": "2024", "rating": 5, "service": "${nicheVal}", "verified": true},
      {"quote": "segundo testimonio distinto con detalle concreto", "author": "Carlos M.", "initials": "CM", "location": "${cityVal}", "date": "2024", "rating": 5, "service": "${nicheVal}", "verified": true},
      {"quote": "tercer testimonio con detalle diferente a los anteriores", "author": "Ana R.", "initials": "AR", "location": "${cityVal}", "date": "2024", "rating": 5, "service": "${nicheVal}", "verified": true}
    ]
  },
  "serviceAreas": {
    "title": "Dónde trabajamos",
    "subtitle": "Nos desplazamos para medir y presupuestar sin compromiso en toda la zona.",
    "group1": {
      "title": "${cityVal} Capital",
      "description": "Cubrimos todos los barrios y distritos.",
      "items": [
        {"name": "zona real o barrio", "popular": true},
        {"name": "zona real o barrio", "popular": false},
        {"name": "zona real o barrio", "popular": false},
        {"name": "zona real o barrio", "popular": false}
      ]
    },
    "group2": {
      "title": "Municipios cercanos",
      "description": "Desplazamiento incluido sin coste adicional.",
      "items": [
        {"name": "municipio cercano real"},
        {"name": "municipio cercano real"},
        {"name": "municipio cercano real"}
      ]
    }
  },
  "faq": [
    {"question": "¿Cuánto cuesta X en Y?", "answer": "respuesta directa en 2 frases"},
    {"question": "¿Hacéis presupuesto gratis?", "answer": "respuesta directa"},
    {"question": "¿Dais garantía?", "answer": "respuesta directa"},
    {"question": "¿Trabajáis en Y y alrededores?", "answer": "respuesta con zonas reales si disponibles"},
    {"question": "¿Cómo sé si un profesional de X es de confianza?", "answer": "respuesta conversacional mencionando el negocio"},
    {"question": "¿Qué debería preguntarle antes de contratar?", "answer": "respuesta conversacional útil"}
  ],
  "cta": {
    "title": "¿Necesitas X en Y?",
    "subtitle": "Llámanos o escríbenos. Venimos a ver el trabajo, te damos presupuesto cerrado sin compromiso.",
    "buttonText": "Presupuesto gratuito · Sin compromiso"
  }
}
Iconos válidos: Award, ShieldCheck, Users, FileCheck, Star, MapPin, Wrench, CheckCircle,
Phone, Zap, Hammer, Paintbrush, Home, Building, Key, BadgeCheck, ClipboardCheck, FileText.`;

    const text = callClaude(prompt, 180_000);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) throw new Error('Claude no devolvió JSON válido para la home');
    const c = JSON.parse(match[0]);

    send('status', { message: 'Contenido generado ✓ — construyendo MDX...' });

    const seoJson = JSON.stringify({ title: c.seoTitle, description: c.seoDescription });

    const heroFeatures = (c.hero?.features || [])
      .map(f => `      - '${ys(f)}'`).join('\n');

    const featureItems = (c.features?.items || [])
      .map(i => `      - title: '${ys(i.title)}'\n        description: '${ys(i.description)}'\n        icon: ${i.icon}`)
      .join('\n');

    const statsItems = (c.stats?.items || [])
      .map(i => `      - label: '${ys(i.label)}'\n        value: '${ys(i.value)}'\n        suffix: '${ys(i.suffix || '')}'\n        icon: ${i.icon}`)
      .join('\n');

    const aboutFeatures = (c.about?.features || [])
      .map(i => `      - title: '${ys(i.title)}'\n        description: '${ys(i.description)}'\n        icon: ${i.icon}`)
      .join('\n');

    const processSteps = (c.process?.steps || [])
      .map(s => `      - title: '${ys(s.title)}'\n        description: '${ys(s.description)}'\n        icon: ${s.icon}\n        duration: '${ys(s.duration || '')}'`)
      .join('\n');

    const testimonials = (c.testimonials?.items || [])
      .map(t => [
        `      - quote: '${ys(t.quote)}'`,
        `        author: '${ys(t.author)}'`,
        `        initials: '${ys(t.initials)}'`,
        `        location: '${ys(t.location)}'`,
        `        date: '${ys(t.date)}'`,
        `        rating: ${t.rating || 5}`,
        `        service: '${ys(t.service || '')}'`,
        `        verified: ${t.verified !== false}`,
      ].join('\n'))
      .join('\n');

    const areaGroup1Items = (c.serviceAreas?.group1?.items || [])
      .map(i => `          - name: '${ys(i.name)}'\n            description: ''\n            icon: MapPin\n            popular: ${i.popular ? 'true' : 'false'}`)
      .join('\n');

    const areaGroup2Items = (c.serviceAreas?.group2?.items || [])
      .map(i => `          - name: '${ys(i.name)}'\n            supplement: ''\n            icon: MapPin`)
      .join('\n');

    const faqItems = (c.faq || [])
      .map(f => {
        const lines = f.answer.split('\n').map(l => `            ${l}`).join('\n');
        return `        - question: '${ys(f.question)}'\n          answer: >-\n${lines}\n          category: ''`;
      }).join('\n');

    const mdx = `---
seoControls: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: '${ys(c.hero?.heading || '')}'
      headingHighlight: '${ys(c.hero?.headingHighlight || '')}'
      subheading: '${ys(c.hero?.subheading || '')}'
      ctaPrimaryText: '${ys(c.hero?.ctaPrimaryText || 'Pedir Presupuesto')}'
      ctaPrimaryLink: '#contacto'
      ctaSecondaryText: '${ys(c.hero?.ctaSecondaryText || 'WhatsApp')}'
      ctaSecondaryLink: ''
      titleTag: h1
      features:
${heroFeatures}

  - discriminant: home_intro
    value:
      heading: '${ys(c.homeIntro?.heading || '')}'
      paragraph: >-
        ${(c.homeIntro?.paragraph || '').replace(/\n/g, '\n        ')}

  - discriminant: features
    value:
      title: '${ys(c.features?.title || '')}'
      titleTag: h2
      variant: grid
      features:
${featureItems}

  - discriminant: services_grid
    value:
      variant: featured
      title: '${ys(c.servicesGrid?.title || 'Nuestros Servicios')}'
      titleHighlight: '${ys(c.servicesGrid?.titleHighlight || '')}'
      subtitle: '${ys(c.servicesGrid?.subtitle || '')}'
      services: {}

  - discriminant: stats
    value:
      title: '${ys(c.stats?.title || '')}'
      titleTag: h2
      stats:
${statsItems}

  - discriminant: about
    value:
      title: '${ys(c.about?.title || '')}'
      titleHighlight: '${ys(c.about?.titleHighlight || '')}'
      titleTag: h2
      description: '${ys(c.about?.description || '')}'
      yearsExperience: '${ys(c.about?.yearsExperience || '10+')}'
      projectsCompleted: '${ys(c.about?.projectsCompleted || '500+')}'
      image: ~
      features:
${aboutFeatures}
      buttonText: '${ys(c.about?.buttonText || 'Quiénes somos')}'
      buttonLink: '${ys(c.about?.buttonLink || '/nosotros/')}'

  - discriminant: process
    value:
      title: '${ys(c.process?.title || 'Cómo trabajamos')}'
      subtitle: '${ys(c.process?.subtitle || '')}'
      titleTag: h2
      variant: timeline
      steps:
${processSteps}

  - discriminant: testimonials
    value:
      title: '${ys(c.testimonials?.title || '')}'
      subtitle: '${ys(c.testimonials?.subtitle || '')}'
      titleTag: h2
      testimonials:
${testimonials}

  - discriminant: service_areas
    value:
      title: '${ys(c.serviceAreas?.title || 'Dónde trabajamos')}'
      subtitle: '${ys(c.serviceAreas?.subtitle || '')}'
      group1:
        title: '${ys(c.serviceAreas?.group1?.title || '')}'
        description: '${ys(c.serviceAreas?.group1?.description || '')}'
        items:
${areaGroup1Items}
      group2:
        title: '${ys(c.serviceAreas?.group2?.title || 'Municipios cercanos')}'
        description: '${ys(c.serviceAreas?.group2?.description || '')}'
        note: ''
        items:
${areaGroup2Items}

  - discriminant: faq
    value:
      title: '${ys(`Preguntas frecuentes sobre ${nicheVal} en ${cityVal}`)}'
      subtitle: 'Resolvemos las dudas más habituales antes de pedir presupuesto.'
      variant: accordion
      questions:
${faqItems}

  - discriminant: contact
    value:
      title: 'Solicita tu presupuesto gratuito'
      subtitle: 'Cuéntanos qué necesitas y te respondemos en menos de 24 horas.'
      description: ''
      phone: ''
      whatsapp: ''
      email: ''
      schedule: ''
      responseTime: menos de 24 horas

  - discriminant: cta
    value:
      title: '${ys(c.cta?.title || '')}'
      subtitle: '${ys(c.cta?.subtitle || '')}'
      titleTag: h2
      buttonText: '${ys(c.cta?.buttonText || 'Presupuesto gratuito')}'
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida

seoContentTitle: ''
stickyPhone: true
whatsappFloat: true
---
`;

    send('content', {
      mdx,
      seoTitle: c.seoTitle,
      heroHeading: c.hero?.heading,
      servicesCount: serviceTitles.length,
      locationsCount: locationNames.length,
      faqCount: (c.faq || []).length,
    });

    send('done', { path: 'src/content/pages/home.mdx' });

  } catch (err) {
    send('error', { message: err.message });
  } finally {
    res.end();
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

const ROUTES = {
  'GET /':                          serveUI,
  'GET /api/business':              getBusinessData,
  'GET /api/avatar':                getAvatar,
  'POST /api/avatar/generate':      generateAvatarHandler,
  'POST /api/save-avatar':          saveAvatarHandler,
  'POST /api/keywords/generate':    generateKeywordsHandler,
  'POST /api/keywords/import-csv':  importCsvHandler,
  'POST /api/architecture/generate':generateArchitectureHandler,
  'GET /api/existing-pages':        getExistingPagesHandler,
  'POST /api/generate-page':        generatePageHandler,
  'POST /api/save-page':            savePageHandler,
  'GET /api/home-status':           getHomeStatus,
  'POST /api/generate-home':        generateHome,
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const key = `${req.method} ${req.url.split('?')[0]}`;
  const handler = ROUTES[key];

  if (handler) {
    try { await handler(req, res); }
    catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    }
  } else {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Strategy Wizard — Rank & Rent Template`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n  Abierto en: ${url}`);
  console.log(`  Ctrl+C para cerrar\n`);
  const opener = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(opener, [url], { detached: true, stdio: 'ignore' }).unref();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ✗  Puerto ${PORT} en uso. Prueba con: PORT=${PORT + 1} npm run strategy-wizard\n`);
  } else { console.error(err); }
  process.exit(1);
});
