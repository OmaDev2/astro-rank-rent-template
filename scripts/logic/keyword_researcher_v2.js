import {
    getTopCompetitors,
    getRelatedKeywords,
    getCompetitorKeywords,
    getPeopleAlsoAsk,
    getKeywordSuggestions,
    filterByCity,
    calculateRelevance,
    getLocationCode,
    SPANISH_CITIES
} from '../lib/seo_client_v2.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

// ============================================================================
// PATRONES DE FILTRADO
// ============================================================================

// Keywords obviamente irrelevantes (ruido universal)
const NOISE_PATTERNS = [
    'instagram', 'tiktok', 'facebook', 'youtube', 'twitter',
    'meme', 'significado espiritual', 'horoscopo', 'horóscopo',
    'juego del calamar', 'squid game', 'brainrot',
    'en inglés', 'en frances', 'en alemán', 'traductor',
    'wikipedia', 'pdf gratis', 'descargar gratis'
];

// Patrones informativos (para separar de comerciales)
const INFORMATIONAL_PATTERNS = [
    'qué es', 'que es', 'cómo hacer', 'como hacer', 'cómo se hace',
    'tutorial', 'guía', 'guia', 'paso a paso', 'diy', 'casero',
    'historia de', 'origen de', 'tipos de', 'diferencia entre',
    'ventajas y desventajas', 'pros y contras', 'comparativa'
];

// Patrones comerciales (alta intención de compra)
const COMMERCIAL_PATTERNS = [
    'precio', 'presupuesto', 'coste', 'costo', 'cuanto cuesta',
    'barato', 'económico', 'economico', 'oferta',
    'empresa', 'empresas', 'profesional', 'profesionales',
    'servicio', 'servicios', 'contratar', 'busco',
    'cerca de mi', 'cerca de mí', 'en mi zona', '24 horas', 'urgente'
];

// ============================================================================
// FUNCIONES DE FILTRADO Y SCORING
// ============================================================================

/**
 * Filtra ruido universal de la lista de keywords
 */
function filterNoise(keywords) {
    return keywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();
        return !NOISE_PATTERNS.some(pattern => kwLower.includes(pattern));
    });
}

/**
 * Clasifica la intención de una keyword
 */
function classifyIntent(keyword) {
    const kwLower = keyword.toLowerCase();

    // Verificar patrones comerciales
    const isCommercial = COMMERCIAL_PATTERNS.some(p => kwLower.includes(p));

    // Verificar patrones informativos
    const isInformational = INFORMATIONAL_PATTERNS.some(p => kwLower.includes(p));

    if (isCommercial && !isInformational) return 'COMMERCIAL';
    if (isInformational && !isCommercial) return 'INFORMATIONAL';
    if (isCommercial && isInformational) return 'MIXED';

    // Por defecto, asumir comercial si tiene términos de servicio
    return 'COMMERCIAL';
}

/**
 * Calcula un score de relevancia avanzado con enfoque LOCAL
 */
function advancedRelevanceScore(keyword, niche, targetCity) {
    const kwLower = keyword.keyword.toLowerCase();
    const nicheTerms = niche.toLowerCase().split(' ').filter(t => t.length > 2);
    const cityLower = targetCity?.toLowerCase() || '';

    let score = 0;
    let reasons = [];

    // 🎯 +10 puntos si contiene la ciudad objetivo (MÁXIMA PRIORIDAD)
    if (cityLower && kwLower.includes(cityLower)) {
        score += 10;
        reasons.push(`+10 ciudad "${cityLower}"`);
    }

    // +5 por cada término del nicho presente
    nicheTerms.forEach(term => {
        if (kwLower.includes(term)) {
            score += 5;
            reasons.push(`+5 contiene "${term}"`);
        }
    });

    // +3 si tiene intención comercial clara
    if (COMMERCIAL_PATTERNS.some(p => kwLower.includes(p))) {
        score += 3;
        reasons.push('+3 intención comercial');
    }

    // +2 si viene de competidor
    if (keyword.source === 'competitor') {
        score += 2;
        reasons.push('+2 fuente competidor');
    }

    // +1 por buen volumen (escalonado)
    if (keyword.volume > 1000) {
        score += 2;
        reasons.push('+2 volumen >1000');
    } else if (keyword.volume > 100) {
        score += 1;
        reasons.push('+1 volumen >100');
    }

    // -3 si es demasiado genérica
    const wordCount = keyword.keyword.split(' ').length;
    if (wordCount === 1 && keyword.keyword.length < 6) {
        score -= 3;
        reasons.push('-3 muy genérica');
    }

    // -10 si contiene otra ciudad española (penalización severa para SEO local)
    const otherCities = SPANISH_CITIES.filter(c => c !== cityLower);
    if (otherCities.some(city => new RegExp(`\\b${city}\\b`, 'i').test(kwLower))) {
        score -= 10;
        reasons.push('-10 otra ciudad');
    }

    return { score, reasons };
}

// ============================================================================
// CLUSTERING PRINCIPAL
// ============================================================================

/**
 * Genera clusters de keywords inteligentes
 * @param {string} niche - El nicho/servicio principal
 * @param {string} city - La ciudad objetivo
 * @param {Array} competitors - Lista de dominios competidores
 * @param {string|number} location - Location code o nombre
 * @param {Object} options - Opciones adicionales
 */
export async function generateSmartClusters(niche, city, competitors, location, options = {}) {
    const {
        top10Filter = true,
        minRelevanceScore = 5,  // Aumentado de 3 a 5 para SEO local más estricto
        maxKeywordsForAI = 150,
        includeInformational = true
    } = options;

    const locationCode = getLocationCode(location);

    console.log('\n' + '='.repeat(60));
    console.log(`🚀 SMART CLUSTERING: "${niche}" en "${city}"`);
    console.log(`📍 Location Code: ${locationCode}`);
    console.log(`🎯 TOP 10 Filter: ${top10Filter ? 'ON' : 'OFF'}`);
    console.log('='.repeat(60) + '\n');

    // ========================================================================
    // PASO 1: Recopilar keywords de múltiples fuentes
    // ========================================================================

    let allKeywords = [];
    const competitorKeywordsMap = {};
    const stats = {
        fromCompetitors: 0,
        fromRelated: 0,
        fromSuggestions: 0,
        filteredByCity: 0,
        filteredByNoise: 0,
        filteredByRelevance: 0
    };

    // 1.1 Keywords de competidores
    console.log('📊 FASE 1: Extrayendo keywords de competidores...\n');

    for (const domain of competitors) {
        console.log(`   🔍 Analizando: ${domain}`);
        const compKeywords = await getCompetitorKeywords(domain, location, city, top10Filter);

        if (compKeywords.length > 0) {
            competitorKeywordsMap[domain] = compKeywords;
            allKeywords = [...allKeywords, ...compKeywords];
            stats.fromCompetitors += compKeywords.length;
        }
    }

    console.log(`   ✅ Total de competidores: ${stats.fromCompetitors} keywords\n`);

    // 1.2 Keywords relacionadas (seed expansion)
    console.log('📊 FASE 2: Expandiendo con keywords relacionadas...\n');

    // Búsqueda principal: nicho + ciudad
    const relatedMain = await getRelatedKeywords(`${niche} ${city}`, location, city);
    allKeywords = [...allKeywords, ...relatedMain];

    // Búsqueda secundaria: solo nicho (para capturar más volumen)
    const relatedNiche = await getRelatedKeywords(niche, location, city);
    allKeywords = [...allKeywords, ...relatedNiche];

    stats.fromRelated = relatedMain.length + relatedNiche.length;
    console.log(`   ✅ Keywords relacionadas: ${stats.fromRelated}\n`);

    // 1.3 Sugerencias de autocomplete
    console.log('📊 FASE 3: Obteniendo sugerencias de autocomplete...\n');

    const suggestions = await getKeywordSuggestions(`${niche} ${city}`, location);
    // Filtrar sugerencias por ciudad antes de añadir
    const filteredSuggestions = filterByCity(suggestions, city);
    allKeywords = [...allKeywords, ...filteredSuggestions];
    stats.fromSuggestions = filteredSuggestions.length;
    console.log(`   ✅ Sugerencias: ${stats.fromSuggestions}\n`);

    // 1.4 People Also Ask (para FAQs)
    console.log('📊 FASE 4: Extrayendo preguntas PAA...\n');

    const paaQuestions = await getPeopleAlsoAsk(`${niche} ${city}`, location);
    console.log(`   ✅ Preguntas PAA: ${paaQuestions.length}\n`);

    // ========================================================================
    // PASO 2: Filtrado inteligente
    // ========================================================================

    console.log('🔬 FASE 5: Filtrado inteligente...\n');
    const totalBefore = allKeywords.length;

    // 2.1 Eliminar ruido universal
    allKeywords = filterNoise(allKeywords);
    stats.filteredByNoise = totalBefore - allKeywords.length;
    console.log(`   🗑️ Eliminado ruido: ${stats.filteredByNoise} keywords`);

    // 2.2 Filtrar por ciudad (segunda pasada, por si acaso)
    const afterNoise = allKeywords.length;
    allKeywords = filterByCity(allKeywords, city);
    stats.filteredByCity = afterNoise - allKeywords.length;
    console.log(`   📍 Filtrado por ciudad: ${stats.filteredByCity} keywords`);

    // 2.3 Calcular relevancia y filtrar
    allKeywords = allKeywords.map(k => {
        const { score, reasons } = advancedRelevanceScore(k, niche, city);
        return { ...k, relevanceScore: score, relevanceReasons: reasons };
    });

    const afterRelevance = allKeywords.length;
    allKeywords = allKeywords.filter(k => k.relevanceScore >= minRelevanceScore);
    stats.filteredByRelevance = afterRelevance - allKeywords.length;
    console.log(`   🎯 Filtrado por relevancia (min ${minRelevanceScore}): ${stats.filteredByRelevance} keywords`);

    // 2.4 Clasificar intención
    allKeywords = allKeywords.map(k => ({
        ...k,
        intent: classifyIntent(k.keyword)
    }));

    // ========================================================================
    // PASO 3: Deduplicar y ordenar
    // ========================================================================

    console.log('\n🔄 FASE 6: Deduplicación y ordenamiento...\n');

    const uniqueMap = new Map();

    allKeywords.forEach(k => {
        if (!k.keyword) return;
        const text = k.keyword.toLowerCase().trim();

        // Solo incluir si tiene volumen
        if (k.volume > 0) {
            // Quedarse con el de mayor relevancia o volumen
            const existing = uniqueMap.get(text);
            if (!existing || k.relevanceScore > existing.relevanceScore) {
                uniqueMap.set(text, { ...k, keyword: text });
            }
        }
    });

    // Ordenar por relevancia, luego por volumen
    let uniqueKeywords = Array.from(uniqueMap.values())
        .sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            return (b.volume || 0) - (a.volume || 0);
        })
        .slice(0, maxKeywordsForAI);

    console.log(`   ✅ Keywords únicas para clustering: ${uniqueKeywords.length}`);

    // Separar por intención
    const commercialKws = uniqueKeywords.filter(k => k.intent === 'COMMERCIAL');
    const informationalKws = uniqueKeywords.filter(k => k.intent === 'INFORMATIONAL');
    const mixedKws = uniqueKeywords.filter(k => k.intent === 'MIXED');

    console.log(`   📈 Comerciales: ${commercialKws.length}`);
    console.log(`   📚 Informativas: ${informationalKws.length}`);
    console.log(`   🔀 Mixtas: ${mixedKws.length}`);

    // ========================================================================
    // PASO 4: Clustering con Gemini
    // ========================================================================

    console.log('\n🧠 FASE 7: Clustering con Gemini AI...\n');

    const prompt = buildClusteringPrompt(niche, city, uniqueKeywords, paaQuestions, includeInformational);

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const plan = JSON.parse(jsonStr);

        // ========================================================================
        // PASO 5: Enriquecer y guardar resultados
        // ========================================================================

        const finalData = {
            ...plan,
            raw_data: {
                top_keywords: uniqueKeywords.slice(0, 50),
                competitor_keywords: competitorKeywordsMap,
                paa_questions: paaQuestions,
                stats: stats
            },
            niche: niche,
            city: city
        };

        // Generar log de análisis
        const analysisLog = generateAnalysisLog(
            niche, city, locationCode, competitorKeywordsMap,
            uniqueKeywords, paaQuestions, plan, stats
        );

        await fs.writeFile('clustering_analysis.md', analysisLog);
        console.log('   📄 Log guardado: clustering_analysis.md');

        await fs.writeFile('project_plan.json', JSON.stringify(finalData, null, 2));
        console.log('   💾 Plan guardado: project_plan.json');

        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('✨ CLUSTERING COMPLETADO');
        console.log('='.repeat(60));
        console.log(`📊 Clusters generados: ${plan.clusters?.length || 0}`);
        console.log(`📈 Volumen total capturado: ${plan.clusters?.reduce((sum, c) => sum + (c.volume || 0), 0).toLocaleString()}`);
        console.log('='.repeat(60) + '\n');

        return finalData;

    } catch (error) {
        console.error("❌ Error en Gemini Clustering:", error);
        throw new Error("Fallo al generar clusters con IA.");
    }
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildClusteringPrompt(niche, city, keywords, paaQuestions, includeInformational) {
    return `
ACTÚA COMO: Arquitecto SEO y Estratega de Contenidos experto.

PROYECTO: ${niche} en ${city}
OBJETIVO: Crear la arquitectura de páginas de servicio óptima para posicionar en Google.

═══════════════════════════════════════════════════════════════════════════════
DATOS DE KEYWORDS (Ya filtrados por relevancia y ubicación)
═══════════════════════════════════════════════════════════════════════════════
${JSON.stringify(keywords.map(k => ({
        keyword: k.keyword,
        volume: k.volume,
        intent: k.intent,
        source: k.source,
        url: k.url || null,
        relevance: k.relevanceScore
    })), null, 2)}

═══════════════════════════════════════════════════════════════════════════════
PREGUNTAS REALES DE USUARIOS (People Also Ask)
═══════════════════════════════════════════════════════════════════════════════
${JSON.stringify(paaQuestions, null, 2)}

═══════════════════════════════════════════════════════════════════════════════
INSTRUCCIONES DE CLUSTERING
═══════════════════════════════════════════════════════════════════════════════

1. ANALIZA LA INTENCIÓN:
   - COMMERCIAL: Keywords que indican intención de contratar/comprar
   - INFORMATIONAL: Keywords que buscan información/aprendizaje
   ${includeInformational ? '- Incluye AMBOS tipos en clusters separados' : '- SOLO incluye clusters COMMERCIAL'}

2. AGRUPA POR SERVICIO/TEMA:
   - Cada cluster debe representar UNA página de servicio
   - Keywords del mismo cluster deben poder responderse con UNA sola página
   - NO mezcles servicios diferentes (ej: "pintar fachadas" ≠ "quitar gotelé")

3. EVITA CANIBALIZACIÓN:
   - Cada keyword debe ir en UN solo cluster
   - Si una keyword podría ir en varios, elige el más específico

4. REGLAS DE CALIDAD:
   - Clusters con <3 keywords probablemente no merezcan página propia
   - El main_keyword debe ser el de MAYOR volumen del cluster
   - Calcula el volumen total sumando TODAS las keywords del cluster

5. META TAGS (5 variaciones por cluster):
   - H1: Máximo 60 caracteres, incluir keyword principal
   - SEO Title: Máximo 60 caracteres, NO repetir H1 exacto
   - Meta Description: Máximo 160 caracteres, incluir CTA y ciudad

═══════════════════════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════════════════════

{
    "market_analysis": "Análisis breve del mercado y oportunidad detectada (2-3 frases)",
    "clusters": [
        {
            "name": "Nombre descriptivo del servicio/cluster",
            "intent": "COMMERCIAL",
            "main_keyword": "keyword principal (mayor volumen)",
            "volume": 12345,
            "meta_suggestions": [
                {
                    "h1": "H1 Optimizado",
                    "seo_title": "Title para Google",
                    "seo_description": "Meta description persuasiva con CTA"
                }
                // ... 5 variaciones total
            ],
            "selected_suggestion": 0,
            "keywords": [
                {"keyword": "keyword 1", "volume": 1000},
                {"keyword": "keyword 2", "volume": 500}
            ],
            "related_questions": ["¿Pregunta PAA relevante?"]
        }
    ],
    "locations": ["5 barrios/zonas importantes de ${city} para SEO local"],
    "home_structure": {
        "h1": "H1 optimizado para la homepage",
        "h2s": ["H2 sección 1", "H2 sección 2", "H2 sección 3"]
    }
}

IMPORTANTE: 
- El JSON debe ser válido y parseable
- NO incluyas explicaciones fuera del JSON
- Calcula "volume" como la SUMA de todos los volúmenes del cluster
`;
}

// ============================================================================
// LOG GENERATOR
// ============================================================================

function generateAnalysisLog(niche, city, locationCode, competitorKeywordsMap, uniqueKeywords, paaQuestions, plan, stats) {
    let log = `# 📊 Análisis de Clustering - ${niche} en ${city}\n\n`;
    log += `**Fecha:** ${new Date().toLocaleString('es-ES')}\n`;
    log += `**Location Code:** ${locationCode}\n\n`;
    log += `---\n\n`;

    // Stats
    log += `## 📈 Estadísticas de Recopilación\n\n`;
    log += `| Fuente | Keywords |\n`;
    log += `|--------|----------|\n`;
    log += `| Competidores | ${stats.fromCompetitors} |\n`;
    log += `| Relacionadas | ${stats.fromRelated} |\n`;
    log += `| Sugerencias | ${stats.fromSuggestions} |\n`;
    log += `| **Total recopiladas** | **${stats.fromCompetitors + stats.fromRelated + stats.fromSuggestions}** |\n\n`;

    log += `### Filtrado\n\n`;
    log += `| Filtro | Eliminadas |\n`;
    log += `|--------|------------|\n`;
    log += `| Ruido universal | ${stats.filteredByNoise} |\n`;
    log += `| Otras ciudades | ${stats.filteredByCity} |\n`;
    log += `| Baja relevancia | ${stats.filteredByRelevance} |\n`;
    log += `| **Keywords finales** | **${uniqueKeywords.length}** |\n\n`;

    // Keywords por competidor
    log += `## 🔍 Keywords por Competidor\n\n`;
    for (const [domain, keywords] of Object.entries(competitorKeywordsMap)) {
        log += `### ${domain}\n`;
        log += `**Total:** ${keywords.length} keywords\n\n`;
        log += `| Keyword | Vol | Pos | Intent |\n`;
        log += `|---------|-----|-----|--------|\n`;
        keywords.slice(0, 15).forEach(k => {
            log += `| ${k.keyword} | ${k.volume} | ${k.position || '-'} | ${classifyIntent(k.keyword)} |\n`;
        });
        if (keywords.length > 15) log += `| ... y ${keywords.length - 15} más |\n`;
        log += `\n`;
    }

    // PAA Questions
    if (paaQuestions.length > 0) {
        log += `## ❓ People Also Ask\n\n`;
        paaQuestions.forEach(q => {
            log += `- ${q.question}\n`;
        });
        log += `\n`;
    }

    // Clusters generados
    log += `## 🎨 Clusters Generados\n\n`;
    plan.clusters?.forEach((cluster, i) => {
        log += `### ${i + 1}. ${cluster.name}\n\n`;
        log += `- **Intent:** ${cluster.intent}\n`;
        log += `- **Main Keyword:** ${cluster.main_keyword}\n`;
        log += `- **Volumen Total:** ${cluster.volume?.toLocaleString()}\n`;
        log += `- **Keywords:** ${cluster.keywords?.length || 0}\n\n`;

        if (cluster.keywords?.length > 0) {
            log += `| Keyword | Volumen |\n`;
            log += `|---------|--------|\n`;
            cluster.keywords.forEach(k => {
                log += `| ${k.keyword} | ${k.volume} |\n`;
            });
            log += `\n`;
        }

        if (cluster.meta_suggestions?.[0]) {
            log += `**Meta Tags Sugeridos:**\n`;
            log += `- H1: ${cluster.meta_suggestions[0].h1}\n`;
            log += `- Title: ${cluster.meta_suggestions[0].seo_title}\n`;
            log += `- Description: ${cluster.meta_suggestions[0].seo_description}\n\n`;
        }
    });

    return log;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    generateSmartClusters,
    filterNoise,
    classifyIntent,
    advancedRelevanceScore
};
