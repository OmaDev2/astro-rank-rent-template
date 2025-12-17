
import { discoverNicheServices } from '../../../scripts/logic/service_discoverer.js';
import { generateDeepResearch } from '../../../scripts/logic/keyword_researcher.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();

        const { niche, city } = body; // Asegurar que recibimos 'city' si está disponible

        if (!niche) {
            return new Response(JSON.stringify({ error: 'Niche is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`🧠 Discovering services & Deep Research for: ${niche}...`);

        // Ejecutamos en paralelo para velocidad
        const [services, deepResearch] = await Promise.all([
            discoverNicheServices(niche),
            generateDeepResearch(niche, city || 'Spain') // Fallback a Spain si no hay ciudad
        ]);

        return new Response(JSON.stringify({
            services: services.services, // discoverNicheServices devuelve {services: []}
            rich_context: deepResearch.success ? deepResearch : null
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
