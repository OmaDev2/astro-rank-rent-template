
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { SERVICE_DISCOVERY_PROMPT } from '../lib/ai_prompts.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" }
});

export async function discoverNicheServices(niche) {
    console.log(`🧠 Consultando a Gemini sobre servicios para: "${niche}"...`);

    const prompt = SERVICE_DISCOVERY_PROMPT(niche);

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpieza robusta de JSON (Soporte para CoT/Reasoning)
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        let data;
        if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            try {
                // Intentamos JSON5 primero si importamos la librería, sino JSON normal con limpieza extra
                // Como JSON5 no está importado aquí, usaremos limpieza manual si JSON.parse falla
                data = JSON.parse(jsonStr);
            } catch (e) {
                // Fallback simple: a veces Gemini devuelve trailing commas
                const cleaned = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
                data = JSON.parse(cleaned);
            }
        } else {
            // Fallback a limpieza simple si no hay match de llaves
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            data = JSON.parse(cleanText);
        }

        return data;

    } catch (error) {
        console.error('❌ Error consultando a Gemini:', error);
        // Loguear el texto que falló al parsear si es posible
        if (error instanceof SyntaxError) {
            console.error('❌ Error de sintaxis JSON. Respuesta recibida:', error.message);
        }
        throw new Error(`Failed to discover services: ${error.message}`);
    }
}
