
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { SERVICE_DISCOVERY_PROMPT } from '../../src/prompts/service_discovery.js';

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

        // Limpiar markdown si existe
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);

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
