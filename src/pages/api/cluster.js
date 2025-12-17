
import { runGeminiClustering } from '../../../scripts/logic/keyword_researcher.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { keywords, niche, city, rich_context } = body; // ✅ Recibimos rich_context

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return new Response(JSON.stringify({ error: 'Keywords list is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`🧠 API Cluster: Clustering ${keywords.length} keywords for "${niche}" in "${city}"`);
        if (rich_context) console.log("   ✨ With Rich Deep Research Context");

        const result = await runGeminiClustering(keywords, niche, city, rich_context); // ✅ Pasamos context

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Cluster Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
