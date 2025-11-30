import { getInitialCompetitors } from '../../../scripts/logic/keyword_researcher';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche, city, locationCode } = body;

        console.log(`📡 API Research: Buscando competidores para ${niche} (Location ID: ${locationCode || 'Auto'})...`);

        const competitors = await getInitialCompetitors(niche, locationCode);

        // Devolvemos estructura lista para el frontend
        return new Response(JSON.stringify({
            raw_data: { competitors: competitors }
        }), { status: 200 });

    } catch (e) {
        console.error("API Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}