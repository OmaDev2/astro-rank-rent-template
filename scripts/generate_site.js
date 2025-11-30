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
    let text = '';  // Declarar fuera del try para que esté disponible en el catch
    try {
        console.log(`      ⏳ Consultando a Gemini...`);
        const result = await model.generateContent(prompt);
        text = result.response.text();

        // Log para debug
        console.log(`      📝 Respuesta recibida (${text.length} chars)`);

        // Limpiar el texto: remover markdown code blocks y limpiar saltos de línea problemáticos
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // NUEVO: Reemplazar saltos de línea dentro de strings por espacios
        // Esto evita errores de parsing cuando Gemini genera strings multilínea
        jsonStr = jsonStr.replace(/("\w+"\s*:\s*"[^"]*)\n([^"]*")/g, '$1 $2');

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

        throw error;
    }
}

// Función para extraer keywords de cola larga tipo pregunta
function extractLongTailQuestions(clusterKeywords) {
    if (!clusterKeywords || !Array.isArray(clusterKeywords)) return [];

    const questionPatterns = [
        'cómo', 'como', 'cuánto', 'cuanto', 'qué', 'que', 'cuál', 'cual', 'cuáles', 'cuales',
        'dónde', 'donde', 'por qué', 'por que', 'para qué', 'para que', 'cuándo', 'cuando'
    ];

    return clusterKeywords
        .filter(k => {
            const words = k.keyword.split(' ');
            const hasQuestion = questionPatterns.some(p =>
                k.keyword.toLowerCase().includes(p)
            );
            // 4+ palabras, volumen > 10, y contiene patrón de pregunta
            return words.length >= 4 && (k.volume || 0) > 10 && hasQuestion;
        })
        .slice(0, 5);  // Máximo 5 FAQs por servicio
}

// Función para generar FAQs con Gemini
async function generateFAQs(serviceName, city, longTailKeywords) {
    const keywordsList = longTailKeywords.map(k => `- ${k.keyword} (${k.volume} búsquedas/mes)`).join('\n');

    const prompt = `
        Actúa como experto en SEO local.
        Genera una sección de Preguntas Frecuentes (FAQs) para el servicio "${serviceName}" en "${city}".
        
        KEYWORDS DE COLA LARGA (Úsalas como inspiración):
        ${keywordsList || '(No hay keywords específicas, genera preguntas generales relevantes)'}
        
        INSTRUCCIONES:
        1. Crea 3-5 preguntas y respuestas.
        2. Si hay keywords de pregunta, ÚSALAS literalmente en las preguntas.
        3. Las respuestas deben ser útiles, de 40-60 palabras.
        4. Incluye el nombre de la ciudad ("${city}") de forma natural en algunas respuestas.
        5. Tono profesional pero cercano.
        
        IMPORTANTE: Genera SOLO JSON válido. NO uses saltos de línea dentro de los strings.
        
        Estructura JSON requerida:
        {
            "faqs": [
                {
                    "question": "¿Pregunta 1?",
                    "answer": "Respuesta 1..."
                },
                ...
            ]
        }
    `;

    try {
        const data = await generateData(prompt, `FAQs para ${serviceName}`);

        if (!data || !data.faqs || !Array.isArray(data.faqs)) return '';

        let section = '\n\n## Preguntas Frecuentes\n\n';
        data.faqs.forEach(item => {
            section += `### ${item.question}\n\n${item.answer}\n\n`;
        });

        return section;
    } catch (error) {
        console.error(`      ⚠️  Error generando FAQs para ${serviceName}:`, error.message);
        return '';
    }
}

// Función para generar sección de servicios relacionados (interlinking)
function generateRelatedServices(currentCluster, allClusters, city) {
    // Excluir el servicio actual y tomar máximo 3
    const relatedClusters = allClusters
        .filter(c => c.name !== currentCluster.name)
        .slice(0, 3);

    if (relatedClusters.length === 0) return '';

    // Extraer solo el nombre de la ciudad (antes de la primera coma)
    const cityName = city.split(',')[0].trim();

    let section = '\n\n## Servicios Relacionados\n\n';
    section += 'Descubre otros servicios profesionales que ofrecemos en ' + cityName + ':\n\n';

    relatedClusters.forEach(cluster => {
        const slug = cluster.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');

        // Usar la descripción corta del meta tag o generar una
        const selectedIdx = cluster.selected_suggestion || 0;
        const metaTags = cluster.meta_suggestions?.[selectedIdx];
        const shortDesc = metaTags?.seo_description?.substring(0, 80) || `Servicio profesional de ${cluster.name}`;

        section += `- **[${cluster.name}](/${slug}/)** - ${shortDesc}\n`;
    });

    return section;
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
        
        IMPORTANTE: Genera SOLO JSON válido. NO uses saltos de línea dentro de los strings.
        
        Estructura requerida (JSON):
        {
            "hero": {
                "heading": "${plan.home_structure?.h1 || `${plan.niche} en ${plan.city}`}",
                "subheading": "Subtítulo persuasivo de 15-20 palabras en UNA SOLA LÍNEA"
            },
            "seoContentTitle": "${plan.home_structure?.h2s?.[0] || `¿Por qué elegir nuestros servicios de ${plan.niche}?`}",
            "seoContent": "Texto SEO de 500-600 palabras en formato Markdown. Usa H2 y H3. Ataca la keyword principal '${plan.niche} en ${plan.city}'.",
            "features": [
                { "title": "Característica 1", "description": "Breve descripción en una línea" },
                { "title": "Característica 2", "description": "Breve descripción en una línea" },
                { "title": "Característica 3", "description": "Breve descripción en una línea" }
            ],
            "faq": [
                { "question": "Pregunta 1", "answer": "Respuesta breve en una línea" },
                { "question": "Pregunta 2", "answer": "Respuesta breve en una línea" },
                { "question": "Pregunta 3", "answer": "Respuesta breve en una línea" },
                { "question": "Pregunta 4", "answer": "Respuesta breve en una línea" }
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
  headingHighlight: ${homeData.hero.headingHighlight || 'null'}
  subheading: >-
    ${homeData.hero.subheading}
servicesSection:
  title: ${plan.niche}
  titleHighlight: en ${plan.city}
  subtitle: >-
    Servicio profesional y garantizado. Presupuesto sin compromiso.
features:
${(homeData.features || []).map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${f.description}`).join('\n')}
seoContentTitle: ${escapeYaml(homeData.seoContentTitle)}
faq:
${(homeData.faq || []).map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
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

    // 2. CONFIGURAR KEYSTATIC (global.yaml)
    console.log(`\n⚙️  Configurando Keystatic...`);

    // Extraer solo el nombre de la ciudad (antes de la primera coma)
    const cityName = plan.city.split(',')[0].trim();

    const businessConfigYaml = `siteName: ${plan.niche} ${cityName}
niche: ${plan.niche}
city: ${cityName}
phone: 600 000 000
email: contacto@ejemplo.com
businessType: LocalBusiness
ctaText: Pedir Presupuesto
coordinates:
  lat: '40.416'
  lng: '-3.703'
`;

    await fs.mkdir('src/content/business', { recursive: true });
    await fs.writeFile('src/content/business/global.yaml', businessConfigYaml);

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
            // NUEVO: Generar sección de interlinking
            const relatedServicesSection = generateRelatedServices(cluster, services, plan.city);

            // NUEVO: Generar FAQs automáticas
            const longTailKeywords = extractLongTailQuestions(cluster.keywords);
            // Usar cityName (definido arriba) en lugar de plan.city para evitar "Barcelona,Catalonia,Spain" en el texto
            const faqsSection = await generateFAQs(serviceName, cityName, longTailKeywords);

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
${data.content}${relatedServicesSection}${faqsSection}`;

            const filePath = path.join('src/content/services', `${slug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            console.log(`      ✅ Creado: ${slug}.mdx (con ${services.length - 1} links relacionados y FAQs)`);
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