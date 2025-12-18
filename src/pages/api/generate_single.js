import { GoogleGenerativeAI } from "@google/generative-ai";

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { field, niche, city, service, contextPrompt, format = 'text' } = body;

        const apiKey = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Gemini API Key missing" }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos flash para velocidad en generationes individuales
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: format === 'json' ? { responseMimeType: "application/json" } : undefined
        });

        const contextInfo = `Nicho: ${niche}, Ciudad: ${city}${service ? `, Servicio: ${service}` : ''}.`;
        let prompt = "";

        // Mapeo detallado de campos para el CMS y el Generador Modular
        const promptMap = {
            // SEO & Meta
            'seoTitle': `Genera un SEO Title persuasivo (máx 60 caracteres) para ${contextInfo}. Solo devuelve el texto.`,
            'seoDesc': `Genera una Meta Description SEO (máx 155 caracteres) para ${contextInfo}. Invita al clic con beneficios. Solo devuelve el texto.`,

            // Hero
            'heroHeading': `Genera un H1 impactante y persuasivo para el hero de ${contextInfo}. Solo devuelve el texto.`,
            'heroSubheading': `Genera un subtítulo para el hero de ${contextInfo} que refuerce la autoridad y confianza local. Máx 20 palabras.`,
            'headingHighlight': `Genera una palabra o frase corta (máx 2-3 palabras) que destaque del H1 de ${contextInfo} (ej: "Garantizado", "24 Horas", "Expertos").`,

            // Secciones Informativas
            'aboutTitle': `Genera un título creativo para la sección "Sobre Nosotros" de ${contextInfo}.`,
            'aboutDescription': `Genera una descripción detallada (2 párrafos) para la sección "Sobre Nosotros" de ${contextInfo}. Habla de experiencia local, profesionalismo y cercanía.`,
            'shortDesc': `Genera una descripción corta (2-3 líneas) para un listado de servicios de ${contextInfo}.`,

            // Bloques Específicos
            'servicesTitle': `Genera un título llamativo para la sección de servicios de ${contextInfo}.`,
            'servicesSubtitle': `Genera un subtítulo introductorio para la cuadrícula de servicios de ${contextInfo}.`,

            'featuresTitle': `Genera un título para la sección de "Por qué elegirnos" de ${contextInfo}.`,

            'processTitle': `Genera un título para la sección de "Nuestro Proceso" de ${contextInfo}.`,
            'processStepTitle': `Genera un título corto para un paso del proceso de trabajo en ${contextInfo}.`,
            'processStepDesc': `Genera una descripción corta de un paso del proceso para ${contextInfo}.`,

            'ctaTitle': `Genera un título de llamada a la acción (CTA) urgente y persuasivo para ${contextInfo}.`,
            'ctaSubtitle': `Genera un subtítulo para un bloque CTA de ${contextInfo} que elimine fricciones (ej: "Presupuesto Gratis", "Sin Compromiso").`,

            // Datos Estructurados / Arrays (Requieren format 'json')
            'faqArray': `Genera un array JSON con 5 FAQs (question, answer) altamente relevantes para ${contextInfo}.`,
            'featuresArray': `Genera un array JSON con 3 características clave (title, description, icon) para elegir a esta empresa en ${contextInfo}. Los iconos deben ser nombres de Lucide (ej: 'Shield', 'Clock', 'Award').`,
            'stepsArray': `Genera un array JSON con 3 pasos (title, description) del proceso de trabajo para ${contextInfo}.`,
            'testimonialsArray': `Genera un array JSON con 3 testimonios realistas (quote, author, location, initials) para ${contextInfo}.`,
        };

        if (promptMap[field]) {
            prompt = promptMap[field];
        } else if (contextPrompt) {
            prompt = `${contextPrompt}. Contexto: ${contextInfo}.`;
        } else {
            return new Response(JSON.stringify({ error: "Campo desconocido y sin prompt personalizado" }), { status: 400 });
        }

        // Si se pide JSON, forzamos instrucciones
        if (format === 'json') {
            prompt += " Responde exclusivamente con un JSON válido.";
        } else {
            prompt += " Solo devuelve el texto final, sin explicaciones ni comillas.";
        }

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        if (format === 'json') {
            // Limpieza básica de JSON si Gemini devuelve markdown blocks
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const jsonContent = JSON.parse(text);
                return new Response(JSON.stringify({ content: jsonContent }), { status: 200, headers: { "Content-Type": "application/json" } });
            } catch (err) {
                return new Response(JSON.stringify({ content: text, warning: "JSON malformed" }), { status: 200, headers: { "Content-Type": "application/json" } });
            }
        } else {
            text = text.replace(/^"|"$/g, '');
            return new Response(JSON.stringify({ content: text }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

    } catch (e) {
        console.error("❌ AI Generation Error:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

