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

// 1. Obtener Competidores (SERP)
export async function getTopCompetitors(keyword, locationInput) {
    const locParams = getLocationParams(locationInput);

    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        ...locParams, // Inyectamos location_name o location_code
        language_code: "es",
        depth: 10
    }]);

    if (!results || !results[0].items) return [];

    return results[0].items
        .filter(item => item.type === 'organic')
        .map(item => ({
            url: item.url,
            title: item.title,
            domain: item.domain,
            description: item.description
        }))
        .filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.domain === value.domain
            ))
        ) // Únicos por dominio
        .slice(0, 10); // Top 10
}

// 2. Obtener Keywords de Competidores
export async function getCompetitorKeywords(domain, locationInput) {
    const locParams = getLocationParams(locationInput);
    let allKeywords = [];

    const result = await postDataForSEO('/dataforseo_labs/google/keywords_for_site/live', [{
        target: domain,
        ...locParams,
        language_name: "Spanish",
        limit: 20,
        filters: [["keyword_info.search_volume", ">", 0]]
    }]);

    if (result && result[0].items) {
        allKeywords = result[0].items.map(k => ({
            keyword: k.keyword_info.keyword,
            volume: k.keyword_info.search_volume,
            source: 'competitor'
        }));
    }
    return allKeywords;
}

// 3. Obtener Keywords Relacionadas
export async function getRelatedKeywords(keyword, locationInput) {
    const locParams = getLocationParams(locationInput);

    const result = await postDataForSEO('/dataforseo_labs/google/related_keywords/live', [{
        keyword,
        ...locParams,
        language_name: "Spanish",
        limit: 30
    }]);

    if (!result || !result[0].items) return [];

    return result[0].items.map(k => ({
        keyword: k.keyword_info.keyword,
        volume: k.keyword_info.search_volume,
        source: 'related'
    }));
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