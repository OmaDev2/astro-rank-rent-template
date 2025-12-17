import fs from 'fs/promises';
import { runGeminiClustering, importKeywordsFromCSV } from '../logic/keyword_researcher.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    // 1. Get args
    const args = process.argv.slice(2);
    const nicheArg = args.find(a => a.startsWith('--niche='));
    const cityArg = args.find(a => a.startsWith('--city='));
    const fileArg = args.find(a => a.startsWith('--file='));

    const niche = nicheArg ? nicheArg.split('=')[1] : "Servicio General";
    const city = cityArg ? cityArg.split('=')[1] : "Barcelona";
    const file = fileArg ? fileArg.split('=')[1] : "_data/manual_keywords.txt";

    console.log('\n' + '═'.repeat(60));
    console.log(`🚀 MANUAL KEYWORD RESEARCHER`);
    console.log('═'.repeat(60));
    console.log(`   Nicho: ${niche}`);
    console.log(`   Ciudad: ${city}`);
    console.log(`   Archivo: ${file}`);
    console.log('═'.repeat(60) + '\n');

    // 2. Read keywords or Generate Deep Research
    let keywords = [];
    let richContext = null;

    if (!fileArg) {
        console.log("   📂 No se especificó archivo (--file). Usando DEEP RESEARCH WIZARD...");
        try {
            const result = await import('../logic/keyword_researcher.js').then(m => m.generateDeepResearch(niche, city));
            if (result.success) {
                richContext = result;
                // Convert main keywords to the format expected by clustering
                // We use main + longtail for volume/clustering, but we have rich context too
                // FIX: Include NLP phrases to ensure we have "Informational" fodder for the Blog
                const allKws = [
                    ...result.data.mainKeywords,
                    ...result.data.longTail,
                    ...(result.data.nlpPhrases || [])
                ];
                keywords = allKws.map(k => ({ keyword: k, volume: 100 }));
                console.log(`   ✅ Generadas ${keywords.length} keywords base desde el Wizard (incluyendo User Voice).`);
            } else {
                throw new Error(result.error);
            }
        } catch (e) {
            console.error("❌ Error en Deep Research:", e);
            process.exit(1);
        }
    } else {
        try {
            // 2a. Intentar parseo robusto CSV primero si termina en .csv
            if (file.endsWith('.csv')) {
                console.log("   📂 Detectado archivo CSV. Usando importador robusto...");
                keywords = importKeywordsFromCSV(file);
            } else {
                // 2b. Fallback para .txt o JSON puro
                const content = await fs.readFile(file, 'utf-8');
                try {
                    const json = JSON.parse(content);
                    if (Array.isArray(json)) {
                        keywords = json.map(k => {
                            if (typeof k === 'string') return { keyword: k, volume: 100 };
                            return { ...k, volume: k.volume || 100 };
                        });
                    }
                } catch (e) {
                    // Fallback texto linea por linea
                    keywords = content.split('\n')
                        .map(l => l.trim())
                        .filter(l => l.length > 0)
                        .map(k => ({ keyword: k, volume: 100 }));
                }
            }

            if (keywords.length === 0) {
                throw new Error("No keywords found in file.");
            }
        } catch (error) {
            console.error(`❌ Error leyendo el archivo ${file}:`, error.message);
            process.exit(1);
        }
    }

    console.log(`✅ ${keywords.length} palabras clave cargadas.`);

    // 3. Cluster
    console.log('\n🧠 Ejecutando Clustering con Gemini...');
    let result = { services: [], blog: [] };
    try {
        result = await runGeminiClustering(keywords, niche, city, richContext); // ✅ Pasamos richContext
    } catch (error) {
        console.error("❌ Error en clustering:", error);
        process.exit(1);
    }

    // Adapt legacy structure
    const clusters = result.services || [];
    const blog = result.blog || [];
    console.log(`   ✅ Generados ${clusters.length} servicios y ${blog.length} artículos.`);

    // 4. Build Plan
    const homeStructure = {
        h1: `${niche} en ${city}`,
        h2s: ["Nuestros Servicios", "Por qué elegirnos", "Opiniones", "Contacto"]
    };

    if (clusters.length > 0) {
        // Sort by volume (simulated) or keyword count
        const sortedClusters = [...clusters].sort((a, b) => b.keywords.length - a.keywords.length);
        const mainCluster = sortedClusters[0];

        if (mainCluster && mainCluster.meta_suggestions && mainCluster.meta_suggestions[0]) {
            homeStructure.h1 = mainCluster.meta_suggestions[0].h1;
        }

        const serviceH2s = sortedClusters
            .filter(c => c.name !== mainCluster?.name)
            .slice(0, 4)
            .map(c => c.name);

        if (serviceH2s.length > 0) {
            homeStructure.h2s = [...serviceH2s, "Sobre Nosotros", "Opiniones", "Contacto"];
        }
    }

    const plan = {
        niche,
        city,
        clusters, // Legacy name for services
        blog_topics: blog, // New field
        home_structure: homeStructure,
        generate_locations: false,
        locations: [],
        market_analysis: "Plan generado manualmente.",
        raw_data: { top_keywords: keywords, rich_context: richContext }
    };

    // 5. Save
    await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 PLAN GENERADO CON ÉXITO');
    console.log('═'.repeat(60));
    console.log('   Archivo: project_plan.json');
    console.log('   Siguiente paso: npm run generate_site');
    console.log('═'.repeat(60) + '\n');
}

main();
