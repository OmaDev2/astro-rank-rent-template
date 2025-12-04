
import { discoverNicheServices } from '../../../scripts/logic/service_discoverer.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche } = body;

        if (!niche) {
            return new Response(JSON.stringify({ error: 'Niche is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await discoverNicheServices(niche);

        return new Response(JSON.stringify(data), {
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
