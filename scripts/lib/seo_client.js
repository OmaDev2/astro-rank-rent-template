import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
const BASE_URL = 'https://api.dataforseo.com/v3';

// Función mágica que decide si usar "location_code" o "location_name"
function getLocationParams(loc) {
    if (!loc) return { location_code: 2724 }; // Default España

    // Si es un número (ej: 1005424), es un código
    if (typeof loc === 'number' || !isNaN(loc)) {
        return { location_code: parseInt(loc) };
    }
    // Si es texto, es un nombre
    return { location_name: loc };
}

// NUEVA FUNCIÓN: Buscar ubicación exacta (Autocompletar)
export async function searchLocations(query) {
    console.log(`📡 DataForSEO: Buscando ubicación "${query}"...`);
    try {
        const response = await axios({
            method: 'get',
            url: `${BASE_URL}/serp/google/locations`,
            headers: { 'Authorization': `Basic ${AUTH}`, 'Content-Type': 'application/json' }
        });

        if (!response.data.tasks || !response.data.tasks[0].result) return [];

        const allLocations = response.data.tasks[0].result;

        // Filtramos en memoria por el query del usuario
        return allLocations
            .filter(loc => loc.location_name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10) // Top 10 coincidencias
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

// Helper genérico para peticiones
async function postDataForSEO(endpoint, data) {
    try {
        console.log(`📡 DataForSEO: Consultando ${endpoint}...`);
        const response = await axios({
            method: 'post',
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Content-Type': 'application/json'
            },
            data: data
        });

        // DEBUG: Ver respuesta completa si falla
        // console.log("🔍 Response Status:", response.data.tasks?.[0]?.status_code);
        // console.log("🔍 Response Message:", response.data.tasks?.[0]?.status_message);


        if (!response.data.tasks || response.data.tasks[0].status_code !== 20000) {
            console.warn("⚠️ API Error:", response.data.tasks?.[0]?.status_message);
            return null;
        }
        return response.data.tasks[0].result;
    } catch (error) {
        console.error("❌ Error de Red (DataForSEO):", error.message);
        return null;
    }
}

// 1. Obtener los 10 primeros resultados REALES de Google SERP
export async function getTopCompetitors(keyword, locationInput) {
    const locParams = getLocationParams(locationInput);

    console.log(`🔍 Obteniendo SERP real para: "${keyword}"`);

    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        ...locParams,
        language_code: "es",
        depth: 10  // Solo los primeros 10 resultados
    }]);

    if (!results || !results[0] || !results[0].items) {
        console.warn('⚠️ No se obtuvieron resultados SERP');
        return [];
    }

    // Devolver EXACTAMENTE los 10 primeros resultados orgánicos, SIN FILTRAR
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

    console.log(`✅ SERP obtenida: ${organicResults.length} resultados orgánicos`);
    organicResults.forEach(r => {
        console.log(`   ${r.position}. ${r.domain} - ${r.title}`);
    });

    return organicResults;
}

// 2. Obtener Keywords de Competidores ESPECÍFICOS (de la SERP real)
export async function getCompetitorKeywords(domain, locationInput, top10Only = true) {
    const locationName = "Spain";

    console.log(`📍 Using location for Labs: ${locationName} (original input: ${locationInput})`);
    console.log(`🎯 Extrayendo keywords de: ${domain} ${top10Only ? '(TOP 10)' : '(ALL)'}`);

    let allKeywords = [];

    const payload = [{
        target: domain,
        location_name: locationName,
        language_name: "Spanish",
        limit: 100,  // Máximo de keywords por competidor
        filters: [
            ["keyword_data.keyword_info.search_volume", ">", 0],
            // Filtro TOP 10 a nivel de API
            ...(top10Only ? [
                "and",
                [
                    ["ranked_serp_element.serp_item.rank_absolute", "<=", 10],
                    "and",
                    ["ranked_serp_element.serp_item.type", "<>", "paid"]
                ]
            ] : [])
        ]
    }];

    console.log(`🔍 DEBUG ranked_keywords payload:`, JSON.stringify(payload, null, 2));

    // CAMBIO: Usar ranked_keywords en lugar de keywords_for_site
    const result = await postDataForSEO('/dataforseo_labs/google/ranked_keywords/live', payload);

    if (result && result[0] && result[0].items) {
        console.log(`📦 DEBUG: Received ${result[0].items.length} total items from API`);
        if (result[0].items.length > 0) {
            console.log(`📦 DEBUG: Sample raw item:`, JSON.stringify(result[0].items[0], null, 2));
        }

        allKeywords = result[0].items.map(k => {
            // Extraer datos de keyword_data
            const kwData = k.keyword_data || {};
            const kwInfo = kwData.keyword_info || {};
            const kwProps = kwData.keyword_properties || {};

            // IMPORTANTE: ranked_keywords tiene la posición en ranked_serp_element
            const rankInfo = k.ranked_serp_element?.serp_item || {};

            return {
                keyword: kwData.keyword || kwInfo.keyword || 'unknown',
                volume: kwInfo.search_volume || 0,
                cpc: kwInfo.cpc || 0,
                competition: kwInfo.competition || 0,
                competition_level: kwInfo.competition_level || 'UNKNOWN',
                difficulty: kwProps.keyword_difficulty || 0,
                position: rankInfo.rank_absolute || null,  // ⭐ Ahora sí tenemos posición
                url: rankInfo.url || null, // ⭐ NUEVO: URL que rankea
                etv: k.etv || 0,  // NUEVO: Tráfico estimado
                source: 'competitor'
            };
        });

        console.log(`✅ Extracted ${allKeywords.length} keywords from ${domain} ${top10Only ? '(TOP 10)' : '(ALL)'}`);
        if (allKeywords.length > 0) {
            console.log(`   Sample keyword:`, allKeywords[0]);
        }
    }
    return allKeywords;
}

// 3. Obtener Keywords Relacionadas con filtrado semántico
export async function getRelatedKeywords(keyword, locationInput) {
    const locationName = "Spain";
    console.log(`📍 Using location for Labs: ${locationName} (original input: ${locationInput})`);

    // Extraer términos clave del keyword original
    const keywordTerms = keyword.toLowerCase().split(' ').filter(t => t.length > 2);

    const result = await postDataForSEO('/dataforseo_labs/google/related_keywords/live', [{
        keyword,
        location_name: locationName,
        language_name: "Spanish",
        limit: 50,  // Aumentamos para tener más opciones
        // Filtros en la API para mejorar relevancia
        filters: [
            ["keyword_data.keyword_info.search_volume", ">", 50],  // Mínimo 50 búsquedas
            "and",
            ["keyword_data.keyword_info.search_volume", "<", 50000]  // Máximo 50k (evitar genéricas)
        ]
    }]);

    if (!result || !result[0] || !result[0].items) return [];

    // Calcular relevancia semántica para cada keyword relacionada
    const keywords = result[0].items
        .map(k => {
            const kwData = k.keyword_data || k;
            const kwInfo = kwData.keyword_info || kwData;
            const kwText = (kwData.keyword || kwInfo.keyword || '').toLowerCase();

            // Calcular score de relevancia
            let relevanceScore = 0;
            keywordTerms.forEach(term => {
                if (kwText.includes(term)) relevanceScore += 2;
            });

            // Penalizar si es demasiado genérica
            if (kwText.split(' ').length === 1) relevanceScore -= 3;

            return {
                keyword: kwInfo.keyword || k.keyword || 'unknown',
                volume: kwInfo.search_volume || k.search_volume || 0,
                cpc: kwInfo.cpc || k.cpc || 0,
                competition: kwInfo.competition || k.competition || 0,
                competition_level: kwInfo.competition_level || k.competition_level || 'UNKNOWN',
                difficulty: k.keyword_properties?.keyword_difficulty || 0,
                source: 'related'
            };
        });

    console.log(`✅ Extracted ${keywords.length} related keywords for "${keyword}"`);
    return keywords;
}

// 4. Obtener Preguntas Frecuentes (People Also Ask)
export async function getPeopleAlsoAsk(keyword, locationName) {
    const loc = locationName || "Spain";
    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        location_name: loc,
        language_code: "es",
        depth: 10
    }]);

    if (!results || !results[0].items) return [];

    // Filtramos los items de tipo 'people_also_ask'
    const paaItem = results[0].items.find(item => item.type === 'people_also_ask');

    if (paaItem && paaItem.items) {
        return paaItem.items.map(q => q.title);
    }

    return [];
}