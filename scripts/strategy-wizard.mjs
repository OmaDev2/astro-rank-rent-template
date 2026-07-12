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
import { GoogleGenerativeAI } from '@google/generative-ai';

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

function extractMainText(html) {
  let text = html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text.slice(0, 15000);
}

async function scrapeUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    
    const cleanText = (str) => str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    const h1s = h1Match.map(cleanText).filter(Boolean);
    const h2s = h2Match.map(cleanText).filter(Boolean).slice(0, 8);
    
    const bodyText = extractMainText(html);
    
    return {
      h1: h1s[0] || '',
      h2s: h2s,
      bodyText: bodyText
    };
  } catch (err) {
    console.error(`Scraping error for ${url}:`, err.message);
    return null;
  }
}

async function callLLM(prompt, modelName, useJson = false) {
  const env = loadEnv();
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  if (modelName !== 'claude-cli' && apiKey) {
    let geminiModel = 'gemini-1.5-pro';
    if (modelName === 'gemini-1.5-flash') geminiModel = 'gemini-1.5-flash';
    if (modelName === 'gemini-2.5-flash') geminiModel = 'gemini-2.5-flash';
    if (modelName.startsWith('gemini-')) geminiModel = modelName;
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: geminiModel,
        generationConfig: useJson ? { responseMimeType: 'application/json' } : undefined
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error(`Gemini API Error (${modelName}), falling back to Claude CLI:`, err.message);
      return callClaude(prompt);
    }
  }

  return callClaude(prompt);
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

// Helpers cleaned up to avoid duplication

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
  let body = {};
  try {
    body = await readBody(req) || {};
  } catch (_) {}
  const { llmModel } = body;
  const modelName = llmModel || 'gemini-1.5-flash';

  const business = loadGlobalYaml();
  const prompt = `Eres un especialista en marketing para negocios de servicios locales en España.

NEGOCIO:
- Nombre: ${business.siteName || 'Negocio local'}
- Servicio: ${business.niche}
- Ciudad: ${business.city}
${business.slogan ? `- Slogan: ${business.slogan}` : ''}

Define el avatar del cliente ideal. Devuelve SOLO JSON válido que se ajuste al siguiente formato:
{
  "summary": "3-4 frases describiendo quién es, qué situación le lleva a buscar el servicio y qué espera encontrar. Tercera persona, específico.",
  "demographics": "edad, situación (propietario/inquilino/empresa), poder adquisitivo en una frase",
  "desires": ["deseo concreto 1", "deseo concreto 2", "deseo concreto 3"],
  "fears": ["miedo o objeción 1", "miedo o objeción 2", "miedo o objeción 3"],
  "searchVocabulary": ["cómo busca en Google 1", "cómo busca 2", "cómo busca 3", "cómo busca 4"],
  "decisionFactors": ["factor decisión 1", "factor 2", "factor 3"]
}`;

  try {
    const text = await callLLM(prompt, modelName, true);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) return json(res, { error: 'LLM no devolvió JSON válido' }, 500);
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
  const { avatar, llmModel } = await readBody(req);
  const modelName = llmModel || 'gemini-1.5-flash';
  const business = loadGlobalYaml();
  const prompt = `Eres un especialista en SEO local para negocios de servicios en España.

NEGOCIO: ${business.siteName} — ${business.niche} en ${business.city}
${avatar?.summary ? `CLIENTE IDEAL: ${avatar.summary}` : ''}
${avatar?.searchVocabulary?.length ? `VOCABULARIO DEL CLIENTE: ${avatar.searchVocabulary.join(', ')}` : ''}

Genera al menos 35 keywords que usa la gente para buscar este servicio en Google.
Prioriza keywords transaccionales (intención de contratar) y long tail (3+ palabras).

Devuelve SOLO un objeto JSON válido con el siguiente formato:
{
  "keywords": [
    { "keyword": "ejemplo keyword transaccional", "type": "transaccional", "notes": "alta intención" },
    { "keyword": "ejemplo consideración", "type": "consideracion", "notes": "" },
    { "keyword": "ejemplo informativa", "type": "informativa", "notes": "" }
  ]
}
Tipos válidos: "transaccional", "consideracion", "informativa"`;

  try {
    const text = await callLLM(prompt, modelName, true);
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
  const { keywords, avatar, llmModel } = await readBody(req);
  const modelName = llmModel || 'gemini-1.5-flash';
  const business = loadGlobalYaml();
  const transactional = (keywords || [])
    .filter(k => k.type === 'transaccional' || k.selected)
    .map(k => k.keyword);

  const prompt = `Eres un SEO experto en arquitecturas web para negocios locales en España.

NEGOCIO: ${business.siteName} — ${business.niche} en ${business.city}

KEYWORDS TRANSACCIONALES:
${transactional.map(k => `  - "${k}"`).join('\n')}

Agrupa keywords por intención, elige la principal de cada grupo, evita canibalización.

Devuelve SOLO un objeto JSON válido con el siguiente formato:
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
    const text = await callLLM(prompt, modelName, true);
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
  const { keyword, city, type, niche, analyzeSerp, llmModel } = await readBody(req);
  const modelName = llmModel || 'gemini-1.5-flash';
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

    const avatarPath = path.join(ROOT, 'src/content/business/avatar.yaml');
    let avatarText = '';
    if (fs.existsSync(avatarPath)) {
      const raw = fs.readFileSync(avatarPath, 'utf-8');
      const m = raw.match(/^summary:\s*>-\s*\n((?:[ \t]+.+\n?)+)/m);
      avatarText = m ? m[1].replace(/^[ \t]+/gm, '').trim() : '';
      send('status', { message: 'Avatar cargado ✓' });
    }

    const sDir = path.join(ROOT, 'src/content/services');
    const lDir = path.join(ROOT, 'src/content/locations');
    const existingServices = fs.existsSync(sDir)
      ? fs.readdirSync(sDir).filter(f => /\.(mdx?|yaml)$/.test(f) && f !== '.gitkeep').map(f => f.replace(/\.(mdx?|yaml)$/, ''))
      : [];
    const existingLocations = fs.existsSync(lDir)
      ? fs.readdirSync(lDir).filter(f => /\.(mdx?|yaml)$/.test(f) && f !== '.gitkeep').map(f => f.replace(/\.(mdx?|yaml)$/, ''))
      : [];

    const existingPagesList = [
      ...existingServices.map(s => `- Servicio: ${s} (URL: /servicios/${s})`),
      ...existingLocations.map(l => `- Localidad: ${l} (URL: /zona/${l})`),
    ].join('\n');

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

    let competitorContext = '';
    if (analyzeSerp && kw.topResults.length) {
      send('status', { message: 'Scrapeando contenido de competidores...' });
      for (const result of kw.topResults.filter(r => r.url).slice(0, 3)) {
        try {
          const scrapData = await scrapeUrlContent(result.url);
          if (scrapData && scrapData.bodyText) {
            competitorContext += `\n--- COMPETIDOR: ${result.domain} (${result.url}) ---\n`;
            competitorContext += `H1: ${scrapData.h1}\n`;
            competitorContext += `H2s: ${scrapData.h2s.join(', ')}\n`;
            competitorContext += `TEXTO PRINCIPAL EXTRAÍDO:\n${scrapData.bodyText.slice(0, 8000)}\n`;
          }
        } catch (e) {
          console.error(`Error scraping ${result.url}:`, e.message);
        }
      }
      if (competitorContext) send('status', { message: 'Competidores analizados con scraping nativo ✓' });
    }

    send('status', { message: `${modelName} generando contenido rico...` });

    const isService = type !== 'location';
    const paaStr = kw.paaQuestions.length
      ? `PAA Google:\n${kw.paaQuestions.map(q => `  - ${q}`).join('\n')}` : '';

    const prompt = `Eres un especialista en SEO local para negocios de servicios en España.
Genera el contenido rico y optimizado para una página ${isService ? 'de servicio' : 'de zona/localidad'}.

DATOS DEL SITIO:
- Nombre negocio: ${business.siteName || niche}
- Nicho: ${niche || business.niche}
- Ciudad base: ${business.city || city}
${business.slogan ? `- Slogan: ${business.slogan}` : ''}
${avatarText ? `\nAVATAR CLIENTE IDEAL:\n${avatarText}` : ''}
${paaStr ? '\n' + paaStr : ''}

INFORMACIÓN LOCAL A GENERAR:
- Palabra Clave Principal: "${keyword}"
- Localidad/Ciudad: "${city}"

${competitorContext ? `\nCONTENIDO REAL DE COMPETIDORES EN GOOGLE:\n${competitorContext}\nAnaliza el contenido anterior de la competencia y redacta un texto superador: más específico, más útil para el usuario, que cubra todos sus puntos pero totalmente original y redactado para la ciudad de ${city}.\n` : ''}

${existingPagesList ? `\nENLAZADO INTERNO (SILOING):
Aquí tienes enlaces existentes en el sitio. Si es natural, incluye enlaces markdown en los textos hacia ellos (máximo 2-3 enlaces por página):
${existingPagesList}\n` : ''}

REGLAS DE COPYWRITING:
1. Tono cercano, profesional, directo (evita palabras vacías como "líderes en el sector" o "calidad inigualable").
2. Integra la keyword y variantes locales de forma fluida.
3. FAQ en formato "answer-first" (la primera oración responde directamente la duda).
4. Usa el vocabulario del cliente ideal, no términos técnicos que no entienda.

Devuelve SOLO JSON válido conforme al siguiente esquema estricto:
{
  "seoTitle": "Título SEO (máx 60 caracteres, incluye keyword + ciudad)",
  "seoDescription": "Descripción SEO (máx 155 caracteres con llamada a la acción y ciudad)",
  "shortDesc": "Descripción corta (máx 115 caracteres para tarjetas de servicio)",
  "hero": {
    "heading": "H1 - variante corta o keyword principal",
    "headingHighlight": "beneficio principal o ciudad",
    "subheading": "1-2 frases descriptivas",
    "features": ["beneficio 1", "beneficio 2", "beneficio 3"],
    "ctaPrimaryText": "texto del botón de presupuesto"
  },
  "trustStrip": [
    {"icon":"ShieldCheck","label":"texto rápido"},
    {"icon":"Clock","label":"texto rápido"},
    {"icon":"Users","label":"texto rápido"},
    {"icon":"Gift","label":"texto rápido"}
  ],
  "featuresSection": {
    "title": "Título con keyword",
    "items": [
      {"title":"característica 1","description":"frase específica","icon":"Award"},
      {"title":"característica 2","description":"frase específica","icon":"FileCheck"},
      {"title":"característica 3","description":"frase específica","icon":"Star"}
    ]
  },
  ${isService ? `
  "process": {
    "title": "Cómo trabajamos",
    "subtitle": "Un proceso sencillo y garantizado",
    "steps": [
      {"title": "1. Contacto o Llamada", "description": "Nos cuentas qué necesitas y agendamos una visita.", "icon": "Phone", "duration": "Inmediato"},
      {"title": "2. Presupuesto Cerrado", "description": "Te damos el precio final por escrito tras la visita.", "icon": "FileText", "duration": "24 horas"},
      {"title": "3. Ejecución Profesional", "description": "Realizamos el servicio de forma limpia y eficiente.", "icon": "Hammer", "duration": "Según trabajo"}
    ]
  },
  "priceFrom": {
    "title": "Precio Competitivo",
    "subtitle": "Tarifas adaptadas y transparentes",
    "price": "49",
    "unit": "/servicio"
  },
  ` : ''}
  "contentSection": {
    "title": "Servicio experto en ${city}",
    "sections": [
      {
        "heading": "Profesionales a tu servicio en ${city}",
        "content": "Redacta un texto extenso (2-3 párrafos) en Markdown sobre el servicio, la seriedad de los operarios, y la garantía. Utiliza **negritas** y listas con guiones si es apropiado. Aprovecha para incluir enlaces de siloing si corresponde de forma natural."
      },
      {
        "heading": "Atención rápida y eficaz",
        "content": "Otro bloque de texto rico (2 párrafos) en Markdown detallando el soporte, la disponibilidad en los barrios de ${city} y la honestidad en el presupuesto."
      }
    ]
  },
  "faqSeo": [
    {"question":"pregunta transaccional de Google","answer":"respuesta directa 2-3 frases"},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."}
  ],
  "faqGeo": [
    {"question":"pregunta de LLMs/conversacional","answer":"respuesta conversacional mencionando el negocio"},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."},
    {"question":"...","answer":"..."}
  ],
  "cta": {
    "title": "Pregunta de acción con la keyword",
    "subtitle": "Mensaje de urgencia o propuesta de valor",
    "buttonText": "texto del botón"
  }
}

Para iconos usa SOLO: ShieldCheck, Clock, Users, Gift, FileCheck, Star, MapPin, Wrench, CheckCircle, Phone, Zap, Award, Hammer, Paintbrush, Home, Building, Key, Truck, Drill, BadgeCheck.`;

    const text = await callLLM(prompt, modelName, true);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) throw new Error('El modelo de IA no devolvió un JSON válido.');
    const content = JSON.parse(match[0]);

    send('status', { message: 'Construyendo YAML y bloques...' });

    const keywordSlug = toSlug(keyword);
    const slug = isService 
      ? (keywordSlug.endsWith(toSlug(city)) ? keywordSlug : `${keywordSlug}-${toSlug(city)}`)
      : keywordSlug;
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

    const contentSections = (content.contentSection?.sections || [])
      .map(s => `        - heading: '${ys(s.heading)}'\n          content: >-\n            ${String(s.content || '').split('\n').join('\n            ')}`)
      .join('\n');

    let pageBlocks = '';

    pageBlocks += `  - discriminant: hero
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
`;

    pageBlocks += `
  - discriminant: trust_strip
    value:
      title: ''
      subtitle: ''
      titleTag: h2
      variant: bar
      items:
${trustItems}
`;

    pageBlocks += `
  - discriminant: features
    value:
      title: '${ys(content.featuresSection?.title || '')}'
      titleTag: h2
      variant: grid
      features:
${featureItems}
`;

    if (isService) {
      const processSteps = (content.process?.steps || [])
        .map(st => `        - title: '${ys(st.title)}'\n          description: '${ys(st.description)}'\n          icon: ${st.icon}\n          duration: '${ys(st.duration)}'`).join('\n');
      pageBlocks += `
  - discriminant: process
    value:
      title: '${ys(content.process?.title || 'Cómo trabajamos')}'
      subtitle: '${ys(content.process?.subtitle || '')}'
      titleTag: h2
      variant: timeline
      steps:
${processSteps}
`;

      pageBlocks += `
  - discriminant: price_from
    value:
      title: '${ys(content.priceFrom?.title || 'Precio Cerrado')}'
      subtitle: '${ys(content.priceFrom?.subtitle || 'Consulte nuestras tarifas')}'
      price: '${ys(content.priceFrom?.price || '49')}'
      unit: '${ys(content.priceFrom?.unit || '/servicio')}'
      buttonText: 'Pedir Presupuesto'
      buttonLink: '/contacto/'
      isOffer: true
      bgClass: 'bg-surface'
`;
    } else {
      pageBlocks += `
  - discriminant: map
    value:
      title: 'Zona de Cobertura en ${ys(city)}'
      zoom: 13
`;

      pageBlocks += `
  - discriminant: location_services
    value:
      title: 'Servicios de ${ys(niche || business.niche || '')} en ${ys(city)}'
      subtitle: 'Atendemos urgencias y servicios concertados'
`;
    }

    pageBlocks += `
  - discriminant: content
    value:
      title: '${ys(content.contentSection?.title || '')}'
      sections:
${contentSections}
`;

    pageBlocks += `
  - discriminant: faq
    value:
      title: 'Preguntas frecuentes sobre ${ys(keyword)} en ${ys(city)}'
      variant: accordion
      faqs:
${faqItems}
`;

    pageBlocks += `
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

    let mdx = '';
    if (isService) {
      mdx = `---
title: '${ys(content.hero?.heading || keyword)} en ${ys(city)}: ¡Pide Presupuesto!'
icon: ${content.featuresSection?.items?.[0]?.icon || 'Wrench'}
shortDesc: '${ys(content.shortDesc || '')}'
featured: true
seo: '${seoJson}'
blocks:
${pageBlocks}`;
    } else {
      mdx = `---
name: '${ys(city)}'
type: residencial
zipCodes: []
seo: '${seoJson}'
blocks:
${pageBlocks}`;
    }

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
    llmModel,
  } = await readBody(req);
  const modelName = llmModel || 'gemini-1.5-flash';

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
      let p = path.join(ROOT, `src/content/services/${s.slug}.mdx`);
      if (!fs.existsSync(p)) p = path.join(ROOT, `src/content/services/${s.slug}.yaml`);
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const m = raw.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
        if (m) serviceTitles.push(m[1].trim());
      }
    }

    const locationNames = (locations || []).map(l => l.name || l.slug);
    send('status', { message: `${serviceTitles.length} servicios · ${locationNames.length} zonas` });

    let competitorContext = '';
    const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
    const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;

    if (analyzeSerp) {
      send('status', { message: 'Analizando competidores para la home...' });
      try {
        if (dfLogin && dfPassword) {
          const auth = Buffer.from(`${dfLogin}:${dfPassword}`).toString('base64');
          const r = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify([{
              keyword: `${keyword} ${city}`, location_code: 2724, language_code: 'es',
              device: 'desktop', depth: 10,
            }]),
          });
          const serpRes = await r.json();
          const items = serpRes?.tasks?.[0]?.result?.[0]?.items ?? [];
          const topResults = items.filter(i => i.type === 'organic').slice(0, 3)
            .map(i => ({ title: i.title, url: i.url, domain: i.domain }));
          
          let competitors = [];
          for (const result of topResults) {
            if (result.url) {
              const scrapData = await scrapeUrlContent(result.url);
              if (scrapData && scrapData.bodyText) {
                competitors.push({ url: result.url, h1: scrapData.h1, h2s: scrapData.h2s, bodyText: scrapData.bodyText });
              }
            }
          }
          competitorContext = competitors.map((c, i) =>
            `Competidor ${i+1} (${c.url}): H1="${c.h1}" · H2s: ${c.h2s.join(', ')}\nTexto:\n${c.bodyText.slice(0, 5000)}`
          ).join('\n\n') || '';
        } else if (modelName === 'claude-cli') {
          const serpText = callClaude(
            `Busca en Google "${keyword} ${city}" y analiza las 3 primeras webs que aparezcan.
Para cada una, usa web_fetch y extrae: H1, H2s principales, y texto de la página.
Devuelve JSON: {"competitors": [{"url":"","h1":"","h2s":[],"bodyText":""}]}`
          );
          const m = serpText.match(/\{[\s\S]+\}/);
          if (m) {
            const data = JSON.parse(m[0]);
            competitorContext = data.competitors?.map((c, i) =>
              `Competidor ${i+1} (${c.url}): H1="${c.h1}" · H2s: ${c.h2s?.join(', ')}\nTexto:\n${c.bodyText?.slice(0, 5000)}`
            ).join('\n\n') || '';
          }
        }
        if (competitorContext) send('status', { message: 'Competidores analizados con scraping nativo ✓' });
      } catch (e) {
        send('status', { message: 'Análisis competidores falló — continuando sin datos' });
      }
    }

    send('status', { message: `${modelName} generando contenido de la home...` });

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

    const text = await callLLM(prompt, modelName, true);
    const match = text.match(/\{[\s\S]+\}/);
    if (!match) throw new Error(`${modelName} no devolvió JSON válido para la home`);
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
