import { generateSmartClusters } from '../../../scripts/logic/keyword_researcher.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { niche, city, competitors, location, options = {} } = body;

        // Validación detallada
        if (!niche) {
            return new Response(JSON.stringify({
                error: "Falta el parámetro 'niche'"
            }), { status: 400 });
        }
        if (!city) {
            return new Response(JSON.stringify({
                error: "Falta el parámetro 'city'"
            }), { status: 400 });
        }
        if (!competitors || !Array.isArray(competitors)) {
            return new Response(JSON.stringify({
                error: "El parámetro 'competitors' debe ser un array"
            }), { status: 400 });
        }
        if (competitors.length === 0) {
            return new Response(JSON.stringify({
                error: "Debes seleccionar al menos un competidor"
            }), { status: 400 });
        }

        console.log(`📡 API Analyze v2: Clustering "${niche}" en "${city}"`);
        console.log(`🎯 Competidores: ${competitors.length}`);
        console.log(`🔍 Opciones:`, options);

        // Extraer solo los dominios del array de competidores
        const domains = competitors.map(c => c.domain || c);

        // Generar clusters con opciones configurables
        const plan = await generateSmartClusters(
            niche,
            city,
            domains,
            location || city,
            {
                top10Filter: options.top10Only !== undefined ? options.top10Only : false,
                minRelevanceScore: options.minRelevance !== undefined ? options.minRelevance : 0,
                includeInformational: options.includeInfo !== undefined ? options.includeInfo : false,
                maxKeywordsForAI: options.maxKeywords || undefined,
                specificServices: options.specificServices || [],
                skipClustering: options.skipClustering || false // ✅ Pasar flag
            }
        );

        console.log(`✅ Clusters generados: ${plan.clusters?.length || 0}`);

        return new Response(JSON.stringify(plan), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("❌ API Analyze Error:", e);
        return new Response(JSON.stringify({
            error: e.message || "Error al generar clusters"
        }), { status: 500 });
    }
}
