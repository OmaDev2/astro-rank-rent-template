import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",  // Modelo confirmado funcionando
    generationConfig: { responseMimeType: "application/json" }
});

// Helper para evitar rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para crear JSONs de datos
async function generateData(prompt, context = '') {
    try {
        console.log(`      ⏳ Consultando a Gemini...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Log para debug
        console.log(`      📝 Respuesta recibida (${text.length} chars)`);

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        console.log(`      ✅ JSON parseado correctamente`);

        // Delay para evitar rate limits (2 segundos entre llamadas)
        await delay(2000);

        return parsed;
    } catch (error) {
        console.error(`      ❌ ERROR en generateData (${context}):`, error.message);
        if (error.message.includes('JSON')) {
            console.error(`      📄 Respuesta que falló:`, text?.substring(0, 200));
        }

        // Si es rate limit, esperar más tiempo
        if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`      ⏸️  Rate limit detectado, esperando 30 segundos...`);
            await delay(30000);
        }

        return null;
    }
}

async function main() {
    console.log("🚀 INICIANDO GENERADOR DE SITIO...");

    // 1. LEER EL PLAN (FUENTE DE LA VERDAD)
    let plan;
    try {
        const raw = await fs.readFile('project_plan.json', 'utf-8');
        plan = JSON.parse(raw);

        // Validación de seguridad
        if (!plan.niche || !plan.city) {
            throw new Error("El plan está corrupto: Faltan 'niche' o 'city'. Vuelve a ejecutar research_niche.js");
        }

        console.log(`Target: ${plan.niche} en ${plan.city}`);
    } catch (error) {
        console.error("❌ Error crítico:", error.message);
        return;
    }

    // 2. GENERAR CONTENIDO DE LA HOME (KEYWORD PRINCIPAL)
    console.log(`\n🏠 Generando contenido SEO para la Home...`);

    // Extraemos preguntas reales (PAA) si existen
    const realQuestions = plan.raw_data?.paa_questions || [];
    const faqInstruction = realQuestions.length > 0
        ? `Usa estas PREGUNTAS REALES de usuarios para la sección FAQ (responde de forma experta): ${JSON.stringify(realQuestions)}`
        : `Genera 4 preguntas frecuentes relevantes para el nicho.`;

    const homePrompt = `
        Actúa como experto en SEO y Copywriting.
        Genera el contenido para la página de inicio de un sitio de "${plan.niche}" en "${plan.city}".
        
        Estructura requerida (JSON):
        {
            "hero": {
                "heading": "${plan.home_structure?.h1 || `${plan.niche} en ${plan.city}`}",
                "subheading": "Subtítulo persuasivo de 15-20 palabras"
            },
            "seoContentTitle": "${plan.home_structure?.h2s?.[0] || `¿Por qué elegir nuestros servicios de ${plan.niche}?`}",
            "seoContent": "Texto SEO de 500-600 palabras en formato Markdown. Usa H2 y H3. Ataca la keyword principal '${plan.niche} en ${plan.city}'.",
            "features": [
                { "title": "Característica 1", "description": "Breve descripción" },
                { "title": "Característica 2", "description": "Breve descripción" },
                { "title": "Característica 3", "description": "Breve descripción" }
            ],
            "faq": [
                { "question": "Pregunta 1", "answer": "Respuesta breve" },
                { "question": "Pregunta 2", "answer": "Respuesta breve" },
                { "question": "Pregunta 3", "answer": "Respuesta breve" },
                { "question": "Pregunta 4", "answer": "Respuesta breve" }
            ]
        }
        
        INSTRUCCIONES ADICIONALES:
        - ${faqInstruction}
        - El tono debe ser profesional y confiable.
    `;

    const homeData = await generateData(homePrompt, 'Home Page');

    if (homeData) {
        // Helper para escapar strings YAML
        const escapeYaml = (str) => {
            if (!str) return '';
            // Si contiene caracteres especiales, envolver en comillas
            if (str.includes(':') || str.includes('#') || str.includes('|') || str.includes('>')) {
                return `"${str.replace(/"/g, '\\"')}"`;
            }
            return str;
        };

        const homeMdx = `---
hero:
  heading: ${escapeYaml(homeData.hero.heading)}
  headingHighlight: ${homeData.hero.headingHighlight}
  subheading: >-
    ${homeData.hero.subheading}
servicesSection:
  title: ${plan.niche}
  titleHighlight: en ${plan.city}
  subtitle: >-
    Servicio profesional y garantizado. Presupuesto sin compromiso.
features:
${homeData.features.map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${f.description}`).join('\n')}
seoContentTitle: ${escapeYaml(homeData.seoContentTitle)}
faq:
${homeData.faq.map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
blocks:
  - discriminant: hero
  - discriminant: services
  - discriminant: about
  - discriminant: features
  - discriminant: cta
---

${homeData.seoContent}
`;

        await fs.mkdir('src/content/pages', { recursive: true });
        await fs.writeFile('src/content/pages/home.mdx', homeMdx);
        console.log(`   ✅ Home generada con contenido SEO`);
    } else {
        console.warn(`   ⚠️  No se pudo generar contenido para Home`);
    }

    // 3. CONFIGURAR EL NEGOCIO (GLOBAL SETTINGS)
    console.log("\n⚙️  Configurando Keystatic...");

    const businessConfig = {
        "siteName": plan.siteName || `${plan.niche} ${plan.city}`,
        "niche": plan.niche,
        "city": plan.city,
        "phone": "600 000 000",
        "email": "contacto@ejemplo.com",
        "businessType": "LocalBusiness",
        "ctaText": "Pedir Presupuesto",
        "coordinates": { "lat": "40.416", "lng": "-3.703" }
    };

    await fs.mkdir('src/content/business', { recursive: true });
    await fs.writeFile('src/content/business/global.json', JSON.stringify(businessConfig, null, 2));

    // 3. GENERAR SERVICIOS (MDX) - Usando clusters
    const services = plan.clusters || [];
    console.log(`\n🛠️  Generando ${services.length} Servicios...`);

    for (const cluster of services) {
        const serviceName = cluster.name;
        console.log(`   > ${serviceName}...`);
        const slug = serviceName.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Obtener la sugerencia seleccionada o la primera por defecto
        const selectedIdx = cluster.selected_suggestion || 0;
        const metaTags = cluster.meta_suggestions?.[selectedIdx] || {
            h1: cluster.h1 || serviceName,
            seo_title: cluster.seo_title || serviceName,
            seo_description: cluster.seo_description || `Servicios de ${serviceName}`
        };

        const prompt = `
            Genera datos JSON para página de servicio.
            - Servicio: "${serviceName}"
            - Ciudad: "${plan.city}"
            - Nicho: "${plan.niche}"
            - Focal Keyword: "${cluster.main_keyword}"
            - Keywords relacionadas: ${JSON.stringify(cluster.keywords?.slice(0, 5).map(k => k.keyword))}
            
            JSON Structure:
            {
                "title": "${metaTags.h1}",
                "shortDesc": "Short SEO description (100 chars)",
                "seoTitle": "${metaTags.seo_title}",
                "seoDesc": "${metaTags.seo_description}",
                "content": "Markdown text (400 words). Incluye las keywords relacionadas de forma natural."
            }
        `;

        const data = await generateData(prompt);
        if (data) {
            const mdx = `---
title: "${data.title}"
shortDesc: "${data.shortDesc}"
icon: "Hammer"
heroImage: "/images/services/default.jpg"
seoTitle: "${data.seoTitle}"
seoDesc: "${data.seoDesc}"
blocks:
  - discriminant: "hero"
  - discriminant: "content"
  - discriminant: "cta"
---
${data.content}`;

            const filePath = path.join('src/content/services', `${slug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            console.log(`      ✅ Creado: ${slug}.mdx`);
        } else {
            console.warn(`      ⚠️  SALTADO: No se pudo generar ${serviceName}`);
        }
    }

    // 4. GENERAR ZONAS (MDX)
    console.log(`\n🌍 Generando ${plan.locations.length} Zonas...`);

    for (const location of plan.locations) {
        console.log(`   > ${location}...`);
        const slug = location.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const prompt = `
            Genera Landing Page Local.
            - Zona: "${location}"
            - Ciudad: "${plan.city}"
            
            JSON Structure:
            {
                "name": "${location}",
                "seoTitle": "Meta Title",
                "seoDesc": "Meta Description",
                "zipCode": "Código postal realista",
                "content": "Markdown text (300 words)"
            }
        `;

        const data = await generateData(prompt);
        if (data) {
            const zipArray = data.zipCode ? `["${data.zipCode}"]` : `[]`;
            const mdx = `---
name: "${data.name}"
type: "residencial"
zipCodes: ${zipArray}
seoTitle: "${data.seoTitle}"
seoDesc: "${data.seoDesc}"
blocks:
  - discriminant: "hero"
  - discriminant: "features"
  - discriminant: "map"
  - discriminant: "content"
  - discriminant: "cta"
---
${data.content}`;

            const filePath = path.join('src/content/locations', `${slug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            console.log(`      ✅ Creado: ${slug}.mdx`);
        } else {
            console.warn(`      ⚠️  SALTADO: No se pudo generar ${location}`);
        }
    }

    console.log("\n✅ SITIO COMPLETADO. Ejecuta 'npm run dev'.");
}

main();