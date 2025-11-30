import { getTopCompetitors, getRelatedKeywords, getCompetitorKeywords } from '../lib/seo_client.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // O gemini-1.5-flash si 2.5 da error
    generationConfig: { responseMimeType: "application/json" }
});

export async function getInitialCompetitors(niche, location_code) {
    console.log(`🚀 Logic: Buscando competidores para "${niche}" en Location Code: ${location_code}...`);
    const cleanNiche = niche.trim();
    const searchQuery = `${cleanNiche}`;
    return await getTopCompetitors(niche, location_code);
}

export async function generateClustersFromSelection(niche, city, competitors, location_code) {
    // Si no viene código, usamos España (2724) por defecto
    const targetLoc = location_code || 2724;
    const cleanCity = city.trim();
    const cleanNiche = niche.trim();

    console.log(`🚀 Logic: Clusterizando para "${cleanNiche}" en "${cleanCity}" (Loc: ${targetLoc})...`);

    let allKeywords = [];
    const competitorKeywordsMap = {};

    // 1. Obtener keywords de competidores (USANDO targetLoc)
    for (const domain of competitors) {
        console.log(`   🔍 Analizando competidor: ${domain}...`);
        // CAMBIO: "Spain" -> targetLoc
        const compKeywords = await getCompetitorKeywords(domain, targetLoc);

        if (compKeywords.length > 0) {
            allKeywords = [...allKeywords, ...compKeywords];
            competitorKeywordsMap[domain] = compKeywords;
        }
    }

    // 2. Obtener keywords relacionadas (Seed) (USANDO targetLoc)
    console.log(`   🔍 Buscando keywords relacionadas...`);
    // CAMBIO: "Spain" -> targetLoc
    const seedKeywords = await getRelatedKeywords(`${cleanNiche} ${cleanCity}`, targetLoc);

    if (seedKeywords && seedKeywords.length > 0) {
        allKeywords = [...allKeywords, ...seedKeywords];
    }

    // 3. Filtrado y Deduplicación
    const uniqueMap = new Map();

    allKeywords.forEach(k => {
        if (!k.keyword) return;
        const text = k.keyword.toLowerCase().trim();

        // Filtro más permisivo: Incluir todas las keywords con volumen
        // (El filtrado semántico lo hará la IA después)
        const hasVolume = k.volume && k.volume > 0;

        if (hasVolume) {
            // Si ya existe, nos quedamos con el que tenga el dato más completo
            if (!uniqueMap.has(text) || (k.volume > (uniqueMap.get(text).volume || 0))) {
                uniqueMap.set(text, k);
            }
        }
    });

    // Ordenar por volumen
    let uniqueKeywords = Array.from(uniqueMap.values())
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 150); // Top 150

    console.log(`   📊 Dataset para IA: ${uniqueKeywords.length} keywords.`);

    // 4. Clustering con Gemini
    const prompt = `
        Actúa como experto SEO. Objetivo: Arquitectura web para "${cleanNiche}" en "${cleanCity}".
        
        INPUT (Keywords + Volumen Local):
        ${JSON.stringify(uniqueKeywords.map(k => `${k.keyword} (${k.volume})`))}
        
        TAREA:
        1. Agrupa en CLUSTERS temáticos para servicios.
        2. Selecciona la "Focal Keyword" (Mayor volumen/intención).
        3. Define 5 zonas locales.
        
        DEVUELVE JSON:
        {
            "market_analysis": "Análisis breve",
            "clusters": [
                {
                    "name": "Nombre Cluster",
                    "main_keyword": "keyword principal",
                    "volume": 100,
                    "h1": "H1 Optimizado",
                    "seo_title": "Meta Title",
                    "seo_description": "Meta Desc",
                    "keywords": [{"keyword": "kw", "volume": 10}]
                }
            ],
            "locations": ["Zona 1", "Zona 2"],
            "home_structure": { "h1": "...", "h2s": ["..."] }
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const plan = JSON.parse(jsonStr);

        const finalData = {
            ...plan,
            raw_data: {
                top_keywords: uniqueKeywords.slice(0, 50),
                competitor_keywords: competitorKeywordsMap
            },
            niche: cleanNiche,
            city: cleanCity
        };

        await fs.writeFile('project_plan.json', JSON.stringify(finalData, null, 2));
        return finalData;

    } catch (error) {
        console.error("❌ Error en Gemini Clustering:", error);
        throw new Error("Fallo al generar clusters con IA. Inténtalo de nuevo.");
    }
}