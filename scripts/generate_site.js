import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from 'json5';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" }
});

// Helper para evitar rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para crear JSONs de datos
async function generateData(prompt, context = '') {
    let text = '';
    try {
        console.log(`      ⏳ Consultando a Gemini (${context})...`);
        const result = await model.generateContent(prompt);
        text = result.response.text();

        // Limpiar el texto: remover markdown code blocks
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON5.parse(jsonStr);

        await delay(2000); // Delay para evitar rate limits
        return parsed;
    } catch (error) {
        console.error(`      ❌ ERROR en generateData (${context}):`, error.message);
        if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`      ⏸️  Rate limit detectado, esperando 30 segundos...`);
            await delay(30000);
        }
        return null; // Devolver null para manejar el error arriba
    }
}

// Función para generar FAQs con Gemini (Priorizando PAA)
async function generateFAQs(serviceName, city, longTailKeywords, paaQuestions = []) {
    // Unimos keywords con comas para que se entiendan como conceptos relacionados, no solo una lista
    const keywordsString = (longTailKeywords || []).map(k => k.keyword).join(', ');

    // Lógica para instrucciones de PAA
    let paaInstructions = '';
    const relevantPAA = paaQuestions.slice(0, 5).map(q => `- ${q.question}`).join('\n');

    if (relevantPAA.length > 0) {
        paaInstructions = `
        OBJETIVO PRINCIPAL: Responder a las intenciones de búsqueda reales de los usuarios.
        Usa PRIORITARIAMENTE las siguientes preguntas "People Also Ask" (PAA) de Google si son coherentes con el servicio:
        ${relevantPAA}
        
        Si alguna PAA es demasiado genérica, adáptala ligeramente al contexto de "${serviceName}".
        Si necesitas completar hasta llegar a 4 preguntas, genera nuevas basadas en los "Puntos de Dolor" habituales de este servicio.
        `;
    } else {
        paaInstructions = `
        Genera 4 preguntas frecuentes basadas en los problemas más comunes, dudas sobre precios o tiempos de espera que suelen tener los clientes de "${serviceName}".
        `;
    }

    const prompt = `
    ACTÚA COMO: Experto en atención al cliente y artesano veterano.
    
    TAREA: Generar sección de FAQs para "${serviceName}" en "${city}".
    
    INPUT DATA:
    - Keywords Semánticas: ${keywordsString}
    - Preguntas Reales (Google PAA): ${JSON.stringify(relevantPAA)}
    
    REGLAS:
    1. TONO: Autoridad empática. Respuestas de 40-60 palabras.
    2. LOCALIZACIÓN: Menciona "${city}" o normativas locales si aplica.
    3. SCHEMA: Estructura lista para FAQSchema.
    
    FORMATO DE SALIDA (JSON ÚNICO Y ESTRICTO):
    Devuelve SOLO un objeto JSON con esta estructura exacta:
    {
        "faqs": [
            {
                "question": "Pregunta frecuente (usar las PAA si son relevantes o variaciones)",
                "answer": "Respuesta directa, útil y con keyword semántica integrada de forma natural."
            },
            {
                "question": "Pregunta sobre precio/presupuesto",
                "answer": "Respuesta orientativa sin dar precio fijo, enfatizando 'ver el trabajo in situ'."
            },
            {
                "question": "Pregunta sobre tiempos/garantía",
                "answer": "Respuesta que denote profesionalidad."
            },
            {
                "question": "Pregunta sobre urgencias o disponibilidad en ${city}",
                "answer": "Respuesta local."
            }
        ]
    }
    `;

    // Nota: Si usas la API de Gemini directamente, asegúrate de pasar config: { responseMimeType: "application/json" }
    const data = await generateData(prompt, `FAQs ${serviceName}`);
    return data?.faqs || [];
}

async function main() {
    console.log("🚀 INICIANDO GENERADOR DE SITIO (ARTISAN MODE)...");

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
    } else {
        console.warn("⚠️ No hay clusters definidos en el plan.");
    }

    // 3. GENERAR HOME (Con estructura definida por usuario + Main Cluster)
    console.log(`\n🏠 Generando Home (Artisan Quality)...`);

    // Usar H1 del plan o del main cluster
    const homeH1 = plan.home_structure?.h1 || mainCluster?.meta_suggestions?.[0]?.h1 || `${plan.niche} en ${cityName}`;
    const homeH2s = plan.home_structure?.h2s || [];

    // Keywords del main cluster para enriquecer
    const mainKeywords = mainCluster?.keywords?.map(k => k.keyword).slice(0, 10) || [];

    // Lista de servicios para contexto
    const servicesList = serviceClusters.map(c => c.name);

    // --- 2. GENERAR HOME (Con "One Page Mode" en mente) ---
    console.log(`\n🏠 Generando Home (Artisan Quality)...`);

    // Si es One Page Mode, pedimos explícitamente que incluya los servicios como "features" o una lista
    const isOnePage = plan.one_page_mode === true;
    const onePageInstruction = isOnePage
        ? `MODO ONE PAGE ACTIVO: Esta será la ÚNICA página del sitio. 
           - Debes incluir una lista detallada de los servicios principales (${servicesList.join(', ')}) dentro de la sección 'services_list'.
           - El contenido debe ser muy completo, cubriendo lo que normalmente iría en páginas separadas.`
        : "";

    const homePrompt = `
    ACTÚA COMO: Un experto en SEO Local y Copywriting Persuasivo.
    
    TAREA: Escribir el contenido para la HOME de una web de "${plan.niche}" en "${cityName}".
    ${onePageInstruction}
    
    ESTRUCTURA MENTAL (Artisan Mode):
    - Tono: Profesional, cercano, de "oficio". No corporativo frío.
    - Autoridad: Habla de "nuestro taller", "técnicas propias", "acabados perfectos".
    - Local: Menciona barrios reales de ${cityName} (ej: "trabajamos mucho por la zona centro...").
    - Anti-IA: PROHIBIDO usar palabras como "vibrante", "tapiz", "sinfonía", "inigualable". Sé directo.
    
    FORMATO DE SALIDA (JSON ÚNICO Y ESTRICTO):
    Devuelve SOLO un objeto JSON con esta estructura exacta:
    {
        "meta": {
            "title": "Title tag optimizado (max 60 chars)",
            "description": "Meta description persuasiva con CTR alto"
        },
        "hero_section": {
            "h1": "${homeH1}",
            "subheadline": "Subtítulo de 2 líneas que refuerce la propuesta de valor local",
            "cta_primary": "Texto botón (ej: Pedir Presupuesto)",
            "cta_secondary": "Texto botón secundario (ej: Ver Galería)"
        },
        "intro_content": {
            "title": "Un título H2 atractivo",
            "paragraphs": ["Párrafo 1 (historia/local)", "Párrafo 2 (calidad/garantía)"]
        },
        "services_grid_intro": "Breve frase introductoria antes de mostrar los servicios",
        "why_us_bullets": [
            { "title": "Título beneficio", "desc": "Descripción corta" },
            { "title": "Título beneficio", "desc": "Descripción corta" },
            { "title": "Título beneficio", "desc": "Descripción corta" }
        ],
        "features": [ 
             { "title": "Ventaja 1", "description": "Desc..." },
             { "title": "Ventaja 2", "description": "Desc..." },
             { "title": "Ventaja 3", "description": "Desc..." }
        ],
        "services_list": [ // SOLO SI ES ONE PAGE MODE
             { "title": "Servicio 1", "description": "Descripción detallada del servicio..." },
             { "title": "Servicio 2", "description": "Descripción detallada del servicio..." }
        ],
        "process": {
            "title": "Nuestro Proceso de Trabajo",
            "description": "Cómo garantizamos la excelencia en cada paso.",
            "steps": [
                { "title": "Paso 1", "description": "Descripción detallada..." },
                { "title": "Paso 2", "description": "Descripción detallada..." },
                { "title": "Paso 3", "description": "Descripción detallada..." }
            ]
        },
        "local_closing": "Párrafo final mencionando zonas de cobertura en ${cityName}",
        "faq": [
            { "question": "Pregunta 1", "answer": "Respuesta 1" },
            { "question": "Pregunta 2", "answer": "Respuesta 2" },
            { "question": "Pregunta 3", "answer": "Respuesta 3" }
        ]
    }
    `;

    const homeData = await generateData(homePrompt, 'Home Page');

    if (homeData) {
        // Generar testimonios realistas
        const testimonialsPrompt = `Genera 3 testimonios muy realistas para ${plan.niche} en ${cityName}. Que mencionen servicios específicos como ${servicesList.slice(0, 3).join(', ')}. Usa barrios reales. JSON: { "testimonials": [{ "quote": "...", "author": "...", "location": "...", "initials": ".." }] }`;
        const testimonialsData = await generateData(testimonialsPrompt, 'Testimonials');

        const escapeYaml = (str) => str ? `"${str.replace(/"/g, '\\"')}"` : '""';
        const indentYaml = (str) => str ? str.replace(/\n/g, '\n    ') : '';

        // Si es One Page, usamos la lista de servicios generada por IA o un fallback
        let finalServicesList = homeData.services_list || [];
        if (isOnePage && finalServicesList.length === 0) {
            finalServicesList = servicesList.slice(0, 6).map(s => ({
                title: s,
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
  image: "/images/home/about-placeholder.jpg"
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
        console.log(`\n🛠️ Generando ${serviceClusters.length} Páginas de Servicios...`);

        for (const cluster of serviceClusters) {
            const serviceName = cluster.name;
            console.log(`   > ${serviceName}...`);
            const serviceSlug = serviceName
                .toLowerCase()
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const clusterKeywords = cluster.keywords.map(k => k.keyword);
            const selectedIdx = cluster.selected_suggestion || 0;
            const metaTags = cluster.meta_suggestions?.[selectedIdx] || { h1: serviceName, seo_title: serviceName, seo_description: "" };

            // --- NUEVO PROMPT SERVICIO ---
            const servicePrompt = `
            ACTÚA COMO: Un técnico especialista senior en "${serviceName}".
            
            TAREA: Escribir una LANDING PAGE DE VENTA para este servicio en "${cityName}".
            
            KEYWORDS (DATASET COMPLETO - REFERENCIA SEMÁNTICA):
            ${clusterKeywords.join(', ')}
            
            ESTRUCTURA MENTAL:
            - No vendas humo, vende solución técnica.
            - Habla de materiales específicos, marcas de calidad o herramientas.
            - Explica el proceso paso a paso para generar confianza.
            - IMPORTANTE: Tienes acceso a todas las keywords del cluster. Úsalas para enriquecer el texto con la mayor variedad semántica posible. No es necesario usarlas todas literalmente si son redundantes, pero sí cubrir todas las INTENCIONES de búsqueda que representan.
            - NO hagas "keyword stuffing". Prioriza la naturalidad.
            
            FORMATO DE SALIDA (JSON ÚNICO Y ESTRICTO):
            Devuelve SOLO un objeto JSON con esta estructura exacta:
            {
                "meta": {
                    "title": "Title tag enfocado en ${serviceName} ${cityName}",
                    "description": "Meta description transaccional incluyendo keywords principales"
                },
                "hero": {
                    "h1": "${metaTags.h1}", 
                    "lead_text": "Texto introductorio atacando el problema principal del cliente y usando keywords."
                },
                "problem_agitation": {
                    "h2": "Título sobre el problema (ej: ¿Grietas que vuelven a salir?)",
                    "content": "Texto empático describiendo la molestia. Integra keywords de dolor (ej: humedad, desconchones)."
                },
                "solution_technical": {
                    "h2": "Nuestra solución técnica",
                    "content": "Descripción de la solución usando terminología experta. Integra keywords de solución."
                },
                "process_steps": [
                    { "step_number": 1, "title": "Preparación", "description": "Detalle técnico..." },
                    { "step_number": 2, "title": "Ejecución", "description": "Detalle técnico..." },
                    { "step_number": 3, "title": "Acabados", "description": "Detalle técnico..." }
                ],
                "materials_section": {
                    "title": "Materiales que utilizamos",
                    "items": ["Material 1", "Material 2", "Herramienta especial"]
                },
                "final_cta": "Frase de cierre contundente para pedir presupuesto"
            }
            `;

            const data = await generateData(servicePrompt, serviceName);
            if (data) {
                // Pasamos las preguntas PAA del plan global
                const faqs = await generateFAQs(serviceName, cityName, cluster.keywords, plan.raw_data?.paa_questions || []);
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

    // 4. GENERAR ZONAS (OPCIONAL)
    if (plan.generate_locations) {
        console.log(`\n🌍 Generando ${plan.locations.length} Zonas (Artisan Local Mode)...`);

        for (const location of plan.locations) {
            console.log(`   > ${location}...`);
            const slug = location.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const prompt = `
                Escribe una Landing Page Local para "${plan.niche}" en el barrio/zona de "${location}", ${cityName}.
                
                IMPORTANTE - CONTEXTO LOCAL:
                - Investiga (simula conocimiento) sobre el tipo de viviendas en ${location} (ej: pisos antiguos, obra nueva, casas).
                - Menciona calles principales o puntos de referencia de ${location} si es posible.
                - Adapta el discurso: Si es zona histórica, habla de restauración. Si es nueva, de instalación moderna.
                
                JSON:
                {
                    "name": "${location}",
                    "seoTitle": "${plan.niche} en ${location} | Servicio Local",
                    "seoDesc": "Servicio de ${plan.niche} en ${location}. Llegamos rápido, conocemos la zona. Presupuesto gratis.",
                    "content": "Markdown (300 palabras). Muy enfocado en la cercanía y conocimiento del barrio."
                }
            `;

            const data = await generateData(prompt, location);
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
    } else {
        console.log(`\n🌍 Saltando generación de zonas (Desactivado en configuración).`);
    }

    console.log("\n✅ SITIO COMPLETADO.");
}

main();