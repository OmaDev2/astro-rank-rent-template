import { generateClustersFromSelection } from '../../../scripts/logic/keyword_researcher';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche, city, competitors, locationCode, locationName } = body;

        if (!niche || !city || !competitors || competitors.length === 0) {
            return new Response(JSON.stringify({ error: "Faltan competidores seleccionados" }), { status: 400 });
        }

        console.log(`📡 API Analyze: Clusterizando (Location: ${locationName || locationCode || 'Auto'})...`);

        // Pasamos locationName para Labs endpoints (keywords_for_site, related_keywords)
        const data = await generateClustersFromSelection(niche, city, competitors, locationName || locationCode);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("API Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
