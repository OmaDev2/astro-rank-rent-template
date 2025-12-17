
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { spawn } from 'child_process';
import path from 'path';

async function reproduceFullFlow() {
    console.log("🚀 Starting Full Flow Reproduction (ONE PAGE MODE)");

    // 1. Manual Process (CSV)
    const csvPath = '_data/kwfinder_gote_export.csv';
    if (!fs.existsSync(csvPath)) {
        console.error("❌ CSV file not found");
        return;
    }
    const text = fs.readFileSync(csvPath, 'utf-8');
    const niche = "Pintores";
    const city = "Barcelona";
    const csvContent = text.replace(/^\uFEFF/, '');

    // Delimiter logic
    const firstLine = csvContent.split('\n')[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = (semicolonCount > commaCount && semicolonCount > 2) ? ';' : ',';

    const records = parse(csvContent, {
        columns: false,
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_column_count: true,
        relax_quotes: true,
        quote: '"'
    });

    // Map to keywords (simplified)
    const keywords = records.slice(1).map(row => ({
        keyword: row[0].replace(/^["']|["']$/g, '').trim(),
        volume: parseInt(row[1]) || 0,
        source: 'manual_csv',
        relevanceScore: 10
    })).filter(k => k.keyword);

    console.log(`✅ CSV Parsed: ${keywords.length} keywords`);

    // 2. Mock Clustering
    const clusters = [
        {
            name: `Alisado de Paredes`,
            slug: `alisado-paredes`,
            type: 'SERVICE',
            intent: 'COMMERCIAL',
            keywords: keywords.slice(0, 10),
            meta_suggestions: [{ h1: `Alisado de Paredes en ${city}`, seo_title: "Test", seo_description: "Test" }]
        },
        {
            name: `Pintura Decorativa`,
            slug: `pintura-decorativa`,
            type: 'SERVICE',
            intent: 'COMMERCIAL',
            keywords: keywords.slice(10, 20),
            meta_suggestions: [{ h1: `Pintura Decorativa en ${city}`, seo_title: "Test", seo_description: "Test" }]
        }
    ];

    // 3. Construct Plan with ONE PAGE MODE = TRUE
    const plan = {
        niche,
        city,
        market_analysis: "Manual reproduction",
        raw_data: { top_keywords: keywords, competitors: [] },
        clusters: clusters, // Old format compatibility
        services: clusters, // New format
        blog: [],
        home_structure: {
            h1: "Pintores Profesionales en Barcelona",
            h2s: ["Nuestros Servicios de Alisado", "Pintura Decorativa", "Presupuesto Gratis"]
        },
        generate_locations: false,
        one_page_mode: true // <--- IMPORTANT CHANGE
    };

    // 4. Save Plan
    fs.writeFileSync('project_plan.json', JSON.stringify(plan, null, 2));
    console.log("✅ project_plan.json created with one_page_mode: true");

    // 5. Run Generator Script
    console.log("🚀 Spawning scripts/generate_site.js...");
    const child = spawn('node', ['scripts/generate_site.js'], {
        cwd: process.cwd()
    });

    child.stdout.on('data', (data) => console.log(`[Script]: ${data}`));
    child.stderr.on('data', (data) => console.error(`[Script Error]: ${data}`));

    child.on('close', (code) => {
        console.log(`✅ Script finished with code ${code}`);
    });
}

reproduceFullFlow();
