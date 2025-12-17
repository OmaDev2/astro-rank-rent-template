import { parse } from 'csv-parse/sync';
import { generateDeepResearch } from '../../../scripts/logic/keyword_researcher.js';

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { text, niche, city } = body;

        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ error: 'Keywords text is required' }), { status: 400 });
        }

        console.log(`📝 API Manual Process: Parsing CSV for "${niche}"`);

        // 1. Eliminar BOM
        const fileContent = text.replace(/^\uFEFF/, '');

        // 2. Detectar delimitador
        const firstLine = fileContent.split('\n')[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;

        let delimiter = ',';
        if (semicolonCount > commaCount && semicolonCount > 2) delimiter = ';';

        console.log(`   🔍 CSV Debug: Detected Delimiter: "${delimiter}"`);

        // 3. Parseo robusto con csv-parse
        let records;
        try {
            records = parse(fileContent, {
                columns: false,
                skip_empty_lines: true,
                trim: true,
                delimiter: delimiter,
                relax_column_count: true,
                relax_quotes: true,
                quote: '"'
            });
        } catch (parseError) {
            console.error("CSV Parse Error:", parseError);
            throw new Error("Formato CSV inválido. Asegúrate de usar comillas si hay comas en los valores.");
        }

        if (records.length === 0) {
            return new Response(JSON.stringify({ error: 'No data found in CSV' }), { status: 400 });
        }

        // 4. Detectar Header
        const firstRow = records[0];
        const firstCol = String(firstRow[0]).trim().toLowerCase();

        let hasHeader = false;
        if (firstCol.includes('keyword') || firstCol.includes('word') || firstCol.includes('palabra')) {
            hasHeader = true;
        }

        const keywords = records.map((row, index) => {
            // Skip header row
            if (hasHeader && index === 0) return null;

            let term = '';
            let vol = 0;
            let cpc = 0;
            let kd = 0;

            if (hasHeader) {
                // Header Mapping strategy (Consistent with robust script)
                // 0: Keyword
                // 1: Volume
                // 6: CPC
                // 8: KD
                term = row[0];
                vol = row[1];
                cpc = row[6];
                kd = row[8];
            } else {
                // Fallback posicional
                term = row[0];
                vol = row[1];
                cpc = row[6];
                kd = row[8];
            }

            // Validation
            if (!term || typeof term !== 'string' || term.length < 2) return null;
            // Limpiar comillas extras si quedaron (aunque csv-parse quita las externas)
            term = term.replace(/^["']|["']$/g, '').trim();

            // Numeros
            if (typeof vol === 'string') vol = parseInt(vol.replace(/[^0-9]/g, ''), 10);
            if (typeof cpc === 'string') cpc = parseFloat(cpc.replace(',', '.').replace(/[^0-9.]/g, ''));
            if (typeof kd === 'string') kd = parseInt(kd.replace(/[^0-9]/g, ''), 10);

            return {
                keyword: term,
                volume: isNaN(vol) ? 0 : vol,
                cpc: isNaN(cpc) ? 0 : cpc,
                competition: isNaN(kd) ? 0 : kd, // This is KD
                source: 'manual_csv',
                relevanceScore: 10 // Default internal score for manual
            };
        }).filter(k => k !== null);

        const result = {
            niche,
            city,
            market_analysis: "Manual CSV Import",
            raw_data: {
                top_keywords: keywords,
                competitors: []
            },
            clusters: []
        };

        // ENRICHMENT: Run Deep Research if niche/city provided
        if (niche && city) {
            console.log("🧠 Manual Mode: Triggering parallel Deep Research...");
            try {
                const deepRes = await generateDeepResearch(niche, city);
                if (deepRes.success) {
                    result.rich_context = deepRes;
                    console.log("   ✅ Deep Research Attached to Manual Data");
                }
            } catch (err) {
                console.error("   ⚠️ Deep Research failed but proceeding with manual data:", err.message);
            }
        }

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
