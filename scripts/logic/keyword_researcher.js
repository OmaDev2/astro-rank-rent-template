import { getTopCompetitors, getRelatedKeywords, getCompetitorKeywords } from '../lib/seo_client.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Changed to Flash 2.5 as requested
    generationConfig: { responseMimeType: "application/json" }
});

export async function getInitialCompetitors(niche, location_code) {
    console.log(`🚀 Logic: Buscando competidores para "${niche}" en Location Code: ${location_code}...`);
    const cleanNiche = niche.trim();
    const searchQuery = `${cleanNiche}`;
    return await getTopCompetitors(niche, location_code);
}

export async function generateClustersFromSelection(niche, city, competitors, location_code, top10Filter = true) {
    // Si no viene código, usamos España (2724) por defecto
    const targetLoc = location_code || 2724;
    const cleanCity = city.trim();
    const cleanNiche = niche.trim();

    console.log(`🚀 Logic: Clusterizando para "${cleanNiche}" en "${cleanCity}" (Loc: ${targetLoc})...`);
    console.log(`🎯 TOP 10 Filter: ${top10Filter ? 'ENABLED' : 'DISABLED'}`);

    let allKeywords = [];
    const competitorKeywordsMap = {};

    // 1. Obtener keywords de competidores (USANDO targetLoc)
    for (const domain of competitors) {
        console.log(`   🔍 Analizando competidor: ${domain}...`);
        // CAMBIO: "Spain" -> targetLoc
        const compKeywords = await getCompetitorKeywords(domain, targetLoc, top10Filter);

        if (compKeywords.length > 0) {
            allKeywords = [...allKeywords, ...compKeywords];
            competitorKeywordsMap[domain] = compKeywords;
        }
    }

    // 2. Obtener keywords relacionadas (seed)
    console.log(`   🔍 Buscando keywords relacionadas...`);
    const relatedKeywords = await getRelatedKeywords(cleanNiche, targetLoc);
    allKeywords = [...allKeywords, ...relatedKeywords];

    console.log(`   📊 Total keywords antes de filtrado: ${allKeywords.length}`);

    // SISTEMA INTELIGENTE: Filtrado adaptativo basado en relevancia semántica
    const nicheTerms = cleanNiche.toLowerCase().split(' ').filter(term => term.length > 2);

    // Lista universal de patrones obviamente irrelevantes (independiente del nicho)
    const universalIrrelevantPatterns = [
        'instagram', 'tiktok', 'meme', 'significado espiritual', 'horoscopo',
        'juego del calamar', 'squid game', 'brainrot', 'en inglés', 'en frances'
    ];

    // Paso 1: Eliminar keywords obviamente irrelevantes (ruido universal)
    allKeywords = allKeywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();
        return !universalIrrelevantPatterns.some(pattern => kwLower.includes(pattern));
    });

    console.log(`   🗑️ Después de eliminar ruido universal: ${allKeywords.length} keywords`);

    // Paso 2: Calcular relevancia semántica para cada keyword
    allKeywords = allKeywords.map(k => {
        const kwLower = k.keyword.toLowerCase();
        let relevanceScore = 0;

        // +3 puntos por cada término del niche que contenga
        nicheTerms.forEach(term => {
            if (kwLower.includes(term)) {
                relevanceScore += 3;
            }
        });

        // +2 puntos si viene de competidor (más confiable)
        if (k.source === 'competitor') {
            relevanceScore += 2;
        }

        // +1 punto por volumen alto (>500)
        if (k.volume > 500) {
            relevanceScore += 1;
        }

        // Penalización: -5 si es demasiado genérica (1 sola palabra)
        if (k.keyword.split(' ').length === 1 && k.keyword.length < 8) {
            relevanceScore -= 5;
        }

        return { ...k, relevanceScore };
    });

    // Paso 3: Filtrar por score mínimo (keywords con al menos 1 punto de relevancia)
    const minRelevanceScore = 1;
    allKeywords = allKeywords.filter(k => k.relevanceScore >= minRelevanceScore);

    console.log(`   🎯 Después de filtro inteligente: ${allKeywords.length} keywords`);

    // Paso 4: Ordenar por relevancia (las más relevantes primero)
    allKeywords.sort((a, b) => {
        // Primero por relevancia, luego por volumen
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }
        return (b.volume || 0) - (a.volume || 0);
    });

    // 3. Deduplicar y filtrar por volumenduplicación
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
                // Preservar URL y Source
                uniqueMap.set(text, {
                    ...k,
                    keyword: text // Asegurar lowercase
                });
            }
        }
    });

    // Ordenar por volumen
    let uniqueKeywords = Array.from(uniqueMap.values())
        .sort((a, b) => (b.volume || 0) - (a.volume || 0))
        .slice(0, 150); // Top 150

    console.log(`   📊 Dataset para IA: ${uniqueKeywords.length} keywords.`);

    // NUEVO: Crear log detallado del proceso
    let analysisLog = `# 📊 Análisis de Clustering - ${cleanNiche} en ${cleanCity}\n\n`;
    analysisLog += `**Fecha:** ${new Date().toLocaleString('es-ES')}\n`;
    analysisLog += `**Location Code:** ${targetLoc}\n\n`;
    analysisLog += `---\n\n`;

    // Log 1: Keywords por competidor
    analysisLog += `## 🔍 Keywords Extraídas por Competidor\n\n`;
    for (const [domain, keywords] of Object.entries(competitorKeywordsMap)) {
        analysisLog += `### ${domain}\n`;
        analysisLog += `**Total:** ${keywords.length} keywords\n\n`;
        analysisLog += `| Keyword | Volumen | Pos | Fuente | URL |\n`;
        analysisLog += `|---------|---------|-----|--------|-----|\n`;
        keywords.slice(0, 20).forEach(k => {
            analysisLog += `| ${k.keyword} | ${k.volume} | ${k.position || '-'} | ${k.source} | ${k.url || '-'} |\n`;
        });
        if (keywords.length > 20) {
            analysisLog += `| ... y ${keywords.length - 20} más |\n`;
        }
        analysisLog += `\n`;
    }

    // Log 2: Keywords relacionadas (seed)
    analysisLog += `## 🌱 Keywords Relacionadas (Seed)\n\n`;
    const seedKws = allKeywords.filter(k => k.source === 'related');
    analysisLog += `**Total:** ${seedKws.length} keywords\n\n`;
    analysisLog += `| Keyword | Volumen |\n`;
    analysisLog += `|---------|--------|\n`;
    seedKws.slice(0, 30).forEach(k => {
        analysisLog += `| ${k.keyword} | ${k.volume} |\n`;
    });
    if (seedKws.length > 30) {
        analysisLog += `| ... y ${seedKws.length - 30} más |\n`;
    }
    analysisLog += `\n`;

    // Log 3: Proceso de filtrado
    analysisLog += `## 🔬 Proceso de Filtrado y Deduplicación\n\n`;
    analysisLog += `- **Keywords totales extraídas:** ${allKeywords.length}\n`;
    analysisLog += `- **Keywords después de deduplicación:** ${uniqueKeywords.length}\n`;
    analysisLog += `- **Keywords descartadas (sin volumen):** ${allKeywords.length - uniqueKeywords.length}\n\n`;

    // Log 4: Top 50 keywords enviadas a IA
    analysisLog += `## 🎯 Top 50 Keywords Enviadas a Gemini AI\n\n`;
    analysisLog += `Estas son las keywords que se usaron para el clustering:\n\n`;
    analysisLog += `| # | Keyword | Volumen | Pos | Fuente | URL |\n`;
    analysisLog += `|---|---------|---------|-----|--------|-----|\n`;
    uniqueKeywords.slice(0, 50).forEach((k, i) => {
        analysisLog += `| ${i + 1} | ${k.keyword} | ${k.volume} | ${k.position || '-'} | ${k.source} | ${k.url || '-'} |\n`;
    });
    analysisLog += `\n`;

    // 4. Clustering con Gemini
    const prompt = `
        ACTÚA COMO: Experto en Arquitectura Web y SEO Estratégico.
        OBJETIVO: Identificar los SERVICIOS PRINCIPALES (Commercial Intent) que ofrecen los competidores y separarlos de temas informativos (Blog/Info).

        INPUT DATA (Keywords + Contexto):
        ${JSON.stringify(uniqueKeywords.map(k => ({
        keyword: k.keyword,
        volume: k.volume,
        source: k.source, // 'competitor' o 'related'
        url: k.url || '' // URL que rankea (pista de intención)
    })))}
        
        INSTRUCCIONES DE ANÁLISIS:
        1. Analiza la INTENCIÓN DE BÚSQUEDA de cada keyword usando la URL y el término:
           - **COMMERCIAL (Servicios):** Si la URL sugiere una página de servicio (ej: /servicios/, /instalacion/, root domain) o la keyword es transaccional ("precio", "empresa", "instalador").
           - **INFORMATIONAL (Blog):** Si la URL sugiere blog (ej: /blog/, /consejos/, /guia/, /como-hacer/) o la keyword es informativa ("cómo limpiar", "qué es", "ideas").
        2. Agrupa las keywords en CLUSTERS temáticos.
        3. Clasifica cada cluster como "COMMERCIAL" o "INFORMATIONAL".
        4. **PRIORIDAD:** Tu objetivo principal es definir la arquitectura de SERVICIOS.
        
        REGLAS SEO ESTRICTAS para meta tags:
        - H1: Máximo 60 caracteres, incluir focal keyword de forma natural
        - SEO Title: Máximo 60 caracteres, NO repetir focal keyword exacta, usar sinónimos
        - Meta Description: Máximo 160 caracteres, persuasiva, incluir CTA
        - Usar keywords secundarias del cluster en títulos
        
        DEVUELVE JSON (IMPORTANTE: Respetar esta estructura exacta):
        {
            "market_analysis": "Breve análisis de qué servicios priorizan los competidores y qué temas informativos cubren.",
            "clusters": [
                {
                    "name": "Nombre del Cluster/Servicio",
                    "intent": "COMMERCIAL", // o "INFORMATIONAL"
                    "main_keyword": "focal keyword",
                    "volume": 0,  // Suma TOTAL de volúmenes
                    "meta_suggestions": [
                        {
                            "h1": "H1 Optimizado Variación 1",
                            "seo_title": "Meta Title Variación 1",
                            "seo_description": "Meta Description Variación 1"
                        },
                        // ... 5 variaciones ...
                        {
                            "h1": "H1 Optimizado Variación 5",
                            "seo_title": "Meta Title Variación 5",
                            "seo_description": "Meta Description Variación 5"
                        }
                    ],
                    "selected_suggestion": 0,
                    "keywords": [{"keyword": "kw", "volume": 10}]
                }
            ],
            "locations": ["Zona 1", "Zona 2", "Zona 3", "Zona 4", "Zona 5"],
            "home_structure": { "h1": "H1 para homepage", "h2s": ["H2 sección 1", "H2 sección 2"] }
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

        // NUEVO: Añadir sección de resultados del clustering al log
        analysisLog += `## 🎨 Resultados del Clustering\n\n`;
        analysisLog += `**Total de Clusters Generados:** ${plan.clusters?.length || 0}\n\n`;

        plan.clusters?.forEach((cluster, i) => {
            const totalVol = cluster.keywords?.reduce((sum, k) => sum + (k.volume || 0), 0) || 0;
            analysisLog += `### Cluster ${i + 1}: ${cluster.name}\n\n`;
            analysisLog += `- **Focal Keyword:** ${cluster.main_keyword}\n`;
            analysisLog += `- **Volumen Total:** ${totalVol}\n`;
            analysisLog += `- **Keywords en el cluster:** ${cluster.keywords?.length || 0}\n\n`;

            if (cluster.keywords && cluster.keywords.length > 0) {
                analysisLog += `| Keyword | Volumen |\n`;
                analysisLog += `|---------|--------|\n`;
                cluster.keywords.forEach(k => {
                    analysisLog += `| ${k.keyword} | ${k.volume} |\n`;
                });
                analysisLog += `\n`;
            }

            // Mostrar las 5 sugerencias de meta tags
            if (cluster.meta_suggestions && cluster.meta_suggestions.length > 0) {
                analysisLog += `**Meta Tag Suggestions:**\n\n`;
                cluster.meta_suggestions.forEach((suggestion, idx) => {
                    analysisLog += `${idx + 1}. **H1:** ${suggestion.h1}\n`;
                    analysisLog += `   - **Title:** ${suggestion.seo_title}\n`;
                    analysisLog += `   - **Description:** ${suggestion.seo_description}\n\n`;
                });
            }
        });

        // Guardar el log en un archivo
        await fs.writeFile('clustering_analysis.md', analysisLog);
        console.log(`   📄 Análisis guardado en: clustering_analysis.md`);

        await fs.writeFile('project_plan.json', JSON.stringify(finalData, null, 2));
        return finalData;

    } catch (error) {
        console.error("❌ Error en Gemini Clustering:", error);
        throw new Error("Fallo al generar clusters con IA. Inténtalo de nuevo.");
    }
}