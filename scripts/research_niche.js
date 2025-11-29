import { getSerpResults } from './lib/seo_client.js';
import { analyzeCompetitor } from './lib/scraper.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// --- TUS VARIABLES (AQUÍ DEFINES EL PROYECTO) ---
const PROJECT = {
    niche: "Fontanero Urgente",  // <--- CÁMBIALO AQUÍ Y SE PROPAGARÁ A TODO
    city: "Sevilla",             // <--- CÁMBIALO AQUÍ
    targetAudience: "Particulares con urgencias 24h"
};
// -----------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function main() {
    console.log(`\n🚀 INICIANDO INVESTIGACIÓN PARA: ${PROJECT.niche} en ${PROJECT.city}...\n`);

    // 1. Obtener Competidores
    const competitors = await getSerpResults(`${PROJECT.niche} ${PROJECT.city}`, "Spain");

    if (competitors.length === 0) {
        console.log("❌ No se encontraron competidores (DataForSEO).");
        return;
    }

    console.log(`✅ Analizando ${competitors.length} competidores reales...\n`);

    // 2. Analizar Estructura
    const analyzedData = [];
    for (const comp of competitors) {
        const analysis = await analyzeCompetitor(comp.url);
        analyzedData.push(analysis);
    }

    // 3. Consultar a Gemini
    console.log("\n🧠 Diseñando Arquitectura SEO con IA...");

    const prompt = `
        Actúa como Arquitecto SEO experto.
        Proyecto: ${PROJECT.niche} en ${PROJECT.city}.
        
        Competencia analizada:
        ${JSON.stringify(analyzedData.slice(0, 3), null, 2)}
        
        TU TAREA:
        Crea la estructura JSON ideal para superarles.
        
        FORMATO JSON REQUERIDO:
        {
            "services": ["Lista de 6 servicios principales (keywords transaccionales)"],
            "locations": ["Lista de 5 barrios/zonas importantes de ${PROJECT.city} para SEO Local"],
            "home_h1": "H1 optimizado para la Home",
            "home_h2s": ["Lista de 3 H2 persuasivos para la Home"]
        }
        
        Responde SOLO con el JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let plan = JSON.parse(responseText);

        // --- LA CLAVE MAESTRA: INYECTAR DATOS FIJOS ---
        // Aquí forzamos que el plan guarde lo que tú definiste, ignorando a la IA si se equivoca.
        plan.niche = PROJECT.niche;
        plan.city = PROJECT.city;
        plan.siteName = `${PROJECT.niche} ${PROJECT.city} Pro`; // Generamos nombre auto
        // ----------------------------------------------

        console.log("\n✨ ESTRATEGIA GENERADA:\n");
        console.log(JSON.stringify(plan, null, 2));

        await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));
        console.log("\n💾 Plan guardado en 'project_plan.json'. Ahora ejecuta 'generate_site.js'.");

    } catch (error) {
        console.error("❌ Error generando el plan:", error);
    }
}

main();