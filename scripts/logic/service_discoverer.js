
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" }
});

export async function discoverNicheServices(niche) {
    console.log(`🧠 Consultando a Gemini sobre servicios para: "${niche}"...`);

    const prompt = `
    ACTÚA COMO: Experto en SEO Local y Estrategia de Negocios.
    
    OBJETIVO: Identificar una lista exhaustiva de SERVICIOS ESPECÍFICOS (entre 10 y 15) para el nicho: "${niche}".
    
    INSTRUCCIONES CRÍTICAS:
    1. DESGLOSA AL MÁXIMO: No agrupes servicios diferentes en una misma línea.
       - ❌ MAL: "Alisado de paredes y eliminación de gotelé"
       - ✅ BIEN: "Alisado de paredes", "Eliminación de gotelé" (como dos items separados)
       - ❌ MAL: "Pintura de interiores y exteriores"
       - ✅ BIEN: "Pintura de interiores", "Pintura de exteriores"
    2. BUSCA LA ESPECIFICIDAD: Piensa en qué escribe el usuario en Google.
    3. Ignora servicios genéricos (ej: "reparaciones", "mantenimiento") si no son específicos.
    4. Ignora herramientas o materiales sueltos.
    
    FORMATO JSON:
    {
        "services": [
            "Servicio específico 1",
            "Servicio específico 2",
            ...
        ],
        "reasoning": "Breve explicación"
    }
    `;

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
