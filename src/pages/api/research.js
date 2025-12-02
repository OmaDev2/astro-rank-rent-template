import { getTopCompetitors, getLocationCode } from '../../../scripts/lib/seo_client_v2.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche, city, location } = body;

        // Validación
        if (!niche || !city) {
            return new Response(JSON.stringify({
                error: "Faltan parámetros requeridos: 'niche' y 'city'"
            }), { status: 400 });
        }

        console.log(`📡 API Research v2: "${niche}" en "${city}"`);

        // Obtener location_code de la ciudad
        const locationCode = getLocationCode(location || city);
        console.log(`📍 Location Code: ${locationCode}`);

        // Buscar competidores en SERP local
        const searchQuery = `${niche} ${city}`;
        const competitors = await getTopCompetitors(searchQuery, locationCode);

        console.log(`✅ ${competitors.length} competidores encontrados`);

        // Devolver estructura compatible con el frontend
        return new Response(JSON.stringify({
            raw_data: {
                competitors: competitors.map(c => ({
                    domain: c.domain,
                    url: c.url,
                    title: c.title,
                    description: c.description,
                    position: c.position
                }))
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("❌ API Research Error:", e);
        return new Response(JSON.stringify({
            error: e.message || "Error al buscar competidores"
        }), { status: 500 });
    }
}