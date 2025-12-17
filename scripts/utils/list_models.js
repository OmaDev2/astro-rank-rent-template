import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    console.log("🔍 Consultando modelos disponibles para tu API Key...");
    try {
        // Para listar modelos, usamos el manager del SDK si está disponible, 
        // o hacemos una petición REST simple si el SDK no expone listModels fácilmente en esta versión.
        // La versión actual del SDK suele tener genAI.getGenerativeModel, pero no siempre un listModels global directo en la instancia principal.
        // Vamos a intentar un fetch directo a la API REST para asegurar.

        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ Modelos Disponibles:");
            data.models.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                console.log(`  Versión: ${m.version}, Límites: ${m.inputTokenLimit} tokens entrada`);
            });
        } else {
            console.log("❌ No se encontraron modelos o hubo un error en el formato.");
            console.log(data);
        }

    } catch (error) {
        console.error("❌ Error listando modelos:", error.message);
    }
}

listModels();
