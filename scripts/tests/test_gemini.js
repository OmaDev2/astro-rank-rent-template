import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

async function test() {
    console.log("🧪 Probando conexión con Gemini (gemini-3-pro-preview)...");
    try {
        const result = await model.generateContent("Di 'Hola Mundo' si funcionas.");
        const response = await result.response;
        const text = response.text();
        console.log("✅ ÉXITO: Respuesta recibida:");
        console.log(text);
    } catch (error) {
        console.error("❌ ERROR: No se pudo conectar con el modelo.");
        console.error(error.message);
        console.log("\n⚠️ Posible causa: El modelo 'gemini-3-pro-preview' no existe o no tienes acceso.");
        console.log("Intenta cambiar a 'gemini-1.5-pro' o 'gemini-exp-1121' si este falla.");
    }
}

test();
