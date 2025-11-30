import { runFullResearch } from '../../../scripts/logic/keyword_researcher';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche, city } = body;

        if (!niche || !city) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        // Ejecutamos la lógica
        const { seedKeyword } = body;
        const data = await runFullResearch(niche, city, seedKeyword);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("API Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}