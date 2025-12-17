// import { getTopCompetitors, getLocationCode } from '../../../scripts/lib/seo_client_v2.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        console.log('📥 Request body received:', JSON.stringify(body, null, 2));

        const { niche, city, location } = body;

        // Validación mejorada
        if (!niche || !city) {
            console.error('❌ Validation failed:', { niche, city });
            return new Response(JSON.stringify({
                error: "Faltan parámetros requeridos: 'niche' y 'city'",
                received: { niche, city, location }
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log(`📡 API Research v2: "${niche}" en "${city}"`);

        // MOCK DATA for Build Fix (Missing seo_client_v2.js)
        /*
        const locationCode = getLocationCode(location || city);
        const searchQuery = `${niche} ${city}`;
        const competitors = await getTopCompetitors(searchQuery, locationCode);
        */
        const competitors = []; // Empty for now to fix build

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