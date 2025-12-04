
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
    minSearchVolume: 0,           // ✅ BAJAMOS A 0: En local, el volumen bajo es normal y valioso
    maxKeywordsForAI: 1000,       // ✅ SUBIMOS A 1000: Prácticamente sin límite para local
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
    // FASE 3: SEMILLAS CREATIVAS (GEMINI + DATA FOR SEO) - NUEVO 🚀
    // ========================================================================
    console.log('\n📊 FASE 3: Semillas Creativas (Estrategia Maestro)...');

    try {
        // 1. Generar semillas con Gemini
        const creativeSeeds = await generateCreativeSeedsWithGemini(niche);
        console.log(`   🧠 Gemini generó ${creativeSeeds.length} semillas creativas.`);

        // 2. Seleccionar las mejores (top 5-10 para no saturar API)
        // Priorizamos problemas y preguntas que suelen tener menos competencia
        const seedsToProcess = creativeSeeds.slice(0, 8);
        console.log(`   🎯 Procesando ${seedsToProcess.length} semillas en DataForSEO...`);

        for (const seed of seedsToProcess) {
            try {
                // NO añadimos la ciudad para que la búsqueda de relacionadas sea más amplia
                // La API ya filtra por país (Spain) con locationCode
                const query = seed;
                const related = await getRelatedKeywords(query, locationCode);

                if (related.length > 0) {
                    const tagged = related.map(k => ({ ...k, source: 'creative_seed' }));
                    allKeywords.push(...tagged);
                    stats.fromSuggestions += related.length; // Sumamos a suggestions
                    console.log(`      ✅ "${seed}": ${related.length} keywords`);
                }
            } catch (err) {
                // Ignorar error individual
            }
        }
    } catch (error) {
        console.error(`   ❌ Error en Fase Creativa: ${error.message}`);
    }

    // ========================================================================
    // FASE 4: SUGERENCIAS
    // ========================================================================
    console.log('\n📊 FASE 4: Sugerencias...\n');

    try {
        const suggestions = await getKeywordSuggestions(`${niche} ${city}`, locationCode);
        // Filtrado básico por ciudad para sugerencias
        const filtered = suggestions.filter(k => k.keyword.toLowerCase().includes(city.toLowerCase()));

        const tagged = filtered.map(k => ({ ...k, source: 'suggestion' }));
        allKeywords.push(...tagged);
        stats.fromSuggestions += filtered.length;

        console.log(`   ✅ ${stats.fromSuggestions} keywords`);
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }

    // ========================================================================
    // FASE 5: IDEAS (DESACTIVADA POR ERROR API Y REDUNDANCIA)
    // ========================================================================
    /*
    console.log('\n📊 FASE 5: Ideas long-tail...\n');

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
    */

    // ========================================================================
    // FASE 6: SERVICIOS ESPECÍFICOS (Híbrido: Frontend + Auto)
    // ========================================================================
    console.log('\n📊 FASE 6: Expandiendo servicios...\n');

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
                let relatedService = await getRelatedKeywords(
                    simplifiedService,
                    locationCode
                );

                // FALLBACK INTELIGENTE: Si falla con 3 palabras, probamos con 2
                if (relatedService.length === 0 && simplifiedService.split(' ').length > 2) {
                    const shorterQuery = simplifiedService.split(' ').slice(0, 2).join(' ');
                    console.log(`         ⚠️ Sin resultados. Reintentando más corto: "${shorterQuery}"...`);
                    relatedService = await getRelatedKeywords(shorterQuery, locationCode);
                }

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
    // FASE 7: FILTRADO INTELIGENTE
    // ========================================================================
    console.log('\n🔬 FASE 7: Filtrado inteligente...\n');
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
    // FASE 8: DEDUPLICACIÓN
    // ========================================================================
    console.log('\n🔄 FASE 8: Deduplicación...\n');

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
    // FASE 9: PEOPLE ALSO ASK
    // ========================================================================
    console.log('\n❓ FASE 9: People Also Ask...\n');

    let paaQuestions = [];
    try {
        paaQuestions = await getPeopleAlsoAsk(`${niche} ${city}`, locationCode);
        console.log(`   ✅ ${paaQuestions.length} preguntas encontradas`);
    } catch (error) {
        console.log(`   ⚠️ No se pudieron obtener preguntas PAA`);
    }

    // ========================================================================
    // FASE 10: CLUSTERING CON GEMINI (El paso final para la Web)
    // ========================================================================

    let clusters = [];

    if (!skipClustering) {
        console.log('\n🧠 FASE 10: Clustering con Gemini AI...\n');
        clusters = await runGeminiClustering(finalKeywords, niche, city);
    } else {
        console.log('\n⏸️ FASE 10: Clustering OMITIDO (skipClustering=true)....\n');
    }

    console.log('═'.repeat(70));
    console.log('✅ PROCESO COMPLETADO');
    console.log('═'.repeat(70));
    console.log(`📊 Estadísticas Finales:`);
    console.log(`   - Clusters generados: ${clusters.length}`);
    console.log(`   - Keywords totales usadas: ${finalKeywords.length}`);
    console.log('═'.repeat(70) + '\n');

    // ========================================================================
    // FASE 11: ESTRUCTURA HOME (Añadido para el Frontend)
    // ========================================================================

    let homeStructure = {
        h1: `${niche} en ${city}`,
        h2s: ["Nuestros Servicios", "Por qué elegirnos", "Opiniones de Clientes", "Preguntas Frecuentes"]
    };

    if (clusters.length > 0) {
        // El cluster con más volumen suele ser el mejor candidato para la Home
        const mainCluster = [...clusters].sort((a, b) => {
            const volA = a.keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
            const volB = b.keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
            return volB - volA;
        })[0];

        if (mainCluster && mainCluster.meta_suggestions && mainCluster.meta_suggestions[0]) {
            homeStructure.h1 = mainCluster.meta_suggestions[0].h1;
        }

        // Usar los nombres de los otros clusters como H2s de servicios
        const serviceH2s = clusters
            .filter(c => c.name !== mainCluster?.name)
            .slice(0, 4)
            .map(c => c.name);

        if (serviceH2s.length > 0) {
            homeStructure.h2s = [
                ...serviceH2s,
                "Sobre Nosotros",
                "Opiniones",
                "Contacto"
            ];
        }
    }

    return {
        niche: niche,
        city: city,
        clusters: clusters,
        home_structure: homeStructure, // ✅ AÑADIDO
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

async function generateCreativeSeedsWithGemini(niche) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
    Actúa como un Especialista SEO Senior y Estratega de Contenidos.

    Estoy realizando una investigación de palabras clave (Keyword Research) para un cliente/negocio que ofrece el siguiente servicio: "${niche}".

    Necesito que generes una lista de 30 ideas de "Palabras Clave Semilla" (Seed Keywords) y variaciones temáticas para introducir en mi herramienta SEO y descubrir Longtails.

    No inventes volúmenes de búsqueda. Céntrate en la intención de búsqueda.

    La lista debe estar dividida y categorizada de la siguiente manera para cubrir todo el embudo (funnel):

    1. **Servicios Específicos:** (Desglosa el servicio principal en sub-servicios técnicos o nichos).
    2. **Puntos de Dolor / Problemas:** (Qué busca el usuario cuando tiene el problema antes de saber la solución. Ej: "mancha humedad techo" en lugar de "impermeabilización").
    3. **Intención Transaccional/Comercial:** (Palabras que denotan compra inminente: precio, presupuesto, urgente, empresa de...).
    4. **Preguntas Informativas:** (Qué, cómo, cuánto, por qué... relacionadas con el servicio).
    5. **Público Objetivo / Escenarios:** (Servicio + para quién/dónde. Ej: para empresas, para comunidades, en altura, industrial...).

    IMPORTANTE:
    Devuelve SOLO una lista plana de keywords separadas por coma, sin títulos de categorías ni numeración. Solo las keywords.
    Ejemplo de salida:
    reparación de fugas, mancha en el techo, cuánto cuesta fontanero, fontanero urgente, fontanería para comunidades...
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Limpiar y convertir a array
        const seeds = text.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 3) // Filtrar basura corta
            .filter(s => !s.includes('**')) // Filtrar cabeceras si se colaron
            .slice(0, 30); // Limitar a 30

        return seeds;
    } catch (error) {
        console.error("Error generando semillas con Gemini:", error);
        return [];
    }
}

export async function runGeminiClustering(keywords, niche, city) {
    if (keywords.length === 0) return [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
    ACTÚA COMO: Experto en SEO Técnico y Arquitectura de Información.
    
    CONTEXTO:
    Estamos creando la estructura de una web local para el nicho "${niche}" en la ciudad de "${city}".
    
    OBJETIVO:
    Agrupar la lista de keywords proporcionada en CLUSTERS SEMÁNTICOS lógicos que se convertirán en URLs de servicio (Landing Pages).
    
    LISTA DE KEYWORDS (Datos brutos):
    ${keywords.map(k => `- KW: "${k.keyword}" | Vol: ${k.volume} | CPC: ${k.cpc || 0} | Diff: ${k.difficulty || 0}`).join('\n')}
    
    INSTRUCCIONES DE AGRUPACIÓN:
    1. **ATOMIZACIÓN:** Agrupa por INTENCIÓN DE SERVICIO muy específica (ej: "Alisado" separado de "Pintura"). No mezcles conceptos distintos en un mismo cluster.
    2. **PROBLEMAS:** Si hay keywords de problemas (ej: "Humedades", "Grietas", "Gotelé"), crea clusters dedicados a la solución de esos problemas.
    3. **HOME:** Agrupa las keywords genéricas (ej: "pintor barcelona", "precio pintor", "empresa de pintura") en un cluster llamado "HOME" o "General".
    4. **CANTIDAD:** Crea entre 5 y 12 clusters. Prefiere clusters pequeños y específicos.
    5. **SLUG:** Incluye la ciudad en el slug (estructura plana).
    
    FORMATO DE SALIDA (JSON ESTRICTO):
    Debes devolver UNICAMENTE un objeto JSON válido, sin bloques de código markdown (\`\`\`) ni texto introductorio.
    
    Estructura requerida:
    [
        {
            "name": "Nombre comercial del servicio (ej: Alisado de Paredes)",
            "slug": "alisado-paredes-barcelona",
            "intent": "COMMERCIAL",
            "meta_suggestions": [
                {
                    "h1": "H1 optimizado con keyword principal + ciudad",
                    "seo_title": "Title Tag atractivo (max 60 chars)",
                    "seo_description": "Meta description con CTR alto (max 155 chars)"
                }
            ],
            "keywords": [
                { "keyword": "alisar paredes precio", "volume": 200, "cpc": 0.5, "difficulty": 15 },
                ...
            ]
        }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const clusters = JSON.parse(text);

        // Enriquecer clusters con datos originales
        const enrichedClusters = clusters.map(c => ({
            ...c,
            keywords: c.keywords.map(k => {
                const original = keywords.find(ok => ok.keyword === k.keyword);
                return original || k;
            })
        }));

        // GUARDAR EN ARCHIVO PARA PERSISTENCIA
        const mdContent = `# Análisis de Clustering: ${niche} en ${city}
Fecha: ${new Date().toLocaleString()}
Modelo: gemini-2.5-pro

${enrichedClusters.map(c => `
## 📂 ${c.name} (${c.keywords.length} keywords)
**Slug:** \`${c.slug}\`
**Intención:** ${c.intent}
**H1 Sugerido:** ${c.meta_suggestions?.[0]?.h1 || 'N/A'}
**SEO Title:** ${c.meta_suggestions?.[0]?.seo_title || 'N/A'}

| Keyword | Vol | Score |
|---------|-----|-------|
${c.keywords.map(k => `| ${k.keyword} | ${k.volume} | ${k.relevanceScore} |`).join('\n')}
`).join('\n---\n')}
`;
        fs.writeFileSync('clustering_analysis.md', mdContent);
        console.log('   💾 Clusters guardados en clustering_analysis.md');

        return enrichedClusters;
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
