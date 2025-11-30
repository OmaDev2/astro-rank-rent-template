import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
const BASE_URL = 'https://api.dataforseo.com/v3';

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
export async function getTopCompetitors(keyword, locationName) {
    const loc = locationName || "Spain";
    const results = await postDataForSEO('/serp/google/organic/live/advanced', [{
        keyword,
        location_name: loc,
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
            description: item.description // Added description
        }))
        .filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.domain === value.domain
            ))
        ) // Únicos por dominio
        .slice(0, 10); // Top 10
}

// 2. Obtener Keywords de Competidores
// 2. Obtener Keywords de Competidores
export async function getCompetitorKeywords(domain, locationName) {
    let allKeywords = [];

    const result = await postDataForSEO('/dataforseo_labs/google/keywords_for_site/live', [{
        target: domain,
        location_name: locationName || "Spain",
        language_name: "Spanish",
        limit: 20
        // filters: [["keyword_info.search_volume", ">", 10]]
    }]);

    if (result && result[0].items) {


        allKeywords = result[0].items.map(k => ({
            keyword: k.keyword,
            volume: k.keyword_info?.search_volume || 0,
            source: 'competitor'
        }));
    }

    return allKeywords;
}

// 3. Obtener Keywords Relacionadas (ESTA ES LA QUE TRAE EL VOLUMEN)
export async function getRelatedKeywords(keyword, locationName) {
    const makeRequest = async (loc) => {
        return await postDataForSEO('/dataforseo_labs/google/related_keywords/live', [{
            keyword,
            location_name: loc,
            language_name: "Spanish",
            limit: 30
        }]);
    };

    let result = await makeRequest(locationName || "Spain");

    // Fallback: Si falla por location_name, probamos con "Spain"
    if (!result && locationName && locationName !== "Spain") {
        console.warn(`⚠️ Falló con ubicación '${locationName}'. Reintentando con 'Spain'...`);
        result = await makeRequest("Spain");
    }

    if (!result || !result[0].items) return [];

    return result[0].items.map(k => ({
        keyword: k.keyword_data?.keyword,
        volume: k.keyword_data?.keyword_info?.search_volume || 0,
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