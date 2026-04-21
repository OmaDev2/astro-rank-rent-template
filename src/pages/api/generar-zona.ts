export const prerender = false;

import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function yamlDQ(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`;
}

function buildMdx(data: Record<string, any>, zoneName: string, type: string): string {
  const seoObj = { title: data.seoTitle ?? '', description: data.seoDesc ?? '' };
  const seoJson = JSON.stringify(seoObj).replace(/'/g, "''");

  const heroJson = JSON.stringify({
    heading: data.heading ?? zoneName,
    headingHighlight: data.headingHighlight ?? '',
    subheading: data.subheading ?? '',
    ctaPrimaryText: 'Llamar Ahora',
    ctaPrimaryLink: '/contacto/',
    ctaSecondaryText: 'Ver Servicios',
    ctaSecondaryLink: '/servicios/',
    features: (data.heroFeatures ?? []).join('\n'),
    bgColor: '#0a0a0a',
  });

  const featuresJson = JSON.stringify({
    title: `Servicios en ${zoneName}`,
    features: data.features ?? [],
  });

  const ctaJson = JSON.stringify({
    title: data.ctaTitle ?? `¿Necesitas servicio en ${zoneName}?`,
    subtitle: data.ctaSubtitle ?? 'Llámanos y te atendemos hoy.',
    buttonText: 'SOLICITAR SERVICIO',
    buttonLink: '/contacto/',
    features: 'Sin desplazamiento\nPresupuesto gratis\nGarantía 2 años',
    style: 'primary',
  });

  const faqItems = data.faq ?? [];
  const faqYaml = faqItems.length > 0
    ? 'faq:\n' + faqItems
        .map((q: Record<string, string>) =>
          `  - question: ${yamlDQ(q.question ?? '')}\n    answer: ${yamlDQ(q.answer ?? '')}`
        )
        .join('\n')
    : 'faq: []';

  return `---
name: ${yamlDQ(zoneName)}
type: ${type}
heroImage: ''
seo: '${seoJson}'
coordinates:
  lat: ''
  lng: ''
zipCodes: []
${faqYaml}
blocks:
  - discriminant: hero
    value:
      content: >-
        ${heroJson}
  - discriminant: features
    value:
      content: >-
        ${featuresJson}
  - discriminant: cta
    value:
      content: >-
        ${ctaJson}
---

${data.bodyText ?? ''}
`;
}

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(
      JSON.stringify({ error: 'Esta herramienta solo está disponible en desarrollo local.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { zoneName, type = 'residencial', notes = '', businessName, niche, city } = body;

    if (!zoneName?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Falta el nombre de la zona.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY no está configurada en .env' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Eres un redactor SEO local especializado en negocios de servicios.
Negocio: ${businessName}
Sector: ${niche}
Ciudad principal: ${city}
Zona objetivo: ${zoneName}
Tipo de zona: ${type === 'centro' ? 'zona principal o centro urbano' : 'zona residencial secundaria'}
${notes ? `Notas: ${notes}` : ''}

Crea contenido SEO local original y específico para la página de zona "${zoneName}".
Si conoces la zona, menciona características reales: tipo de viviendas, barrios, historia, problemas habituales del sector en esa área.
Escribe en español. Tono profesional y cercano.

Responde ÚNICAMENTE con JSON válido con esta estructura exacta:
{
  "heading": "Título H1 (incluye ${niche} + ${zoneName}, máx 55 chars)",
  "headingHighlight": "2-3 palabras destacadas del heading",
  "subheading": "Subtítulo descriptivo 1-2 frases",
  "heroFeatures": ["Característica 1", "Característica 2", "Característica 3"],
  "seoTitle": "Título SEO máx 60 chars",
  "seoDesc": "Meta descripción máx 155 chars con llamada a la acción",
  "features": [
    {"title": "Ventaja específica para ${zoneName}", "description": "2-3 frases específicas para esta zona", "icon": "Zap"},
    {"title": "Ventaja 2", "description": "2-3 frases específicas", "icon": "MapPin"},
    {"title": "Ventaja 3", "description": "2-3 frases específicas", "icon": "ShieldCheck"}
  ],
  "faq": [
    {"question": "Pregunta específica sobre ${niche} en ${zoneName}", "answer": "Respuesta detallada"},
    {"question": "Pregunta sobre precios o tiempo de respuesta", "answer": "Respuesta detallada"},
    {"question": "Pregunta sobre garantías o confianza", "answer": "Respuesta detallada"}
  ],
  "ctaTitle": "Título CTA en forma de pregunta directa",
  "ctaSubtitle": "Subtítulo CTA, 1 frase corta",
  "bodyText": "2-3 párrafos de texto cuerpo sobre la zona y el servicio local. Específico para ${zoneName}, con detalles reales del barrio."
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    let rawText: string;
    try {
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
    } catch (geminiErr: unknown) {
      const msg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      return new Response(
        JSON.stringify({ error: `Error de Gemini: ${msg}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Gemini no devolvió JSON válido. Inténtalo de nuevo.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = slugify(zoneName);
    const fileName = `${slug}.mdx`;
    const mdxContent = buildMdx(parsedData, zoneName, type);

    let writtenToDisk = false;
    try {
      const filePath = path.join(process.cwd(), 'src/content/locations', fileName);
      await fs.writeFile(filePath, mdxContent, 'utf-8');
      writtenToDisk = true;
    } catch {
      // En producción o si falla la escritura, el usuario puede copiar/descargar
    }

    return new Response(
      JSON.stringify({ success: true, content: mdxContent, slug, fileName, writtenToDisk }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
