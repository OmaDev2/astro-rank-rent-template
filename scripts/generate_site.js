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
    const keywordsList = (longTailKeywords || []).map(k => `- ${k.keyword}`).join('\n');

    // Filtrar preguntas PAA relevantes para este servicio si es posible
    // O usar las generales si no hay específicas
    const relevantPAA = paaQuestions.slice(0, 5).map(q => `- ${q.question}`).join('\n');

    let instructions = '';
    if (relevantPAA) {
        instructions = `
        USAR ESTAS PREGUNTAS REALES DE GOOGLE (PAA) COMO PRIORIDAD:
        ${relevantPAA}
        
        Si necesitas más, inventa otras relevantes basadas en las keywords.
        `;
    } else {
        instructions = `Crea 4 preguntas frecuentes altamente relevantes para este servicio.`;
    }

    const prompt = `
        Actúa como un artesano experto con 20 años de experiencia.
        Genera una sección de Preguntas Frecuentes (FAQs) para el servicio "${serviceName}" en "${city}".
        
        ${instructions}
        
        KEYWORDS (Contexto):
        ${keywordsList}
        
        INSTRUCCIONES DE RESPUESTA:
        1. Tono: Profesional, cercano, de experto a cliente.
        2. Respuestas detalladas (50-70 palabras) que demuestren conocimiento técnico.
        3. Incluye el nombre de la ciudad ("${city}") de forma natural en las respuestas.
        4. Formato JSON estricto.
        
        JSON:
        {
            "faqs": [
                { "question": "¿...?", "answer": "..." }
            ]
        }
    `;

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
    const mainKeywords = mainCluster?.keywords?.map(k => k.keyword).slice(0, 10).join(', ') || '';

    // Lista de servicios para contexto
    const servicesList = serviceClusters.map(c => c.name).join(', ');

    const homePrompt = `
        Actúa como un maestro artesano y experto en marketing local.
        Escribe el contenido para la home de una empresa de "${plan.niche}" en "${cityName}".
        
        CONTEXTO DE SERVICIOS OFRECIDOS:
        ${servicesList}
        
        FOCUS SEO:
        - Keyword Principal: "${mainCluster?.main_keyword || plan.niche + ' ' + cityName}"
        - Keywords Secundarias: ${mainKeywords}

        ESTRUCTURA OBLIGATORIA:
        - H1: "${homeH1}"
        - Secciones H2: ${JSON.stringify(homeH2s)}
        
        TONO Y ESTILO (ARTISAN):
        - Autoridad y Confianza: Habla de "nosotros", "nuestro taller", "nuestra experiencia".
        - Local: Menciona barrios específicos de ${cityName}, tradiciones locales o arquitectura típica si aplica.
        - Calidad: Enfatiza materiales, acabados, garantías y trato personal.
        - NO uses lenguaje genérico de IA ("En el vibrante paisaje de..."). Sé directo y profesional.
        
        JSON REQUERIDO:
        {
            "hero": {
                "heading": "${homeH1}",
                "subheading": "Subtítulo potente de 2 líneas que combine promesa de valor (seguridad/diseño) y garantía local."
            },
            "about": {
                "title": "Título atractivo sobre la empresa (ej: Herreros de Confianza en Barcelona)",
                "description": "Descripción de 3-4 líneas sobre la experiencia, el taller propio y el compromiso con el cliente. Sin relleno.",
                "features": [
                    { "title": "Característica 1 (ej: Taller Propio)", "description": "Breve explicación..." },
                    { "title": "Característica 2 (ej: Sin Intermediarios)", "description": "Breve explicación..." },
                    { "title": "Característica 3 (ej: Acabados Premium)", "description": "Breve explicación..." }
                ]
            },
            "seoContentTitle": "${homeH2s[0] || `Expertos en ${plan.niche}`}",
            "seoContent": "Texto en Markdown (600 palabras). Usa los H2 proporcionados. Incluye listas, negritas y párrafos cortos. Habla de la historia de la empresa en ${cityName} y menciona los servicios principales (${servicesList}).",
            "features": [
                { "title": "Ventaja Competitiva 1", "description": "Descripción detallada..." },
                { "title": "Ventaja Competitiva 2", "description": "Descripción detallada..." },
                { "title": "Ventaja Competitiva 3", "description": "Descripción detallada..." }
            ],
            "faq": [
                { "question": "Pregunta frecuente real 1", "answer": "Respuesta experta..." },
                { "question": "Pregunta frecuente real 2", "answer": "Respuesta experta..." },
                { "question": "Pregunta frecuente real 3", "answer": "Respuesta experta..." }
            ],
            "contactSection": {
                "title": "Título persuasivo para pedir presupuesto (ej: ¿Urgencia? Llámanos)",
                "subtitle": "Subtítulo que elimine fricción (ej: Sin compromiso, precio cerrado por teléfono)"
            },
            "locationsSection": {
                "title": "Título sobre cobertura geográfica (ej: Atendemos en todo ${cityName})",
                "subtitle": "Subtítulo sobre rapidez de desplazamiento"
            }
        }
    `;

    const homeData = await generateData(homePrompt, 'Home Page');

    if (homeData) {
        // Generar testimonios realistas
        const testimonialsPrompt = `Genera 3 testimonios muy realistas para ${plan.niche} en ${cityName}. Que mencionen servicios específicos como ${servicesList.split(',').slice(0, 3).join(', ')}. Usa barrios reales. JSON: { "testimonials": [{ "quote": "...", "author": "...", "location": "...", "initials": ".." }] }`;
        const testimonialsData = await generateData(testimonialsPrompt, 'Testimonials');

        const escapeYaml = (str) => str ? `"${str.replace(/"/g, '\\"')}"` : '';
        const indentYaml = (str) => str ? str.replace(/\n/g, '\n    ') : '';

        const homeMdx = `---
hero:
  heading: ${escapeYaml(homeData.hero.heading)}
  subheading: >-
    ${indentYaml(homeData.hero.subheading)}
servicesSection:
  title: ${plan.niche.charAt(0).toUpperCase() + plan.niche.slice(1)}
  titleHighlight: en ${cityName}
  subtitle: >-
    Soluciones profesionales a medida. Calidad artesanal garantizada.
aboutSection:
  title: ${escapeYaml(homeData.about.title)}
  description: >-
    ${indentYaml(homeData.about.description)}
  yearsExperience: "15+"
  image: "/images/home/about-placeholder.jpg"
  features:
${(homeData.about.features || []).map(f => `    - title: ${escapeYaml(f.title)}\n      description: ${escapeYaml(f.description)}`).join('\n')}
  buttonText: "Solicitar Visita Técnica"
  buttonLink: "/contacto"
features:
${(homeData.features || []).map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${escapeYaml(f.description)}`).join('\n')}
testimonials:
${(testimonialsData?.testimonials || []).map(t => `  - quote: ${escapeYaml(t.quote)}\n    author: "${t.author}"\n    location: "${t.location}"\n    initials: "${t.initials}"`).join('\n')}
seoContentTitle: ${escapeYaml(homeData.seoContentTitle)}
faq:
${(homeData.faq || []).map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
contactSection:
  title: ${escapeYaml(homeData.contactSection?.title || "¿Necesitas un Presupuesto?")}
  subtitle: >-
    ${indentYaml(homeData.contactSection?.subtitle || "Cuéntanos tu proyecto.")}
locationsSection:
  title: ${escapeYaml(homeData.locationsSection?.title || "Zonas de Servicio")}
  subtitle: >-
    ${indentYaml(homeData.locationsSection?.subtitle || "Llegamos a toda la ciudad.")}
stickyPhone: true
blocks:
  - discriminant: hero
  - discriminant: services
  - discriminant: about
  - discriminant: features
  - discriminant: process
  - discriminant: testimonials
  - discriminant: faq
  - discriminant: contact
  - discriminant: locations
  - discriminant: cta
  - discriminant: content
---

${homeData.seoContent}
`;
        await fs.mkdir('src/content/pages', { recursive: true });
        await fs.writeFile('src/content/pages/home.mdx', homeMdx);
        console.log(`   ✅ Home generada`);
    }

    // 3. GENERAR SERVICIOS (Clusters)
    // 4. GENERAR PÁGINAS DE SERVICIOS (Desde Clusters Filtrados)
    console.log(`\n🛠️ Generando ${serviceClusters.length} Páginas de Servicios...`);

    for (const cluster of serviceClusters) {
        const serviceName = cluster.name;
        console.log(`   > ${serviceName}...`);
        const serviceSlug = serviceName
            .toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const selectedIdx = cluster.selected_suggestion || 0;
        const metaTags = cluster.meta_suggestions?.[selectedIdx] || { h1: serviceName, seo_title: serviceName, seo_description: "" };

        const prompt = `
            Actúa como un técnico especialista en "${serviceName}".
            Escribe una página de venta para este servicio en "${cityName}".
            
            KEYWORDS: ${cluster.keywords.slice(0, 5).map(k => k.keyword).join(', ')}
            
            ESTRUCTURA:
            - Introducción: Problema común y solución experta.
            - Proceso de Trabajo: Pasos técnicos detallados (ej: preparación, ejecución, acabados).
            - Materiales/Tecnología: Menciona marcas o tipos de materiales de calidad.
            - Por qué nosotros: Experiencia específica en este servicio.
            
            JSON:
            {
                "title": "${metaTags.h1}",
                "shortDesc": "Descripción corta para cards (20 palabras)",
                "seoTitle": "${metaTags.seo_title}",
                "seoDesc": "${metaTags.seo_description}",
                "content": "Markdown (600 palabras). Usa H2 y H3. Tono técnico pero accesible."
            }
        `;

        const data = await generateData(prompt, serviceName);
        if (data) {
            // Pasamos las preguntas PAA del plan global
            const faqs = await generateFAQs(serviceName, cityName, cluster.keywords, plan.raw_data?.paa_questions || []);
            const faqYaml = faqs.map(q => `  - question: "${q.question}"\n    answer: >-\n      ${q.answer}`);

            // Generar enlaces relacionados
            // Generar related services (links internos)
            const related = serviceClusters.filter(s => s.name !== serviceName).slice(0, 3).map(s => {
                const sSlug = s.name
                    .toLowerCase()
                    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                return `- **[${s.name}](/servicios/${sSlug})**: Especialistas en ${s.name.toLowerCase()}.`;
            });

            const mdx = `---
title: "${data.title}"
shortDesc: "${data.shortDesc}"
icon: "Hammer"
heroImage: "/images/services/default.jpg"
featured: true
seoTitle: "${data.seoTitle}"
seoDesc: "${data.seoDesc}"
faq:
${faqYaml.join('\n')}
blocks:
  - discriminant: "hero"
  - discriminant: "content"
  - discriminant: "faq"
  - discriminant: "cta"
---

${data.content}

## Otros Servicios en ${cityName}

${related.join('\n')}
`;
            const filePath = path.join('src/content/services', `${serviceSlug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            console.log(`      ✅ Servicio creado: ${serviceSlug}.mdx`);
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