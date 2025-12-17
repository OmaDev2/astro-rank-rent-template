import fs from 'fs/promises'; // Use promises version for async/await
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { getSearchVolume, getLocationCode } from '../lib/seo_client.js';

dotenv.config();

// Configuration
const CONFIG = {
    geminiModel: "gemini-2.0-flash", // Updated to supported model
    csvSeparator: ",",
    outputDir: "_data/research_wizard"
};

async function main() {
    // 1. Parse Arguments
    const args = process.argv.slice(2);
    const nicheArg = args.find(a => a.startsWith('--niche='));
    const cityArg = args.find(a => a.startsWith('--city='));

    if (!nicheArg || !cityArg) {
        console.error("❌ Uso incorrecto. Debes especificar --niche y --city");
        console.error("   Ejemplo: npm run research:wizard -- --niche=\"Cerrajero\" --city=\"Barcelona\"");
        process.exit(1);
    }

    const niche = nicheArg.split('=')[1].replace(/"/g, '');
    const city = cityArg.split('=')[1].replace(/"/g, '');

    console.log('\n' + '🧙'.repeat(20));
    console.log(`   RESEARCH WIZARD: ${niche} en ${city}`);
    console.log('🧙'.repeat(20) + '\n');

    // 2. Initialize Gemini
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ Error: GEMINI_API_KEY no encontrada en .env");
        process.exit(1);
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: CONFIG.geminiModel });

    // 3. Execution Chain
    let fullContext = [];
    let collectedKeywords = [];
    let faqs = [];

    // --- STEP 1: MAIN KEYWORDS ---
    await runStep(1, "Palabras Clave Principales", async () => {
        const prompt = `
            Actúa como un eperto SEO Local.
            Proporciona una lista de las 10 principales palabras clave transaccionales para "${niche}" en "${city}".
            Focus: Usuarios con intención de contratar.
            Formato: Solo lista separada por comas.
        `;
        const result = await generate(model, prompt);
        processKeywords(result, "Main", collectedKeywords);
        return result;
    }, fullContext);

    // --- STEP 2: LONG TAIL ---
    await runStep(2, "Long-Tail Keywords", async () => {
        const prompt = `
            Actúa como experto SEO para el nicho "${niche}" en "${city}".
            Basado en las keywords principales anteriores, enumera 10 palabras clave de cola larga (long-tail) ESPECÍFICAS para ${niche}.
            Focus: Búsquedas de voz, preguntas precisas sobre ${niche}, urgencias (24h, barato) o detalles técnicos.
            Evita temas genéricos o recetas de cocina.
            Formato: Solo lista separada por comas.
        `;
        const result = await generate(model, prompt);
        processKeywords(result, "LongTail", collectedKeywords);
        return result;
    }, fullContext);

    // --- STEP 3: NLP & SEMANTIC ---
    await runStep(3, "NLP & Variaciones Naturales", async () => {
        const prompt = `
             Actúa como experto SEO para el nicho "${niche}" en "${city}".
            Identifica 10 frases o variaciones de lenguaje natural (NLP) que usaría una persona real para buscar "${niche}".
            Focus: Cómo lo pediría una persona mayor ("arreglar puerta", "se me rompió la llave") o alguien sin vocabulario técnico.
            Formato: Solo lista separada por comas.
        `;
        const result = await generate(model, prompt);
        processKeywords(result, "NLP", collectedKeywords);
        return result;
    }, fullContext);

    // --- STEP 4: FAQS ---
    await runStep(4, "Preguntas Frecuentes (FAQs)", async () => {
        const prompt = `
            Actúa como experto en atención al cliente para "${niche}".
            Lista 5 preguntas frecuentes REALES que los clientes hacen antes de contratar un ${niche} en ${city}.
            Focus: Dudas de precio, tiempo de llegada, factura, garantía.
            Formato: Lista separada por pipe (|).
        `;
        const result = await generate(model, prompt);
        const questions = result.split('|').map(q => q.trim()).filter(q => q.length > 5);
        questions.forEach(q => faqs.push(q));
        console.log(`      ✅ ${questions.length} preguntas extraídas.`);
        return result;
    }, fullContext);

    // --- STEP 5: SEMANTIC ENTITIES ---
    await runStep(5, "Entidades Semánticas Relacionadas", async () => {
        const prompt = `
            Proporciona 10 términos semánticamente relacionados, sinónimos o herramientas relacionadas con "${niche}".
            Focus: Palabras que demuestren autoridad en el tema (ej: si es pintor -> "rodillo", "laca", "imprimación").
            Formato: Solo lista separada por comas.
        `;
        const result = await generate(model, prompt);
        processKeywords(result, "Semantic", collectedKeywords);
        return result;
    }, fullContext);

    // 4. Enrich Volumes (DataForSEO)
    console.log('\n📊 Enriqueciendo datos con volúmenes reales (DataForSEO)...');
    try {
        const kwList = collectedKeywords.map(k => k.keyword);
        const locationCode = getLocationCode(city);
        const volMap = await getSearchVolume(kwList, locationCode);

        collectedKeywords = collectedKeywords.map(k => {
            const volData = volMap[k.keyword.toLowerCase()];
            return {
                ...k,
                volume: volData ? volData.volume : 'N/A',
                competition: volData ? volData.competition : 'N/A',
                cpc: volData ? volData.cpc : 'N/A'
            };
        });
        console.log('   ✅ Volúmenes actualizados.');
    } catch (e) {
        console.warn('   ⚠️ No se pudieron obtener volúmenes (API Error o límite). Se guardarán sin datos.');
    }

    // 5. Export to CSV
    console.log('\n💾 Guardando resultados...');
    try {
        await fs.mkdir(CONFIG.outputDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${CONFIG.outputDir}/${niche.replace(/\s+/g, '_')}_${city.replace(/\s+/g, '_')}_${timestamp}.csv`;

        let csvContent = "Category,Keyword/Question,Intent,Volume,Competition,CPC\n";

        // Keywords
        collectedKeywords.forEach(k => {
            csvContent += `${k.category},"${k.keyword.replace(/"/g, '""')}",Commercial/Informational,${k.volume},${k.competition},${k.cpc}\n`;
        });

        // FAQs
        faqs.forEach(q => {
            csvContent += `FAQ,"${q.replace(/"/g, '""')}",Informational,-,-,-\n`;
        });

        await fs.writeFile(filename, csvContent);

        console.log('═'.repeat(60));
        console.log(`✅ EXPORTADO: ${filename}`);
        console.log('═'.repeat(60) + '\n');

    } catch (e) {
        console.error("❌ Error guardando CSV:", e);
    }
}

// --- HELPER FUNCTIONS ---

async function runStep(stepNum, title, action, context) {
    console.log(`\n🔹 PASO ${stepNum}: ${title}...`);
    try {
        const result = await action();
        context.push({ step: title, result });
    } catch (e) {
        console.error(`   ❌ Error en paso ${stepNum}:`, e.message);
    }
}

async function generate(model, userPrompt) {
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();
}

function processKeywords(text, category, collection) {
    const keywords = text.split(',')
        .map(k => k.trim())
        .map(k => k.replace(/^[-\*\d\.]+\s*/, '')) // Remove bullets 1. or - 
        .filter(k => k.length > 2);

    keywords.forEach(k => {
        collection.push({
            category,
            keyword: k,
            volume: 0,
            competition: 0,
            cpc: 0
        });
    });
    console.log(`      ✅ ${keywords.length} keywords extraídas.`);
}

main();
