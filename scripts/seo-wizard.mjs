#!/usr/bin/env node
/**
 * seo-wizard — Pipeline SEO por fases (adaptación del playbook Rank Masters al template).
 *
 * Cada fase alimenta a la siguiente. El estado vive en archivos del proyecto:
 *   - src/content/business/contexto.md  → contexto REAL del negocio + buyer personas
 *   - seo_plan.json                     → arquitectura + clusters de keywords + estado
 *
 * FASES:
 *   npm run seo-wizard contexto [-- --transcript audios.txt]   Fase 0: transcripción o entrevista → contexto
 *   npm run seo-wizard plan     [-- --csv carpeta/]            Fase 1: arquitectura + keywords validadas
 *   npm run seo-wizard home     [-- --competitors u1,u2,u3]    Fase 2: generar la HOME
 *   npm run seo-wizard service <slug>                          Fase 3: generar un servicio del plan
 *   npm run seo-wizard zona <slug>                             Fase 3: generar una zona del plan
 *   npm run seo-wizard status                                  Ver progreso del plan
 *
 * Requiere: claude CLI con sesión activa.
 * Opcional: DATAFORSEO_LOGIN/PASSWORD en .env (volúmenes y SERP reales),
 *           CSVs de Google Keyword Planner (--csv), URLs de competidores (--competitors).
 */

import { spawnSync } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONTEXTO_PATH = path.join(ROOT, 'src/content/business/contexto.md');
const PLAN_PATH = path.join(ROOT, 'seo_plan.json');
const GLOBAL_PATH = path.join(ROOT, 'src/content/business/global.yaml');
const HOME_PATH = path.join(ROOT, 'src/content/pages/home.mdx');

// ── Helpers básicos ───────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      out[key] = (!next || next.startsWith('--')) ? true : argv[++i];
    } else {
      out._.push(argv[i]);
    }
  }
  return out;
}

function toSlug(str) {
  return String(str).toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ys(str) { return String(str ?? '').replace(/'/g, "''"); }

function normalize(str) {
  return String(str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

function ask(rl, question, fallback = '') {
  return new Promise((resolve) => {
    const hint = fallback ? ` (enter = ${fallback})` : '';
    rl.question(`  ${question}${hint}: `, (a) => resolve(a.trim() || fallback));
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

function loadGlobal() {
  if (!fs.existsSync(GLOBAL_PATH)) return {};
  try { return parseYaml(fs.readFileSync(GLOBAL_PATH, 'utf-8')) || {}; } catch { return {}; }
}

function loadContexto() {
  if (!fs.existsSync(CONTEXTO_PATH)) return null;
  return fs.readFileSync(CONTEXTO_PATH, 'utf-8');
}

function loadPlan() {
  if (!fs.existsSync(PLAN_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8')); } catch { return null; }
}

function savePlan(plan) {
  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2), 'utf-8');
}

// ── Claude CLI ────────────────────────────────────────────────────────────────

function callClaude(prompt, { timeoutMs = 240_000, tools = null, retries = 1 } = {}) {
  // tools: array de herramientas a permitir en modo no interactivo (ej: ['WebFetch']).
  // Sin --allowedTools, claude --print bloquea las herramientas al pedir permiso.
  const cliArgs = ['--print'];
  if (tools?.length) cliArgs.push('--allowedTools', tools.join(','));

  for (let attempt = 0; ; attempt++) {
    const result = spawnSync('claude', cliArgs, {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024,
      timeout: timeoutMs,
    });
    if (result.error) throw new Error(`No se pudo ejecutar claude CLI: ${result.error.message}`);

    if (result.status === 0) return result.stdout ?? '';

    const reason = result.signal
      ? `terminado por señal ${result.signal} (¿timeout de ${Math.round(timeoutMs / 1000)}s?)`
      : `exit ${result.status}: ${result.stderr?.trim().slice(0, 300) || '(sin stderr)'}`;

    if (attempt < retries) {
      console.log(`    ⚠ claude CLI falló (${reason}) — reintentando en 5s...`);
      spawnSync('sleep', ['5']);
      continue;
    }
    throw new Error(`claude CLI error: ${reason}`);
  }
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]+\}/);
  if (!match) throw new Error(`Claude no devolvió JSON.\nRespuesta: ${text.slice(0, 300)}`);
  try { return JSON.parse(match[0]); }
  catch (e) { throw new Error(`JSON inválido: ${e.message}\nFragmento: ${match[0].slice(0, 400)}`); }
}

// ── DataForSEO (opcional) ─────────────────────────────────────────────────────

async function dfsPost(endpoint, body, login, password) {
  const res = await fetch(`https://api.dataforseo.com${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`DataForSEO HTTP ${res.status}`);
  const data = await res.json();
  return data?.tasks?.[0]?.result ?? null;
}

async function dfsVolumes(keywords, login, password) {
  const result = await dfsPost(
    '/v3/keywords_data/google_ads/search_volume/live',
    [{ keywords: keywords.slice(0, 100), location_code: 2724, language_code: 'es' }],
    login, password,
  );
  const map = {};
  for (const r of result ?? []) map[r.keyword] = r.search_volume ?? 0;
  return map;
}

async function dfsRelated(keyword, login, password, limit = 20) {
  const result = await dfsPost(
    '/v3/keywords_data/google_ads/keywords_for_keywords/live',
    [{ keywords: [keyword], location_code: 2724, language_code: 'es', limit }],
    login, password,
  );
  return (result ?? [])
    .filter((r) => r.keyword !== keyword && (r.search_volume ?? 0) > 0)
    .sort((a, b) => (b.search_volume ?? 0) - (a.search_volume ?? 0))
    .map((r) => ({ keyword: r.keyword, volume: r.search_volume }));
}

async function dfsSerpTop(keyword, login, password) {
  const result = await dfsPost(
    '/v3/serp/google/organic/live/advanced',
    [{ keyword, location_code: 2724, language_code: 'es', device: 'desktop', depth: 10 }],
    login, password,
  );
  const items = result?.[0]?.items ?? [];
  const topResults = items
    .filter((i) => i.type === 'organic' && i.url)
    .slice(0, 6)
    .map((i) => ({ url: i.url, title: i.title, description: i.description, domain: i.domain }));
  const paa = items
    .filter((i) => i.type === 'people_also_ask')
    .slice(0, 6)
    .map((i) => i.title || i.question)
    .filter(Boolean);
  return { topResults, paa };
}

// ── Análisis de competidores (claude web_fetch) ───────────────────────────────

function fetchCompetitorPage(url) {
  const prompt = `Usa la herramienta WebFetch para obtener el contenido de esta URL: ${url}

Analiza SOLO el contenido principal (ignora navegación, footer, cookies).

Devuelve SOLO un objeto JSON válido (sin markdown):
{
  "url": "${url}",
  "h1": "texto del H1 o null",
  "h2s": ["H2 1", "H2 2"],
  "sections": ["nombre sección 1", "nombre sección 2"],
  "wordCount": número aproximado,
  "hasFaq": true, "hasTestimonials": true, "hasProcess": true, "hasPricing": false,
  "queHacenBien": "1-2 frases: por qué crees que posiciona",
  "queLesFalta": "1-2 frases: huecos de contenido o intenciones no resueltas"
}`;
  try {
    return extractJson(callClaude(prompt, { tools: ['WebFetch'] }));
  } catch { return null; }
}

async function analyzeCompetitors({ keyword, competitorUrls, dfLogin, dfPassword }) {
  let urls = competitorUrls;
  let paa = [];
  if (!urls?.length && dfLogin && dfPassword) {
    process.stdout.write('  → DataForSEO: buscando top 3 en Google...');
    try {
      const serp = await dfsSerpTop(keyword, dfLogin, dfPassword);
      paa = serp.paa;
      urls = serp.topResults
        .filter((r) => !r.url.match(/habitissimo|milanuncios|paginas-amarillas|yelp|tripadvisor|google\.|facebook\.|instagram\.|youtube\./i))
        .slice(0, 3)
        .map((r) => r.url);
      console.log(` ✓ (${urls.length} URLs)`);
    } catch (e) { console.log(` ✗ (${e.message})`); urls = []; }
  }
  if (!urls?.length) return { analyses: null, paa };

  console.log(`  → Analizando ${urls.length} competidores (claude web_fetch)...`);
  const analyses = [];
  for (const url of urls) {
    process.stdout.write(`    · ${url.slice(0, 60)}...`);
    const a = fetchCompetitorPage(url);
    if (a) { analyses.push(a); console.log(' ✓'); } else console.log(' ✗ (saltado)');
  }
  return { analyses: analyses.length ? analyses : null, paa };
}

function competitorContext(analyses) {
  if (!analyses?.length) return '';
  const parts = analyses.map((a, i) => [
    `Competidor ${i + 1}: ${a.url}`,
    a.h1 ? `  H1: "${a.h1}"` : null,
    a.h2s?.length ? `  H2s: ${a.h2s.slice(0, 8).map((h) => `"${h}"`).join(', ')}` : null,
    a.wordCount ? `  ~${a.wordCount} palabras` : null,
    `  Secciones: ${['hasFaq', 'hasTestimonials', 'hasProcess', 'hasPricing'].filter((k) => a[k]).map((k) => k.slice(3)).join(', ') || 'básicas'}`,
    a.queHacenBien ? `  Qué hacen bien: ${a.queHacenBien}` : null,
    a.queLesFalta ? `  Qué les falta: ${a.queLesFalta}` : null,
  ].filter(Boolean).join('\n')).join('\n\n');

  return `ANÁLISIS DE COMPETIDORES (top de Google para esta keyword):
${parts}

INSTRUCCIÓN: no copies — crea algo superior. Cubre lo que hacen bien, añade lo que
les falta, y usa un H1 más específico y orientado al cliente que la competencia.`;
}

// ── Verificación de cobertura de keywords (el truco del checklist) ────────────

function collectStrings(obj, acc = []) {
  if (typeof obj === 'string') acc.push(obj);
  else if (Array.isArray(obj)) obj.forEach((v) => collectStrings(v, acc));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((v) => collectStrings(v, acc));
  return acc;
}

function checkCoverage(content, variants) {
  const fullText = normalize(collectStrings(content).join(' '));
  const missing = [];
  const covered = [];
  for (const v of variants) {
    const kw = typeof v === 'string' ? v : v.keyword;
    // Matching flexible: los tokens de la keyword en orden, permitiendo hasta 2
    // palabras intercaladas ("cerrajero 24 horas Granada" matchea
    // "cerrajero 24 horas EN Granada"). Es como Google entiende la integración.
    const tokens = normalize(kw).split(' ').filter(Boolean)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(tokens.join('(?:\\s+\\S+){0,2}\\s+'));
    if (re.test(fullText)) covered.push(kw);
    else missing.push(kw);
  }
  return { covered, missing };
}

function fixCoverage(content, missing) {
  console.log(`  → Reintegrando ${missing.length} keywords que faltaban...`);
  const prompt = `Este JSON es el contenido de una página web. Estas keywords del cluster NO aparecen en el texto:
${missing.map((k) => `  - "${k}"`).join('\n')}

Devuelve el MISMO JSON completo, con la misma estructura exacta, pero integrando cada
keyword que falta en la sección donde suene más natural (subheading, descripciones,
respuestas de FAQ...). Sin forzar: si una keyword de verdad no encaja en ninguna parte,
déjala fuera. No cambies nada más del contenido.

Devuelve SOLO el JSON (sin markdown):

${JSON.stringify(content)}`;
  try { return extractJson(callClaude(prompt)); }
  catch { console.log('    ⚠ no se pudo reintegrar — continúo con el contenido original'); return content; }
}

function reportCoverage(label, covered, missing) {
  console.log(`\n  CHECKLIST DE KEYWORDS (${label}):`);
  covered.forEach((k) => console.log(`    ✓ ${k}`));
  missing.forEach((k) => console.log(`    ✗ ${k}`));
}

// ── FASE 0: contexto ──────────────────────────────────────────────────────────

const INTERVIEW_QUESTIONS = [
  ['servicios', '¿Qué servicios ofrece exactamente el negocio? (describe cada uno como se lo contarías a un cliente)'],
  ['diferenciadores', '¿Por qué es mejor que la competencia? Dame ejemplos concretos, no generalidades'],
  ['rentables', '¿Qué servicios dan más margen o interesan más? ¿Por qué?'],
  ['clienteTipico', '¿Quién suele contratar? Describe 2-3 casos reales de clientes típicos'],
  ['zona', '¿Qué zona cubre? (ciudad, barrios, municipios donde se desplaza)'],
  ['proceso', '¿Cómo trabaja desde que le llaman hasta que entrega? ¿Plazos habituales?'],
  ['precios', '¿Rangos de precio orientativos que se puedan decir en la web? (o "no publicar")'],
  ['voz', 'Escribe 2-3 frases TEXTUALES de cómo habla el dueño (ej: "yo lo que hago es...")'],
];

async function interview(rl) {
  console.log('\n  MODO ENTREVISTA — responde como si fueras el dueño (o pegando lo que te contó).');
  console.log('  Cuanto más concreto, mejor saldrá el contenido. Enter en blanco para saltar.\n');
  const parts = [];
  for (const [, q] of INTERVIEW_QUESTIONS) {
    const answer = await ask(rl, q);
    if (answer) parts.push(`P: ${q}\nR: ${answer}`);
  }
  return parts.join('\n\n');
}

async function pasteTranscript(rl) {
  console.log('\n  Pega la transcripción (puede ser larga). Cuando termines, escribe FIN en una línea sola:\n');
  const lines = [];
  for (;;) {
    const line = await new Promise((res) => rl.question('', res));
    if (line.trim() === 'FIN') break;
    lines.push(line);
  }
  return lines.join('\n');
}

async function cmdContexto(args) {
  const business = loadGlobal();
  let transcript = '';

  if (args.transcript) {
    const p = path.resolve(String(args.transcript));
    if (!fs.existsSync(p)) { console.error(`✗ No existe el archivo: ${p}`); process.exit(1); }
    transcript = fs.readFileSync(p, 'utf-8');
    console.log(`  ✓ Transcripción cargada: ${p} (${transcript.split(/\s+/).length} palabras)`);
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n  ¿De dónde sacamos el contexto del negocio?');
    console.log('    1. Pegar transcripción de audios/reunión del cliente');
    console.log('    2. Entrevista (te hago las preguntas y respondes tú)');
    const mode = await ask(rl, 'Elige 1 o 2', '2');
    transcript = mode === '1' ? await pasteTranscript(rl) : await interview(rl);
    rl.close();
  }

  if (transcript.trim().split(/\s+/).length < 30) {
    console.error('\n✗ Muy poco material (mínimo ~30 palabras). El contexto saldría inventado — y eso está prohibido.');
    process.exit(1);
  }

  const knownData = [
    business.siteName && `Nombre: ${business.siteName}`,
    business.niche && `Actividad: ${business.niche}`,
    business.city && `Ciudad: ${business.city}`,
    business.phone && `Teléfono: ${business.phone}`,
    business.siteUrl && `Web: ${business.siteUrl}`,
    Array.isArray(business.areaServed) && business.areaServed.length && `Zona (config): ${business.areaServed.join(', ')}`,
  ].filter(Boolean).join('\n');

  console.log('\n  → Claude: estructurando contexto + buyer personas (esto tarda ~1 min)...');
  const prompt = `Te paso la transcripción de los audios / entrevista del dueño de un negocio local en España.

DATOS YA CONFIRMADOS DEL NEGOCIO (de la configuración de su web):
${knownData || '(ninguno)'}

PARTE 1 — Genera un documento de contexto estructurado en markdown con este formato exacto:

## DATOS DEL NEGOCIO
Nombre, actividad, ubicación, web, teléfono

## QUÉ HACE (servicios concretos)
Lista de servicios reales con descripción breve

## DIFERENCIADORES REALES
Por qué es mejor que la competencia, con ejemplos concretos de la transcripción

## SERVICIOS MÁS RENTABLES
Cuáles generan más margen o interés y por qué

## CLIENTE IDEAL
A quién le vende, casos típicos que menciona

## ZONA DE SERVICIO
Cobertura geográfica real

## VOZ Y TONO
Cómo habla el dueño. Incluye frases textuales de la transcripción que capturen su forma de expresarse.

REGLA CRÍTICA: No inventes NADA. Solo extrae y estructura lo que dice el propio cliente.
Si falta información para una sección, escribe "(sin datos — completar)".

PARTE 2 — Después, añade una sección:

## BUYER PERSONAS
Define el buyer persona principal (y secundarios si detectas más de un perfil de cliente
en la transcripción, máximo 3). Para cada uno:

### PERFIL [nombre descriptivo]
**Quién es:** edad aproximada, situación, contexto en el que surge la necesidad
**Qué quiere conseguir:** el resultado real (no el servicio técnico)
**Qué le frena o preocupa:** miedos, objeciones, malas experiencias previas
**Cómo busca en Google:** 10-12 frases textuales que escribiría este cliente
(mezcla búsquedas de urgencia y reflexivas, con y sin ciudad)
**Qué le haría elegirnos:** los 3-4 argumentos que más pesan

Para los personas sí puedes extrapolar del contexto, pero ancla cada perfil en lo que
dice la transcripción. Usa el vocabulario real del cliente, no jerga técnica.

TRANSCRIPCIÓN:
${transcript}`;

  const doc = callClaude(prompt);
  const header = `<!-- Generado por seo-wizard (fase contexto) el ${new Date().toISOString().split('T')[0]}.
     Fuente: ${args.transcript ? 'transcripción' : 'entrevista'}. REVÍSALO: es la base de todo el contenido. -->\n\n`;
  fs.writeFileSync(CONTEXTO_PATH, header + doc.trim() + '\n', 'utf-8');

  console.log(`\n  ✓ Contexto guardado en src/content/business/contexto.md`);
  console.log('\n  ⚠ REVISA el documento antes de seguir (corrige lo que Claude haya entendido mal).');
  console.log('  Siguiente paso:  npm run seo-wizard plan');
}

// ── FASE 1: plan ──────────────────────────────────────────────────────────────

function readCsvDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => /\.csv$/i.test(f));
  const chunks = [];
  for (const f of files) {
    let buf = fs.readFileSync(path.join(dir, f));
    let text;
    // Keyword Planner exporta UTF-16LE con tabs; detectar BOM
    if (buf[0] === 0xff && buf[1] === 0xfe) text = buf.toString('utf16le');
    else text = buf.toString('utf-8');
    const lines = text.split('\n').slice(0, 250).join('\n');
    chunks.push(`--- CSV: ${f} ---\n${lines}`);
  }
  return chunks.join('\n\n');
}

async function cmdPlan(args) {
  const contexto = loadContexto();
  if (!contexto) {
    console.error('✗ Falta src/content/business/contexto.md — ejecuta antes: npm run seo-wizard contexto');
    process.exit(1);
  }
  const business = loadGlobal();
  const env = loadEnv();
  const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
  const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;
  const city = business.city || 'la ciudad';

  // ── Paso A: brainstorm de arquitectura (playbook 03) ──
  console.log('  → Claude: brainstorming de arquitectura (solo transaccional)...');
  const brainstorm = extractJson(callClaude(`Basándote en este contexto de negocio y sus buyer personas:

${contexto}

PARTE 1 — Dame hasta 10 ideas de servicios que podrían tener página propia en la web.
Condiciones:
- Solo servicios que el negocio realmente ofrece según el contexto
- Solo intención transaccional (el usuario quiere contratar, no informarse)
- Evita solapamientos que canibalizen la misma intención de búsqueda

PARTE 2 — Para la home, define la keyword principal del negocio ("actividad + ${city}").

Zona geográfica: ${city}

Devuelve SOLO JSON:
{
  "home": { "keyword": "actividad en ${city}", "seeds": ["variante 1", "variante 2", "variante 3"] },
  "services": [
    { "title": "Nombre del servicio", "keyword": "keyword transaccional con ciudad", "seeds": ["variante"], "razon": "por qué merece página propia", "prioridad": 1 }
  ]
}
Ordena services de mayor a menor potencial de negocio (no de volumen).`));

  // ── Paso B: validación con datos reales (playbook 04) ──
  let volumeData = '';
  let validated = false;

  if (args.csv) {
    const dir = path.resolve(String(args.csv));
    if (!fs.existsSync(dir)) { console.error(`✗ No existe la carpeta: ${dir}`); process.exit(1); }
    console.log(`  → Leyendo CSVs de Keyword Planner en ${dir}...`);
    volumeData = `CSVs EXPORTADOS DE GOOGLE KEYWORD PLANNER:\n${readCsvDir(dir)}`;
    validated = true;
  } else if (dfLogin && dfPassword) {
    console.log('  → DataForSEO: validando volúmenes reales...');
    const allSeeds = [
      brainstorm.home.keyword, ...(brainstorm.home.seeds || []),
      ...brainstorm.services.flatMap((s) => [s.keyword, ...(s.seeds || [])]),
    ];
    const volumes = await dfsVolumes([...new Set(allSeeds)], dfLogin, dfPassword);
    const relatedLines = [];
    for (const kw of [brainstorm.home.keyword, ...brainstorm.services.slice(0, 6).map((s) => s.keyword)]) {
      process.stdout.write(`    · related "${kw}"...`);
      try {
        const rel = await dfsRelated(kw, dfLogin, dfPassword, 15);
        relatedLines.push(`"${kw}" → ${rel.map((r) => `${r.keyword} (${r.volume}/mes)`).join(', ') || 'sin datos'}`);
        console.log(' ✓');
      } catch { console.log(' ✗'); }
    }
    volumeData = `VOLÚMENES REALES (Google Ads, España):
${Object.entries(volumes).map(([k, v]) => `  - "${k}": ${v}/mes`).join('\n')}

KEYWORDS RELACIONADAS POR SEMILLA:
${relatedLines.join('\n')}`;
    validated = true;
  } else {
    console.log('  ⚠ Sin DataForSEO ni CSVs — el plan quedará SIN VALIDAR (hipótesis).');
    console.log('    Valida después con: npm run seo-wizard plan -- --csv carpeta-csvs/');
    volumeData = '(Sin datos de volumen — trabaja solo con las hipótesis del brainstorm)';
  }

  // ── Paso C: clustering + asignación (playbook 04) ──
  console.log('  → Claude: limpieza, clustering y variantes exhaustivas...');
  const clusters = extractJson(callClaude(`Eres un SEO experto en negocios locales. Tenemos esta arquitectura propuesta:

HOME → keyword principal: "${brainstorm.home.keyword}"
SERVICIOS:
${brainstorm.services.map((s, i) => `${i + 1}. ${s.title} → "${s.keyword}" (${s.razon})`).join('\n')}

Y estos datos de keywords:
${volumeData}

TAREA:
1. LIMPIEZA — descarta keywords irrelevantes: marcas de competidores, términos puramente
   informativos (qué es, cómo funciona...), y cualquier intención no transaccional.
2. AGRUPACIÓN — agrupa las keywords válidas por intención de búsqueda real.
3. ASIGNACIÓN — asigna cada grupo a la página correspondiente (home o servicio).
   Si dos páginas propuestas atacan la misma intención, fusiónalas y dilo en "notas".
4. VARIANTES EXHAUSTIVAS — para cada página, lista TODAS las variantes semánticas reales.
   Solo variantes con diferencia semántica real (nada de singular/plural o cambio de orden).

Devuelve SOLO JSON:
{
  "notas": "observaciones importantes (fusiones, keywords dudosas, oportunidades)",
  "home": { "keyword": "...", "volumen": 320, "variantes": [{"kw": "...", "vol": 90}] },
  "services": [
    { "title": "...", "slug": "sugerencia-slug-con-ciudad", "keyword": "...", "volumen": 210,
      "variantes": [{"kw": "...", "vol": 50}], "prioridad": 1, "razon": "..." }
  ]
}
Usa volumen null si no hay dato. Ordena services por potencial de negocio.`));

  // ── Montar el plan (+ zonas desde areaServed) ──
  const zonas = (business.areaServed || [])
    .filter((z) => z && z !== business.city)
    .map((z) => ({
      type: 'zona', slug: toSlug(z), title: z,
      keyword: `${(business.niche || 'servicio').toLowerCase()} ${z}`,
      volumen: null, variantes: [], prioridad: 9, status: 'pendiente',
    }));

  const plan = {
    generatedAt: new Date().toISOString(),
    city, niche: business.niche || '', validated,
    notas: clusters.notas || '',
    pages: [
      { type: 'home', slug: 'home', title: 'Página de inicio', keyword: clusters.home.keyword,
        volumen: clusters.home.volumen ?? null, variantes: clusters.home.variantes || [], prioridad: 0, status: 'pendiente' },
      ...clusters.services.map((s) => ({
        type: 'service', slug: s.slug || toSlug(s.title), title: s.title, keyword: s.keyword,
        volumen: s.volumen ?? null, variantes: s.variantes || [], prioridad: s.prioridad ?? 5,
        razon: s.razon || '', status: 'pendiente',
      })),
      ...zonas,
    ],
  };
  savePlan(plan);

  console.log(`\n  ✓ Plan guardado en seo_plan.json ${validated ? '(validado con datos reales)' : '(⚠ SIN validar)'}`);
  if (plan.notas) console.log(`\n  Notas: ${plan.notas}`);
  printPlan(plan);
  console.log('\n  ⚠ Revisa seo_plan.json (borra/edita páginas que no encajen) antes de generar.');
  console.log('  Siguiente paso:  npm run seo-wizard home');
}

function printPlan(plan) {
  console.log('\n  PLAN DE CONTENIDOS:');
  for (const p of plan.pages) {
    const vol = p.volumen ? ` · ${p.volumen}/mes` : '';
    const vars = p.variantes?.length ? ` · ${p.variantes.length} variantes` : '';
    const mark = p.status === 'generada' ? '✓' : '○';
    console.log(`    ${mark} [${p.type}] ${p.slug} — "${p.keyword}"${vol}${vars}`);
  }
}

// ── Reglas de redacción compartidas (playbook 08 + 09) ────────────────────────

const WRITING_RULES = `REGLAS DE REDACCIÓN (obligatorias):
1. Español natural, como habla el dueño del negocio — consulta VOZ Y TONO del contexto
   y úsala: el texto debe sonar a él, no a una agencia
2. PROHIBIDAS las frases genéricas: "somos líderes", "amplia experiencia", "máxima calidad",
   "equipo altamente cualificado", "soluciones integrales", "a la vanguardia"
3. Usa los DIFERENCIADORES REALES del contexto, con sus ejemplos concretos
4. La intro engancha en las 2 primeras frases (problema del cliente, no descripción de empresa)
5. CTAs específicos con urgencia o beneficio ("Te llamamos en 1h", "Visita gratis esta semana")
   — nunca "contáctanos" a secas
6. Cada título de sección (H2/H3) integra una variante REAL del cluster — no keyword
   principal repetida, no títulos sin búsqueda detrás tipo "Nuestros servicios"
7. El orden del contenido sigue la progresión del usuario: llega → entiende → confía → decide
8. Responde a los miedos del buyer persona en features y FAQ (los tienes en el contexto)`;

const FAQ_RULES = `INSTRUCCIONES FAQ:
faqSeo — 5 preguntas transaccionales que se escriben en Google:
- Formato answer-first: la primera frase responde directamente
- Incluye keyword y ciudad de forma natural
faqGeo — 5 preguntas conversacionales para LLMs (ChatGPT, Perplexity):
- Las que haría alguien a un amigo antes de contratar
- Respuestas AUTOCONTENIDAS (citables sin contexto), 60-100 palabras cada una
- Cada respuesta menciona la zona geográfica al menos una vez de forma natural
- Menciona el nombre del negocio en al menos 3 de las 5
- Basadas en el contexto real — no inventes datos ni precios
- NO repitas preguntas de faqSeo`;

// ── FASE 2: home ──────────────────────────────────────────────────────────────

async function cmdHome(args) {
  const contexto = loadContexto();
  const plan = loadPlan();
  if (!contexto) { console.error('✗ Falta contexto.md — ejecuta: npm run seo-wizard contexto'); process.exit(1); }
  if (!plan) { console.error('✗ Falta seo_plan.json — ejecuta: npm run seo-wizard plan'); process.exit(1); }

  const page = plan.pages.find((p) => p.type === 'home');
  const business = loadGlobal();
  const env = loadEnv();
  const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
  const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;

  const competitorUrls = args.competitors ? String(args.competitors).split(',').map((u) => u.trim()) : null;
  const { analyses, paa } = await analyzeCompetitors({ keyword: page.keyword, competitorUrls, dfLogin, dfPassword });

  const variantesStr = page.variantes.length
    ? page.variantes.map((v) => `  - "${v.kw}"${v.vol ? ` (${v.vol}/mes)` : ''}`).join('\n')
    : '  (sin variantes en el plan)';

  console.log('  → Claude: generando la HOME (jerarquía + texto + copy + FAQ GEO)...');
  let content = extractJson(callClaude(`Eres un especialista en SEO local y copywriting para negocios de servicios en España.
Vas a escribir la PÁGINA DE INICIO completa de este negocio.

CONTEXTO REAL DEL NEGOCIO Y BUYER PERSONAS:
${contexto}

KEYWORD PRINCIPAL: "${page.keyword}"
VARIANTES DEL CLUSTER QUE DEBEN APARECER EN EL TEXTO (todas las que encajen):
${variantesStr}

${analyses ? competitorContext(analyses) : ''}
${paa?.length ? `PREGUNTAS "PEOPLE ALSO ASK" EN GOOGLE:\n${paa.map((q) => `  - ${q}`).join('\n')}` : ''}

${WRITING_RULES}

${FAQ_RULES}

Devuelve SOLO un objeto JSON válido (sin markdown) con esta estructura EXACTA:
{
  "seoTitle": "máx 45 caracteres, keyword + ciudad — SIN el nombre del negocio (la web lo añade automáticamente al final)",
  "seoDescription": "máx 155 caracteres, keyword + ciudad + CTA",
  "hero": {
    "heading": "H1 sin la parte destacada (ej: 'Carpintería de aluminio en')",
    "headingHighlight": "parte destacada del H1 (normalmente la ciudad)",
    "subheading": "2 frases que enganchan: problema del cliente + promesa concreta",
    "features": ["beneficio concreto 1", "beneficio 2", "beneficio 3"],
    "ctaPrimaryText": "CTA específico"
  },
  "homeIntro": {
    "heading": "H2 con variante del cluster",
    "paragraph": "3-4 frases: quién eres, qué haces, para quién, con qué diferenciadores reales. Voz del dueño."
  },
  "features": {
    "title": "H2 con variante (por qué elegirnos)",
    "items": [
      { "title": "diferenciador real", "description": "1-2 frases concretas del contexto", "icon": "IconoLucide" },
      { "title": "...", "description": "...", "icon": "..." },
      { "title": "...", "description": "...", "icon": "..." }
    ]
  },
  "servicesIntro": { "title": "H2 servicios con variante", "titleHighlight": "en [ciudad]", "subtitle": "1-2 frases" },
  "about": {
    "title": "H2 sobre el negocio (sin la parte destacada)", "titleHighlight": "parte destacada",
    "description": "3-4 frases con la historia/experiencia REAL del contexto",
    "yearsExperience": "ej '15+' — SOLO si el contexto lo dice, sino ''",
    "features": [ { "title": "...", "description": "...", "icon": "..." }, { "title": "...", "description": "...", "icon": "..." } ]
  },
  "process": {
    "title": "H2 cómo trabajamos con variante si encaja", "subtitle": "1 frase",
    "steps": [
      { "title": "1. ...", "description": "cómo lo hace ESTE negocio según el contexto", "icon": "IconoLucide", "duration": "plazo real o ''" },
      { "title": "2. ...", "description": "...", "icon": "...", "duration": "..." },
      { "title": "3. ...", "description": "...", "icon": "...", "duration": "..." },
      { "title": "4. ...", "description": "...", "icon": "...", "duration": "..." }
    ]
  },
  "serviceAreas": {
    "title": "H2 zona de servicio con variante geográfica",
    "subtitle": "1-2 frases sobre desplazamiento/cobertura según contexto",
    "group1": { "title": "título zona principal", "description": "1 frase",
      "items": [ { "name": "barrio o zona real de la ciudad", "popular": true }, { "name": "...", "popular": false }, { "name": "...", "popular": false }, { "name": "...", "popular": false } ] },
    "group2": { "title": "título municipios", "description": "1 frase" }
  },
  "faqSeo": [ { "question": "...", "answer": "..." }, {}, {}, {}, {} ],
  "faqGeo": [ { "question": "...", "answer": "..." }, {}, {}, {}, {} ],
  "cta": { "title": "pregunta o llamada con keyword", "subtitle": "refuerza propuesta", "buttonText": "CTA específico" },
  "contact": { "title": "H2 contacto", "subtitle": "1 frase con plazo de respuesta real si lo hay" }
}

Iconos Lucide válidos: ShieldCheck, Clock, Users, FileCheck, Star, MapPin, Wrench, CheckCircle, Phone, Zap, Award, Hammer, Home, Building, Key, Truck, Ruler, ClipboardCheck, FileText, BadgeCheck.`,
  { timeoutMs: 300_000 }));

  // Checklist de cobertura (playbook 08) + reintegración
  const allVariants = [page.keyword, ...page.variantes.map((v) => v.kw)];
  let { covered, missing } = checkCoverage(content, allVariants);
  if (missing.length) {
    content = fixCoverage(content, missing);
    ({ covered, missing } = checkCoverage(content, allVariants));
  }
  reportCoverage('home', covered, missing);

  if (args['dry-run'] || args.dry) {
    console.log('\n  [DRY RUN] JSON generado (no se escribe home.mdx):\n');
    console.log(JSON.stringify(content, null, 2).slice(0, 4000));
    return;
  }

  // Backup + escribir
  if (fs.existsSync(HOME_PATH)) {
    const bak = HOME_PATH.replace(/\.mdx$/, `.bak-${Date.now()}.mdx`);
    fs.copyFileSync(HOME_PATH, bak);
    console.log(`\n  ✓ Backup de la home anterior: ${path.relative(ROOT, bak)}`);
  }
  fs.writeFileSync(HOME_PATH, buildHomeMdx(content, business), 'utf-8');
  page.status = 'generada';
  savePlan(plan);

  console.log('  ✓ src/content/pages/home.mdx generada');
  console.log('\n  ⚠ PENDIENTE MANUAL: imagen del hero, y testimonios REALES desde Keystatic');
  console.log('    (no se generan testimonios inventados — política del template).');
  console.log('  Revisa en local:  npm run dev → http://localhost:4321');
  console.log('  Siguiente paso:   npm run seo-wizard service <slug>  (mira: npm run seo-wizard status)');
}

function yamlStr(s) { return `'${ys(s ?? '')}'`; }

function buildHomeMdx(c, business) {
  // index.astro añade " | siteName" al title automáticamente — evitar marca duplicada
  let title = String(c.seoTitle || '');
  if (business.siteName) {
    title = title.replace(new RegExp(`\\s*[|–—-]\\s*${business.siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'), '');
  }
  const seoJson = JSON.stringify({ title, description: c.seoDescription });
  const li = (arr, indent) => arr.map((x) => `${indent}- ${yamlStr(x)}`).join('\n');
  const featureItems = (items, indent) => (items || []).map((it) =>
    `${indent}- title: ${yamlStr(it.title)}\n${indent}  description: ${yamlStr(it.description)}\n${indent}  icon: ${it.icon || 'CheckCircle'}`).join('\n');

  const allFaq = [...(c.faqSeo || []), ...(c.faqGeo || [])].filter((f) => f.question);
  const faqItems = allFaq.map((f) =>
    `        - question: ${yamlStr(f.question)}\n          answer: >-\n${String(f.answer).split('\n').map((l) => `            ${l}`).join('\n')}\n          category: ''`).join('\n');

  const g1items = (c.serviceAreas?.group1?.items || []).map((it) =>
    `          - name: ${yamlStr(it.name)}\n            description: ''\n            icon: MapPin\n            popular: ${it.popular ? 'true' : 'false'}`).join('\n');
  const g2items = (business.areaServed || []).filter((z) => z !== business.city).slice(0, 8).map((z) =>
    `          - name: ${yamlStr(z)}\n            supplement: ''\n            icon: MapPin`).join('\n');

  const steps = (c.process?.steps || []).map((s) =>
    `        - title: ${yamlStr(s.title)}\n          description: ${yamlStr(s.description)}\n          icon: ${s.icon || 'CheckCircle'}\n          duration: ${yamlStr(s.duration || '')}`).join('\n');

  return `---
seoControls: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: ${yamlStr(c.hero.heading)}
      headingHighlight: ${yamlStr(c.hero.headingHighlight)}
      subheading: >-
        ${String(c.hero.subheading).split('\n').join(' ')}
      ctaPrimaryText: ${yamlStr(c.hero.ctaPrimaryText)}
      ctaSecondaryText: WhatsApp
      ctaPrimaryLink: '#contacto'
      ctaSecondaryLink: ''
      features:
${li(c.hero.features || [], '        ')}
      titleTag: h1
      backgroundImageAlt: ''

  - discriminant: home_intro
    value:
      heading: ${yamlStr(c.homeIntro.heading)}
      paragraph: >-
        ${String(c.homeIntro.paragraph).split('\n').join(' ')}

  - discriminant: features
    value:
      title: ${yamlStr(c.features.title)}
      titleTag: h2
      variant: grid
      features:
${featureItems(c.features.items, '        ')}

  - discriminant: services_grid
    value:
      variant: featured
      title: ${yamlStr(c.servicesIntro?.title || 'Nuestros servicios')}
      titleHighlight: ${yamlStr(c.servicesIntro?.titleHighlight || '')}
      subtitle: >-
        ${String(c.servicesIntro?.subtitle || '').split('\n').join(' ')}
      services: {}

  - discriminant: about
    value:
      title: ${yamlStr(c.about.title)}
      titleHighlight: ${yamlStr(c.about.titleHighlight || '')}
      titleTag: h2
      description: >-
        ${String(c.about.description).split('\n').join(' ')}
      yearsExperience: ${yamlStr(c.about.yearsExperience || '')}
      projectsCompleted: ''
      image: null
      features:
${featureItems(c.about.features, '        ')}
      buttonText: Quiénes somos
      buttonLink: /nosotros/

  - discriminant: process
    value:
      title: ${yamlStr(c.process.title)}
      subtitle: ${yamlStr(c.process.subtitle || '')}
      titleTag: h2
      variant: timeline
      steps:
${steps}

  - discriminant: service_areas
    value:
      title: ${yamlStr(c.serviceAreas?.title || 'Dónde trabajamos')}
      subtitle: >-
        ${String(c.serviceAreas?.subtitle || '').split('\n').join(' ')}
      group1:
        title: ${yamlStr(c.serviceAreas?.group1?.title || business.city || '')}
        description: ${yamlStr(c.serviceAreas?.group1?.description || '')}
        items:
${g1items}
      group2:
        title: ${yamlStr(c.serviceAreas?.group2?.title || 'Municipios cercanos')}
        description: ${yamlStr(c.serviceAreas?.group2?.description || '')}
        note: ''
        items:
${g2items}

  - discriminant: faq
    value:
      title: ${yamlStr(`Preguntas frecuentes`)}
      subtitle: ''
      variant: accordion
      questions:
${faqItems}

  - discriminant: contact
    value:
      title: ${yamlStr(c.contact?.title || 'Pide tu presupuesto gratuito')}
      subtitle: ${yamlStr(c.contact?.subtitle || '')}
      description: ''
      phone: ''
      whatsapp: ''
      email: ''
      schedule: ''
      responseTime: menos de 24 horas

  - discriminant: cta
    value:
      title: ${yamlStr(c.cta.title)}
      subtitle: >-
        ${String(c.cta.subtitle).split('\n').join(' ')}
      titleTag: h2
      buttonText: ${yamlStr(c.cta.buttonText)}
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida

seoContentTitle: ''
stickyPhone: true
---
`;
}

// ── FASE 3: service / zona ────────────────────────────────────────────────────

async function cmdPage(type, args) {
  const contexto = loadContexto();
  const plan = loadPlan();
  if (!contexto || !plan) {
    console.error('✗ Faltan contexto.md o seo_plan.json — ejecuta las fases contexto y plan primero.');
    process.exit(1);
  }
  const slug = args._[1];
  if (!slug) {
    console.error(`✗ Falta el slug. Páginas ${type} del plan:`);
    plan.pages.filter((p) => p.type === type).forEach((p) => console.error(`    ${p.status === 'generada' ? '✓' : '○'} ${p.slug} — "${p.keyword}"`));
    process.exit(1);
  }
  const page = plan.pages.find((p) => p.type === type && p.slug === slug);
  if (!page) { console.error(`✗ No existe "${slug}" (tipo ${type}) en seo_plan.json`); process.exit(1); }

  const business = loadGlobal();
  const env = loadEnv();
  const dfLogin = process.env.DATAFORSEO_LOGIN || env.DATAFORSEO_LOGIN;
  const dfPassword = process.env.DATAFORSEO_PASSWORD || env.DATAFORSEO_PASSWORD;
  const competitorUrls = args.competitors ? String(args.competitors).split(',').map((u) => u.trim()) : null;
  const { analyses, paa } = await analyzeCompetitors({ keyword: page.keyword, competitorUrls, dfLogin, dfPassword });

  const variantesStr = page.variantes.length
    ? page.variantes.map((v) => `  - "${v.kw}"${v.vol ? ` (${v.vol}/mes)` : ''}`).join('\n')
    : '  (sin variantes — integra la keyword principal y derivados naturales)';

  const isService = type === 'service';
  console.log(`  → Claude: generando página de ${isService ? 'servicio' : 'zona'} "${page.title}"...`);

  let content = extractJson(callClaude(`Eres un especialista en SEO local y copywriting para negocios de servicios en España.
Genera el contenido de una página de ${isService ? `servicio: "${page.title}"` : `zona geográfica: "${page.title}"`}.

CONTEXTO REAL DEL NEGOCIO Y BUYER PERSONAS:
${contexto}

KEYWORD PRINCIPAL: "${page.keyword}"
VARIANTES DEL CLUSTER QUE DEBEN APARECER (todas las que encajen):
${variantesStr}
${isService ? '' : `\nESTA PÁGINA es para clientes de ${page.title}: adapta ejemplos, desplazamiento y cercanía a ese municipio. NO dupliques el contenido de la home — enfócalo 100% local.`}

${analyses ? competitorContext(analyses) : ''}
${paa?.length ? `PREGUNTAS "PEOPLE ALSO ASK":\n${paa.map((q) => `  - ${q}`).join('\n')}` : ''}

${WRITING_RULES}

${FAQ_RULES}

Devuelve SOLO un objeto JSON válido:
{
  "seoTitle": "máx 60 chars: keyword + ${isService ? 'ciudad' : 'municipio'} + ' | ' + nombre del negocio",
  "seoDescription": "máx 155 chars con CTA",
  "shortDesc": "máx 115 chars para tarjeta",
  "hero": {
    "heading": "H1 sin parte destacada", "headingHighlight": "parte destacada",
    "subheading": "2 frases que enganchan", "features": ["b1", "b2", "b3"],
    "ctaPrimaryText": "CTA específico"
  },
  "trustStrip": [ { "icon": "IconoLucide", "label": "corto" }, {}, {}, {} ],
  "featuresSection": { "title": "H2 con variante", "items": [ { "title": "...", "description": "...", "icon": "..." }, {}, {} ] },
  "faqSeo": [ { "question": "...", "answer": "..." }, {}, {}, {}, {} ],
  "faqGeo": [ { "question": "...", "answer": "..." }, {}, {}, {}, {} ],
  "cta": { "title": "...", "subtitle": "...", "buttonText": "..." }
}

Iconos Lucide válidos: ShieldCheck, Clock, Users, FileCheck, Star, MapPin, Wrench, CheckCircle, Phone, Zap, Award, Hammer, Home, Building, Key, Truck, Ruler.`,
  { timeoutMs: 300_000 }));

  const allVariants = [page.keyword, ...page.variantes.map((v) => v.kw)];
  let { covered, missing } = checkCoverage(content, allVariants);
  if (missing.length) {
    content = fixCoverage(content, missing);
    ({ covered, missing } = checkCoverage(content, allVariants));
  }
  reportCoverage(page.slug, covered, missing);

  if (args['dry-run'] || args.dry) {
    console.log('\n  [DRY RUN] JSON generado:\n');
    console.log(JSON.stringify(content, null, 2).slice(0, 3000));
    return;
  }

  const outDir = path.join(ROOT, isService ? 'src/content/services' : 'src/content/locations');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${page.slug}.mdx`);
  if (fs.existsSync(outPath)) {
    const bak = outPath.replace(/\.mdx$/, `.bak-${Date.now()}.mdx`);
    fs.copyFileSync(outPath, bak);
    console.log(`  ✓ Backup: ${path.relative(ROOT, bak)}`);
  }
  fs.writeFileSync(outPath, isService
    ? buildServiceMdx(content, page)
    : buildZonaMdx(content, page), 'utf-8');
  page.status = 'generada';
  savePlan(plan);

  console.log(`  ✓ ${path.relative(ROOT, outPath)} generada`);
  console.log(`  ⚠ Pendiente manual: imagen hero del ${isService ? 'servicio' : 'municipio'} desde Keystatic`);
}

function buildServiceMdx(c, page) {
  const seoJson = JSON.stringify({ title: c.seoTitle, description: c.seoDescription });
  const heroFeatures = (c.hero.features || []).map((f) => `        - ${yamlStr(f)}`).join('\n');
  const trustItems = (c.trustStrip || []).filter((t) => t.label).map((t) =>
    `        - icon: ${t.icon || 'CheckCircle'}\n          label: ${yamlStr(t.label)}\n          description: ''`).join('\n');
  const featureItems = (c.featuresSection?.items || []).map((it) =>
    `        - title: ${yamlStr(it.title)}\n          description: ${yamlStr(it.description)}\n          icon: ${it.icon || 'CheckCircle'}`).join('\n');
  const allFaq = [...(c.faqSeo || []), ...(c.faqGeo || [])].filter((f) => f.question);
  const faqItems = allFaq.map((f) =>
    `          - question: ${yamlStr(f.question)}\n            answer: >-\n${String(f.answer).split('\n').map((l) => `              ${l}`).join('\n')}`).join('\n');

  return `---
title: ${yamlStr(page.title)}
icon: Wrench
shortDesc: ${yamlStr(c.shortDesc)}
featured: true
seo: '${ys(seoJson)}'
blocks:
  - discriminant: hero
    value:
      heading: ${yamlStr(c.hero.heading)}
      headingHighlight: ${yamlStr(c.hero.headingHighlight)}
      subheading: ${yamlStr(c.hero.subheading)}
      ctaPrimaryText: ${yamlStr(c.hero.ctaPrimaryText)}
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
      title: ${yamlStr(c.featuresSection?.title || '')}
      titleTag: h2
      variant: grid
      features:
${featureItems}

  - discriminant: faq
    value:
      title: ${yamlStr(`Preguntas frecuentes sobre ${page.keyword}`)}
      variant: accordion
      faqs:
${faqItems}

  - discriminant: cta
    value:
      title: ${yamlStr(c.cta.title)}
      subtitle: ${yamlStr(c.cta.subtitle)}
      titleTag: h2
      buttonText: ${yamlStr(c.cta.buttonText)}
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida
---
`;
}

function buildZonaMdx(c, page) {
  const seoJson = JSON.stringify({ title: c.seoTitle, description: c.seoDescription });
  const allFaq = [...(c.faqSeo || []), ...(c.faqGeo || [])].filter((f) => f.question);
  const faqItems = allFaq.map((f) =>
    `  - question: ${yamlStr(f.question)}\n    answer: >-\n${String(f.answer).split('\n').map((l) => `      ${l}`).join('\n')}`).join('\n');

  return `---
name: ${yamlStr(page.title)}
type: residencial
zipCodes: []
seo: '${ys(seoJson)}'
faq:
${faqItems}
blocks:
  - discriminant: hero
    value:
      heading: ${yamlStr(c.hero.heading)}
      headingHighlight: ${yamlStr(c.hero.headingHighlight)}
      subheading: ${yamlStr(c.hero.subheading)}
      ctaPrimaryText: ${yamlStr(c.hero.ctaPrimaryText)}
      ctaSecondaryText: WhatsApp
      ctaPrimaryLink: '#contacto'
      ctaSecondaryLink: ''
      titleTag: h1
      features:
${(c.hero.features || []).map((f) => `        - ${yamlStr(f)}`).join('\n')}

  - discriminant: features
    value:
      title: ${yamlStr(c.featuresSection?.title || '')}
      titleTag: h2
      variant: grid
      features:
${(c.featuresSection?.items || []).map((it) => `        - title: ${yamlStr(it.title)}\n          description: ${yamlStr(it.description)}\n          icon: ${it.icon || 'CheckCircle'}`).join('\n')}
---
`;
}

// ── status ────────────────────────────────────────────────────────────────────

function cmdStatus() {
  const plan = loadPlan();
  const contexto = loadContexto();
  console.log(`\n  Fase 0 contexto:  ${contexto ? '✓ src/content/business/contexto.md' : '○ pendiente — npm run seo-wizard contexto'}`);
  console.log(`  Fase 1 plan:      ${plan ? `✓ seo_plan.json (${plan.validated ? 'validado' : '⚠ sin validar'})` : '○ pendiente — npm run seo-wizard plan'}`);
  if (plan) {
    printPlan(plan);
    const done = plan.pages.filter((p) => p.status === 'generada').length;
    console.log(`\n  Progreso: ${done}/${plan.pages.length} páginas generadas`);
  }
  console.log('');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const HELP = `
seo-wizard — pipeline SEO por fases (contexto → plan → home → servicios/zonas)

  npm run seo-wizard contexto [-- --transcript audios.txt]  Fase 0: contexto real + buyer personas
  npm run seo-wizard plan     [-- --csv carpeta-csvs/]      Fase 1: arquitectura + keywords validadas
  npm run seo-wizard home     [-- --competitors u1,u2]      Fase 2: generar la home
  npm run seo-wizard service <slug>                         Fase 3: generar servicio del plan
  npm run seo-wizard zona <slug>                            Fase 3: generar zona del plan
  npm run seo-wizard status                                 Progreso del plan

Flags comunes: --dry-run (no escribe archivos), --competitors url1,url2,url3
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case 'contexto': await cmdContexto(args); break;
    case 'plan': await cmdPlan(args); break;
    case 'home': await cmdHome(args); break;
    case 'service': await cmdPage('service', args); break;
    case 'zona': await cmdPage('zona', args); break;
    case 'status': cmdStatus(); break;
    default:
      console.log(HELP);
      if (cmd) { console.error(`✗ Comando desconocido: ${cmd}`); process.exit(1); }
  }
}

main().catch((err) => { console.error(`\n✗ ${err.message}`); process.exit(1); });
