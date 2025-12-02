import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
const BASE_URL = 'https://api.dataforseo.com/v3';

// ============================================================================
// CONFIGURACIÓN DE UBICACIONES
// ============================================================================

// Cache de ciudades españolas principales para filtrado
const SPANISH_CITIES = [
    'madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'málaga', 'malaga',
    'murcia', 'palma', 'bilbao', 'alicante', 'córdoba', 'cordoba', 'valladolid',
    'vigo', 'gijón', 'gijon', 'hospitalet', 'vitoria', 'coruña', 'coruna',
    'granada', 'elche', 'oviedo', 'terrassa', 'badalona', 'cartagena', 'jerez',
    'sabadell', 'móstoles', 'mostoles', 'alcalá', 'alcala', 'pamplona', 'almería',
    'almeria', 'leganés', 'leganes', 'san sebastián', 'san sebastian', 'donostia',
    'santander', 'burgos', 'albacete', 'getafe', 'salamanca', 'huelva', 'logroño',
    'badajoz', 'tarragona', 'lleida', 'marbella', 'león', 'leon', 'cádiz', 'cadiz',
    'alcorcón', 'alcorcon', 'fuenlabrada', 'torrejón', 'torrejon', 'parla'
];

// Location codes de DataForSEO para ciudades españolas
const LOCATION_CODES = {
    // España general
    'spain': 2724,
    'españa': 2724,

    // Ciudades principales (códigos de DataForSEO)
    'madrid': 1005424,
    'barcelona': 1005492,
    'valencia': 1005540,
    'sevilla': 1005529,
    'zaragoza': 1005545,
    'málaga': 1005508,
    'malaga': 1005508,
    'bilbao': 1005495,
    'alicante': 1005486,
    'córdoba': 1005499,
    'cordoba': 1005499,
    'granada': 1005503,
    'murcia': 1005512,

    // Comunidades Autónomas
    'cataluña': 20311,
    'catalonia': 20311,
    'andalucía': 20306,
    'andalucia': 20306,
    'comunidad de madrid': 20315,
    'país vasco': 20310,
    'pais vasco': 20310,
    'galicia': 20313,
    'castilla y león': 20309,
    'comunidad valenciana': 20319
};

/**
 * Obtiene el location_code correcto para DataForSEO
 */
export function getLocationCode(location) {
    if (!location) return 2724; // Default: España

    // Si ya es un número, devolverlo
    if (typeof location === 'number') return location;
    if (!isNaN(location)) return parseInt(location);

    // Buscar en el mapa
    const normalized = location.toLowerCase().trim();
    return LOCATION_CODES[normalized] || 2724;
}

/**
 * Obtiene el nombre de ubicación para DataForSEO Labs
 * (Labs API requiere location_name, no location_code)
 */
export function getLocationName(location) {
    if (!location) return "Spain";

    const normalized = location.toLowerCase().trim();

    // Mapeo de nombres en español a nombres que acepta DataForSEO
    const nameMap = {
        'españa': 'Spain',
        'spain': 'Spain',
        'madrid': 'Madrid,Autonomous Community of Madrid,Spain',
        'barcelona': 'Barcelona,Catalonia,Spain',
        'valencia': 'Valencia,Valencian Community,Spain',
        'sevilla': 'Seville,Andalusia,Spain',
        'málaga': 'Malaga,Andalusia,Spain',
        'malaga': 'Malaga,Andalusia,Spain',
        'bilbao': 'Bilbao,Basque Country,Spain',
        'zaragoza': 'Zaragoza,Aragon,Spain',
        'cataluña': 'Catalonia,Spain',
        'andalucía': 'Andalusia,Spain'
    };

    return nameMap[normalized] || location;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function postDataForSEO(endpoint, data) {
    try {
        console.log(`📡 DataForSEO: ${endpoint}`);
        const response = await axios({
            method: 'post',
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Content-Type': 'application/json'
            },
            data: data
        });

        if (!response.data.tasks || response.data.tasks[0].status_code !== 20000) {
            console.warn("⚠️ API Error:", response.data.tasks?.[0]?.status_message);
            return null;
        }
        return response.data.tasks[0].result;
    } catch (error) {
        console.error("❌ Error DataForSEO:", error.message);
        return null;
    }
}

/**
 * Filtra keywords que contienen ciudades diferentes a la objetivo
 */
export function filterByCity(keywords, targetCity) {
    if (!targetCity) return keywords;

    const targetCityLower = targetCity.toLowerCase().trim();
    const otherCities = SPANISH_CITIES.filter(c => c !== targetCityLower);

    return keywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();

        // Verificar si contiene alguna ciudad diferente a la objetivo
        const hasOtherCity = otherCities.some(city => {
            // Evitar falsos positivos (ej: "león" dentro de "instalación")
            const regex = new RegExp(`\\b${city}\\b`, 'i');
            return regex.test(kwLower);
        });

        if (hasOtherCity) {
            console.log(`   🗑️ Filtrada (otra ciudad): "${k.keyword}"`);
            return false;
        }

        return true;
    });
}

/**
 * Calcula relevancia semántica con enfoque en SEO LOCAL
 */
export function calculateRelevance(keyword, niche, targetCity) {
    const kwLower = keyword.keyword.toLowerCase();
    const nicheTerms = niche.toLowerCase().split(' ').filter(t => t.length > 2);
    const cityLower = targetCity?.toLowerCase() || '';

    let score = 0;

    // 🎯 +10 puntos si contiene la ciudad objetivo (MÁXIMA PRIORIDAD LOCAL)
    if (cityLower && kwLower.includes(cityLower)) {
        score += 10;
    }

    // +5 por cada término del nicho presente
    nicheTerms.forEach(term => {
        if (kwLower.includes(term)) score += 5;
    });

    // +3 si tiene intención comercial
    const commercialPatterns = [
        'precio', 'presupuesto', 'coste', 'cuanto cuesta',
        'empresa', 'profesional', 'servicio', 'contratar',
        'cerca de mi', 'urgente', '24 horas'
    ];
    if (commercialPatterns.some(p => kwLower.includes(p))) {
        score += 3;
    }

    // +2 si viene de competidor (más confiable)
    if (keyword.source === 'competitor') score += 2;

    // +1 si tiene buen volumen
    if (keyword.volume > 500) score += 1;

    // -3 si es demasiado genérica (1 palabra corta)
    if (keyword.keyword.split(' ').length === 1 && keyword.keyword.length < 6) {
        score -= 3;
    }

    // -20 si contiene OTRA ciudad (penalización SEVERA para SEO local)
    if (cityLower) {
        const otherCities = SPANISH_CITIES.filter(c => c !== cityLower);
        if (otherCities.some(city => new RegExp(`\\b${city}\\b`, 'i').test(kwLower))) {
            score -= 20;
        }
    }

    // -2 si es claramente informativa (pero no eliminar, puede ser útil para blog)
    const infoPatterns = ['qué es', 'que es', 'cómo hacer', 'como hacer', 'tutorial', 'diy'];
    if (infoPatterns.some(p => kwLower.includes(p))) {
        score -= 2;
    }

    return score;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Buscar ubicaciones disponibles en DataForSEO
 */
export async function searchLocations(query) {
    console.log(`🔍 Buscando ubicación: "${query}"...`);
    try {
        const response = await axios({
            method: 'get',
            url: `${BASE_URL}/serp/google/locations`,
            headers: { 'Authorization': `Basic ${AUTH}` }
        });

        if (!response.data.tasks?.[0]?.result) return [];

        return response.data.tasks[0].result
            .filter(loc => loc.location_name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
            .map(loc => ({
                name: loc.location_name,
                code: loc.location_code,
                type: loc.location_type
            }));
    } catch (error) {
        console.error("❌ Error buscando ubicaciones:", error.message);
        return [];
    }
}

/**
 * Obtener TOP 10 competidores de Google SERP
 */
export async function getTopCompetitors(keyword, location) {
    const locationCode = getLocationCode(location);
    console.log(`🔍 SERP para: "${keyword}" (Location: ${locationCode})`);

    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        location_code: locationCode,
        language_code: "es",
        depth: 10
    }]);

    if (!results?.[0]?.items) {
        console.warn('⚠️ Sin resultados SERP');
        return [];
    }

    const organicResults = results[0].items
        .filter(item => item.type === 'organic')
        .slice(0, 10)
        .map((item, index) => ({
            position: index + 1,
            url: item.url,
            title: item.title,
            domain: item.domain,
            description: item.description
        }));

    console.log(`✅ ${organicResults.length} resultados orgánicos`);
    return organicResults;
}

/**
 * Obtener keywords de un competidor específico
 * IMPORTANTE: Labs API solo acepta países, no ciudades
 */
export async function getCompetitorKeywords(domain, location, targetCity, top10Only = true) {
    // Labs API SOLO acepta países ("Spain"), no ciudades
    const locationName = "Spain";

    console.log(`🎯 Keywords de: ${domain} (${locationName}) ${top10Only ? '[TOP 10]' : '[ALL]'}`);

    const filters = [
        ["keyword_data.keyword_info.search_volume", ">", 0]
    ];

    if (top10Only) {
        filters.push("and");
        filters.push([
            ["ranked_serp_element.serp_item.rank_absolute", "<=", 10],
            "and",
            ["ranked_serp_element.serp_item.type", "<>", "paid"]
        ]);
    }

    const result = await postDataForSEO('/dataforseo_labs/google/ranked_keywords/live', [{
        target: domain,
        location_name: locationName,
        language_name: "Spanish",
        limit: 100,
        filters
    }]);

    if (!result?.[0]?.items) return [];

    let keywords = result[0].items.map(k => {
        const kwData = k.keyword_data || {};
        const kwInfo = kwData.keyword_info || {};
        const rankInfo = k.ranked_serp_element?.serp_item || {};

        return {
            keyword: kwData.keyword || 'unknown',
            volume: kwInfo.search_volume || 0,
            cpc: kwInfo.cpc || 0,
            competition: kwInfo.competition || 0,
            competition_level: kwInfo.competition_level || 'UNKNOWN',
            difficulty: kwData.keyword_properties?.keyword_difficulty || 0,
            position: rankInfo.rank_absolute || null,
            url: rankInfo.url || null,
            etv: k.etv || 0,
            source: 'competitor'
        };
    });

    // 🔥 FILTRADO LOCAL MEJORADO
    if (targetCity) {
        const beforeCount = keywords.length;
        const cityLower = targetCity.toLowerCase();
        const nicheTerms = domain.split('.')[0].toLowerCase(); // Inferir nicho del dominio

        keywords = keywords.filter(k => {
            const kwLower = k.keyword.toLowerCase();

            // ✅ PRIORIDAD 1: Keywords que contienen la ciudad objetivo
            if (kwLower.includes(cityLower)) return true;

            // ✅ PRIORIDAD 2: Keywords muy relevantes al nicho (sin ciudad pero útiles)
            const hasNicheTerm = kwLower.includes(nicheTerms) ||
                kwLower.includes('quitar') ||
                kwLower.includes('alisar') ||
                kwLower.includes('pintor');

            // ❌ Rechazar si tiene otra ciudad
            const otherCities = SPANISH_CITIES.filter(c => c !== cityLower);
            const hasOtherCity = otherCities.some(city =>
                new RegExp(`\\b${city}\\b`, 'i').test(kwLower)
            );

            if (hasOtherCity) return false;

            // Permitir keywords relevantes sin ciudad si tienen buen volumen
            return hasNicheTerm && k.volume > 100;
        });

        console.log(`   📍 Filtrado local: ${beforeCount} → ${keywords.length} keywords`);
    }

    console.log(`✅ ${keywords.length} keywords extraídas de ${domain}`);
    return keywords;
}

/**
 * Obtener keywords relacionadas (seed expansion)
 * IMPORTANTE: Labs API solo acepta países
 */
export async function getRelatedKeywords(keyword, location, targetCity) {
    // Labs API SOLO acepta países
    const locationName = "Spain";
    console.log(`🌱 Keywords relacionadas: "${keyword}" (${locationName})`);

    const result = await postDataForSEO('/dataforseo_labs/google/related_keywords/live', [{
        keyword,
        location_name: locationName,
        language_name: "Spanish",
        limit: 100,
        filters: [
            ["keyword_data.keyword_info.search_volume", ">", 10],
            "and",
            ["keyword_data.keyword_info.search_volume", "<", 100000]
        ]
    }]);

    if (!result?.[0]?.items) return [];

    let keywords = result[0].items.map(k => {
        const kwData = k.keyword_data || k;
        const kwInfo = kwData.keyword_info || kwData;

        return {
            keyword: kwInfo.keyword || 'unknown',
            volume: kwInfo.search_volume || 0,
            cpc: kwInfo.cpc || 0,
            competition: kwInfo.competition || 0,
            competition_level: kwInfo.competition_level || 'UNKNOWN',
            difficulty: kwData.keyword_properties?.keyword_difficulty || 0,
            source: 'related'
        };
    });

    // 🔥 NUEVO: Filtrar por ciudad
    if (targetCity) {
        const beforeCount = keywords.length;
        keywords = filterByCity(keywords, targetCity);
        console.log(`   📍 Filtrado ciudad: ${beforeCount} → ${keywords.length} keywords`);
    }

    console.log(`✅ ${keywords.length} keywords relacionadas`);
    return keywords;
}

/**
 * Obtener keywords de sugerencia (autocomplete)
 */
export async function getKeywordSuggestions(keyword, location) {
    const locationCode = getLocationCode(location);
    console.log(`💡 Sugerencias para: "${keyword}"`);

    const result = await postDataForSEO('/dataforseo_labs/google/keyword_suggestions/live', [{
        keyword,
        location_code: locationCode,
        language_code: "es",
        limit: 50
    }]);

    if (!result?.[0]?.items) return [];

    return result[0].items.map(k => ({
        keyword: k.keyword,
        volume: k.keyword_info?.search_volume || 0,
        cpc: k.keyword_info?.cpc || 0,
        competition: k.keyword_info?.competition || 0,
        source: 'suggestion'
    }));
}

/**
 * Obtener preguntas "People Also Ask"
 */
export async function getPeopleAlsoAsk(keyword, location) {
    const locationCode = getLocationCode(location);
    console.log(`❓ PAA para: "${keyword}"`);

    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        location_code: locationCode,
        language_code: "es",
        depth: 10
    }]);

    if (!results?.[0]?.items) return [];

    const paaItem = results[0].items.find(item => item.type === 'people_also_ask');

    if (paaItem?.items) {
        const questions = paaItem.items.map(q => ({
            question: q.title,
            answer: q.description || null
        }));
        console.log(`✅ ${questions.length} preguntas PAA`);
        return questions;
    }

    return [];
}

/**
 * Obtener volumen de búsqueda para lista de keywords
 */
export async function getSearchVolume(keywords, location) {
    const locationCode = getLocationCode(location);
    console.log(`📊 Volumen para ${keywords.length} keywords`);

    // DataForSEO acepta hasta 1000 keywords por request
    const result = await postDataForSEO('/dataforseo_labs/google/bulk_keyword_difficulty/live', [{
        keywords: keywords.slice(0, 1000),
        location_code: locationCode,
        language_code: "es"
    }]);

    if (!result?.[0]?.items) return {};

    const volumeMap = {};
    result[0].items.forEach(k => {
        volumeMap[k.keyword.toLowerCase()] = {
            volume: k.search_volume || 0,
            difficulty: k.keyword_difficulty || 0,
            cpc: k.cpc || 0
        };
    });

    return volumeMap;
}

// Named exports for constants
export { SPANISH_CITIES, LOCATION_CODES };

export default {
    searchLocations,
    getTopCompetitors,
    getCompetitorKeywords,
    getRelatedKeywords,
    getKeywordSuggestions,
    getPeopleAlsoAsk,
    getSearchVolume,
    getLocationCode,
    getLocationName,
    filterByCity,
    calculateRelevance,
    SPANISH_CITIES,
    LOCATION_CODES
};
