import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from 'json5';
import dotenv from 'dotenv';
import { validateContent, injectInternalLinks } from './content_processor.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-pro";
const CACHE_DIR = path.join(process.cwd(), '.cache', 'gemini');

// Asegurar directorio de caché
if (!fsSync.existsSync(CACHE_DIR)) {
    fsSync.mkdirSync(CACHE_DIR, { recursive: true });
}

// --- UTILS ---
function calculateHash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

// Helper para evitar rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cargar y procesar prompts externos
async function loadPrompt(promptName, variables) {
    try {
        const promptPath = path.join(process.cwd(), 'src/prompts', `${promptName}.prompt.md`);
        let content = await fs.readFile(promptPath, 'utf-8');

        // Reemplazo simple de variables {{variable}}
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            // Manejamos arrays y objetos JSON stringified para listas complejas
            let valStr = value;
            if (Array.isArray(value)) valStr = value.join(', ');
            if (typeof value === 'object' && value !== null) valStr = JSON.stringify(value);

            content = content.replace(regex, valStr || '');
        }
        return content;
    } catch (error) {
        console.error(`❌ Error cargando prompt ${promptName}:`, error.message);
        return null; // Prompt no encontrado
    }
}

// Función auxiliar para crear JSONs de datos (CON CACHÉ)
async function generateData(prompt, context = '') {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ ERROR: Falta GEMINI_API_KEY en .env");
        return null;
    }

    // CACHE CHECK
    const cacheKey = `${context.replace(/[^a-z0-9]/gi, '_')}_${calculateHash(prompt)}.json`;
    const cachePath = path.join(CACHE_DIR, cacheKey);

    if (fsSync.existsSync(cachePath)) {
        console.log(`      ⚡ Cache hit: ${context}`);
        try {
            const cachedData = JSON.parse(await fs.readFile(cachePath, 'utf-8'));
            return cachedData;
        } catch (e) {
            console.warn("      ⚠️ Error leyendo caché, regenerando...");
        }
    }

    console.log(`      ⏳ Consultando a Gemini (${context})...`);

    // Configuración del modelo (re-instanciado o re-usado)
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
    });

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extracción Robusta de JSON (Soporte para CoT/Reasoning)
        // Busca el primer '{' y el último '}' para aislar el objeto JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.warn(`      ⚠️ No se encontró JSON válido en la respuesta (${context}). Intentando limpieza básica...`);
            // Fallback a limpieza simple
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON5.parse(jsonStr); // Si falla aquí, irá al catch interactivo

            // GUARDAR EN CACHÉ
            await fs.writeFile(cachePath, JSON.stringify(parsed, null, 2));
            await delay(2000);
            return parsed;
        }

        const jsonStr = jsonMatch[0];
        const parsed = JSON5.parse(jsonStr);

        // VALIDACIÓN DE CONTENIDO (Anti-IA)
        const validation = validateContent(parsed);
        if (!validation.valid) {
            console.warn(`      ⚠️ ADVERTENCIA DE CALIDAD (${context}):`);
            validation.warnings.forEach(w => console.warn(`         ${w}`));
        }

        // GUARDAR EN CACHÉ
        await fs.writeFile(cachePath, JSON.stringify(parsed, null, 2));

        await delay(2000); // Delay para evitar rate limits
        return parsed;

    } catch (error) {
        console.error(`      ❌ ERROR en generateData (${context}):`, error.message);
        if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`      ⏸️  Rate limit detectado, esperando 30 segundos...`);
            await delay(30000);
            // Podríamos reintentar aquí recursivamente si quisiéramos
        }
        return null;
    }
}

// Función para generar FAQs con Gemini (REFFACTORIZADA)
async function generateFAQs(serviceName, city, longTailKeywords, paaQuestions = [], cityContextData = "{}") {
    // Unimos keywords con comas para que se entiendan como conceptos relacionados
    const keywordsString = (longTailKeywords || []).map(k => k.keyword).join(', ');

    // Lógica para instrucciones de PAA
    let relevantPAA = "";
    if (paaQuestions.length > 0) {
        relevantPAA = paaQuestions.slice(0, 5).map(q => `- ${q.question}`).join('\n');
    } else {
        relevantPAA = "No hay preguntas PAA específicas disponibles. Genera preguntas basadas en dudas comunes (precio, tiempo, urgencia).";
    }

    const prompt = await loadPrompt('faq', {
        serviceName,
        city,
        keywordsString,
        relevantPAA,
        cityContext: cityContextData
    });

    if (!prompt) return [];

    const data = await generateData(prompt, `FAQs ${serviceName}`);
    return data?.faqs || [];
}

async function main() {
    console.log("🚀 INICIANDO GENERADOR DE SITIO (MODO INTEGRADO)...");

    // 1. LEER EL PLAN (FUENTE DE LA VERDAD)
    let plan;
    try {
        const raw = await fs.readFile('project_plan.json', 'utf-8');
        plan = JSON.parse(raw);
        if (!plan.niche || !plan.city) throw new Error("Plan corrupto");
        console.log(`Target: ${plan.niche} en ${plan.city}`);
    } catch (error) {
        console.error("❌ Error crítico leyendo plan:", error.message);
        return;
    }

    const cityName = plan.city.split(',')[0].trim();

    // --- LEER CONTEXTO DE CIUDAD ---
    let cityContextData = "";
    try {
        const cityDataPath = path.join(process.cwd(), 'src/data/city_data.json');
        if (fsSync.existsSync(cityDataPath)) {
            const raw = await fs.readFile(cityDataPath, 'utf-8');
            cityContextData = raw; // Pasamos el string JSON crudo o lo parseamos para procesarlo mejor
            console.log("🏙️ Contexto de ciudad cargado: src/data/city_data.json");
        } else {
            console.warn("⚠️ No se encontró src/data/city_data.json, usando contexto básico.");
            cityContextData = JSON.stringify({ city: cityName, note: "Sin datos específicos." });
        }
    } catch (e) {
        console.warn("⚠️ Error leyendo city_data.json:", e.message);
    }


    // --- 1.5 ASEGURAR DIRECTORIOS DE CONTENIDO ---
    // Astro falla si las carpetas de colecciones no existen, aunque estén vacías.
    const contentDirs = [
        'src/content/services',
        'src/content/locations',
        'src/content/testimonials',
        'src/content/pages',
        'src/content/business',
        'src/content/design',
        'src/content/social',
        'src/content/analytics',
        'src/content/schema',
        'src/content/navigation',
        'src/content/footer',
        'src/content/projects',
        'src/content/blog'
    ];

    console.log("📁 Asegurando estructura de directorios...");
    for (const dir of contentDirs) {
        await fs.mkdir(dir, { recursive: true });
    }

    // --- APPLY DESIGN STYLE ---
    try {
        const designStyle = plan.design_style || 'industrial';
        let fontPair = 'modern';

        // Intelligent font mapping
        const fontMap = {
            'industrial': 'robust',
            'corporate': 'modern',
            'nature': 'friendly',
            'urgent': 'modern',
            'legal': 'elegant',
            'health': 'clean', // clean isn't in config? check fallback
            'luxury': 'elegant',
            'beauty': 'elegant',
            'tech': 'tech',
            'clean_light': 'modern',
            'clay_paper': 'artisan_warm',
            'forest_stone': 'artisan_natural',
            'classic_workshop': 'artisan_classic'
        };

        // Fallback checks just in case
        fontPair = fontMap[designStyle] || 'modern';
        if (designStyle === 'health') fontPair = 'modern'; // Fix potential issue if 'clean' font doesn't exist

        const designYaml = `theme: ${designStyle}\nfontPair: ${fontPair}\n`;
        await fs.mkdir('src/content/design', { recursive: true });
        await fs.writeFile('src/content/design/global.yaml', designYaml);
        console.log(`🎨 Diseño aplicado: ${designStyle} (Font: ${fontPair})`);
    } catch (e) {
        console.error("⚠️ Error aplicando diseño:", e.message);
    }

    // 2. IDENTIFICAR CLUSTER PRINCIPAL (HOME)
    // Buscamos el cluster con mayor volumen y relevancia para ser la Home
    let mainCluster = null;
    let serviceClusters = [];

    if (plan.clusters && plan.clusters.length > 0) {
        // Ordenar por volumen descendente
        const sortedClusters = [...plan.clusters].sort((a, b) => b.volume - a.volume);

        // El mejor candidato es el primero (mayor volumen)
        mainCluster = sortedClusters[0];

        // El resto son servicios
        serviceClusters = plan.clusters.filter(c => c.name !== mainCluster.name);

        console.log(`🏆 Main Cluster detectado para Home: "${mainCluster.name}" (Vol: ${mainCluster.volume})`);
        console.log(`📦 Clusters restantes para Servicios: ${serviceClusters.length}`);
    } else if (plan.services) {
        // Nueva lógica con Servicios y Blog separados
        const sortedServices = [...plan.services].sort((a, b) => b.volume - a.volume);
        mainCluster = sortedServices[0];
        serviceClusters = sortedServices.filter(c => c.name !== mainCluster.name);
        console.log(`🏆 Main Service detectado para Home: "${mainCluster.name}" (Vol: ${mainCluster.volume})`);
        console.log(`📦 Servicios adicionales: ${serviceClusters.length}`);
    } else {
        console.warn("⚠️ No hay clusters/servicios definidos en el plan.");
    }

    // 3. GENERAR HOME (Con estructura definida por usuario + Main Cluster)
    console.log(`\n🏠 Generando Home (Calidad IA)...`);
    // 3. GENERAR HOME
    console.log("\n🏠 Generando Home (Calidad IA)...");

    // Usar H1 del plan (Prioridad 1) o del main cluster (Prioridad 2)
    const homeH1 = plan.home_structure?.h1 || (mainCluster ? mainCluster.cluster_name : `${plan.niche} en ${cityName}`);

    // Keywords del main cluster para enriquecer
    // const mainKeywords = mainCluster?.keywords?.map(k => k.keyword).slice(0, 10) || [];

    // Lista de servicios para contexto (Enriquezida con keywords)
    const servicesContext = serviceClusters.map(c => ({
        name: c.cluster_name,
        keywords: c.keywords.slice(0, 5).map(k => k.keyword).join(', ')
    }));

    // Si es One Page Mode, pedimos explícitamente que incluya los servicios como "features" o una lista
    const isOnePage = plan.one_page_mode === true;
    const onePageInstruction = isOnePage
        ? `🚨 MODO ONE PAGE (LANDING ÚNICA) ACTIVO 🚨
           Esta será la ÚNICA página del sitio. El objetivo es convertir visitas en clientes sin que naveguen a otras páginas.
           
           INSTRUCCIONES CRÍTICAS:
           1. Genera una sección 'services_list' MUY ROBUSTA.
           2. Para cada servicio de la lista (${servicesContext.map(s => s.name).join(', ')}), debes incluir:
              - Título atractivo.
              - Descripción persuasiva de 2-3 líneas (menciona beneficios).
              - Una lista de "features" o puntos clave dentro de la descripción si es posible.
           3. El contenido debe ser suficiente para vender el servicio sin necesidad de hacer clic.
           
           Contexto de Keywords por Servicio:
           ${servicesContext.map(s => `- ${s.name}: ${s.keywords}`).join('\n           ')}`
        : "";

    // Construir instrucción de estructura personalizada
    let structureInstruction = "";
    // Solo forzamos la estructura manual (H2s de servicios) si estamos en One Page Mode.
    // En modo Multi-Page, dejamos que la IA decida la mejor estructura de navegación.
    if (isOnePage && plan.home_structure?.h2s && plan.home_structure.h2s.length > 0) {
        structureInstruction = `ESTRUCTURA VISUAL REQUERIDA (Adapta el JSON a esto):
        El usuario ha definido estos encabezados (H2) que DEBEN estar representados en el contenido (ya sea como secciones, items de lista o features):
        - ${plan.home_structure.h2s.join('\n        - ')}`;
    }

    // CARGAR PROMPT DESDE ARCHIVO
    const homePrompt = await loadPrompt('home', {
        niche: plan.niche,
        cityName: cityName,
        homeH1: homeH1,
        onePageInstruction: onePageInstruction,
        structureInstruction: structureInstruction,
        servicesList: servicesContext.map(s => s.name).join(', '), // Mantener compatibilidad simple
        cityContext: cityContextData
    });

    if (!homePrompt) return; // Exit if prompt load fails

    let homeData = await generateData(homePrompt, 'Home Page');

    if (homeData) {
        // ENLAZADO INTERNO
        // homeData = injectInternalLinks(homeData, linksMap); // Assuming injectInternalLinks is defined elsewhere

        // Generar testimonios (también con prompt externo)
        const servicesNames = servicesContext.map(s => s.name);
        const testimonialsPrompt = await loadPrompt('testimonials', {
            niche: plan.niche,
            cityName: cityName,
            servicesList: servicesNames.slice(0, 3).join(', ')
        });

        const testimonialsData = await generateData(testimonialsPrompt, 'Testimonials');

        const escapeYaml = (str) => str ? `"${str.replace(/"/g, '\\"')}"` : '""';
        const indentYaml = (str) => str ? str.replace(/\n/g, '\n    ') : '';

        // Si es One Page, usamos la lista de servicios generada por IA o un fallback
        let finalServicesList = homeData.services_list || [];
        if (isOnePage && finalServicesList.length === 0) {
            finalServicesList = servicesContext.slice(0, 6).map(s => ({
                title: s.name,
                description: `Especialistas en ${s.toLowerCase()} en ${cityName}.`
            }));
        }

        // MAPPING NUEVO JSON -> MDX
        const homeMdx = `---
hero:
  heading: ${escapeYaml(homeData.hero_section?.h1)}
  subheading: >-
    ${indentYaml(homeData.hero_section?.subheadline)}
servicesSection:
  title: ${plan.niche.charAt(0).toUpperCase() + plan.niche.slice(1)}
  titleHighlight: en ${cityName}
  subtitle: >-
    ${indentYaml(homeData.services_grid_intro || "Soluciones profesionales a medida.")}
aboutSection:
  title: ${escapeYaml(homeData.intro_content?.title)}
  description: >-
    ${indentYaml(homeData.intro_content?.paragraphs?.join('\n\n') || "")}
  yearsExperience: "15+"
  image: "/images/home/hero-placeholder.jpg"
  features:
${(homeData.why_us_bullets || []).map(f => `    - title: ${escapeYaml(f.title)}\n      description: ${escapeYaml(f.desc)}`).join('\n')}
  buttonText: "Solicitar Visita Técnica"
  buttonLink: "/contacto"
features:
${(homeData.features || []).map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${escapeYaml(f.description)}`).join('\n')}
servicesList:
${finalServicesList.map(s => `  - title: ${escapeYaml(s.title)}\n    description: ${escapeYaml(s.description)}`).join('\n')}
process:
  title: ${escapeYaml(homeData.process?.title || "Nuestro Proceso")}
  description: ${escapeYaml(homeData.process?.description || "")}
  steps:
${(homeData.process?.steps || []).map(s => `    - title: ${escapeYaml(s.title)}\n      description: ${escapeYaml(s.description)}`).join('\n')}
testimonials:
${(testimonialsData?.testimonials || []).map(t => `  - quote: ${escapeYaml(t.quote)}\n    author: "${t.author}"\n    location: "${t.location}"\n    initials: "${t.initials}"`).join('\n')}
seoContentTitle: "Expertos en ${plan.niche}"
faq:
${(homeData.faq || []).map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
contactSection:
  title: "Contacta con Nosotros"
  subtitle: >-
    ${indentYaml(homeData.local_closing || "Presupuesto sin compromiso.")}
locationsSection:
  title: "Zonas de Servicio"
  subtitle: "Llegamos a toda la ciudad."
stickyPhone: true
blocks:
  - discriminant: "hero"
${isOnePage ? '  - discriminant: "services_list"' : '  - discriminant: "services"'}
  - discriminant: "about"
  - discriminant: "features"
  - discriminant: "process"
  - discriminant: "testimonials"
  - discriminant: "faq"
  - discriminant: "contact"
  - discriminant: "locations"
  - discriminant: "cta"
  - discriminant: "content"
---

${homeData.intro_content?.paragraphs?.join('\n\n') || ""}
`;
        await fs.mkdir('src/content/pages', { recursive: true });
        await fs.writeFile('src/content/pages/home.mdx', homeMdx);
        console.log(`   ✅ Home generada`);
    }

    // 3. GENERAR SERVICIOS (Clusters)
    // 4. GENERAR PÁGINAS DE SERVICIOS (Desde Clusters Filtrados)
    if (isOnePage) {
        console.log(`\n⏸️ MODO ONE PAGE: Saltando generación de páginas de servicios.`);
    } else {
        // 4. GENERAR SERVICIOS (PÁGINAS INDIVIDUALES)
        console.log(`\n🛠️ Generando ${serviceClusters.length} Páginas de Servicios...`);

        for (const cluster of serviceClusters) {
            const serviceName = cluster.cluster_name;
            console.log(`   > ${serviceName}...`);
            const serviceSlug = serviceName
                .toLowerCase()
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const clusterKeywords = cluster.keywords.map(k => k.keyword);
            const selectedIdx = cluster.selected_suggestion || 0;
            const metaTags = cluster.meta_suggestions?.[selectedIdx] || { h1: serviceName, seo_title: serviceName, seo_description: "" };

            // Cargar prompt externo para el servicio
            const servicePrompt = await loadPrompt('service', {
                serviceName: serviceName,
                cityName: cityName,
                clusterKeywords: clusterKeywords.join(', '),
                h1: metaTags.h1,
                cityContext: cityContextData // Inyeccion de contexto
            });

            if (!servicePrompt) continue;

            let serviceData = await generateData(servicePrompt, `Service: ${serviceName}`);

            if (serviceData) {
                // ENLAZADO INTERNO
                serviceData = injectInternalLinks(serviceData, linksMap);

                // Generate FAQs using the existing generateFAQs function
                // Pasamos cityContextData a las FAQs
                const faqs = await generateFAQs(serviceName, cityName, cluster.keywords, plan.raw_data?.paa_questions || [], cityContextData);
                const faqYaml = faqs.map(q => `  - question: "${q.question}"\n    answer: >-\n      ${q.answer}`);

                // Generar enlaces relacionados
                const related = serviceClusters.filter(s => s.name !== serviceName).slice(0, 3).map(s => {
                    const sSlug = s.name
                        .toLowerCase()
                        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    return `- **[${s.name}](/servicios/${sSlug})**: Especialistas en ${s.name.toLowerCase()}.`;
                });

                // Construir contenido MDX desde las secciones del JSON
                const contentBody = `
## ${data.problem_agitation?.h2 || "El Problema"}
${data.problem_agitation?.content || ""}

## ${data.solution_technical?.h2 || "Nuestra Solución"}
${data.solution_technical?.content || ""}

## Proceso de Trabajo
${(data.process_steps || []).map(s => `### ${s.step_number}. ${s.title}\n${s.description}`).join('\n\n')}

## ${data.materials_section?.title || "Materiales"}
${(data.materials_section?.items || []).map(i => `- ${i}`).join('\n')}

> **${data.final_cta || "Contáctanos hoy mismo."}**
`;

                const mdx = `---
title: "${data.hero?.h1 || serviceName}"
shortDesc: "${data.hero?.lead_text?.slice(0, 100) || "Servicio profesional"}"
icon: "Hammer"
heroImage: "/images/services/default.jpg"
featured: true
seoTitle: "${data.meta?.title || serviceName}"
seoDesc: "${data.meta?.description || ""}"
faq:
${faqYaml.join('\n')}
blocks:
  - discriminant: "hero"
  - discriminant: "content"
  - discriminant: "faq"
  - discriminant: "cta"
---

${contentBody}

## Otros Servicios en ${cityName}

${related.join('\n')}
`;
                const filePath = path.join('src/content/services', `${serviceSlug}.mdx`);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, mdx);
                console.log(`      ✅ Servicio creado: ${serviceSlug}.mdx`);
            }
        }
    }

    // 4.5 GENERAR BLOG (ARTÍCULOS INFORMACIONALES)
    const blogPosts = plan.blog || [];
    if (blogPosts.length > 0) {
        console.log(`\n📰 Generando ${blogPosts.length} Artículos de Blog...`);

        for (const post of blogPosts) {
            const articleTitle = post.name;
            console.log(`   > ${articleTitle}...`);
            const postSlug = articleTitle
                .toLowerCase()
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const keywordsString = post.keywords?.map(k => k.keyword).join(', ') || "";
            const mainKeyword = post.main_keyword || articleTitle;

            // Cargar Prompt
            const blogPrompt = await loadPrompt('blog', {
                niche: plan.niche,
                cityName: cityName,
                articleTitle: articleTitle,
                mainKeyword: mainKeyword,
                keywordsString: keywordsString,
                cityContext: cityContextData
            });

            if (!blogPrompt) continue;

            let blogData = await generateData(blogPrompt, `Blog: ${articleTitle}`);

            if (blogData) {
                const escapeYaml = (str) => str ? `"${str.replace(/"/g, '\\"')}"` : '""';

                // Convertir Secciones a Markdown
                const sectionsMd = (blogData.sections || []).map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');

                const finalMdx = `---
title: ${escapeYaml(blogData.title)}
pubDate: "${new Date().toISOString().split('T')[0]}"
description: ${escapeYaml(blogData.seoDesc)}
author: "Equipo ${plan.niche}"
image: "/images/blog/default.jpg"
tags: ["${plan.niche}", "${cityName}"]
category: "Guías"
featured: false
intro: >-
  ${blogData.intro ? blogData.intro.replace(/\n/g, '\n  ') : ''}
---

${sectionsMd}

## Conclusión
${blogData.final_thoughts}
`;
                const filePath = path.join('src/content/blog', `${postSlug}.mdx`);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, finalMdx);
                console.log(`      ✅ Post creado: ${postSlug}.mdx`);
            }
        }
    } else {
        console.log(`\n📰 No hay artículos de blog planificados.`);
    }

    // 4. GENERAR ZONAS (OPCIONAL)
    // 4. GENERAR ZONAS (Soporte Dual: Modo IA vs Modo Spintax)
    if (plan.generate_locations) {

        // --- MODO SPINTAX ---
        if (plan.generation_mode === 'spintax' && plan.spintax_template) {
            console.log(`\n🏭 MODO SPINTAX: Generando ${plan.locations.length} Zonas usando Template...`);

            // Helper Spintax (Inlined to avoid import issues in build script)
            function spin(text) {
                if (!text || typeof text !== 'string') return text;
                const regex = /\{([^{}]+)\}/g;
                let processed = text;
                while (regex.test(processed)) {
                    processed = processed.replace(regex, (m, c) => {
                        const opt = c.split('|');
                        return opt[Math.floor(Math.random() * opt.length)];
                    });
                }
                return processed;
            }

            for (const location of plan.locations) {
                // Preparamos variables para inyectar en el template
                // El template puede usar {Location}, {City}, {Niche} además de Spintax normal
                const vars = {
                    Location: location,
                    City: cityName,
                    Niche: plan.niche
                };

                // Función para reemplazar variables {{Variable}} y luego procesar Spintax
                const processTemplate = (tpl) => {
                    let text = tpl;
                    // 1. Reemplazo de variables simples (ej: {{Location}})
                    for (const [key, val] of Object.entries(vars)) {
                        const vRegex = new RegExp(`{{${key}}}`, 'gi'); // Case insensitive
                        text = text.replace(vRegex, val);
                    }
                    // 2. Reemplazo simple sin llaves dobles si el usuario usó {Location}
                    // (Aunque Spintax usa {}, intentamos dar soporte básico a vars si no conflicto)
                    text = text.replace(/{Location}/gi, location)
                        .replace(/{City}/gi, cityName)
                        .replace(/{Niche}/gi, plan.niche);

                    // 3. Procesar Spintax
                    return spin(text);
                };

                const slug = location.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const tpl = plan.spintax_template;

                const mdx = `---
name: "${processTemplate(tpl.name || location)}"
type: "residencial"
zipCodes: []
seoTitle: "${processTemplate(tpl.seoTitle)}"
seoDesc: "${processTemplate(tpl.seoDesc)}"
blocks:
  - discriminant: "hero"
  - discriminant: "features"
  - discriminant: "map"
  - discriminant: "content"
  - discriminant: "cta"
---
${processTemplate(tpl.content)}`;

                const filePath = path.join('src/content/locations', `${slug}.mdx`);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, mdx);
                // Logging menos verboso para modo industrial
                if (plan.locations.indexOf(location) % 10 === 0) process.stdout.write('.');
            }
            console.log(`\n      ✅ ${plan.locations.length} zonas generadas (Modo Spintax).`);

        } else {
            // --- MODO IA (GEMINI) ---
            console.log(`\n🌍 Generando ${plan.locations.length} Zonas (Modo Local IA)...`);

            for (const location of plan.locations) {
                console.log(`   > ${location}...`);
                const slug = location.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // CARGAR PROMPT DESDE ARCHIVO
                const locationPrompt = await loadPrompt('location', {
                    niche: plan.niche,
                    location: location,
                    cityName: cityName,
                    cityContext: cityContextData
                });

                if (!locationPrompt) continue;

                const data = await generateData(locationPrompt, `Zona: ${location}`);
                if (data) {
                    const mdx = `---
name: "${data.name}"
type: "residencial"
zipCodes: []
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
                    console.log(`      ✅ Zona creada: ${slug}.mdx`);
                }
            }
        }
    } else {
        console.log(`\n🌍 Saltando generación de zonas (Desactivado en configuración).`);
    }

    console.log("\n✅ SITIO COMPLETADO.");
}

main();