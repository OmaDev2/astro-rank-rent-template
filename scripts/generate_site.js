import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from 'json5';
import dotenv from 'dotenv';
import { validateContent, injectInternalLinks } from './content_processor.js';
import { calculateHash, delay, loadPrompt, ensureDirs } from './lib/utils.js';

// Import Generators
import { generateHome } from './generators/home.js';
import { generateServices } from './generators/services.js';
import { generateBlog } from './generators/blog.js';
import { generateLocations } from './generators/locations.js';
import { generateNavigation } from './generators/navigation.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-pro";
const CACHE_DIR = path.join(process.cwd(), '.cache', 'gemini');

// Asegurar directorio de caché
if (!fsSync.existsSync(CACHE_DIR)) {
    fsSync.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Función central de generación de datos con Gemini (CON CACHÉ)
 */
async function generateData(prompt, context = '') {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ ERROR: Falta GEMINI_API_KEY en .env");
        return null;
    }

    const cacheKey = `${context.replace(/[^a-z0-9]/gi, '_')}_${calculateHash(prompt)}.json`;
    const cachePath = path.join(CACHE_DIR, cacheKey);

    if (fsSync.existsSync(cachePath)) {
        console.log(`      ⚡ Cache hit: ${context}`);
        try {
            return JSON.parse(await fs.readFile(cachePath, 'utf-8'));
        } catch (e) {
            console.warn("      ⚠️ Error leyendo caché, regenerando...");
        }
    }

    console.log(`      ⏳ Consultando a Gemini (${context})...`);

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
    });

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        let parsed;
        if (!jsonMatch) {
            console.warn(`      ⚠️ No se encontró JSON válido en la respuesta (${context}). Intentando limpieza básica...`);
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON5.parse(jsonStr);
        } else {
            parsed = JSON5.parse(jsonMatch[0]);
        }

        const validation = validateContent(parsed);
        if (!validation.valid) {
            console.warn(`      ⚠️ ADVERTENCIA DE CALIDAD (${context}):`);
            validation.warnings.forEach(w => console.warn(`         ${w}`));
        }

        await fs.writeFile(cachePath, JSON.stringify(parsed, null, 2));
        await delay(2000);
        return parsed;

    } catch (error) {
        console.error(`      ❌ ERROR en generateData (${context}):`, error.message);
        if (error.message.includes('quota') || error.message.includes('429')) {
            console.log(`      ⏸️  Rate limit detectado, esperando 30 segundos...`);
            await delay(30000);
        }
        return null;
    }
}

/**
 * Generador de FAQs (Dependency para los otros generadores)
 */
async function generateFAQs(serviceName, city, longTailKeywords, paaQuestions = [], cityContextData = "{}") {
    const keywordsString = (longTailKeywords || []).map(k => k.keyword).join(', ');
    let relevantPAA = paaQuestions.length > 0
        ? paaQuestions.slice(0, 5).map(q => `- ${q.question}`).join('\n')
        : "No hay preguntas PAA específicas disponibles. Genera preguntas basadas en dudas comunes.";

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
    console.log("🚀 INICIANDO GENERADOR DE SITIO (MODO MODULAR)...");

    // 1. LEER EL PLAN
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

    const richContext = plan.rich_context?.data || {};
    const nlpPhrases = richContext.nlpPhrases ? richContext.nlpPhrases.join(', ') : "";
    const userPainPoints = richContext.painPoints ? richContext.painPoints.join(', ') : (richContext.userPainPoints ? richContext.userPainPoints.join(', ') : "");
    const cityName = plan.city.split(',')[0].trim();

    // 2. CONTEXTO DE CIUDAD
    let cityContextData = "{}";
    try {
        const cityDataPath = path.join(process.cwd(), 'src/data/city_data.json');
        if (fsSync.existsSync(cityDataPath)) {
            cityContextData = await fs.readFile(cityDataPath, 'utf-8');
            console.log("🏙️ Contexto de ciudad cargado.");
        }
    } catch (e) {
        console.warn("⚠️ Error leyendo city_data.json:", e.message);
    }

    // 3. ASEGURAR DIRECTORIOS
    await ensureDirs([
        'src/content/services', 'src/content/locations', 'src/content/testimonials',
        'src/content/pages', 'src/content/business', 'src/content/design',
        'src/content/social', 'src/content/analytics', 'src/content/schema',
        'src/content/navigation', 'src/content/footer', 'src/content/projects', 'src/content/blog'
    ]);

    // 4. APLICAR DISEÑO
    try {
        const designStyle = plan.design_style || 'industrial';
        const fontMap = {
            'industrial': 'robust', 'corporate': 'modern', 'nature': 'friendly',
            'urgent': 'modern', 'legal': 'elegant', 'luxury': 'elegant',
            'health': 'modern', 'tech': 'tech', 'clay_paper': 'artisan_warm',
            'forest_stone': 'artisan_natural', 'classic_workshop': 'artisan_classic'
        };
        const fontPair = fontMap[designStyle] || 'modern';
        const designYaml = `theme: ${designStyle}\nfontPair: ${fontPair}\n`;
        await fs.writeFile('src/content/design/global.yaml', designYaml);
        console.log(`🎨 Diseño aplicado: ${designStyle}`);
    } catch (e) {
        console.error("⚠️ Error aplicando diseño:", e.message);
    }

    // 5. CLUSTERS Y ENLACES
    let mainCluster = null;
    let serviceClusters = [];

    if (plan.clusters?.length > 0) {
        const sortedClusters = [...plan.clusters].sort((a, b) => b.volume - a.volume);
        mainCluster = sortedClusters[0];
        serviceClusters = plan.clusters.filter(c => c.name !== mainCluster.name);
    } else if (plan.services) {
        const sortedServices = [...plan.services].sort((a, b) => b.volume - a.volume);
        mainCluster = sortedServices[0];
        serviceClusters = sortedServices.filter(c => c.name !== mainCluster.name);
    }

    const linksMap = serviceClusters.map(c => {
        const name = c.cluster_name || c.name || 'servicio';
        const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return { keyword: name.toLowerCase(), url: `/servicios/${slug}` };
    });

    // 6. EJECUTAR GENERADORES MÓDULARES
    const generatorContext = {
        plan, cityName, mainCluster, serviceClusters, cityContextData,
        nlpPhrases, userPainPoints, linksMap, generateData, generateFAQs
    };

    await generateHome(generatorContext);
    await generateServices(generatorContext);
    await generateBlog(generatorContext);
    await generateLocations(generatorContext);
    await generateNavigation(generatorContext);

    console.log("\n✅ PROCESO COMPLETADO CON ÉXITO.");
}

main();