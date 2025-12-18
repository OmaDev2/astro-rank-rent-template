import { GoogleGenerativeAI } from "@google/generative-ai";

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { field, niche, city, service, contextPrompt } = body;

        if (!process.env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "Gemini API Key missing" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Base prompt logic
        let prompt = "";

        const contextInfo = `Negocio: ${niche} en ${city}${service ? `, Servicio específico: ${service}` : ''}.`;

        switch (field) {
            case 'seoTitle':
                prompt = `Genera un SEO Title (máx 60 caracteres) para una página de ${contextInfo}. Debe ser atractivo y contener la palabra clave principal. Solo devuelve el texto.`;
                break;
            case 'seoDesc':
                prompt = `Genera una SEO Meta Description (máx 155 caracteres) para una página de ${contextInfo}. Debe ser persuasiva y terminar con un call to action sutil. Solo devuelve el texto.`;
                break;
            case 'shortDesc':
                prompt = `Genera una descripción corta (2-3 líneas) para un listado de servicios sobre ${contextInfo}. Enfócate en beneficios para el cliente. Solo devuelve el texto.`;
                break;
            case 'heroHeading':
                prompt = `Genera un H1 impactante para el Hero de una página sobre ${contextInfo}. Usa copywriting persuasivo. Solo devuelve el texto.`;
                break;
            case 'heroSubheading':
                prompt = `Genera un subtítulo persuasivo para el Hero de una página sobre ${contextInfo}. Explica por qué somos la mejor opción local. Solo devuelve el texto.`;
                break;
            default:
                if (contextPrompt) {
                    prompt = `${contextPrompt}. Contexto: ${contextInfo}. Solo devuelve el texto generado.`;
                } else {
                    return new Response(JSON.stringify({ error: "Unknown field or prompt missing" }), { status: 400 });
                }
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Remove quotes if present
        text = text.replace(/^"|"$/g, '');

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("AI Generation Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
