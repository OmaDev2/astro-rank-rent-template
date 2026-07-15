#!/usr/bin/env node
/**
 * Interfaz local para rank-rent-wizard v2.
 * Mantiene el CLI como única fuente de acciones: la UI solo lo orquesta.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3466);
const WIZARD_FILE = path.join(ROOT, 'scripts/rank-rent-wizard.mjs');
const UI_FILE = path.join(ROOT, 'scripts/rank-rent-wizard-ui.html');
const WORKSPACE = process.env.RANK_RENT_WORKSPACE
  ? path.resolve(process.env.RANK_RENT_WORKSPACE)
  : path.join(ROOT, 'rank-rent-proyecto');
const CSV_DIR = path.join(WORKSPACE, 'csv');

function exists(file) { return fs.existsSync(file); }
function readJson(file) {
  try { return exists(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }
  catch { return null; }
}
function json(res, value, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}
function readBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) { reject(new Error('La carga supera 25 MB. Sube menos CSVs o divídelos.')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('La petición no tiene un JSON válido.')); }
    });
    req.on('error', reject);
  });
}
function safeSlug(value) { return /^[a-z0-9-]+$/.test(String(value || '')); }
function pageKey(type, slug) { return `${type}-${slug}`; }
function approval(kind, id) { return path.join(WORKSPACE, `approved-${kind}-${id}.json`); }
function artifact(kind, id) { return path.join(WORKSPACE, `${kind}-${id}.json`); }

function state() {
  const project = readJson(path.join(WORKSPACE, 'project.json'));
  const plan = readJson(path.join(WORKSPACE, '02-plan.json'));
  const pages = (plan?.pages || []).filter((page) => ['service', 'zona'].includes(page.type) && safeSlug(page.slug)).map((page) => {
    const id = pageKey(page.type, page.slug);
    const published = exists(path.join(ROOT, page.type === 'service' ? 'src/content/services' : 'src/content/locations', `${page.slug}.mdx`));
    return {
      ...page,
      id,
      outline: exists(artifact('outline', id)),
      outlineApproved: exists(approval('outline', id)),
      draft: exists(artifact('draft', id)),
      draftApproved: exists(approval('draft', id)),
      published,
    };
  });
  return {
    project,
    brief: exists(path.join(WORKSPACE, '01-market-brief.md')),
    csvFiles: exists(CSV_DIR) ? fs.readdirSync(CSV_DIR).filter((file) => /\.csv$/i.test(file)).sort() : [],
    plan: plan ? {
      strategy: plan.strategy || '', validation: plan.validation || null,
      cannibalizationNotes: plan.cannibalizationNotes || [], claims: plan.claims || [],
      approved: exists(approval('plan', 'plan')), pages,
    } : null,
    operator: exists(path.join(WORKSPACE, 'operator-evidence.md')),
  };
}

function runWizard(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [WIZARD_FILE, ...args], {
      cwd: ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    const timeout = setTimeout(() => child.kill('SIGTERM'), 310_000);
    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ ok: code === 0, output: output.trim() || `Proceso terminado (código ${code}).` });
    });
    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ ok: false, output: error.message });
    });
  });
}

async function action(res, args) {
  const result = await runWizard(args);
  json(res, { ...result, state: state() }, result.ok ? 200 : 422);
}

async function uploadCsv(req, res) {
  const body = await readBody(req);
  if (!Array.isArray(body.files) || !body.files.length) throw new Error('Selecciona al menos un CSV.');
  fs.mkdirSync(CSV_DIR, { recursive: true });
  const saved = [];
  for (const file of body.files.slice(0, 20)) {
    const name = path.basename(String(file.name || ''));
    if (!/\.csv$/i.test(name)) throw new Error(`El archivo “${name || 'sin nombre'}” no es CSV.`);
    const data = Buffer.from(String(file.data || ''), 'base64');
    if (!data.length || data.length > 10 * 1024 * 1024) throw new Error(`El CSV “${name}” está vacío o supera 10 MB.`);
    fs.writeFileSync(path.join(CSV_DIR, name), data);
    saved.push(name);
  }
  json(res, { ok: true, output: `CSV guardado: ${saved.join(', ')}`, state: state() });
}

function getArtifact(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const kind = url.searchParams.get('kind');
  const id = url.searchParams.get('id');
  let file = null;
  if (kind === 'plan') file = path.join(WORKSPACE, '02-plan.json');
  if (['outline', 'draft'].includes(kind) && safeSlug(id)) file = artifact(kind, id);
  if (!file || !exists(file)) return json(res, { error: 'Artefacto no encontrado.' }, 404);
  json(res, { content: fs.readFileSync(file, 'utf8') });
}

async function router(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(UI_FILE, 'utf8'));
  }
  if (req.method === 'GET' && req.url === '/api/state') return json(res, state());
  if (req.method === 'GET' && req.url.startsWith('/api/artifact')) return getArtifact(req, res);
  if (req.method !== 'POST') return json(res, { error: 'Ruta no encontrada.' }, 404);

  const route = req.url;
  if (route === '/api/upload-csv') return uploadCsv(req, res);
  const body = await readBody(req);
  if (route === '/api/init') return action(res, ['init', '--niche', String(body.niche || ''), '--city', String(body.city || ''), '--site-name', String(body.siteName || '')]);
  if (route === '/api/brief') return action(res, ['brief', '--text', String(body.text || '')]);
  if (route === '/api/csv-check') return action(res, ['csv', CSV_DIR]);
  if (route === '/api/plan') return action(res, body.withCsv ? ['plan', '--csv', CSV_DIR] : ['plan']);
  if (route === '/api/operator') return action(res, ['operator', '--text', String(body.text || '')]);
  if (route === '/api/approve') {
    const kind = String(body.kind || '');
    const id = String(body.id || '');
    if (!['plan', 'outline', 'draft'].includes(kind) || !safeSlug(id)) return json(res, { error: 'Aprobación no válida.' }, 422);
    return action(res, ['approve', kind, id]);
  }

  const type = String(body.type || '');
  const slug = String(body.slug || '');
  if (!['service', 'zona'].includes(type) || !safeSlug(slug)) return json(res, { error: 'Página no válida.' }, 422);
  if (route === '/api/outline') return action(res, ['outline', type, slug]);
  if (route === '/api/draft') return action(res, ['draft', type, slug]);
  if (route === '/api/publish') return action(res, ['publish', type, slug]);
  return json(res, { error: 'Ruta no encontrada.' }, 404);
}

const server = http.createServer((req, res) => {
  router(req, res).catch((error) => json(res, { ok: false, output: error.message, state: state() }, 422));
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\nRank & Rent Wizard v2 — interfaz local\n\n  ${url}\n  Ctrl+C para cerrar\n`);
  if (!process.argv.includes('--no-open')) {
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(opener, [url], { detached: true, stdio: 'ignore' }).unref();
  }
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `\nEl puerto ${PORT} ya está ocupado. Prueba: PORT=${PORT + 1} npm run rank-rent-ui\n` : error.message);
  process.exit(1);
});
