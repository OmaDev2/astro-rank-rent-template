
import {
    getCompetitorKeywords,
    getRelatedKeywords,
    getKeywordSuggestions,
    getKeywordIdeas,
    getPeopleAlsoAsk,
    getLocationCode
} from '../lib/seo_client_v2.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// ============================================================================
// CONFIGURACIÓN PARA SEO LOCAL
// ============================================================================

const LOCAL_SEO_CONFIG = {
    top10Filter: false,           // Captura todas las posiciones
    minRelevanceScore: 3,         // Score mínimo aceptable
    minSearchVolume: 10,          // Volumen mínimo (ajustado a 10 para evitar ceros)
    maxKeywordsForAI: 200,        // Keywords para clustering
    includeInformational: true    // Incluir FAQs
};

// ============================================================================
// PATRONES PARA SEO LOCAL
// ============================================================================

const LOCAL_COMMERCIAL_PATTERNS = [
    // Precio y presupuesto
    'precio', 'presupuesto', 'coste', 'costo', 'cuanto cuesta', 'tarifas',

    // Cualidades del servicio
    'barato', 'económico', 'oferta', 'profesional', 'urgente',

    // Acción comercial
    'empresa', 'empresas', 'servicio', 'servicios', 'contratar',
    'instalación', 'reparación', 'mantenimiento', 'taller',

    // Localización
    'cerca de mi', 'cerca de mí', 'en mi zona', 'cerca', 'domicilio',

    // Urgencia (clave en servicios locales)
    'urgente', 'urgencias', '24 horas', '24h', 'emergencia',
    'rápido', 'inmediato', 'mismo día'
];

const NOISE_PATTERNS = [
    'instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'linkedin',
    'meme', 'significado', 'horoscopo', 'definición', 'sinónimo',
    'wikipedia', 'pdf', 'descargar', 'gratis', 'torrent',
    'minecraft', 'fortnite', 'roblox', 'lego', 'playmobil',
    'empleo', 'trabajo de', 'sueldo', 'vacantes', 'curso', 'aprender'
];

const BLACKLIST_DOMAINS = [
    'instagram.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'pinterest.com',
    'youtube.com', 'tiktok.com', 'amazon.es', 'amazon.com', 'ebay.es', 'ebay.com',
    'milanuncios.com', 'wallapop.com', 'habitissimo.es', 'cronoshare.com', 'zaask.es',
    'paginasamarillas.es', 'yelp.es', 'tripadvisor.es', 'wikipedia.org', 'boe.es'
];

// ============================================================================
// SCORING OPTIMIZADO PARA SEO LOCAL
// ============================================================================

function calculateLocalScore(keywordObj, niche, city, services = []) {
    let score = 0;
    let reasons = [];
    const text = keywordObj.keyword.toLowerCase();
    const nicheLower = niche.toLowerCase();
    const cityLower = city.toLowerCase();

    // 1. Contiene la ciudad (+20)
    if (text.includes(cityLower)) {
        score += 20;
        reasons.push('+20 ciudad');
    }

    // 2. Contiene el nicho exacto (+15)
    if (text.includes(nicheLower)) {
        score += 15;
        reasons.push('+15 nicho');
    }

    // 3. Contiene palabras de servicios validados (+15)
    // Esto asegura que "rejas" tenga score alto si validaste ese servicio
    if (services && services.length > 0) {
        const matchesService = services.some(s => {
            // Simplificamos el servicio para buscar coincidencias (ej: "Rejas..." -> "rejas")
            const simple = simplifyServiceQuery(s).toLowerCase().split(' ')[0];
            return simple.length > 3 && text.includes(simple);
        });
        if (matchesService) {
            score += 15;
            reasons.push('+15 servicio');
        }
    }

    // 🎯 REGLA 2: TÉRMINOS DEL NICHO (Original REGLA 2, now REGLA 4)
    const nicheTerms = niche.toLowerCase().split(' ').filter(t => t.length > 2);
    let nicheTermCount = 0;
    nicheTerms.forEach(term => {
        if (text.includes(term)) {
            nicheTermCount++;
        }
    });
    if (nicheTermCount > 0) {
        score += 10 * nicheTermCount;
        reasons.push(`+${10 * nicheTermCount} nicho parcial`);
    }

    // 🎯 REGLA 3: INTENCIÓN COMERCIAL
    const hasCommercialIntent = LOCAL_COMMERCIAL_PATTERNS.some(pattern => text.includes(pattern));
    if (hasCommercialIntent) {
        score += 10;
        reasons.push('+10 comercial');
    }

    // 🎯 REGLA 4: LONG TAIL (3+ palabras)
    const wordCount = text.split(' ').length;
    if (wordCount >= 3) {
        score += 5;
        reasons.push('+5 long-tail');
    }

    // 🎯 REGLA 4: DATOS DE COMPETIDOR
    if (keywordObj.source === 'competitor') {
        if (keywordObj.position <= 3) {
            score += 10;
            reasons.push('+10 competidor TOP 3');
        } else if (keywordObj.position <= 10) {
            score += 6;
            reasons.push('+6 competidor TOP 10');
        } else if (keywordObj.position <= 20) {
            score += 3;
            reasons.push('+3 competidor TOP 20');
        } else {
            score += 1;
            reasons.push('+1 competidor');
        }
    }

    // 🎯 REGLA 5: VOLUMEN DE BÚSQUEDA
    const vol = keywordObj.volume || 0;
    if (vol >= 1000) {
        score += 5;
        reasons.push('+5 vol >1000');
    } else if (vol >= 500) {
        score += 4;
        reasons.push('+4 vol >500');
    } else if (vol >= 100) {
        score += 3;
        reasons.push('+3 vol >100');
    } else if (vol >= 50) {
        score += 2;
        reasons.push('+2 vol >50');
    } else if (vol >= 10) {
        score += 1;
        reasons.push('+1 vol >10');
    }

    // ⚠️ PENALIZACIONES

    // Otras ciudades
    // Otras ciudades
    const SPANISH_CITIES = ['madrid', 'barcelona', 'sevilla', 'valencia', 'zaragoza', 'málaga', 'bilbao', 'murcia', 'alicante', 'córdoba', 'valladolid', 'sabadell', 'terrassa', 'badalona'];
    const otherCityMatch = SPANISH_CITIES.filter(c => c !== cityLower).find(c =>
        new RegExp(`\\b${c}\\b`, 'i').test(text)
    );

    if (otherCityMatch) {
        score -= 25;
        reasons.push(`-25 otra ciudad (${otherCityMatch})`);
    }

    // Palabras demasiado genéricas
    if (wordCount === 1 && vol < 50 && nicheTermCount === 0) {
        score -= 5;
        reasons.push('-5 muy genérica');
    }

    // ✨ BONUS: Preguntas
    if (/^(cómo|qué|cuál|dónde|por qué|cuánto)/i.test(text)) {
        score += 3;
        reasons.push('+3 pregunta FAQ');
    }

    return { score, reasons };
}

// ============================================================================
// FUNCIÓN PRINCIPAL - SEO LOCAL UNIVERSAL
// ============================================================================

export async function generateSmartClusters(nicheRaw, cityRaw, competitors, location, options = {}) {
    // Limpieza de inputs
    const niche = nicheRaw.trim();
    const city = cityRaw.trim();

    // Merge configuración
    const config = {
        ...LOCAL_SEO_CONFIG,
        ...options,
        minRelevanceScore: options.minRelevanceScore !== undefined ? options.minRelevanceScore : LOCAL_SEO_CONFIG.minRelevanceScore
    };

    const { skipClustering = false } = options;

    const locationCode = getLocationCode(location || city);
    let allKeywords = [];
    const stats = {
        fromCompetitors: 0,
        fromRelated: 0,
        fromSuggestions: 0,
        fromIdeas: 0,
        fromServices: 0,
        totalCollected: 0,
        afterFiltering: 0
    };

    console.log('\n' + '═'.repeat(70));
    console.log(`🚀 SEO LOCAL: ${niche.toUpperCase()} en ${city.toUpperCase()}`);
    console.log('═'.repeat(70));
    console.log(`📍 Location: ${locationCode}`);
    console.log(`🎯 Min Relevance Score: ${config.minRelevanceScore}`);
    console.log(`📋 Servicios Específicos: ${config.specificServices?.length || 0}`);
    console.log('═'.repeat(70) + '\n');

    // ========================================================================
    // FASE 1: COMPETIDORES
    // ========================================================================
    console.log('📊 FASE 1: Analizando competidores...\n');

    for (const domain of competitors) {
        try {
            console.log(`   🔍 ${domain}...`);
            const keywords = await getCompetitorKeywords(
                domain,
                locationCode,
                city,
                config.top10Filter
            );

            if (keywords && keywords.length > 0) {
                // Marcar fuente
                const tagged = keywords.map(k => ({ ...k, source: 'competitor' }));
                allKeywords.push(...tagged);
                stats.fromCompetitors += keywords.length;
                console.log(`      ✅ ${keywords.length} keywords`);
            } else {
                console.log(`      ⚠️ Sin datos`);
            }
        } catch (error) {
            console.error(`      ❌ Error: ${error.message}`);
        }
    }

    // ========================================================================
    // FASE 2: KEYWORDS RELACIONADAS
    // ========================================================================
    console.log('\n📊 FASE 2: Keywords relacionadas...\n');

    try {
        const relatedMain = await getRelatedKeywords(`${niche} ${city}`, locationCode, city);
        const relatedNiche = await getRelatedKeywords(niche, locationCode, city);

        const taggedMain = relatedMain.map(k => ({ ...k, source: 'related_main' }));
        const taggedNiche = relatedNiche.map(k => ({ ...k, source: 'related_niche' }));

        allKeywords.push(...taggedMain, ...taggedNiche);
        stats.fromRelated = relatedMain.length + relatedNiche.length;

        console.log(`   ✅ ${stats.fromRelated} keywords`);
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }

    // ========================================================================
    // FASE 3: SUGERENCIAS
    // ========================================================================
    console.log('\n📊 FASE 3: Sugerencias...\n');

    try {
        const suggestions = await getKeywordSuggestions(`${niche} ${city}`, locationCode);
        // Filtrado básico por ciudad para sugerencias
        const filtered = suggestions.filter(k => k.keyword.toLowerCase().includes(city.toLowerCase()));

        const tagged = filtered.map(k => ({ ...k, source: 'suggestion' }));
        allKeywords.push(...tagged);
        stats.fromSuggestions = filtered.length;

        console.log(`   ✅ ${stats.fromSuggestions} keywords`);
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }

    // ========================================================================
    // FASE 4: IDEAS
    // ========================================================================
    console.log('\n📊 FASE 4: Ideas long-tail...\n');

    try {
        const ideasMain = await getKeywordIdeas(`${niche} ${city}`, locationCode);
        const filtered = ideasMain.filter(k => k.keyword.toLowerCase().includes(city.toLowerCase()));

        const tagged = filtered.map(k => ({ ...k, source: 'idea' }));
        allKeywords.push(...tagged);
        stats.fromIdeas = filtered.length;

        console.log(`   ✅ ${stats.fromIdeas} keywords`);
    } catch (error) {
        // La API de ideas a veces falla si no hay suficientes datos
        console.log(`   ⚠️ No se encontraron ideas long-tail (API restriction)`);
    }

    // ========================================================================
    // FASE 5: SERVICIOS ESPECÍFICOS (Híbrido: Frontend + Auto)
    // ========================================================================
    console.log('\n📊 FASE 5: Expandiendo servicios...\n');

    let servicesToExpand = config.specificServices || [];

    // Si no hay servicios del frontend, intentamos autodetectar
    if (servicesToExpand.length === 0) {
        console.log('   🧠 Auto-detectando servicios (fallback)...');
        servicesToExpand = await autoDetectServices(niche, city, locationCode);
    }

    if (servicesToExpand.length > 0) {
        console.log(`   🎯 Servicios a procesar: ${servicesToExpand.length}`);

        for (const service of servicesToExpand) {
            try {
                // 1. Simplificar query (ej: "Rejas de Seguridad..." -> "Rejas Seguridad")
                const simplifiedService = simplifyServiceQuery(service);

                console.log(`      🔍 "${service}" -> Query: "${simplifiedService}"...`);

                // 2. Búsqueda AMPLIA (sin ciudad) para capturar variedad
                // Usamos locationCode para que sea relevante al país/región
                const relatedService = await getRelatedKeywords(
                    simplifiedService,
                    locationCode
                );

                if (relatedService.length > 0) {
                    // Filtrar keywords que sean MUY genéricas si no contienen la ciudad
                    // Pero mantenemos las que sean buenas oportunidades
                    const tagged = relatedService.map(k => ({ ...k, source: 'service_expansion' }));
                    allKeywords.push(...tagged);
                    stats.fromServices += relatedService.length;
                    console.log(`         ✅ ${relatedService.length} keywords encontradas`);
                } else {
                    // Fallback: Intentar con ciudad si la genérica falló
                    const queryWithCity = `${simplifiedService} ${city}`;
                    console.log(`         ⚠️ Reintentando con ciudad: "${queryWithCity}"...`);
                    const relatedCity = await getRelatedKeywords(queryWithCity, locationCode);

                    if (relatedCity.length > 0) {
                        const tagged = relatedCity.map(k => ({ ...k, source: 'service_expansion' }));
                        allKeywords.push(...tagged);
                        stats.fromServices += relatedCity.length;
                        console.log(`         ✅ ${relatedCity.length} keywords (con ciudad)`);
                    } else {
                        console.log(`         ❌ Sin resultados`);
                    }
                }
            } catch (error) {
                console.log(`      ⚠️ Error en servicio "${service}"`);
            }
        }
        console.log(`   ✅ ${stats.fromServices} keywords de servicios`);
    } else {
        console.log('   ⚠️ No hay servicios para expandir');
    }

    stats.totalCollected = allKeywords.length;

    // ========================================================================
    // FASE 6: FILTRADO INTELIGENTE
    // ========================================================================
    console.log('\n🔬 FASE 6: Filtrado inteligente...\n');
    console.log(`   📊 Total recopilado: ${stats.totalCollected}`);

    // 1. Eliminar ruido universal
    allKeywords = allKeywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();
        return !NOISE_PATTERNS.some(pattern => kwLower.includes(pattern));
    });
    console.log(`   🗑️ Después de filtrar ruido: ${allKeywords.length}`);

    // 2. Calcular relevancia detallada
    console.log(`   🎯 Calculando relevancia...`);
    allKeywords = allKeywords.map(k => {
        // Pasamos los servicios específicos para dar bonus
        const { score, reasons } = calculateLocalScore(k, niche, city, config.specificServices);
        return { ...k, relevanceScore: score, relevanceReasons: reasons };
    });

    // 3. Filtrar por score y volumen
    // NOTA: Aquí somos más permisivos con las keywords de servicios
    // Si vienen de 'service_expansion', permitimos un score un poco más bajo si tienen buen volumen
    const validKeywords = allKeywords.filter(k => {
        const isService = k.source === 'service_expansion';
        const minScore = isService ? Math.max(1, config.minRelevanceScore - 2) : config.minRelevanceScore;

        return k.relevanceScore >= minScore && (k.volume || 0) >= config.minSearchVolume;
    });

    stats.afterFiltering = validKeywords.length;
    console.log(`   ✅ Keywords válidas: ${stats.afterFiltering}`);

    // ========================================================================
    // FASE 7: DEDUPLICACIÓN
    // ========================================================================
    console.log('\n🔄 FASE 7: Deduplicación...\n');

    const uniqueMap = new Map();
    validKeywords.forEach(k => {
        const text = k.keyword.toLowerCase().trim();
        const existing = uniqueMap.get(text);

        // Nos quedamos con la versión que tenga mejor score o más volumen
        if (!existing || k.relevanceScore > existing.relevanceScore) {
            uniqueMap.set(text, { ...k, keyword: text });
        }
    });

    // Ordenar por relevancia y luego volumen
    let finalKeywords = Array.from(uniqueMap.values())
        .sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            return (b.volume || 0) - (a.volume || 0);
        })
        .slice(0, config.maxKeywordsForAI); // Limitar para la IA

    console.log(`   ✅ Keywords únicas para clustering: ${finalKeywords.length}`);

    // ========================================================================
    // FASE 8: PEOPLE ALSO ASK
    // ========================================================================
    console.log('\n❓ FASE 8: People Also Ask...\n');

    let paaQuestions = [];
    try {
        paaQuestions = await getPeopleAlsoAsk(`${niche} ${city}`, locationCode);
        console.log(`   ✅ ${paaQuestions.length} preguntas encontradas`);
    } catch (error) {
        console.log(`   ⚠️ No se pudieron obtener preguntas PAA`);
    }

    // ========================================================================
    // FASE 9: CLUSTERING CON GEMINI (El paso final para la Web)
    // ========================================================================

    let clusters = [];

    if (!skipClustering) {
        console.log('\n🧠 FASE 9: Clustering con Gemini AI...\n');
        clusters = await runGeminiClustering(finalKeywords, niche, city);
    } else {
        console.log('\n⏸️ FASE 9: Clustering OMITIDO (skipClustering=true)....\n');
    }

    console.log('═'.repeat(70));
    console.log('✅ PROCESO COMPLETADO');
    console.log('═'.repeat(70));
    console.log(`📊 Estadísticas Finales:`);
    console.log(`   - Clusters generados: ${clusters.length}`);
    console.log(`   - Keywords totales usadas: ${finalKeywords.length}`);
    console.log('═'.repeat(70) + '\n');

    return {
        clusters: clusters,
        stats: stats,
        market_analysis: `Análisis de ${niche} en ${city}. ${finalKeywords.length} keywords relevantes encontradas.`,
        raw_data: {
            competitors: competitors, // Usamos la variable competitors del scope superior
            top_keywords: finalKeywords
        },
        paa_questions: paaQuestions
    };
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

async function autoDetectServices(niche, city, location) {
    try {
        const related = await getRelatedKeywords(niche, location, city);
        const servicePatterns = new Map();

        related.forEach(kw => {
            const words = kw.keyword.toLowerCase().split(' ');
            for (let i = 0; i < words.length - 1; i++) {
                if (words[i].length < 3) continue;
                const bigram = `${words[i]} ${words[i + 1]}`;
                if (!bigram.includes(city.toLowerCase())) {
                    servicePatterns.set(bigram, (servicePatterns.get(bigram) || 0) + 1);
                }
            }
        });

        return Array.from(servicePatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([service]) => service);
    } catch (error) {
        return [];
    }
}

export async function runGeminiClustering(keywords, niche, city) {
    if (keywords.length === 0) return [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
    ACTÚA COMO: Experto en SEO y Arquitectura Web.
    
    TAREA: Agrupar la siguiente lista de keywords en CLUSTERS SEMÁNTICOS para una web de "${niche}" en "${city}".
    
    LISTA DE KEYWORDS:
    ${keywords.map(k => `- ${k.keyword} (Vol: ${k.volume}, Score: ${k.relevanceScore})`).join('\n')}
    
    INSTRUCCIONES:
    1. Agrupa las keywords por INTENCIÓN DE SERVICIO (ej: "Rejas", "Puertas", "Barandillas").
    2. Ignora keywords que sean basura o no encajen en servicios comerciales.
    3. Crea entre 3 y 8 clusters principales.
    4. Asigna un nombre comercial atractivo a cada cluster.
    5. Genera METADATOS SEO optimizados para cada cluster (H1, Title, Description) enfocados en "${city}".
    
    FORMATO JSON:
    [
        {
            "name": "Nombre del Cluster (ej: Rejas de Seguridad)",
            "slug": "rejas-seguridad-barcelona",
            "intent": "COMMERCIAL",
            "meta_suggestions": {
                "h1": "Título H1 Optimizado (ej: Rejas de Seguridad a Medida en Barcelona)",
                "seo_title": "Título SEO (ej: Rejas de Seguridad Barcelona | Precios y Modelos)",
                "seo_description": "Meta descripción persuasiva incluyendo keywords principales y llamada a la acción."
            },
            "keywords": [
                { "keyword": "rejas barcelona", "volume": 100, "cpc": 1.5, "difficulty": 20 },
                ...
            ]
        }
    ]
    
    IMPORTANTE: Devuelve SOLO el JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const clusters = JSON.parse(text);

        // Enriquecer clusters con datos originales
        return clusters.map(c => ({
            ...c,
            keywords: c.keywords.map(k => {
                const original = keywords.find(ok => ok.keyword === k.keyword);
                return original || k;
            })
        }));
    } catch (error) {
        console.error("Error en Gemini Clustering:", error);
        // Fallback: un solo cluster con todo
        return [{
            name: `Servicios de ${niche}`,
            keywords: keywords
        }];
    }
}


function simplifyServiceQuery(serviceName) {
    // 1. Eliminar paréntesis y su contenido
    let clean = serviceName.replace(/\(.*\)/g, '');

    // 2. Lista de "Stop Words" en español para eliminar
    const stopWords = [' de ', ' para ', ' y ', ' en ', ' con ', ' a ', ' la ', ' el ', ' los ', ' las ', ' del ', ' por '];

    stopWords.forEach(word => {
        clean = clean.replace(new RegExp(word, 'gi'), ' ');
    });

    // 3. Limpiar espacios dobles y trim
    clean = clean.replace(/\s+/g, ' ').trim();

    // 4. Quedarse con las primeras 2-3 palabras significativas
    const words = clean.split(' ').filter(w => w.length > 2);

    if (words.length > 3) {
        return words.slice(0, 3).join(' ');
    }

    return clean;
}
