
import {
    getCompetitorKeywords,
    getRelatedKeywords,
    getKeywordSuggestions,
    getKeywordIdeas,
    getPeopleAlsoAsk,
    getLocationCode,
    filterByCity
} from '../lib/seo_client.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

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

    // Excluir ciudades que estén contenidas en la ciudad objetivo
    const citiesToExclude = SPANISH_CITIES.filter(c => !cityLower.includes(c));

    const otherCityMatch = citiesToExclude.find(c =>
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

    // Sanitizar ciudad para queries (evitar "Barcelona, Spain" -> usar solo "Barcelona")
    const simpleCity = city.includes(',') ? city.split(',')[0].trim() : city;

    // --- SISTEMA DE CHECKPOINTS (RESUME) ---
    const STATE_FILE = path.join(process.cwd(), '_data/keyword_research_state.json');
    let state = {
        niche,
        city,
        phases: {},
        allKeywords: [],
        stats: {
            fromCompetitors: 0,
            fromRelated: 0,
            fromSuggestions: 0,
            fromIdeas: 0,
            fromServices: 0,
            totalCollected: 0,
            afterFiltering: 0
        }
    };

    // --- MODO MANUAL (CSV) ---
    if (options.manualMode && options.csvPath) {
        console.log('\n📂 MODO MANUAL DETECTADO: Cargando CSV...');
        try {
            const csvKeywords = importKeywordsFromCSV(options.csvPath);
            if (csvKeywords.length > 0) {
                console.log(`   ✅ ${csvKeywords.length} keywords importadas del CSV.`);
                state.allKeywords.push(...csvKeywords);
                state.stats.fromManual = csvKeywords.length; // Ensure stats has this prop or add it dynamically

                // Si es modo puramente manual, marcamos las fases de API como completadas para saltarlas
                if (options.manualMode) {
                    console.log('   🛑 Saltando fases de API (Active DataforSEO bypassed)...');
                    state.phases.phase1 = true;
                    state.phases.phase2 = true;
                    state.phases.phase3 = true;
                    state.phases.phase4 = true;
                    state.phases.phase5 = true; // Ideas (if existed)
                    state.phases.phase6 = true;
                    state.phases.phase9 = true; // PAA usually skipped in manual too unless requested
                }
            }
        } catch (error) {
            console.error(`   ❌ Error importando CSV: ${error.message}`);
        }
    }

    // Intentar cargar estado previo
    try {
        if (fs.existsSync(STATE_FILE)) {
            const savedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            // Solo resumir si es el mismo nicho y ciudad
            if (savedState.niche === niche && savedState.city === city) {
                console.log('🔄 RESTAURANDO ESTADO PREVIO (RESUME MODE)...');
                state = savedState;
            }
        }
    } catch (e) {
        console.warn('⚠️ No se pudo leer el estado previo:', e.message);
    }

    // Alias para facilitar acceso
    let allKeywords = state.allKeywords;
    const stats = state.stats;

    const saveCheckpoint = (phaseName) => {
        state.phases[phaseName] = true;
        state.allKeywords = allKeywords;
        state.stats = stats;
        try {
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            console.log(`💾 Checkpoint guardado: ${phaseName}`);
        } catch (e) {
            console.error('❌ Error guardando checkpoint:', e.message);
        }
    };
    // ---------------------------------------

    console.log('\n' + '═'.repeat(70));
    console.log(`🚀 SEO LOCAL: ${niche.toUpperCase()} en ${city.toUpperCase()}`);
    console.log('═'.repeat(70));
    // ... rest of log ...
    console.log(`📍 Location: ${locationCode}`);
    console.log(`🎯 Min Relevance Score: ${config.minRelevanceScore}`);
    console.log(`📋 Servicios Específicos: ${config.specificServices?.length || 0}`);
    console.log('═'.repeat(70) + '\n');

    // ========================================================================
    // FASE 1: COMPETIDORES
    // ========================================================================
    if (!state.phases.phase1) {
        console.log('📊 FASE 1: Analizando competidores (Limitado a Top 3 para ahorro API)...\n');

        // 🔥 OPTIMIZACIÓN: Solo analizados los 3 primeros competidores
        const topCompetitors = competitors.slice(0, 3);

        for (const domain of topCompetitors) {
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
        saveCheckpoint('phase1');
    } else {
        console.log('⏩ FASE 1: COMPETIDORES (Saltado - Ya completado)');
    }

    // ========================================================================
    // FASE 2: KEYWORDS RELACIONADAS
    // ========================================================================
    if (!state.phases.phase2) {
        console.log('\n📊 FASE 2: Keywords relacionadas...\n');

        try {
            const relatedMain = await getRelatedKeywords(`${niche} ${simpleCity}`, locationCode, simpleCity);
            const relatedNiche = await getRelatedKeywords(niche, locationCode, simpleCity);

            const taggedMain = relatedMain.map(k => ({ ...k, source: 'related_main' }));
            const taggedNiche = relatedNiche.map(k => ({ ...k, source: 'related_niche' }));

            allKeywords.push(...taggedMain, ...taggedNiche);
            stats.fromRelated = relatedMain.length + relatedNiche.length;

            console.log(`   ✅ ${stats.fromRelated} keywords`);
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
        saveCheckpoint('phase2');
    } else {
        console.log('⏩ FASE 2: RELACIONADAS (Saltado - Ya completado)');
    }

    // ========================================================================
    // FASE 3: SEMILLAS CREATIVAS (GEMINI + DATA FOR SEO) - NUEVO 🚀
    // ========================================================================
    if (!state.phases.phase3) {
        console.log('\n📊 FASE 3: Semillas Creativas (Estrategia Maestro)...');

        try {
            // 1. Generar semillas con Gemini
            const creativeSeeds = await generateCreativeSeedsWithGemini(niche);
            console.log(`   🧠 Gemini generó ${creativeSeeds.length} semillas creativas.`);

            // 2. Seleccionar las mejores (top 5 para no saturar API)
            // Priorizamos problemas y preguntas que suelen tener menos competencia
            const seedsToProcess = creativeSeeds.slice(0, 5);
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
        saveCheckpoint('phase3');
    } else {
        console.log('⏩ FASE 3: SEMILLAS CREATIVAS (Saltado - Ya completado)');
    }

    // ========================================================================
    // FASE 4: SUGERENCIAS
    // ========================================================================
    if (!state.phases.phase4) {
        console.log('\n📊 FASE 4: Sugerencias...\n');

        try {
            const suggestions = await getKeywordSuggestions(`${niche} ${simpleCity}`, locationCode);
            // Filtrado básico por ciudad para sugerencias (Safe Guard)
            const filtered = suggestions.filter(k =>
                k.keyword &&
                typeof k.keyword === 'string' &&
                k.keyword.toLowerCase().includes(simpleCity.toLowerCase())
            );

            const tagged = filtered.map(k => ({ ...k, source: 'suggestion' }));
            allKeywords.push(...tagged);
            stats.fromSuggestions += filtered.length;

            console.log(`   ✅ ${stats.fromSuggestions} keywords`);
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
        saveCheckpoint('phase4');
    } else {
        console.log('⏩ FASE 4: SUGERENCIAS (Saltado - Ya completado)');
    }

    // ========================================================================
    // FASE 5: IDEAS
    // ========================================================================
    // ...

    // ========================================================================
    // FASE 6: SERVICIOS ESPECÍFICOS (Híbrido: Frontend + Auto)
    // ========================================================================
    if (!state.phases.phase6) {
        console.log('\n📊 FASE 6: Expandiendo servicios...\n');

        let servicesToExpand = config.specificServices || [];

        // Si no hay servicios del frontend, intentamos autodetectar
        if (servicesToExpand.length === 0) {
            console.log('   🧠 Auto-detectando servicios (fallback)...');
            servicesToExpand = await autoDetectServices(niche, city, locationCode);
        }

        if (servicesToExpand.length > 0) {
            // 🔥 OPTIMIZACIÓN: Limitamos a los 6 servicios más relevantes para controlar costes
            const limitedServices = servicesToExpand.slice(0, 6);
            console.log(`   🎯 Servicios a procesar: ${limitedServices.length} (de ${servicesToExpand.length} detectados)`);

            for (const service of limitedServices) {
                // 🛑 RATE LIMIT CUSTOM: Esperar 5s entre llamadas para evitar 429
                await new Promise(resolve => setTimeout(resolve, 5000));

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
                        const queryWithCity = `${simplifiedService} ${simpleCity}`;
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
        } else {
            console.log('⏩ FASE 6: SERVICIOS ESPECÍFICOS (Saltado - Ya completado)');
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

        // 1.5 Filtrar ciudades irrelevantes (Estricto)
        const countBeforeCityFilter = allKeywords.length;
        allKeywords = filterByCity(allKeywords, city);
        console.log(`   🏙️ Filtradas por ciudad incorrecta: ${countBeforeCityFilter - allKeywords.length}`);

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

        let services = [];
        let blog = [];

        if (!skipClustering) {
            console.log('\n🧠 FASE 10: Clustering con Gemini AI...\n');
            const result = await runGeminiClustering(finalKeywords, niche, city);
            services = result.services || [];
            blog = result.blog || [];
        } else {
            console.log('\n⏸️ FASE 10: Clustering OMITIDO (skipClustering=true)....\n');
        }

        console.log('═'.repeat(70));
        console.log('✅ PROCESO COMPLETADO');
        console.log('═'.repeat(70));
        console.log(`📊 Estadísticas Finales:`);
        console.log(`   - Servicios generados: ${services.length}`);
        console.log(`   - Artículos Blog generados: ${blog.length}`);
        console.log(`   - Keywords totales usadas: ${finalKeywords.length}`);
        console.log('═'.repeat(70) + '\n');

        // ========================================================================
        // FASE 11: ESTRUCTURA HOME (Añadido para el Frontend)
        // ========================================================================

        let homeStructure = {
            h1: `${niche} en ${city}`,
            h2s: ["Nuestros Servicios", "Por qué elegirnos", "Opiniones de Clientes", "Preguntas Frecuentes"]
        };

        if (services.length > 0) {
            // El servicio con más volumen suele ser el mejor candidato para la Home
            const mainService = [...services].sort((a, b) => {
                const volA = a.keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
                const volB = b.keywords.reduce((sum, k) => sum + (k.volume || 0), 0);
                return volB - volA;
            })[0];

            if (mainService && mainService.meta_suggestions && mainService.meta_suggestions[0]) {
                homeStructure.h1 = mainService.meta_suggestions[0].h1;
            }

            // Usar los nombres de otros servicios como H2s
            const serviceH2s = services
                .filter(c => c.name !== mainService?.name)
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
            services: services, // ✅ SEPARADO
            blog: blog,         // ✅ SEPARADO
            home_structure: homeStructure,
            stats: stats,
            market_analysis: `Análisis de ${niche} en ${city}. ${finalKeywords.length} keywords relevantes encontradas.`,
            raw_data: {
                competitors: competitors, // Usamos la variable competitors del scope superior
                top_keywords: finalKeywords
            },
            paa_questions: paaQuestions
        };
    }
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


// ============================================================================
// DEEP RESEARCH WIZARD (Wizard Mode Integration)
// ============================================================================

export async function generateDeepResearch(niche, city) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log(`\n🧙 GENERATING DEEP RESEARCH for: ${niche} in ${city}...\n`);

    const context = {
        niche,
        city,
        mainKeywords: [],
        longTail: [],
        nlpPhrases: [],
        faqs: [],
        semanticTerms: []
    };

    // Helper for Gemini calls
    const askGemini = async (prompt) => {
        const res = await model.generateContent(prompt);
        return res.response.text();
    };

    const cleanList = (text) => {
        return text
            .split(/,|\n/)
            .map(s => s.trim())
            .map(s => s.replace(/^[-\*\d\.]+\s*/, '')) // Remove bullets/numbers
            .map(s => s.replace(/```csv|```/g, '')) // Remove markdown
            .map(s => s.replace(/["']/g, '')) // Remove quotes
            .filter(s => s.length > 2);
    };

    try {
        // STEP 1: Main Keywords
        console.log("   🔹 Step 1: Main Keywords...");
        const res1 = await askGemini(`Actúa como experto SEO Local. Lista 10 keywords transaccionales principales para "${niche}" en "${city}". Usuarios con intención de compra. Formato: Solo lista csv, sin markdown, sin numeros.`);
        context.mainKeywords = cleanList(res1);

        // STEP 2: Long Tail
        console.log("   🔹 Step 2: Long Tail...");
        const res2 = await askGemini(`Experto SEO para "${niche}" en "${city}". Basado en [${context.mainKeywords.slice(0, 5).join(', ')}], dame 10 keywords long-tail muy específicas (urgencias, precios, detalles). Formato: Solo lista csv, sin markdown.`);
        context.longTail = cleanList(res2);

        // STEP 3: NLP / User Voice
        console.log("   🔹 Step 3: NLP & User Voice...");
        const res3 = await askGemini(`Identifica 10 frases naturales que usaría una persona real para buscar "${niche}" en "${city}". Focus: Lenguaje coloquial, problemas ("se me rompió...", "necesito..."). Formato: Solo lista csv, sin markdown.`);
        context.nlpPhrases = cleanList(res3);

        // STEP 4: FAQs (Real Questions)
        console.log("   🔹 Step 4: FAQs...");
        const res4 = await askGemini(`Experto atención cliente "${niche}". Lista 8 preguntas frecuentes REALES antes de contratar en "${city}". (Precio, garantía, horarios...). Formato: Lista separada por pipe (|).`);
        context.faqs = res4.split('|').map(q => q.trim().replace(/```/g, '')).filter(q => q.length > 5);

        // STEP 5: Semantic Entities
        console.log("   🔹 Step 5: Semantics...");
        const res5 = await askGemini(`10 términos semánticamente relacionados con "${niche}" que demuestren autoridad (herramientas, materiales, técnica). Formato: Solo lista csv, sin markdown.`);
        context.semanticTerms = cleanList(res5);

        console.log("\n✅ DEEP RESEARCH COMPLETED.");

        return {
            success: true,
            data: context
        };

    } catch (error) {
        console.error("❌ Error in Deep Research:", error);
        return { success: false, error: error.message };
    }
}

export async function runGeminiClustering(keywords, niche, city, richContext = null) {
    // Si no hay keywords pero sí richContext, usamos las keywords del context
    let processedKeywords = [...keywords];

    // Si tenemos Deep Research, inyectamos sus keywords en el pool principal para que DataForSEO/Clustering las use
    if (richContext && richContext.data) {
        // Helpers
        const addKws = (list, source) => {
            list.forEach(kw => {
                if (!processedKeywords.find(k => k.keyword === kw)) {
                    processedKeywords.push({ keyword: kw, volume: 0, source });
                }
            });
        };
        addKws(richContext.data.mainKeywords, 'wizard_main');
        addKws(richContext.data.longTail, 'wizard_longtail');
        addKws(richContext.data.nlpPhrases, 'wizard_nlp');
    }

    if (processedKeywords.length === 0) return { services: [], blog_topics: [] };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Upgraded to faster model

    // Preparamos el contexto rico para el prompt
    let extraAndFaqs = "";
    if (richContext && richContext.data) {
        extraAndFaqs = `
        \n🔍 INFORMACIÓN DE CONTEXTO (DEEP RESEARCH):
        - FAQs REALES DEL USUARIO: ${JSON.stringify(richContext.data.faqs)}
        - LENGUAJE NATURAL (NLP): ${JSON.stringify(richContext.data.nlpPhrases)}
        
        INSTRUCCIÓN ADICIONAL:
        1. Asigna las FAQs más relevantes a cada Cluster de Servicio en el campo "faqs".
        2. Usa las frases NLP para enriquecer la descripción o sugerir "user_intent_keywords".
        `;
    }

    const prompt = `
    ACTÚA COMO: Experto en SEO Técnico y Estratega de Contenidos.
    
    CONTEXTO:
    Estamos creando la estructura de una web local para el nicho "${niche}" en la ciudad de "${city}".
    ${extraAndFaqs}

    OBJETIVO:
    Clasificar la lista de keywords en dos grupos:
    1. **SERVICIOS (Comercial)**: Páginas de venta para contratar el servicio.
    2. **BLOG (Informacional)**: Artículos educativos para resolver dudas (Top of Funnel).

    LISTA DE KEYWORDS (Muestra):
    ${processedKeywords.slice(0, 150).map(k => `- KW: "${k.keyword}" | Vol: ${k.volume}`).join('\n')}
    
    INSTRUCCIONES DE AGRUPACIÓN:
    
    A) PARA "SERVICIOS" (Intención Transaccional):
       - Agrupa keywords de contratación.
       - Atomiza por tipo de trabajo.
       - METADATA: H1, Title, Description.
       - **FAQs**: Si tienes contexto de FAQs, incluye 3-5 preguntas relevantes para este servicio.

    B) PARA "BLOG" (Intención Informacional):
       - Preguntas educativas, problemas, how-to.
       - Contenido evergreen.

    FORMATO DE SALIDA (JSON ESTRICTO):
    IMPORTANTE: "services" debe ser un ARRAY. "blog" debe ser un ARRAY.
    IMPORTANTE: Asegura que "meta_suggestions" NO esté vacío. Rellena siempre H1, SEO Title y SEO Description.
    IMPORTANTE: Incluye siempre "faqs" en los servicios si están disponibles en el contexto.

    {
        "services": [
            {
                "name": "Nombre Servicio",
                "slug": "servicio-ciudad",
                "intent": "COMMERCIAL",
                "faqs": ["¿Pregunta 1?", "¿Pregunta 2?"],
                "meta_suggestions": [{ 
                    "h1": "Título H1 Optimizado", 
                    "seo_title": "Título SEO (Max 60ch)",
                    "seo_description": "Descripción persuasiva (Max 155ch)" 
                }],
                "keywords": ["kw1", "kw2"]
            }
        ],
        "blog": [
            {
                "name": "Título Artículo",
                "slug": "titulo-articulo",
                "intent": "INFORMATIONAL",
                "meta_suggestions": [{ 
                    "h1": "Título H1 Artículo",
                    "seo_title": "Título SEO para Blog", 
                    "seo_description": "Resumen del artículo..." 
                }],
                "keywords": ["kw1", "kw2"]
            }
        ]
    }
    `;

    let text = "";
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();

        // Limpieza robusta de JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        let json;
        if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            try {
                json = JSON.parse(jsonStr);
            } catch (e) {
                // Fallback simple: a veces Gemini devuelve trailing commas
                const cleaned = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
                json = JSON.parse(cleaned);
            }
        } else {
            // Fallback a limpieza simple si no hay match de llaves
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            json = JSON.parse(cleanText);
        }

        // Función helper para enriquecer clusters
        const enrich = (list) => list.map(c => ({
            ...c,
            keywords: c.keywords.map(k => {
                // Buscamos la keyword original completa o creamos un objeto parcial
                const original = keywords.find(ok => ok.keyword === k); // k puede ser string en la respuesta de Gemini a veces
                return original || { keyword: k, volume: 0, relevanceScore: 0 };
            })
        }));

        const enrichedServices = enrich(json.services || []);
        // Check for 'blog' or 'blog_topics' key to be safe with user response variability
        const blogData = json.blog || json.blog_topics || [];
        const enrichedBlog = enrich(blogData);

        // Devolvemos OBJETO SEPARADO en lugar de array plano
        const finalResult = {
            services: enrichedServices.map(c => ({ ...c, type: 'SERVICE' })),
            blog: enrichedBlog.map(c => ({ ...c, type: 'BLOG' }))
        };

        if (finalResult.services) {
            finalResult.services = finalResult.services.map(s => {
                // FALLBACK: Inject FAQs from Rich Context if AI missed them
                if ((!s.faqs || s.faqs.length === 0) && richContext && richContext.data && richContext.data.faqs) {
                    s.faqs = richContext.data.faqs.slice(0, 5); // Take top 5
                }

                // FALLBACK: Generate Meta if specific sub-keywords suggestions are missing
                if (!s.meta_suggestions || s.meta_suggestions.length === 0) {
                    const cleanName = s.name.replace(/Servicios de /i, '');
                    s.meta_suggestions = [{
                        h1: s.name,
                        seo_title: `${cleanName} en ${city} | Expertos y Garantía`,
                        seo_description: `¿Buscas ${cleanName} en ${city}? Servicio profesional, rápido y al mejor precio. ¡Pide tu presupuesto sin compromiso hoy!`
                    }];
                }

                return s;
            });
        }

        return finalResult;
    } catch (error) {
        console.error("❌ Error parsing Gemini response:", error);
        console.log("Response was:", text);
        // Fallback robusto devolviendo estructura vacía pero válida
        return {
            services: [{
                name: `Servicios de ${niche}`,
                slug: "servicios-generales",
                intent: "COMMERCIAL",
                keywords: keywords.map(k => k.keyword),
                faqs: richContext?.data?.faqs || [], // Fallback here too
                meta_suggestions: [{
                    h1: `Empresa de ${niche} en ${city}`,
                    seo_title: `${niche} en ${city} - Servicio Profesional`,
                    seo_description: `Expertos en ${niche} en ${city}. Contáctanos.`
                }]
            }],
            blog: []
        };
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
export function importKeywordsFromCSV(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo CSV no existe: ${filePath}`);
    }

    let fileContent = fs.readFileSync(filePath, 'utf8');

    // 1. Eliminar BOM
    fileContent = fileContent.replace(/^\uFEFF/, '');

    // 2. Detectar delimitador (force comma approach if looks like standard csv)
    const firstLine = fileContent.split('\n')[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    let delimiter = ',';
    // Si hay muchos más ; que , usamos ;
    if (semicolonCount > commaCount && semicolonCount > 2) delimiter = ';';

    console.log(`   🔍 CSV Debug: Detected Delimiter: "${delimiter}"`);

    // Parseo síncrono
    const records = parse(fileContent, {
        columns: false, // Usamos false para tener control total sobre índices vs headers
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_column_count: true,
        relax_quotes: true,
        quote: '"'
    });

    console.log(`   🔍 Rows Parsed: ${records.length}`);
    if (records.length === 0) return [];

    // 4. Detectar Header real
    const firstRow = records[0];
    const firstCol = String(firstRow[0]).trim().toLowerCase();

    let hasHeader = false;
    // La primera columna se llama "Keyword" según lo que vimos en el archivo
    if (firstCol.includes('keyword') || firstCol.includes('word') || firstCol.includes('palabra')) {
        hasHeader = true;
        console.log('   🔍 Header Detected: YES');
    }

    const keywords = records.map((row, index) => {
        // Skip header row
        if (hasHeader && index === 0) return null;

        let term = '';
        let vol = 0;
        let cpc = 0;
        let kd = 0; // Keyword Difficulty

        if (hasHeader) {
            // Mapping Dinámico basado en los headers reales que vimos:
            // 0: Keyword
            // 1: Avg. Search Volume...
            // 6: CPC/USD
            // 8: Keyword Difficulty  <-- IMPORTANTE

            // Re-escaneamos los headers de la fila 0 por seguridad
            if (index > 0) { // Solo necesitamos hacer esto una vez, pero aquí lo hacemos implícito
                // Usamos índices fijos basados en la inspección visual CONFIRMADA
                // "Keyword" -> 0
                // "Volume" -> 1 (AvgSearchVolume)
                // "CPC" -> 6
                // "Difficulty" -> 8 (Keyword Difficulty)

                term = row[0];
                vol = row[1];
                cpc = row[6];
                kd = row[8];
            }
        } else {
            // Fallback posicional si por alguna razón falla el header check
            term = row[0];
            vol = row[1];
            cpc = row[6];
            kd = row[8];
        }

        // Limpieza y Conversión
        if (!term || typeof term !== 'string' || term.length < 2) return null;
        term = term.replace(/^["']|["']$/g, '').trim();

        // Numeros
        if (typeof vol === 'string') vol = parseInt(vol.replace(/[^0-9]/g, ''), 10);
        if (typeof cpc === 'string') cpc = parseFloat(cpc.replace(',', '.').replace(/[^0-9.]/g, ''));
        if (typeof kd === 'string') kd = parseInt(kd.replace(/[^0-9]/g, ''), 10);

        return {
            keyword: term,
            volume: isNaN(vol) ? 0 : vol,
            cpc: isNaN(cpc) ? 0 : cpc,
            competition: isNaN(kd) ? 0 : kd,
            source: 'manual_csv',
            location_code: 'csv_import'
        };
    }).filter(k => k !== null);

    return keywords;
}
