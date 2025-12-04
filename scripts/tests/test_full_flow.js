
import { generateSmartClusters } from './logic/keyword_researcher_v2.js';

async function testFullFlow() {
    console.log('🚀 Iniciando prueba de flujo completo con servicios específicos...');

    // Simulamos los servicios que vendrían del frontend (validación de Gemini)
    const mockDiscoveredServices = [
        "Rejas de ballesta",
        "Puertas blindadas"
    ];

    console.log('📋 Servicios a probar:', mockDiscoveredServices);

    try {
        const result = await generateSmartClusters(
            'herrero',
            'barcelona',
            ['www.herreriabarcelona.com'], // Un competidor para no tardar mucho
            'Barcelona',
            {
                top10Filter: true,
                minRelevanceScore: 5,
                minSearchVolume: 10,
                specificServices: mockDiscoveredServices // ✅ Aquí pasamos los servicios
            }
        );

        console.log('\n✅ Prueba completada.');
        console.log('📊 Clusters generados:', result.clusters.length);

        // Verificar si hay keywords relacionadas con los servicios
        const keywords = result.clusters.flatMap(c => c.keywords);

        const hasRejas = keywords.some(k => k.keyword.includes('ballesta'));
        const hasPuertas = keywords.some(k => k.keyword.includes('blindada') || k.keyword.includes('puerta'));

        console.log(`\n🔍 Verificación de servicios:`);
        console.log(`   - Contiene "ballesta": ${hasRejas ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   - Contiene "blindada/puerta": ${hasPuertas ? '✅ SÍ' : '❌ NO'}`);

        if (result.stats.fromServices > 0) {
            console.log(`   - Stats fromServices: ${result.stats.fromServices} ✅ (El backend procesó los servicios)`);
        } else {
            console.log(`   - Stats fromServices: 0 ❌ (El backend NO procesó los servicios o no encontró nada)`);
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

testFullFlow();
