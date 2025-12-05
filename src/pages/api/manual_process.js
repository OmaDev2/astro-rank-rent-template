
export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { text, niche, city } = body;

        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ error: 'Keywords text is required' }), { status: 400 });
        }

        console.log(`📝 API Manual Process: Parsing keywords for "${niche}"`);

        // Parse text
        const lines = text.split('\n');
        const keywords = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // 1. Detect delimiter (, or ;)
                const delimiter = line.includes(';') ? ';' : ',';
                const parts = line.split(delimiter);

                // 2. Try to find volume (usually last column if numeric)
                // If only 1 part, it's just keyword
                if (parts.length === 1) {
                    return { keyword: parts[0].trim(), volume: 100, source: 'manual', relevanceScore: 10 };
                }

                // If multiple parts, check if last one is volume
                const lastPart = parts[parts.length - 1].trim();
                const possibleVolume = parseInt(lastPart);

                if (!isNaN(possibleVolume)) {
                    // Reconstruct keyword from previous parts
                    const keyword = parts.slice(0, parts.length - 1).join(delimiter).trim();
                    // Remove quotes if present
                    const cleanKeyword = keyword.replace(/^["']|["']$/g, '');
                    return { keyword: cleanKeyword, volume: possibleVolume, source: 'manual', relevanceScore: 10 };
                }

                // If last part is not number, assume it's all keyword or ignore extra columns
                // Let's just take the first column as keyword
                const firstCol = parts[0].trim().replace(/^["']|["']$/g, '');
                return { keyword: firstCol, volume: 100, source: 'manual', relevanceScore: 10 };
            });

        const result = {
            niche,
            city,
            market_analysis: "Manual keyword list provided by user.",
            raw_data: {
                top_keywords: keywords,
                competitors: [] // No competitors in manual mode
            },
            clusters: [] // Empty initially
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('API Manual Process Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
