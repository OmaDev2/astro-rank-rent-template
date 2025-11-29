import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');

// Función para obtener las SERPs (Resultados de Google)
export async function getSerpResults(keyword, location = "Spain") {
    console.log(`🔍 Buscando en Google: "${keyword}" en ${location}...`);

    try {
        const post_array = [];
        post_array.push({
            "language_code": "es",
            "location_name": location,
            "keyword": keyword
        });

        const response = await axios({
            method: 'post',
            url: 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Content-Type': 'application/json'
            },
            data: post_array
        });

        const results = response.data.tasks[0].result[0].items;

        // Filtramos solo los resultados orgánicos (nos saltamos anuncios y mapas por ahora)
        const competitors = results
            .filter(item => item.type === 'organic')
            .map(item => ({
                title: item.title,
                url: item.url,
                description: item.snippet,
                rank: item.rank_group
            }))
            .slice(0, 5); // Nos quedamos con el Top 5

        return competitors;

    } catch (error) {
        console.error("❌ Error conectando con DataForSEO:", error.message);
        return [];
    }
}

// Función para obtener Palabras Clave Relacionadas (Keywords Data)
export async function getRelatedKeywords(keyword, location = "Spain") {
    console.log(`📊 Buscando keywords relacionadas para: "${keyword}"...`);
    // Nota: Esta función requeriría otro endpoint de DataForSEO (Google Ads API o Keyword Data)
    // Por ahora simularemos una respuesta básica o usaremos el endpoint de SERP para sacar ideas
    return [];
}