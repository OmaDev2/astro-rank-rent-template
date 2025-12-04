
import { generateSmartClusters } from './logic/keyword_researcher_v2.js';
import fs from 'fs';

async function runTest() {
    console.log('🚀 Iniciando prueba de Fase 1...');

    try {
        const result = await generateSmartClusters(
            'herrero',
            'barcelona',
            ['www.herreriabarcelona.com', 'puertasdehierro.es', 'tuherrerobarcelona.com'],
            'Barcelona', // Location name or code, logic handles it. passing name to be safe as per logic
            {
                specificServices: ['rejas', 'puertas metálicas', 'barandillas', 'cerrajería']
            }
        );

        console.log('✅ Prueba completada exitosamente');
        console.log('📊 Clusters generados:', result.clusters.length);
        result.clusters.forEach(c => {
            console.log(`   - ${c.name} (${c.keywords.length} keywords)`);
        });

        // Save result to inspect
        fs.writeFileSync('test_phase1_result.json', JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

runTest();
