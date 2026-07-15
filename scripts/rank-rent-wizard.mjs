#!/usr/bin/env node
/**
 * rank-rent-wizard
 *
 * Pipeline v2 para webs rank & rent. Mantiene separados:
 * - market: investigación y contenido útil que puede existir antes de tener profesional.
 * - operator: hechos, pruebas y activos de la empresa que alquila la web.
 *
 * Los borradores nunca se publican directamente: plan → outline → draft → approve → publish.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stringify as stringifyYaml } from 'yaml';
import { parse as parseCsv } from 'csv-parse/sync';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// La variable permite pruebas aisladas sin crear un proyecto real dentro del template.
const WORKSPACE = process.env.RANK_RENT_WORKSPACE
  ? path.resolve(process.env.RANK_RENT_WORKSPACE)
  : path.join(ROOT, 'rank-rent-proyecto');
const PROJECT_PATH = path.join(WORKSPACE, 'project.json');
const MARKET_BRIEF_PATH = path.join(WORKSPACE, '01-market-brief.md');
const PLAN_PATH = path.join(WORKSPACE, '02-plan.json');
const OPERATOR_PATH = path.join(WORKSPACE, 'operator-evidence.md');

const MARKET_SAFE = [
  'problemas habituales del cliente', 'tipos de servicio', 'criterios para elegir',
  'factores que influyen en el precio', 'mantenimiento', 'normativa pública citada',
  'zonas atendidas como objetivo de la web', 'CTA para solicitar información',
];
const OPERATOR_PROOF = [
  'años de experiencia', 'taller, equipo o sede propia', 'reseñas y testimonios',
  'proyectos realizados', 'garantías', 'certificaciones', 'marcas con las que trabaja',
  'precios, plazos o tiempos de llegada concretos', 'datos NAP y fotos reales',
];

function ensureWorkspace() { fs.mkdirSync(WORKSPACE, { recursive: true }); }
function exists(file) { return fs.existsSync(file); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, value) { ensureWorkspace(); fs.writeFileSync(file, value, 'utf8'); }
function readJson(file) { return exists(file) ? JSON.parse(read(file)) : null; }
function writeJson(file, value) { write(file, `${JSON.stringify(value, null, 2)}\n`); }

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) { args._.push(argv[i]); continue; }
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    args[key] = !next || next.startsWith('--') ? true : argv[++i];
  }
  return args;
}

function required(value, message) {
  if (!value || /^site_name$|^niche_description$|^city_name$/i.test(value)) throw new Error(message);
  return value;
}

function loadProject() {
  const project = readJson(PROJECT_PATH);
  if (!project) throw new Error('Falta rank-rent-proyecto/project.json. Ejecuta primero: npm run rank-rent-wizard init -- --niche "..." --city "..."');
  return project;
}

function projectPath(kind, id) { return path.join(WORKSPACE, `${kind}-${id}.json`); }
function approvalPath(kind, id) { return path.join(WORKSPACE, `approved-${kind}-${id}.json`); }

function callClaude(prompt, timeoutMs = 300_000) {
  const result = spawnSync('claude', [
    '--print', '--allowedTools', '', '--append-system-prompt',
    'Eres una API de texto. Devuelve exclusivamente el JSON solicitado. No escribas archivos ni uses herramientas.',
  ], { input: prompt, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 20 * 1024 * 1024 });
  if (result.error) throw new Error(`No se pudo ejecutar claude CLI: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`claude CLI falló: ${result.stderr?.trim() || `exit ${result.status}`}`);
  const match = result.stdout.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Claude no devolvió JSON válido: ${result.stdout.slice(0, 300)}`);
  return JSON.parse(match[0]);
}

function printClaims(claims = []) {
  const grouped = claims.reduce((all, item) => {
    (all[item.classification] ||= []).push(item);
    return all;
  }, {});
  for (const [classification, items] of Object.entries(grouped)) {
    console.log(`\n${classification}:`);
    items.forEach((item) => console.log(`  - ${item.claim}${item.evidence ? ` (${item.evidence})` : ''}`));
  }
}

function cmdInit(args) {
  if (exists(PROJECT_PATH) && !args.force) throw new Error('Ya existe un proyecto v2. Usa --force solo si quieres reemplazar su configuración.');
  const niche = required(args.niche, 'Indica --niche "...".');
  const city = required(args.city, 'Indica --city "...".');
  const project = {
    version: 2,
    mode: 'market',
    niche,
    city,
    siteName: args['site-name'] || `${niche} ${city}`,
    createdAt: new Date().toISOString(),
    policy: {
      marketSafe: MARKET_SAFE,
      operatorProof: OPERATOR_PROOF,
      publishRequiresApproval: true,
    },
    stages: { brief: 'pending', plan: 'pending', operator: 'not_started' },
  };
  writeJson(PROJECT_PATH, project);
  console.log(`✓ Proyecto market creado: ${niche} en ${city}`);
  console.log('Siguiente paso: npm run rank-rent-wizard brief -- --file investigacion.md');
}

function cmdBrief(args) {
  const project = loadProject();
  const source = args.file ? read(path.resolve(args.file)) : args.text;
  if (!source || source.trim().length < 80) throw new Error('Aporta investigación mediante --file o --text (mínimo 80 caracteres).');
  write(MARKET_BRIEF_PATH, `# Market brief — ${project.niche} en ${project.city}\n\n${source.trim()}\n`);
  project.stages.brief = 'ready';
  writeJson(PROJECT_PATH, project);
  console.log('✓ Market brief guardado. No se ha tratado como información de un profesional.');
  console.log('Siguiente paso: npm run rank-rent-wizard plan');
}

function cmdPlan(args) {
  const project = loadProject();
  if (!exists(MARKET_BRIEF_PATH)) throw new Error('Falta 01-market-brief.md. Ejecuta primero brief.');
  const brief = read(MARKET_BRIEF_PATH);
  let keywordEvidence = '(Sin CSV: las keywords son hipótesis y el plan debe marcarse como no validado.)';
  let validation = { source: 'hypothesis', validated: false, files: [], keywordCount: 0 };
  if (args.csv) {
    const csv = readKeywordPlannerCsvDir(path.resolve(String(args.csv)));
    keywordEvidence = csv.rows.map((row) =>
      `- ${row.keyword} | volumen: ${row.volume ?? 'sin dato'} | competencia: ${row.competition || 'sin dato'} | ${row.source}`,
    ).join('\n');
    validation = { source: 'google_keyword_planner_csv', validated: true, files: csv.files, keywordCount: csv.rows.length };
    console.log(`→ ${csv.rows.length} keywords leídas de ${csv.files.length} CSV(s) de Keyword Planner.`);
  }
  console.log('→ Generando arquitectura market y matriz de afirmaciones…');
  const plan = callClaude(`Diseña la arquitectura SEO para una web rank & rent de ${project.niche} en ${project.city}.

MATERIAL DE MERCADO (no es información de un profesional):
${brief}

DATOS DE KEYWORD RESEARCH:
${keywordEvidence}

REGLAS:
- Solo crea páginas con intención transaccional o local claramente distinta.
- Si hay datos de CSV, usa solo esas keywords o variantes inequívocas del mismo cluster.
- Agrupa por intención, asigna cada keyword a UNA única página y fusiona cualquier solapamiento.
- No inventes empresa, años, taller, reseñas, certificaciones, garantías, proyectos, marcas, precios o tiempos.
- Separa servicios y zonas. Una zona solo se crea si tiene sentido comercial/local.
- Fusiona intenciones que competirían entre sí.

Devuelve SOLO JSON:
{
  "strategy": "resumen breve",
  "cannibalizationNotes": ["fusiones o riesgos detectados"],
  "pages": [{"type":"service|zona","slug":"slug","title":"...","keyword":"...","volume":123,"intent":"...","variants":[{"keyword":"...","volume":50}],"reason":"..."}],
  "claims": [{"claim":"...","classification":"market_safe|operator_proof","evidence":"por qué"}]
}`);
  plan.generatedAt = new Date().toISOString();
  plan.validation = validation;
  writeJson(PLAN_PATH, plan);
  project.stages.plan = 'ready_for_approval';
  writeJson(PROJECT_PATH, project);
  console.log(`✓ Plan creado con ${(plan.pages || []).length} páginas.`);
  printClaims(plan.claims);
  console.log('\nRevisa 02-plan.json y apruébalo con: npm run rank-rent-wizard approve -- plan');
}

function pageFromPlan(type, id) {
  const plan = readJson(PLAN_PATH);
  if (!plan) throw new Error('Falta 02-plan.json. Ejecuta plan.');
  const page = plan.pages?.find((item) => item.type === type && item.slug === id);
  if (!page) throw new Error(`No existe ${type} ${id} en 02-plan.json.`);
  return { plan, page };
}

function readKeywordPlannerCsvDir(directory) {
  if (!exists(directory)) throw new Error(`No existe la carpeta de CSVs: ${directory}`);
  const files = fs.readdirSync(directory).filter((file) => /\.csv$/i.test(file));
  if (!files.length) throw new Error(`No hay archivos .csv en ${directory}`);

  const rows = new Map();
  const normalizeHeader = (value) => String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const getField = (row, candidates) => {
    const key = Object.keys(row).find((header) => candidates.some((candidate) => normalizeHeader(header).includes(candidate)));
    return key ? row[key] : '';
  };
  const parseVolume = (value) => {
    const compact = String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const matches = [...compact.matchAll(/(\d+(?:[.,]\d+)?)\s*(k|mil|m)?/g)];
    if (!matches.length) return null;
    const values = matches.map((match) => {
      const raw = match[1];
      const number = raw.includes(',') && raw.includes('.')
        ? Number(raw.replace(/\./g, '').replace(',', '.'))
        : Number(raw.replace(',', '.'));
      const multiplier = ['k', 'mil'].includes(match[2]) ? 1_000 : match[2] === 'm' ? 1_000_000 : 1;
      return Math.round(number * multiplier);
    }).filter(Number.isFinite);
    // Keyword Planner puede exportar rangos (p. ej. "100 - 1K"). Conservamos el límite alto.
    return values.length ? Math.max(...values) : null;
  };

  for (const file of files) {
    const buffer = fs.readFileSync(path.join(directory, file));
    // Google suele usar BOM, pero también aceptamos UTF-16LE sin BOM (se reconoce por sus NUL).
    const looksLikeUtf16Le = (buffer[0] === 0xff && buffer[1] === 0xfe)
      || (buffer.length > 3 && buffer[1] === 0x00 && buffer[3] === 0x00);
    const text = looksLikeUtf16Le ? buffer.toString('utf16le') : buffer.toString('utf8');
    const header = text.split(/\r?\n/, 1)[0] || '';
    const delimiter = header.includes('\t') ? '\t' : header.includes(';') ? ';' : ',';
    const parsed = parseCsv(text, { columns: true, skip_empty_lines: true, relax_quotes: true, delimiter, bom: true });

    for (const row of parsed) {
      const keyword = String(getField(row, ['keyword', 'palabra clave', 'palabras clave'])).trim();
      if (!keyword) continue;
      const volume = parseVolume(getField(row, ['avg monthly searches', 'promedio de busquedas mensuales', 'busquedas mensuales']));
      const competition = String(getField(row, ['competition', 'competencia'])).trim() || null;
      const key = keyword.toLocaleLowerCase('es');
      const current = rows.get(key);
      if (!current || (volume ?? 0) > (current.volume ?? 0)) rows.set(key, { keyword, volume, competition, source: file });
    }
  }

  if (!rows.size) throw new Error('No pude encontrar una columna de keywords en los CSVs. Exporta los resultados de Keyword Planner con “Palabra clave”.');
  return { files, rows: [...rows.values()].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)) };
}

function cmdCsv(args) {
  const directory = args.dir || args._[1];
  if (!directory) throw new Error('Uso: csv <carpeta-csvs> o csv --dir <carpeta-csvs>.');
  const csv = readKeywordPlannerCsvDir(path.resolve(String(directory)));
  console.log(`✓ ${csv.rows.length} keywords leídas de: ${csv.files.join(', ')}`);
  console.table(csv.rows.slice(0, 20).map((row) => ({
    keyword: row.keyword, volume: row.volume ?? '—', competition: row.competition || '—', source: row.source,
  })));
}

function cmdOutline(args) {
  const project = loadProject();
  const type = args._[1];
  const id = args._[2];
  if (!['service', 'zona'].includes(type) || !id) throw new Error('Uso: outline service|zona <slug>.');
  if (!exists(approvalPath('plan', 'plan'))) throw new Error('Aprueba primero la arquitectura: approve plan');
  const { page } = pageFromPlan(type, id);
  const brief = read(MARKET_BRIEF_PATH);
  console.log(`→ Creando outline market para ${page.title}…`);
  const outline = callClaude(`Crea el outline de una página ${type} para ${project.niche} en ${project.city}.
PÁGINA: ${JSON.stringify(page)}
MARKET BRIEF: ${brief}

Usa solo bloques compatibles: hero, features, content, faq, cta.
El contenido debe ser útil para quien busca el servicio, pero no atribuir cualidades a una empresa inexistente.
Devuelve SOLO JSON:
{
 "h1":"...", "headings":[{"level":"h2|h3","text":"...","intent":"..."}],
 "blocks":["hero","features","content","faq","cta"],
 "operatorSlots":["pruebas que mejorarían esta página al entrar un profesional"]
}`);
  outline.type = type; outline.slug = id; outline.page = page; outline.generatedAt = new Date().toISOString();
  writeJson(projectPath('outline', `${type}-${id}`), outline);
  console.log(`✓ Outline guardado. Revísalo y apruébalo: approve outline ${type}-${id}`);
}

function cmdDraft(args) {
  const project = loadProject();
  const type = args._[1];
  const id = args._[2];
  const outlineId = `${type}-${id}`;
  const outline = readJson(projectPath('outline', outlineId));
  if (!outline) throw new Error(`Falta outline ${outlineId}.`);
  if (!exists(approvalPath('outline', outlineId))) throw new Error(`Aprueba primero el outline: approve outline ${outlineId}`);
  const brief = read(MARKET_BRIEF_PATH);
  console.log(`→ Redactando borrador market para ${outline.page.title}…`);
  const draft = callClaude(`Escribe un borrador SEO de tipo ${type} para ${project.niche} en ${project.city}.
OUTLINE APROBADO: ${JSON.stringify(outline)}
MARKET BRIEF: ${brief}

No inventes atributos de empresa: ni experiencia, taller, equipo, testimonios, certificados, garantías, proyectos, marcas, precios exactos o plazos.
Puedes explicar factores de decisión y recomendar solicitar una valoración.
Devuelve SOLO JSON:
{
 "seoTitle":"máximo 60 caracteres", "seoDescription":"máximo 155 caracteres",
 "hero":{"heading":"...","headingHighlight":"...","subheading":"...","features":["..."],"ctaPrimaryText":"..."},
 "features":[{"title":"...","description":"...","icon":"..."}],
 "bodyMarkdown":"contenido con H2/H3, útil y específico",
 "faq":[{"question":"...","answer":"..."}],
 "cta":{"title":"...","subtitle":"...","buttonText":"..."},
 "claims":[{"claim":"...","classification":"market_safe|operator_proof","evidence":"brief|operator"}]
}`);
  draft.type = type; draft.slug = id; draft.page = outline.page; draft.generatedAt = new Date().toISOString();
  writeJson(projectPath('draft', `${type}-${id}`), draft);
  console.log('✓ Borrador guardado. Afirmaciones detectadas:');
  printClaims(draft.claims);
  console.log(`\nRevisa y aprueba: npm run rank-rent-wizard approve -- draft ${type}-${id}`);
}

function cmdApprove(args) {
  const kind = args._[1];
  const id = args._[2] || (kind === 'plan' ? 'plan' : '');
  if (!['plan', 'outline', 'draft'].includes(kind) || !id) throw new Error('Uso: approve plan | approve outline <id> | approve draft <id>.');
  const source = kind === 'plan' ? PLAN_PATH : projectPath(kind, id);
  if (!exists(source)) throw new Error(`No existe el artefacto ${kind} ${id}.`);
  writeJson(approvalPath(kind, id), { kind, id, approvedAt: new Date().toISOString() });
  console.log(`✓ Aprobado: ${kind} ${id}`);
}

function cmdPublish(args) {
  const type = args._[1];
  const id = args._[2];
  const draftId = `${type}-${id}`;
  if (!['service', 'zona'].includes(type) || !id) throw new Error('Uso: publish service|zona <slug>.');
  if (!exists(approvalPath('draft', draftId))) throw new Error(`Aprueba primero el borrador: approve draft ${draftId}`);
  const draft = readJson(projectPath('draft', draftId));
  const blocked = (draft.claims || []).filter((claim) => claim.classification === 'operator_proof');
  if (blocked.length) throw new Error(`El borrador contiene ${blocked.length} afirmaciones que requieren profesional. Corrige el draft antes de publicar.`);
  const hero = {
    discriminant: 'hero', value: {
      ...draft.hero, ctaPrimaryLink: '/contacto/', ctaSecondaryText: 'WhatsApp', ctaSecondaryLink: '', titleTag: 'h1',
    },
  };
  const blocks = [
    hero,
    { discriminant: 'features', value: { title: `Soluciones de ${draft.page.title}`, titleTag: 'h2', variant: 'grid', features: draft.features || [] } },
    { discriminant: 'faq', value: { title: `Preguntas sobre ${draft.page.title}`, faqs: draft.faq || [] } },
    { discriminant: 'cta', value: { ...draft.cta, titleTag: 'h2', buttonLink: '/contacto/', style: 'gradient' } },
  ];
  const seo = JSON.stringify({ title: draft.seoTitle || '', description: draft.seoDescription || '' });
  const frontmatter = type === 'service'
    ? { title: draft.page.title, icon: 'Wrench', shortDesc: draft.seoDescription || '', featured: true, seo, faq: draft.faq || [], blocks }
    : { name: draft.page.title, type: 'residencial', zipCodes: [], seo, faq: draft.faq || [], blocks };
  const output = path.join(ROOT, type === 'service' ? 'src/content/services' : 'src/content/locations', `${id}.mdx`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  if (exists(output) && !args.force) throw new Error(`Ya existe ${path.relative(ROOT, output)}. Usa --force si ya revisaste la sustitución.`);
  fs.writeFileSync(output, `---\n${stringifyYaml(frontmatter, { lineWidth: 0 })}---\n\n${draft.bodyMarkdown || ''}\n`, 'utf8');
  console.log(`✓ Página market publicada: ${path.relative(ROOT, output)}`);
}

function cmdOperator(args) {
  const project = loadProject();
  const source = args.file ? read(path.resolve(args.file)) : args.text;
  if (!source || source.trim().length < 80) throw new Error('Aporta datos del profesional con --file o --text (mínimo 80 caracteres).');
  write(OPERATOR_PATH, `# Evidencias del operador\n\n${source.trim()}\n`);
  project.mode = 'operator'; project.stages.operator = 'evidence_ready';
  writeJson(PROJECT_PATH, project);
  console.log('✓ Evidencias del profesional guardadas. Aún no se ha incorporado ninguna afirmación automáticamente.');
}

function cmdStatus() {
  const project = loadProject();
  console.log(`\n${project.siteName} — ${project.mode}`);
  console.log(`  brief:    ${exists(MARKET_BRIEF_PATH) ? '✓' : '○'}`);
  console.log(`  plan:     ${exists(PLAN_PATH) ? (exists(approvalPath('plan', 'plan')) ? '✓ aprobado' : '◐ revisar') : '○'}`);
  console.log(`  operator: ${exists(OPERATOR_PATH) ? '✓ evidencias disponibles' : '○ pendiente'}`);
  console.log('\nArtefactos por página: outline → approve → draft → approve → publish');
}

const HELP = `
rank-rent-wizard v2 — pipeline market → operator

  init --niche "..." --city "..." [--site-name "..."]
  brief --file investigacion.md | --text "..."
  csv <carpeta-csvs>                       Comprueba el CSV antes de generar el plan
  plan [--csv carpeta-csvs]
  approve plan
  outline service|zona <slug>
  approve outline <service|zona-slug>
  draft service|zona <slug>
  approve draft <service|zona-slug>
  publish service|zona <slug> [--force]
  operator --file entrevista.md | --text "..."
  status
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  switch (args._[0]) {
    case 'init': return cmdInit(args);
    case 'brief': return cmdBrief(args);
    case 'csv': return cmdCsv(args);
    case 'plan': return cmdPlan(args);
    case 'outline': return cmdOutline(args);
    case 'draft': return cmdDraft(args);
    case 'approve': return cmdApprove(args);
    case 'publish': return cmdPublish(args);
    case 'operator': return cmdOperator(args);
    case 'status': return cmdStatus(args);
    default: console.log(HELP);
  }
}

main().catch((error) => { console.error(`\n✗ ${error.message}`); process.exit(1); });
