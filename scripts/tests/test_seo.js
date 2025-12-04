// import { getSerpResults } from './lib/seo_client.js'; // Comentado porque no existe y no se usa en este test
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const AUTH = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');

async function testApi() {
    console.log("📡 Probando conexión con DataForSEO...");

    // Prueba directa sin usar tu librería para descartar fallos
    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
            headers: { 'Authorization': `Basic ${AUTH}`, 'Content-Type': 'application/json' },
            data: [{ language_code: "es", location_name: "Spain", keyword: "fontanero madrid" }]
        });

        if (response.data.tasks[0].status_code === 20000) {
            console.log("✅ Conexión EXITOSA. DataForSEO responde.");
            const items = response.data.tasks[0].result[0].items;
            console.log(`   Encontrados ${items.length} resultados.`);
        } else {
            console.log("❌ ERROR API:", response.data.tasks[0].status_message);
        }
    } catch (e) {
        console.log("❌ ERROR RED:", e.message);
    }
}

testApi();