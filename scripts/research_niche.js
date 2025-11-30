import { getTopCompetitors, getRelatedKeywords, getCompetitorKeywords, getPeopleAlsoAsk } from './lib/seo_client.js';
import { analyzeCompetitor } from './lib/scraper.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// --- TUS VARIABLES (AQUÍ DEFINES EL PROYECTO) ---
const PROJECT = {
    niche: "Fontanero Urgente",  // <--- CÁMBIALO AQUÍ Y SE PROPAGARÁ A TODO
    city: "Sevilla",             // <--- CÁMBIALO AQUÍ
    targetAudience: "Particulares con urgencias 24h"
};
// -----------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function main() {
    console.log(`\n🚀 INICIANDO INVESTIGACIÓN PROFUNDA PARA: ${PROJECT.niche} en ${PROJECT.city}...\n`);

    // 1. Obtener Competidores
    const competitors = await getTopCompetitors(`${PROJECT.niche} ${PROJECT.city}`, "Spain");

    if (competitors.length === 0) {
        console.log("❌ No se encontraron competidores (DataForSEO).");
        return;
    }

    console.log(`✅ Analizando ${competitors.length} competidores reales...`);
    competitors.forEach(c => console.log(`   - ${c.domain}`));

    // 2. Obtener Volumen de Búsqueda Real (Mercado General)
    console.log(`\n📊 Obteniendo datos de volumen de búsqueda (Mercado)...`);
    let keywordsData = await getRelatedKeywords(`${PROJECT.niche} ${PROJECT.city}`, "Spain");

    // FALLBACK: Si no hay datos para "Nicho + Ciudad", probamos solo "Nicho"
    if (!keywordsData || keywordsData.length < 5) {
        console.log("   ⚠️ Pocos datos para nicho + ciudad. Probando nicho general...");
        const generalData = await getRelatedKeywords(PROJECT.niche, "Spain");
        keywordsData = [...keywordsData, ...generalData];
    }

    const topKeywords = keywordsData.sort((a, b) => b.volume - a.volume).slice(0, 20);
    console.log(`   ✅ Encontradas ${keywordsData.length} keywords con volumen.`);
    console.log("   🔥 Top Keywords por tráfico:");
    topKeywords.forEach(k => console.log(`      - ${k.keyword}: ${k.volume} búsquedas/mes`));

    // 3. ROBO DE KEYWORDS (Espionaje a Competidores)
    console.log(`\n🥷 Robando keywords de la competencia...`);
    const competitorKeywords = {};
    const nicheWords = PROJECT.niche.toLowerCase().split(' ');

    for (const comp of competitors) {
        console.log(`   > Espiando keywords de: ${comp.domain}...`);
        const kw = await getCompetitorKeywords(comp.domain, "Spain");

        // FILTRO DE CALIDAD
        const filteredKw = kw.filter(k => {
            const kLower = k.keyword.toLowerCase();
            return nicheWords.some(word => kLower.includes(word)) || kLower.includes(PROJECT.city.toLowerCase());
        });

        competitorKeywords[comp.domain] = filteredKw.slice(0, 10);
    }

    // 4. PREGUNTAS REALES (People Also Ask)
    console.log(`\n❓ Extrayendo preguntas reales de usuarios (PAA)...`);
    const paaQuestions = await getPeopleAlsoAsk(`${PROJECT.niche} ${PROJECT.city}`, "Spain");
    console.log(`   ✅ Encontradas ${paaQuestions.length} preguntas frecuentes.`);
    paaQuestions.forEach(q => console.log(`      - ${q}`));

    // 5. Analizar Estructura y Contenido
    console.log(`\n🕵️‍♀️ Espiando estructura y contenido...`);
    const analyzedData = [];
    for (const comp of competitors) {
        const analysis = await analyzeCompetitor(comp.url);
        if (analysis) {
            // Añadimos sus keywords al análisis
            analysis.rankingKeywords = competitorKeywords[comp.domain] || [];
            analyzedData.push(analysis);
        }
    }

    // 6. Consultar a Gemini
    console.log("\n🧠 Diseñando Arquitectura SEO con IA (Basada en DATOS PROFUNDOS)...");

    const prompt = `
        Actúa como Arquitecto SEO experto y Estratega de Contenidos.
        Proyecto: ${PROJECT.niche} en ${PROJECT.city}.
        
        DATOS DE MERCADO (Lo que busca la gente):
        ${JSON.stringify(topKeywords, null, 2)}
        
        PREGUNTAS REALES DE USUARIOS (PAA):
        ${JSON.stringify(paaQuestions, null, 2)}
        
        ANÁLISIS DE COMPETENCIA (Lo que tienen ellos):
        ${JSON.stringify(analyzedData, null, 2)}
        
        TU TAREA:
        Analiza los datos y encuentra "Gaps de Contenido" (lo que ellos no cubren bien) y "Must-Haves" (lo que todos tienen).
        Crea la estructura JSON definitiva para superarles.
        
        IMPORTANTE: 
        1. Prioriza servicios con ALTO VOLUMEN de búsqueda.
        2. Usa terminología que usan los competidores en su 'contentText' si es relevante.
        3. Incluye servicios que ataquen keywords donde los competidores son débiles.
        4. Asegúrate de que la estructura responda a las PREGUNTAS REALES (PAA).
        
        FORMATO JSON REQUERIDO:
        {
            "market_analysis": "Resumen estratégico del mercado y la oportunidad detectada.",
            "services": [
                {
                    "title": "Título del Servicio (H1)",
                    "main_keyword": "keyword principal",
                    "volume": 0 // Volumen estimado basado en los datos
                }
            ],
            "reasoning_services": "Explicación breve de por qué elegiste estos servicios basándote en el volumen de búsqueda",
            "locations": ["Lista de 5 barrios/zonas importantes de ${PROJECT.city} para SEO Local"],
            "reasoning_locations": "Explicación breve de por qué elegiste estas zonas (volumen, competencia, etc)",
            "home_structure": {
                "h1": "H1 optimizado para la Home",
                "h2s": ["Lista de 3 H2 persuasivos para la Home"]
            }
        }
        
        Responde SOLO con el JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let plan = JSON.parse(responseText);

        // --- LA CLAVE MAESTRA: INYECTAR DATOS FIJOS ---
        // Aquí forzamos que el plan guarde lo que tú definiste, ignorando a la IA si se equivoca.
        plan.niche = PROJECT.niche;
        plan.city = PROJECT.city;
        plan.siteName = `${PROJECT.niche} ${PROJECT.city} Pro`; // Generamos nombre auto

        // --- NUEVO: GUARDAR EVIDENCIA PARA EL DASHBOARD ---
        plan.raw_data = {
            top_keywords: topKeywords,
            competitor_keywords: competitorKeywords,
            paa_questions: paaQuestions // Guardamos las preguntas
        };
        // ----------------------------------------------

        console.log("\n✨ ESTRATEGIA GENERADA:\n");
        console.log(JSON.stringify(plan, null, 2));

        await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));
        console.log("\n💾 Plan guardado en 'project_plan.json'. Ahora ejecuta 'generate_site.js'.");

    } catch (error) {
        console.error("❌ Error generando el plan:", error);
    }
}

main();