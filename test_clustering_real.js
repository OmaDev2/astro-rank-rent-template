
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { runGeminiClustering } from './scripts/logic/keyword_researcher.js';

dotenv.config();

async function testClustering() {
    console.log("🚀 Testing Gemini Clustering Logic with CSV Data");

    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY missing in environment variables.");
        return;
    }

    try {
        const csvPath = 'kwfinder_gote_export.csv';
        const text = fs.readFileSync(csvPath, 'utf-8');
        const niche = "Pintores";
        const city = "Barcelona";
        const csvContent = text.replace(/^\uFEFF/, '');

        // Manual Parsing (Simplified for test)
        const records = parse(csvContent, {
            columns: false,
            skip_empty_lines: true,
            delimiter: ',' // We know it's comma from previous test
        });

        // Map to keywords
        let keywords = records.slice(1).map(row => ({
            keyword: row[0].replace(/^["']|["']$/g, '').trim(),
            volume: parseInt(row[1]) || 0,
            source: 'manual_csv',
            relevanceScore: 10
        })).filter(k => k.keyword);

        console.log(`✅ Loaded ${keywords.length} keywords.`);

        // Limit to 20 for testing to save tokens/time, but enough to trigger clustering
        const subset = keywords.slice(0, 20);
        console.log(`Sending ${subset.length} keywords to Gemini...`);

        const result = await runGeminiClustering(subset, niche, city);

        console.log("✅ Clustering Result:");
        console.log(JSON.stringify(result, null, 2));

        if (!result.services || result.services.length === 0) {
            console.error("⚠️ Warning: No services returned.");
        }
        if (!result.blog || result.blog.length === 0) {
            console.warn("⚠️ Warning: No blog topics returned.");
        }

    } catch (error) {
        console.error('❌ Clustering Error:', error);
    }
}

testClustering();
