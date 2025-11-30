import { getTopCompetitors, getRelatedKeywords, getCompetitorKeywords, getPeopleAlsoAsk } from '../lib/seo_client.js';
import { analyzeCompetitor } from '../lib/scraper.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export async function runFullResearch(niche, city, seedKeyword) {
    const searchQuery = seedKeyword || `${niche} ${city}`;
    console.log(`🚀 Logic: Investigando ${searchQuery} (Nicho: ${niche}, Ciudad: ${city})...`);

    // 1. Obtener Competidores
    const competitors = await getTopCompetitors(searchQuery, "Spain");

    // 2. Obtener Volumen de Búsqueda Real (Mercado General) using city for location
    let keywordsData = await getRelatedKeywords(searchQuery, city);

    // FALLBACK: Si no hay datos para "Nicho + Ciudad", probamos solo "Nicho" con ubicación ciudad
    if (!keywordsData || keywordsData.length < 5) {
        console.log("   ⚠️ Pocos datos para nicho + ciudad. Probando nicho general con ubicación ciudad...");
        const generalData = await getRelatedKeywords(niche, city);
        keywordsData = [...keywordsData, ...generalData];
    }

    // Filtrar keywords que contengan tanto palabras del nicho como la ciudad
    const nicheWords = niche.toLowerCase().split(' ');
    const cityLower = city.toLowerCase();
    const filteredKeywords = keywordsData.filter(k => {
        const lower = k.keyword.toLowerCase();
        const hasNiche = nicheWords.some(w => lower.includes(w));
        const hasCity = lower.includes(cityLower);
        return hasNiche && hasCity;
    });

    const topKeywords = filteredKeywords.sort((a, b) => b.volume - a.volume).slice(0, 20);

    // 3. ROBO DE KEYWORDS (Espionaje a Competidores)
    const competitorKeywords = {};
    // Removed duplicate declaration of nicheWords – we already have it above


    for (const comp of competitors) {
        const kw = await getCompetitorKeywords(comp.domain, "Spain");

        // Guardamos los primeros 10 keywords del competidor sin filtrado adicional
        competitorKeywords[comp.domain] = kw.slice(0, 10);
    }

    // 4. PREGUNTAS REALES (People Also Ask)
    const paaQuestions = await getPeopleAlsoAsk(searchQuery, "Spain");

    // 5. Analizar Estructura y Contenido
    const analyzedData = [];
    for (const comp of competitors) {
        const analysis = await analyzeCompetitor(comp.url);
        if (analysis) {
            analysis.rankingKeywords = competitorKeywords[comp.domain] || [];
            analyzedData.push(analysis);
        }
    }

    // 6. Consultar a Gemini
    const prompt = `
        Actúa como Arquitecto SEO experto y Estratega de Contenidos.
        Proyecto: ${niche} en ${city}.
        
        DATOS DE MERCADO (Lo que busca la gente):
        ${JSON.stringify(topKeywords, null, 2)}
        
        PREGUNTAS REALES DE USUARIOS (PAA):
        ${JSON.stringify(paaQuestions, null, 2)}
        
        ANÁLISIS DE COMPETENCIA (Lo que tienen ellos):
        ${JSON.stringify(analyzedData, null, 2)}
        
        TU TAREA:
        1. Agrupa las keywords (tanto de mercado como de competidores) en "Clusters Temáticos" lógicos.
           - Ejemplo: "Liposuction NYC", "Arm Lipo", "Chin Lipo" -> Son clusters diferentes.
           - Elimina duplicados y agrupa variantes cercanas.
        2. Para cada Cluster, actúa como un experto SEO y genera:
           - Un H1 optimizado.
           - Un SEO Title (max 60 chars).
           - Una Meta Description (max 160 chars).
           - Asigna las keywords específicas que pertenecen a este cluster.

        FORMATO JSON REQUERIDO:
        {
            "market_analysis": "Resumen estratégico del mercado.",
            "clusters": [
                {
                    "name": "Nombre del Cluster (ej: Body Lift New York)",
                    "main_keyword": "keyword principal del cluster",
                    "volume": 0, // Volumen total estimado del cluster
                    "h1": "H1 Sugerido",
                    "seo_title": "SEO Title Sugerido",
                    "seo_description": "Meta Description Sugerida",
                    "keywords": [
                        {"keyword": "kw1", "volume": 100, "cpc": 2.5},
                        {"keyword": "kw2", "volume": 50, "cpc": 1.0}
                    ]
                }
            ],
            "locations": ["Lista de 5 barrios/zonas importantes de ${city} para SEO Local"],
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

        // Inyectar datos fijos y evidencia
        plan.niche = niche;
        plan.city = city;
        plan.siteName = `${niche} ${city} Pro`;

        plan.raw_data = {
            top_keywords: topKeywords,
            competitors: competitors, // Added competitors list
            competitor_keywords: competitorKeywords,
            paa_questions: paaQuestions
        };

        // Guardamos copia local por si acaso (opcional, pero útil para debug)
        await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));

        return plan;

    } catch (error) {
        console.error("❌ Error generando el plan:", error);
        throw error;
    }
}