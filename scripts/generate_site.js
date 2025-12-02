import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from 'json5';
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
    let text = '';
    try {
        console.log(`      ⏳ Consultando a Gemini...`);
        const result = await model.generateContent(prompt);
        text = result.response.text();

        console.log(`      📝 Respuesta recibida (${text.length} chars)`);

        // Limpiar el texto: remover markdown code blocks
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 🔥 Usar JSON5 que es más tolerante con comillas escapadas y saltos de línea
        const parsed = JSON5.parse(jsonStr);

        console.log(`      ✅ JSON parseado correctamente`);

        // Delay para evitar rate limits
        await delay(2000);

        return parsed;
    } catch (error) {
        console.error(`      ❌ ERROR en generateData (${context}):`, error.message);
        if (error.message.includes('JSON') || error.message.includes('parse')) {
            console.error(`      📄 Respuesta que falló:`, text?.substring(0, 500) + '...');
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

        if (!data || !data.faqs || !Array.isArray(data.faqs)) return [];

        return data.faqs;
    } catch (error) {
        console.error(`      ⚠️  Error generando FAQs para ${serviceName}:`, error.message);
        return [];
    }
}

// Función para generar sección de servicios relacionados (interlinking)
function generateRelatedServices(currentCluster, allClusters, city) {
    // Excluir el servicio actual y tomar máximo 3
    const relatedClusters = allClusters
        .filter(c => c.name !== currentCluster.name)
        .slice(0, 3);

    if (relatedClusters.length === 0) return [];

    return relatedClusters.map(cluster => {
        const slug = cluster.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-');

        // Generar una descripción corta basada en el nombre
        const desc = `Buscas ${cluster.name.toLowerCase()} en ${city.split(',')[0]}? Ofrecemos instalación profesional de todo tipo.`;

        return {
            title: cluster.name,
            url: `/${slug}/`,
            desc: desc.substring(0, 100) // Limitar longitud
        };
    });
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
Genera contenido para la home de "${plan.niche}" en "${plan.city}".

DIRECTRICES E-E-A-T (Google Quality Raters):
1. Experience: Menciona casos reales, problemas resueltos
2. Expertise: Técnicas específicas, materiales, normativas
3. Authoritativeness: Años de experiencia (10-15), proyectos completados
4. Trustworthiness: Garantías, transparencia, proceso claro

Estructura JSON:
{
    "hero": {
        "heading": "${plan.home_structure?.h1 || `${plan.niche} en ${plan.city}`}",
        "subheading": "Subtítulo persuasivo de 15-20 palabras que destaque el beneficio principal y la experiencia"
    },
    "seoContentTitle": "${plan.home_structure?.h2s?.[0] || `¿Por qué elegir nuestros servicios de ${plan.niche}?`}",
    "seoContent": "Contenido SEO de 500-600 palabras en Markdown.

Estructura:
## Introducción (100 palabras)
- Problema que resuelve el servicio
- Beneficio principal
- Mención de ${plan.city}

## Beneficios Principales (200 palabras)
### Beneficio 1 Específico
- Explicación con datos concretos
- Ejemplo o caso de uso

### Beneficio 2 Específico
- Explicación con datos concretos
- Ejemplo o caso de uso

## Por Qué Elegirnos en ${plan.city} (150 palabras)
- Experiencia local (mencionar años específicos)
- Diferenciadores clave
- Garantías específicas

## Proceso de Trabajo (100 palabras)
- Pasos claros (3-4)
- Tiempos estimados
- Transparencia

Incluye:
- Keyword '${plan.niche} en ${plan.city}' 3-5 veces
- Menciona barrios de ${plan.city}
- Datos específicos (años, garantías, certificaciones)
- Tono profesional pero cercano",
    "features": [
        { "title": "Característica Diferenciadora 1", "description": "Descripción específica con beneficio medible (ej: 'Taller Propio: Sin intermediarios, fabricamos en ${plan.city}')" },
        { "title": "Característica Diferenciadora 2", "description": "Descripción específica con beneficio medible (ej: 'Garantía de 5 años: Materiales certificados')" },
        { "title": "Característica Diferenciadora 3", "description": "Descripción específica con beneficio medible (ej: '+15 Años: Desde 2010 en el sector')" }
    ],
    "faq": [
        { "question": "Pregunta frecuente 1 (usar keywords reales si existen)", "answer": "Respuesta de 40-60 palabras, específica y útil" },
        { "question": "Pregunta frecuente 2", "answer": "Respuesta de 40-60 palabras, específica y útil" },
        { "question": "Pregunta frecuente 3", "answer": "Respuesta de 40-60 palabras, específica y útil" },
        { "question": "Pregunta frecuente 4", "answer": "Respuesta de 40-60 palabras, específica y útil" }
    ]
}

INSTRUCCIONES ADICIONALES:
- ${faqInstruction}
- Menciona certificaciones o normativas si aplican
- Incluye garantías específicas (años, satisfacción)
- Usa números concretos (proyectos, clientes, años)
- Tono: Profesional pero cercano
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

        // 🔥 Des-escapar los \n en el contenido SEO
        const cleanSeoContent = homeData.seoContent.replace(/\\n/g, '\n');

        // Extraer solo el nombre de la ciudad (ej: "Barcelona,Catalonia,Spain" → "Barcelona")
        const cityName = plan.city.split(',')[0].trim();

        // 🔥 NUEVO: Generar testimonios (después de definir cityName)
        const testimonialsPrompt = `
Genera 3 testimonios realistas para un negocio de "${plan.niche}" en "${cityName}".

Requisitos:
- Testimonios específicos y creíbles
- Mencionar aspectos concretos del servicio
- Tono natural, español de España
- Variar entre particulares y empresas
- Incluir barrios reales de ${cityName}

JSON:
{
  "testimonials": [
    {
      "quote": "Testimonio de 25-35 palabras",
      "author": "Nombre Apellido",
      "location": "Barrio de ${cityName}",
      "initials": "NA"
    }
  ]
}
    `;

        const testimonialsData = await generateData(testimonialsPrompt, 'Testimonials');

        const homeMdx = `---
hero:
  heading: ${escapeYaml(homeData.hero.heading)}
  subheading: >-
    ${homeData.hero.subheading}
servicesSection:
  title: ${plan.niche}
  titleHighlight: en ${cityName}
  subtitle: >-
    Servicio profesional y garantizado. Presupuesto sin compromiso.
aboutSection:
  title: "¿Por Qué Elegirnos para ${plan.niche} en ${cityName}?"
  description: >-
    Somos especialistas en ${plan.niche} en ${cityName} con más de 15 años de experiencia transformando espacios. Hemos completado más de 500 proyectos en la zona, trabajando con materiales certificados y técnicas profesionales. Nuestro equipo está cualificado y actualizado en las últimas normativas del sector. Garantizamos acabados perfectos y satisfacción total en cada trabajo.
  yearsExperience: "15+"
  image: "/images/home/about-placeholder.jpg"
  features:
    - title: "Taller Propio en ${cityName}"
      description: "Sin intermediarios. Fabricamos y controlamos todo el proceso para garantizar la máxima calidad y ajustar precios."
    - title: "Materiales Certificados"
      description: "Trabajamos solo con proveedores homologados. Todos nuestros materiales cumplen normativas vigentes."
    - title: "Garantía de Satisfacción"
      description: "Garantía de 5 años en todos nuestros trabajos. Si no quedas satisfecho, lo arreglamos sin coste."
  buttonText: "Conoce Más Sobre Nosotros"
  buttonLink: "/nosotros"
features:
${(homeData.features || []).map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${f.description}`).join('\n')}
testimonials:
${(testimonialsData?.testimonials || []).map(t => `  - quote: "${t.quote}"\n    author: "${t.author}"\n    location: "${t.location}"\n    initials: "${t.initials}"`).join('\n')}
seoContentTitle: ${escapeYaml(homeData.seoContentTitle)}
faq:
${(homeData.faq || []).map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
blocks:
  - discriminant: hero
  - discriminant: services
  - discriminant: about
  - discriminant: features
  - discriminant: testimonials
  - discriminant: content
  - discriminant: faq
  - discriminant: locations
  - discriminant: cta
---

${cleanSeoContent}
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
            Actúa como experto en SEO y Copywriting.
            Escribe el contenido para una página de servicio: "${serviceName}" en "${cityName}".
            
            KEYWORDS PRINCIPALES:
            ${cluster.keywords.slice(0, 5).map(k => `- ${k.keyword}`).join('\n')}
            
            ESTRUCTURA REQUERIDA (JSON):
            {
                "title": "${metaTags.h1}",
                "shortDesc": "${metaTags.seo_description.substring(0, 150)}...",
                "seoTitle": "${metaTags.seo_title}",
                "seoDesc": "${metaTags.seo_description}",
                "content": "Contenido en Markdown (aprox 600 palabras). Usa H2 y H3. Incluye negritas en keywords importantes."
            }
            
            IMPORTANTE: Genera SOLO JSON válido. NO uses saltos de línea dentro de los strings.
        `;

        const data = await generateData(prompt);
        if (data) {
            // Helper para escapar strings YAML
            const escapeYaml = (str) => {
                if (!str) return '';
                // Si contiene caracteres especiales, envolver en comillas
                if (str.includes(':') || str.includes('#') || str.includes('|') || str.includes('>')) {
                    return `"${str.replace(/"/g, '\\"')}"`;
                }
                return str;
            };

            // NUEVO: Generar sección de interlinking
            const relatedLinks = generateRelatedServices(cluster, services, plan.city); // Assuming generateRelatedServices now returns an array of objects {title, url, desc}

            // NUEVO: Generar FAQs automáticas (Array de objetos)
            const longTailKeywords = extractLongTailQuestions(cluster.keywords);
            // Usar cityName (definido arriba) en lugar de plan.city para evitar "Barcelona,Catalonia,Spain" en el texto
            const faqsArray = await generateFAQs(serviceName, cityName, longTailKeywords);

            const faqYaml = faqsArray.map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`);

            // IMPORTANTE: Asegurar jerarquía correcta (H2 como máximo nivel en contenido)
            // Si Gemini devuelve un H1 (# Título), lo bajamos a H2 (## Título)
            let cleanContent = data.content.replace(/^#\s+/gm, '## ');

            // 🔥 NUEVO: Des-escapar los \n para que se conviertan en saltos de línea reales
            cleanContent = cleanContent.replace(/\\n/g, '\n');

            // Construir el frontmatter
            const mdx = [
                '---',
                `title: "${data.title}"`,
                `shortDesc: "${data.shortDesc}"`,
                `icon: "${cluster.icon || 'Hammer'}"`, // Use cluster.icon if available, otherwise default to 'Hammer'
                `heroImage: "/images/services/default.jpg"`,
                `featured: true`,
                `seoTitle: "${data.seoTitle}"`,
                `seoDesc: "${data.seoDesc}"`,
                'faq:',
                ...faqYaml,
                'blocks:',
                '  - discriminant: "hero"',
                '  - discriminant: "content"',
                '  - discriminant: "faq"',
                '  - discriminant: "cta"',
                '---',
                cleanContent, // Usar contenido limpio con saltos de línea reales
                '',
                '## Servicios Relacionados',
                '',
                `Descubre otros servicios profesionales que ofrecemos en ${cityName}:`,
                '',
                ...relatedLinks.map(link => `- **[${link.title}](${link.url})** - ${link.desc}`),
                ''
            ].join('\n');

            const filePath = path.join('src/content/services', `${slug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            console.log(`      ✅ Creado: ${slug}.mdx (con ${services.length - 1} links relacionados y ${faqsArray.length} FAQs)`);
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
            // 🔥 Des-escapar los \n para formato correcto
            const cleanContent = data.content.replace(/\\n/g, '\n');

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
${cleanContent}`;

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