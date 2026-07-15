#!/usr/bin/env node
/**
 * seo-wizard — Pipeline SEO por fases (adaptación del playbook Rank Masters al template).
 *
 * Cada fase alimenta a la siguiente. El estado vive en archivos del proyecto:
 *   Todos los documentos se guardan numerados en seo-proyecto/ para revisarlos en orden:
 *   00-material-cliente.txt · 01-contexto.md · 02-buyer-personas.md · 03-plan.md (+plan.json)
 *   · 04+-<pagina>.md (revisión de cada página; el .mdx real va a src/content/).
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

// Carpeta de trabajo: todos los artefactos numerados y revisables en orden.
const WORKSPACE = path.join(ROOT, 'seo-proyecto');
const PREGUNTAS_PATH = path.join(WORKSPACE, '00-preguntas-cliente.md');
const CONTEXTO_PATH = path.join(WORKSPACE, '01-contexto.md');
const PERSONAS_PATH = path.join(WORKSPACE, '02-buyer-personas.md');
const PLAN_MD_PATH = path.join(WORKSPACE, '03-plan.md');
const PLAN_PATH = path.join(WORKSPACE, 'plan.json'); // estado máquina que lee el wizard
const GLOBAL_PATH = path.join(ROOT, 'src/content/business/global.yaml');
const HOME_PATH = path.join(ROOT, 'src/content/pages/home.mdx');

function ensureWorkspace() {
  if (!fs.existsSync(WORKSPACE)) fs.mkdirSync(WORKSPACE, { recursive: true });
}
function pageReviewPath(n, slug) {
  return path.join(WORKSPACE, `${String(n).padStart(2, '0')}-${slug}.md`);
}

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

function loadPersonas() {
  if (!fs.existsSync(PERSONAS_PATH)) return null;
  return fs.readFileSync(PERSONAS_PATH, 'utf-8');
}

function loadPlan() {
  if (!fs.existsSync(PLAN_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8')); } catch { return null; }
}

function savePlan(plan) {
  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2), 'utf-8');
}

// ── Claude CLI ────────────────────────────────────────────────────────────────

// Corre dentro de un repo de Claude Code: sin esto, el modelo se comporta como agente de
// código y, ante prompts largos tipo "documento", intenta escribir el archivo él mismo y
// devuelve un mensaje pidiendo permiso en vez del contenido. Con esto responde como una
// API de texto pura. --allowedTools "" es la segunda barrera (bloquea la escritura aunque
// lo intente); esta es la que evita que lo intente y contamine la salida.
const PURE_TEXT_SYSTEM_PROMPT = 'Eres una API de generación de texto puro, no un asistente ' +
  'de código. NUNCA intentes escribir, crear, editar o guardar archivos, ni menciones que ' +
  'no tienes permiso de escritura, ni uses ninguna herramienta. Simplemente devuelve el ' +
  'texto o JSON solicitado directamente como tu respuesta, sin explicaciones sobre tus ' +
  'capacidades ni peticiones de aprobación.';

function callClaude(prompt, { timeoutMs = 240_000, tools = [], retries = 1 } = {}) {
  // tools: herramientas permitidas. Por defecto [] → `--allowedTools ""` DESACTIVA todas.
  // Las llamadas que analizan competidores pasan tools: ['WebFetch'].
  const cliArgs = ['--print', '--allowedTools', tools.join(','), '--append-system-prompt', PURE_TEXT_SYSTEM_PROMPT];

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

// ── FASE 0a: preguntas (cuestionario de discovery para el CLIENTE) ────────────
// Playbook Paso 01: "pídele al cliente que te mande notas de voz contándote sus
// servicios, diferenciadores, clientes y cómo trabaja". Esto genera ese cuestionario.

async function cmdPreguntas() {
  ensureWorkspace();
  const business = loadGlobal();
  const negocio = [business.siteName, business.niche, business.city].filter(Boolean).join(' · ') || 'el negocio';

  console.log('  → Claude: generando el cuestionario de discovery para el cliente...');
  const doc = callClaude(`Genera un cuestionario de discovery para enviarle al DUEÑO de un negocio local
(${negocio}) para que responda por audios de WhatsApp o por escrito. El objetivo es
recoger la materia prima real con la que luego se escribirá su web. Preséntalo como un
mensaje amable y directo que el dueño pueda contestar hablando suelto.

Cubre, con preguntas concretas y con ejemplos que le ayuden a explayarse:
1. Servicios exactos que ofrece (que describa cada uno con sus palabras)
2. Diferenciadores REALES con ejemplos concretos (qué hace distinto a otros de su gremio)
3. Qué servicios le dan más margen o le interesan más
4. Clientes típicos: 2-3 casos reales de trabajos que haya hecho
5. Zona que cubre de verdad
6. Cómo trabaja de principio a fin y plazos habituales
7. Si tiene taller propio, garantía, si atiende urgencias, certificaciones
8. Precios orientativos que se puedan publicar (o si prefiere no publicarlos)

Termínalo recordándole que hable con naturalidad, como se lo contaría a un amigo, y que
no se preocupe por el orden. Devuelve solo el cuestionario en markdown, listo para copiar.`);

  fs.writeFileSync(PREGUNTAS_PATH, doc.trim() + '\n', 'utf-8');
  console.log(`\n  ✓ Cuestionario guardado en seo-proyecto/00-preguntas-cliente.md`);
  console.log('  Envíaselo al cliente, recoge sus audios, transcríbelos (NotebookLM) y luego:');
  console.log('  npm run seo-wizard contexto -- --transcript transcripcion.txt');
}

// ── FASE 0b: contexto (Prompt 01 — SOLO estructurar, NO inventar) ─────────────

async function readInput(args) {
  if (args.transcript) {
    const p = path.resolve(String(args.transcript));
    if (!fs.existsSync(p)) { console.error(`✗ No existe el archivo: ${p}`); process.exit(1); }
    const t = fs.readFileSync(p, 'utf-8');
    console.log(`  ✓ Cargado: ${p} (${t.split(/\s+/).length} palabras)`);
    return t;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\n  Pega la transcripción de los audios del cliente, o TODOS los datos del negocio');
  console.log('  que tengas (lo que él te haya contado). Al terminar, escribe FIN en una línea sola:\n');
  const lines = [];
  for (;;) {
    const line = await new Promise((res) => rl.question('', res));
    if (line.trim() === 'FIN') break;
    lines.push(line);
  }
  rl.close();
  return lines.join('\n');
}

async function cmdContexto(args) {
  ensureWorkspace();
  const business = loadGlobal();
  const material = await readInput(args);

  if (material.trim().split(/\s+/).length < 25) {
    console.error('\n✗ Muy poco material. El contexto se extrae de lo que aporta el cliente — no se inventa.');
    console.error('  Consigue sus audios/datos, o genera el cuestionario:  npm run seo-wizard preguntas');
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

  // Prompt 01 del playbook, literal: solo estructura, no inventa.
  console.log('\n  → Claude: estructurando el contexto (Prompt 01, sin inventar nada)...');
  const doc = callClaude(`Te paso la transcripción de los audios / datos del dueño de un negocio local en España.
A partir de esto, genera un documento de contexto estructurado con este formato exacto:

## DATOS DEL NEGOCIO
Nombre, actividad, ubicación, web, teléfono

## QUÉ HACE (servicios concretos)
Lista de servicios reales con descripción breve

## DIFERENCIADORES REALES
Por qué es mejor que la competencia, con ejemplos concretos de lo que cuenta el cliente

## SERVICIOS MÁS RENTABLES
Cuáles generan más margen y por qué

## CLIENTE IDEAL
A quién le vende, casos típicos que menciona

## ZONA DE SERVICIO
Cobertura geográfica real

## VOZ Y TONO
Cómo habla el dueño. Incluye frases textuales que capturen su forma de expresarse.

REGLA CRÍTICA: No inventes NADA. Solo extrae y estructura lo que dice el propio cliente.
Si para una sección no hay información en el material, escribe exactamente
"(sin datos — completar)" y NO la rellenes con suposiciones plausibles. Es preferible
un documento con huecos honestos que uno completo pero inventado.

DATOS YA CONFIRMADOS (de la configuración de su web, puedes usarlos en DATOS DEL NEGOCIO):
${knownData || '(ninguno)'}

MATERIAL DEL CLIENTE:
${material}`);

  const header = `<!-- 01 · CONTEXTO — seo-wizard, ${new Date().toISOString().split('T')[0]}.
     Extraído de lo que aporta el cliente (Prompt 01). REVÍSALO y completa los "(sin datos)". -->\n\n`;
  fs.writeFileSync(CONTEXTO_PATH, header + doc.trim() + '\n', 'utf-8');
  // Guardar también el material original para trazabilidad
  fs.writeFileSync(path.join(WORKSPACE, '00-material-cliente.txt'), material.trim() + '\n', 'utf-8');

  console.log(`\n  ✓ Contexto guardado en seo-proyecto/01-contexto.md`);
  console.log('\n  ⚠ REVÍSALO y completa los "(sin datos — completar)" con lo que sepas del cliente.');
  console.log('  Siguiente paso:  npm run seo-wizard personas');
}

// ── FASE 0c: personas (Paso 02 — la IA los GENERA desde el contexto) ──────────

async function cmdPersonas() {
  ensureWorkspace();
  const contexto = loadContexto();
  if (!contexto) {
    console.error('✗ Falta 01-contexto.md — ejecuta antes: npm run seo-wizard contexto');
    process.exit(1);
  }

  console.log('  → Claude: generando buyer personas (Paso 02) desde el contexto...');
  const doc = callClaude(`Teniendo en cuenta este contexto de negocio, define el buyer persona principal
(y los secundarios si hay más de un perfil de cliente con intención de búsqueda distinta,
máximo 3). Para cada perfil, este formato:

## PERFIL [nombre descriptivo]
**Quién es:** edad, situación vital, contexto en el que surge la necesidad
**Qué quiere conseguir:** el resultado real que busca (no el servicio técnico, sino lo que
significa para su vida o negocio)
**Qué le frena o le preocupa:** miedos, objeciones habituales, malas experiencias previas
**Cómo busca en Google:** 10-12 frases textuales que este cliente escribiría en Google
cuando tiene el problema (mezcla urgencia y búsquedas reflexivas, con y sin ciudad)
**Qué le haría elegirnos:** los 3-4 argumentos que más pesan en su decisión

Sé específico. Usa el vocabulario real del cliente, no jerga técnica del sector.
Ancla cada perfil en lo que dice el contexto; si extrapolas edades o miedos, márcalo con
"(a validar)".

CONTEXTO DE NEGOCIO:
${contexto}`);

  const header = `<!-- 02 · BUYER PERSONAS — seo-wizard, ${new Date().toISOString().split('T')[0]}.
     Generados desde 01-contexto.md (Paso 02). Las frases "Cómo busca en Google" alimentan
     el keyword research de la fase plan. REVÍSALOS. -->\n\n`;
  fs.writeFileSync(PERSONAS_PATH, header + doc.trim() + '\n', 'utf-8');

  console.log(`\n  ✓ Buyer personas guardados en seo-proyecto/02-buyer-personas.md`);
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
  ensureWorkspace();
  const contexto = loadContexto();
  const personas = loadPersonas();
  if (!contexto) {
    console.error('✗ Falta seo-proyecto/01-contexto.md — ejecuta antes: npm run seo-wizard contexto');
    process.exit(1);
  }
  if (!personas) {
    console.error('✗ Falta seo-proyecto/02-buyer-personas.md — ejecuta antes: npm run seo-wizard personas');
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

${personas}

PARTE 1 — Dame hasta 10 ideas de servicios que podrían tener página propia en la web.
Condiciones:
- Solo servicios que el negocio realmente ofrece según el contexto
- Solo intención transaccional (el usuario quiere contratar, no informarse)
- Para cada idea, escribe primero su INTENCIÓN CANÓNICA: el resultado final que busca el
  cliente, en una frase corta, SIN vocabulario técnico de producto (ej: "cubrir/cerrar el
  porche para ganar una estancia" — no "pérgola de hierro y cristal").
- ANTES de añadir una idea nueva a la lista, compárala con las que ya llevas: si dos ideas
  comparten la misma intención canónica aunque usen nombres de producto distintos (ejemplo
  real de este mismo tipo de negocio: "pérgola de hierro y cristal para porche" y
  "cerramiento de porche con hierro y cristal" son LA MISMA intención — cerrar el porche —
  aunque suenen a productos distintos), NO las propongas como dos servicios. Fusiónalas en
  una sola idea que cubra ambas variantes de producto.
- Evita cualquier otro solapamiento que canibalice la misma intención de búsqueda

PARTE 2 — Para la home, define la keyword principal del negocio ("actividad + ${city}").

Zona geográfica: ${city}

Devuelve SOLO JSON:
{
  "home": { "keyword": "actividad en ${city}", "seeds": ["variante 1", "variante 2", "variante 3"] },
  "services": [
    { "title": "Nombre del servicio", "intencion": "intención canónica en una frase corta",
      "keyword": "keyword transaccional con ciudad", "seeds": ["variante"],
      "razon": "por qué merece página propia", "prioridad": 1 }
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
${brainstorm.services.map((s, i) => `${i + 1}. ${s.title} → "${s.keyword}" (intención: ${s.intencion || 'no definida'}) — ${s.razon}`).join('\n')}

Y estos datos de keywords:
${volumeData}

TAREA:
1. LIMPIEZA — descarta keywords irrelevantes: marcas de competidores, términos puramente
   informativos (qué es, cómo funciona...), y cualquier intención no transaccional.
2. AGRUPACIÓN — agrupa las keywords válidas por intención de búsqueda real.
3. AUDITORÍA DE CANIBALIZACIÓN (obligatoria, sistemática) — antes de asignar nada, escribe
   la intención canónica de cada página propuesta (qué resultado final busca el cliente,
   sin vocabulario técnico de producto). Después compara TODAS las páginas entre sí, par a
   par (no solo las que parezcan obviamente parecidas): si dos páginas comparten sustantivos
   o verbos clave en sus variantes (ej. ambas hablan de "porche", "terraza", "cerrar",
   "cubrir"), o si un usuario que busca una de las dos aterrizaría razonablemente en la otra,
   son la MISMA intención aunque el nombre de producto sea distinto — FUSIÓNALAS en una sola
   página con un título que cubra ambos productos/variantes, y explica la fusión en "notas"
   con las dos páginas afectadas y el motivo. No asumas que el brainstorm ya vino sin
   solapamientos: repite esta auditoría desde cero con las keywords reales.
4. ASIGNACIÓN — asigna cada grupo ya depurado a su página final (home o servicio).
5. VARIANTES EXHAUSTIVAS — para cada página, lista TODAS las variantes semánticas reales.
   Solo variantes con diferencia semántica real (nada de singular/plural o cambio de orden).

Devuelve SOLO JSON:
{
  "notas": "observaciones importantes (fusiones con las páginas afectadas y motivo, keywords dudosas, oportunidades)",
  "home": { "keyword": "...", "volumen": 320, "variantes": [{"kw": "...", "vol": 90}] },
  "services": [
    { "title": "...", "intencion": "intención canónica en una frase corta", "slug": "sugerencia-slug-con-ciudad",
      "keyword": "...", "volumen": 210, "variantes": [{"kw": "...", "vol": 50}], "prioridad": 1, "razon": "..." }
  ]
}
Usa volumen null si no hay dato. Ordena services por potencial de negocio.
Si fusionaste páginas, el array "services" debe reflejar el resultado YA fusionado
(menos páginas que la propuesta original), nunca ambas por separado.`));

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
        razon: s.razon || '', intencion: s.intencion || '', status: 'pendiente',
      })),
      ...zonas,
    ],
  };
  savePlan(plan);
  writePlanMd(plan);

  console.log(`\n  ✓ Plan guardado: seo-proyecto/plan.json + 03-plan.md ${validated ? '(validado con datos reales)' : '(⚠ SIN validar)'}`);
  if (plan.notas) console.log(`\n  Notas: ${plan.notas}`);
  printPlan(plan);
  console.log('\n  ⚠ Revisa seo-proyecto/03-plan.md (borra/edita páginas que no encajen) antes de generar.');
  console.log('  Siguiente paso:  npm run seo-wizard home');
}

function writePlanMd(plan) {
  const rows = plan.pages.map((p) => {
    const vol = p.volumen != null ? `${p.volumen}/mes` : '—';
    const vars = (p.variantes || []).map((v) => `\`${v.kw}\`${v.vol ? ` (${v.vol})` : ''}`).join(', ') || '—';
    return `### [${p.type}] ${p.slug}\n- **Keyword:** ${p.keyword} · **Volumen:** ${vol} · **Prioridad:** ${p.prioridad}\n${p.intencion ? `- **Intención canónica:** ${p.intencion}\n` : ''}${p.razon ? `- **Por qué:** ${p.razon}\n` : ''}- **Variantes:** ${vars}\n`;
  }).join('\n');
  const md = `<!-- 03 · PLAN — seo-wizard, ${new Date().toISOString().split('T')[0]}.
     Arquitectura + keywords ${plan.validated ? 'validadas con datos reales' : '(SIN VALIDAR — hipótesis)'}.
     REVÍSALO: borra páginas que no encajen editando plan.json (este .md es solo lectura).
     Compara la "Intención canónica" de cada página con las demás: si dos suenan al mismo
     resultado final para el cliente aunque el producto tenga nombre distinto, sospecha
     canibalización y fusiónalas editando plan.json antes de generar contenido. -->

# Plan de contenidos — ${plan.niche || ''} en ${plan.city || ''}

## Notas estratégicas
${plan.notas || '(sin notas)'}

## Páginas
${rows}`;
  fs.writeFileSync(PLAN_MD_PATH, md, 'utf-8');
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

const WRITING_RULES = `REGLA DE HONESTIDAD (la más importante — E-E-A-T):
- SOLO puedes afirmar como hechos los datos que estén EXPLÍCITOS en el contexto del cliente.
- PROHIBIDO inventar o dar por supuesto: "taller propio", "maquinaria moderna", garantías,
  años de experiencia, "precio cerrado", tiempos de respuesta ("te llamamos en 1h"),
  certificaciones, número de trabajos, atención de urgencias 24h.
- Si el contexto marca algo como "(sin datos — completar)" o "(a validar)", NO lo escribas
  como si fuera cierto. Es preferible una página más corta y verdadera que una convincente
  pero falsa: si el cliente no lo dijo, no va en la web.
- Trabaja los beneficios desde lo que SÍ consta (servicios reales, a medida, zona, tipos de
  producto que menciona) y desde los miedos del buyer persona — sin atribuir al negocio
  capacidades no confirmadas.

REGLAS DE REDACCIÓN (obligatorias):
1. Español natural, como habla el dueño del negocio — consulta VOZ Y TONO del contexto
   y úsala: el texto debe sonar a él, no a una agencia
2. PROHIBIDAS las frases genéricas: "somos líderes", "amplia experiencia", "máxima calidad",
   "equipo altamente cualificado", "soluciones integrales", "a la vanguardia"
3. Usa los DIFERENCIADORES REALES del contexto, con sus ejemplos concretos (solo los que consten)
4. La intro engancha en las 2 primeras frases (problema del cliente, no descripción de empresa)
5. CTAs específicos pero HONESTOS: si no consta el tiempo de respuesta, no lo prometas.
   Nunca "contáctanos" a secas; sí "Pídenos presupuesto sin compromiso"
6. Cada título de sección (H2/H3) integra una variante REAL del cluster — no keyword
   principal repetida, no títulos sin búsqueda detrás tipo "Nuestros servicios"
7. El orden del contenido sigue la progresión del usuario: llega → entiende → confía → decide
8. Responde a los miedos del buyer persona en features y FAQ (los tienes en las personas)`;

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
  ensureWorkspace();
  const contexto = loadContexto();
  const personas = loadPersonas();
  const plan = loadPlan();
  if (!contexto) { console.error('✗ Falta 01-contexto.md — ejecuta: npm run seo-wizard contexto'); process.exit(1); }
  if (!personas) { console.error('✗ Falta 02-buyer-personas.md — ejecuta: npm run seo-wizard personas'); process.exit(1); }
  if (!plan) { console.error('✗ Falta el plan — ejecuta: npm run seo-wizard plan'); process.exit(1); }

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

CONTEXTO REAL DEL NEGOCIO:
${contexto}

BUYER PERSONAS:
${personas}

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
  writePageReview(plan, page, content, { covered, missing, analyses });
  page.status = 'generada';
  savePlan(plan);

  console.log('  ✓ src/content/pages/home.mdx generada');
  console.log(`  ✓ Revisión legible: seo-proyecto/${reviewFilename(plan, page)}`);
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
      title: ${yamlStr(c.contact?.title || 'Contacta con nosotros')}
      subtitle: ${yamlStr(c.contact?.subtitle || '')}
      description: ''
      phone: ''
      whatsapp: ''
      email: ''
      schedule: ''
      responseTime: ''

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
${li(c.hero.features || [], '        ')}

seoContentTitle: ''
stickyPhone: true
---
`;
}

// ── FASE 3: service / zona ────────────────────────────────────────────────────

async function cmdPage(type, args) {
  ensureWorkspace();
  const contexto = loadContexto();
  const personas = loadPersonas();
  const plan = loadPlan();
  if (!contexto || !personas || !plan) {
    console.error('✗ Faltan pasos previos — ejecuta contexto → personas → plan primero.');
    process.exit(1);
  }
  const slug = args._[1];
  if (!slug) {
    console.error(`✗ Falta el slug. Páginas ${type} del plan:`);
    plan.pages.filter((p) => p.type === type).forEach((p) => console.error(`    ${p.status === 'generada' ? '✓' : '○'} ${p.slug} — "${p.keyword}"`));
    process.exit(1);
  }
  const page = plan.pages.find((p) => p.type === type && p.slug === slug);
  if (!page) { console.error(`✗ No existe "${slug}" (tipo ${type}) en el plan`); process.exit(1); }

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

CONTEXTO REAL DEL NEGOCIO:
${contexto}

BUYER PERSONAS:
${personas}

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
  writePageReview(plan, page, content, { covered, missing, analyses });
  page.status = 'generada';
  savePlan(plan);

  console.log(`  ✓ ${path.relative(ROOT, outPath)} generada`);
  console.log(`  ✓ Revisión legible: seo-proyecto/${reviewFilename(plan, page)}`);
  console.log(`  ⚠ Pendiente manual: imagen hero del ${isService ? 'servicio' : 'municipio'} desde Keystatic`);
}

// ── Doc de revisión legible por página (en seo-proyecto/) ─────────────────────

function reviewFilename(plan, page) {
  const idx = plan.pages.findIndex((p) => p.slug === page.slug && p.type === page.type);
  return `${String(4 + Math.max(0, idx)).padStart(2, '0')}-${page.type}-${page.slug}.md`;
}

function writePageReview(plan, page, content, { covered, missing, analyses }) {
  const faqs = [...(content.faqSeo || []), ...(content.faqGeo || [])].filter((f) => f.question);
  const comp = analyses?.length
    ? analyses.map((a, i) => `- **${a.url}** — ${a.queLesFalta || a.queHacenBien || 'analizado'}`).join('\n')
    : '- (sin análisis de competencia)';
  const md = `<!-- ${reviewFilename(plan, page)} — seo-wizard, ${new Date().toISOString().split('T')[0]}.
     Versión legible de lo generado. El archivo real es el .mdx en src/content/. -->

# ${page.title} — "${page.keyword}"

## Cobertura de keywords
${covered.map((k) => `- ✓ ${k}`).join('\n')}
${missing.map((k) => `- ✗ ${k} (no encajó de forma natural)`).join('\n')}

## Competencia analizada
${comp}

## SEO
- **Title:** ${content.seoTitle || '—'}
- **Description:** ${content.seoDescription || '—'}

## Hero
**${content.hero?.heading || ''} ${content.hero?.headingHighlight || ''}**
${content.hero?.subheading || ''}

## FAQ (${faqs.length})
${faqs.map((f) => `**${f.question}**\n${f.answer}\n`).join('\n')}
`;
  fs.writeFileSync(path.join(WORKSPACE, reviewFilename(plan, page)), md, 'utf-8');
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
${(c.hero.features || []).map((f) => `        - ${yamlStr(f)}`).join('\n')}
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
  const personas = loadPersonas();
  console.log(`\n  Carpeta de trabajo: seo-proyecto/`);
  console.log(`  01 contexto:  ${contexto ? '✓ 01-contexto.md' : '○ pendiente — npm run seo-wizard contexto'}`);
  console.log(`  02 personas:  ${personas ? '✓ 02-buyer-personas.md' : '○ pendiente — npm run seo-wizard personas'}`);
  console.log(`  03 plan:      ${plan ? `✓ plan.json (${plan.validated ? 'validado' : '⚠ sin validar'})` : '○ pendiente — npm run seo-wizard plan'}`);
  if (plan) {
    printPlan(plan);
    const done = plan.pages.filter((p) => p.status === 'generada').length;
    console.log(`\n  Progreso: ${done}/${plan.pages.length} páginas generadas`);
  }
  console.log('');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const HELP = `
seo-wizard — pipeline SEO por fases. Cada documento se guarda numerado en seo-proyecto/.

  npm run seo-wizard preguntas                              Cuestionario de discovery para el cliente
  npm run seo-wizard contexto [-- --transcript audios.txt]  01 · estructura el material del cliente (Prompt 01)
  npm run seo-wizard personas                               02 · genera los buyer personas (Paso 02)
  npm run seo-wizard plan     [-- --csv carpeta-csvs/]      03 · arquitectura + keywords validadas
  npm run seo-wizard home     [-- --competitors u1,u2]      genera la home
  npm run seo-wizard service <slug>                         genera un servicio del plan
  npm run seo-wizard zona <slug>                            genera una zona del plan
  npm run seo-wizard status                                 progreso del proyecto

Flags: --dry-run (no escribe archivos), --competitors url1,url2,url3
Flujo:  preguntas → (audios del cliente) → contexto → personas → plan → home → service/zona
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case 'preguntas': await cmdPreguntas(); break;
    case 'contexto': await cmdContexto(args); break;
    case 'personas': await cmdPersonas(); break;
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
