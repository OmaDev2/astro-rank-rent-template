import { searchLocations } from './lib/seo_client.js';

async function testLocations() {
    console.log('🧪 Probando búsqueda de ubicaciones...\n');

    // Test 1: Buscar Barcelona
    console.log('1️⃣ Buscando "Barcelona"...');
    const barcelona = await searchLocations('Barcelona');
    console.log('Resultados:', JSON.stringify(barcelona, null, 2));
    console.log('\n---\n');

    // Test 2: Buscar Madrid
    console.log('2️⃣ Buscando "Madrid"...');
    const madrid = await searchLocations('Madrid');
    console.log('Resultados:', JSON.stringify(madrid, null, 2));
    console.log('\n---\n');

    // Test 3: Buscar Spain
    console.log('3️⃣ Buscando "Spain"...');
    const spain = await searchLocations('Spain');
    console.log('Resultados:', JSON.stringify(spain, null, 2));
}

testLocations().catch(console.error);
