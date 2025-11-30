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

    // NUEVO: Filtro de relevancia semántica
    const nicheTerms = cleanNiche.toLowerCase().split(' ');
    const irrelevantPatterns = [
        'restaurante', 'restaurant', 'hotel', 'hostal', 'bar', 'café', 'cafeteria',
        'tienda', 'shop', 'store', 'supermercado', 'mercado', 'farmacia', 'pharmacy'
    ];

    // Filtrar keywords completamente irrelevantes
    allKeywords = allKeywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();

        // Si contiene algún término irrelevante Y NO contiene ningún término del niche, descartarla
        const hasIrrelevant = irrelevantPatterns.some(pattern => kwLower.includes(pattern));
        const hasNicheTerm = nicheTerms.some(term => term.length > 3 && kwLower.includes(term));

        // Mantener si: NO tiene términos irrelevantes O tiene términos del niche
        return !hasIrrelevant || hasNicheTerm;
    });

    console.log(`   🧹 Después de filtro de relevancia: ${allKeywords.length} keywords`);

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
                uniqueMap.set(text, k);
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
        analysisLog += `| Keyword | Volumen | Pos | Fuente |\n`;
        analysisLog += `|---------|---------|-----|--------|\n`;
        keywords.slice(0, 20).forEach(k => {
            analysisLog += `| ${k.keyword} | ${k.volume} | ${k.position || '-'} | ${k.source} |\n`;
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
    analysisLog += `| # | Keyword | Volumen | Pos | Fuente |\n`;
    analysisLog += `|---|---------|---------|-----|--------|\n`;
    uniqueKeywords.slice(0, 50).forEach((k, i) => {
        analysisLog += `| ${i + 1} | ${k.keyword} | ${k.volume} | ${k.position || '-'} | ${k.source} |\n`;
    });
    analysisLog += `\n`;

    // 4. Clustering con Gemini
    const prompt = `
        Actúa como experto SEO profesional. Objetivo: Crear arquitectura web para "${cleanNiche}" en "${cleanCity}".
        
        INPUT (Keywords + Volumen Local):
        ${JSON.stringify(uniqueKeywords.map(k => `${k.keyword} (${k.volume})`))}
        
        TAREA:
        1. Agrupa estas keywords en CLUSTERS temáticos para crear páginas de servicio
        2. Para cada cluster, selecciona la "Focal Keyword" (mayor volumen + intención comercial)
        3. Calcula el "volume" del cluster como la SUMA TOTAL de los volúmenes de TODAS las keywords del cluster
        4. Genera 5 VARIACIONES DIFERENTES de meta tags para cada cluster
        5. Define 5 zonas/barrios locales de ${cleanCity}
        
        REGLAS SEO ESTRICTAS para meta tags:
        - H1: Máximo 60 caracteres, incluir focal keyword de forma natural
        - SEO Title: Máximo 60 caracteres, NO repetir focal keyword exacta, usar sinónimos o variaciones
        - Meta Description: Máximo 160 caracteres, persuasiva, incluir call-to-action
        - Usar keywords secundarias del cluster en títulos
        - Incluir modificadores: "Best", "Top", "Guide", "2024", "Precio", "Cerca de ti", etc.
        - Cada variación debe ser ÚNICA y ofrecer un ángulo diferente
        
        DEVUELVE JSON (IMPORTANTE: Respetar esta estructura exacta):
        {
            "market_analysis": "Análisis breve del mercado local (2-3 líneas)",
            "clusters": [
                {
                    "name": "Nombre del Cluster/Servicio",
                    "main_keyword": "focal keyword",
                    "volume": 0,  // IMPORTANTE: Suma TOTAL de volúmenes de TODAS las keywords del cluster
                    "meta_suggestions": [
                        {
                            "h1": "H1 Optimizado Variación 1",
                            "seo_title": "Meta Title Variación 1 (sin repetir focal keyword)",
                            "seo_description": "Meta Description Variación 1 con CTA"
                        },
                        {
                            "h1": "H1 Optimizado Variación 2",
                            "seo_title": "Meta Title Variación 2 (ángulo diferente)",
                            "seo_description": "Meta Description Variación 2 con CTA"
                        },
                        {
                            "h1": "H1 Optimizado Variación 3",
                            "seo_title": "Meta Title Variación 3 (enfoque precio/calidad)",
                            "seo_description": "Meta Description Variación 3 con CTA"
                        },
                        {
                            "h1": "H1 Optimizado Variación 4",
                            "seo_title": "Meta Title Variación 4 (enfoque local)",
                            "seo_description": "Meta Description Variación 4 con CTA"
                        },
                        {
                            "h1": "H1 Optimizado Variación 5",
                            "seo_title": "Meta Title Variación 5 (enfoque urgencia/2024)",
                            "seo_description": "Meta Description Variación 5 con CTA"
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