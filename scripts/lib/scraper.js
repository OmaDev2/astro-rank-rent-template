import axios from 'axios';
import * as cheerio from 'cheerio';

export async function analyzeCompetitor(url) {
    console.log(`🕵️‍♀️ Espiando competidor: ${url}...`);

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(data);

        // Extraemos la estructura básica
        const h1 = $('h1').text().trim();
        const h2s = $('h2').map((i, el) => $(el).text().trim()).get();
        const h3s = $('h3').map((i, el) => $(el).text().trim()).get();
        const title = $('title').text().trim();
        const metaDesc = $('meta[name="description"]').attr('content');
        const metaKeywords = $('meta[name="keywords"]').attr('content');

        // Extraemos texto del contenido (limpiando scripts y estilos)
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('header').remove();
        $('footer').remove();
        const contentText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1500); // Primeros 1500 chars

        // Extraemos enlaces internos para detectar sus servicios
        const links = $('a').map((i, el) => ({
            text: $(el).text().trim(),
            href: $(el).attr('href')
        })).get().filter(l => l.text.length > 3 && l.href && !l.href.startsWith('http'));

        return {
            url,
            title,
            metaDesc,
            metaKeywords,
            h1,
            contentText, // Texto real de la web
            structure: { h2s: h2s.slice(0, 8), h3s: h3s.slice(0, 5) }, // Limitamos para no saturar a Gemini
            possibleServices: links.slice(0, 10) // Muestra de enlaces
        };

    } catch (error) {
        console.log(`⚠️ No se pudo acceder a ${url}: ${error.message}`);
        return null;
    }
}