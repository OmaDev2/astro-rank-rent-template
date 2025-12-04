
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

async function discoverNicheServices(niche) {
    console.log(`🧠 Consultando a Gemini sobre servicios para: "${niche}"...`);

    const prompt = `
    ACTÚA COMO: Experto en SEO Local y Estrategia de Negocios.
    
    OBJETIVO: Identificar los 6-10 servicios comerciales MÁS RENTABLES y BUSCADOS para el nicho: "${niche}".
    
    INSTRUCCIONES:
    1. Piensa en qué busca realmente un cliente cuando necesita un "${niche}".
    2. Ignora servicios genéricos (ej: "reparaciones", "mantenimiento") si no son específicos.
    3. Ignora herramientas o materiales (ej: "martillo", "hierro").
    4. Céntrate en SERVICIOS o PRODUCTOS INSTALADOS.
    
    FORMATO JSON:
    {
        "services": [
            "Nombre del servicio 1 (ej: Rejas de Seguridad)",
            "Nombre del servicio 2 (ej: Puertas de Garaje)",
            ...
        ],
        "reasoning": "Breve explicación de por qué elegiste estos servicios"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const data = JSON.parse(text);

        console.log('\n✅ Servicios Identificados por Gemini:');
        console.log('=====================================');
        data.services.forEach((service, index) => {
            console.log(`${index + 1}. ${service}`);
        });
        console.log('\n🤔 Razonamiento:', data.reasoning);

        return data.services;

    } catch (error) {
        console.error('❌ Error consultando a Gemini:', error);
        return [];
    }
}

// Ejecutar prueba
discoverNicheServices('Herrero');
