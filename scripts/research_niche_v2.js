#!/usr/bin/env node
/**
 * 🚀 SMART NICHE RESEARCHER v2.0
 * 
 * Script mejorado para investigación de nichos con:
 * - Filtrado inteligente por ciudad
 * - Clasificación de intención (commercial/informational)
 * - Clustering semántico avanzado
 * - Soporte para location codes de DataForSEO
 * 
 * Uso:
 *   node research_niche_v2.js
 *   node research_niche_v2.js --niche "quitar gotele" --city "Barcelona"
 */

import {
    getTopCompetitors,
    searchLocations,
    getLocationCode
} from './lib/seo_client_v2.js';
import { generateSmartClusters } from './logic/keyword_researcher_v2.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import readline from 'readline';

dotenv.config();

// ============================================================================
// CONFIGURACIÓN DEL PROYECTO
// ============================================================================

// Puedes cambiar estos valores directamente o usar argumentos de línea de comandos
const DEFAULT_CONFIG = {
    niche: "quitar gotele",           // Servicio principal
    city: "Barcelona",                 // Ciudad objetivo
    location: "barcelona",             // Para DataForSEO (se convierte a location_code)
    top10Filter: true,                 // Solo keywords donde competidor está en TOP 10
    minRelevanceScore: 5,              // Score mínimo (aumentado para SEO local estricto)
    includeInformational: false,       // Solo comercial para SEO local
    maxCompetitors: 10                 // Máximo de competidores a analizar
};

// ============================================================================
// PARSER DE ARGUMENTOS
// ============================================================================

function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    for (let i = 0; i < args.length; i += 2) {
        const key = args[i]?.replace('--', '');
        const value = args[i + 1];

        if (key && value) {
            switch (key) {
                case 'niche':
                    config.niche = value;
                    break;
                case 'city':
                    config.city = value;
                    config.location = value.toLowerCase();
                    break;
                case 'location':
                    config.location = value;
                    break;
                case 'top10':
                    config.top10Filter = value.toLowerCase() === 'true';
                    break;
                case 'min-relevance':
                    config.minRelevanceScore = parseInt(value) || 3;
                    break;
                case 'include-info':
                    config.includeInformational = value.toLowerCase() === 'true';
                    break;
            }
        }
    }

    return config;
}

// ============================================================================
// INTERFAZ INTERACTIVA
// ============================================================================

async function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function selectCompetitors(competitors) {
    console.log('\n📋 COMPETIDORES ENCONTRADOS:\n');
    competitors.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.domain}`);
        console.log(`      ${c.title}`);
        console.log(`      ${c.url}\n`);
    });

    console.log('💡 Opciones:');
    console.log('   - Presiona ENTER para usar todos');
    console.log('   - Escribe números separados por coma (ej: 1,3,5,7)');
    console.log('   - Escribe "skip" seguido de números para excluir (ej: skip 2,4)\n');

    const answer = await promptUser('Selección: ');

    if (!answer) {
        return competitors.map(c => c.domain);
    }

    if (answer.toLowerCase().startsWith('skip')) {
        const skipIndices = answer.replace('skip', '').trim()
            .split(',')
            .map(n => parseInt(n.trim()) - 1);
        return competitors
            .filter((_, i) => !skipIndices.includes(i))
            .map(c => c.domain);
    }

    const selectedIndices = answer.split(',')
        .map(n => parseInt(n.trim()) - 1)
        .filter(n => n >= 0 && n < competitors.length);

    return selectedIndices.map(i => competitors[i].domain);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('🚀 SMART NICHE RESEARCHER v2.0');
    console.log('═'.repeat(60) + '\n');

    // Parsear configuración
    const config = parseArgs();

    console.log('📋 CONFIGURACIÓN:');
    console.log(`   Nicho: ${config.niche}`);
    console.log(`   Ciudad: ${config.city}`);
    console.log(`   Location: ${config.location}`);
    console.log(`   TOP 10 Filter: ${config.top10Filter}`);
    console.log(`   Min Relevance: ${config.minRelevanceScore}`);
    console.log(`   Include Informational: ${config.includeInformational}\n`);

    // Verificar API keys
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
        console.error('❌ Error: Falta configuración de DataForSEO en .env');
        console.error('   Añade DATAFORSEO_LOGIN y DATAFORSEO_PASSWORD');
        process.exit(1);
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ Error: Falta GEMINI_API_KEY en .env');
        process.exit(1);
    }

    // ========================================================================
    // PASO 1: Obtener competidores
    // ========================================================================

    console.log('🔍 PASO 1: Buscando competidores en Google SERP...\n');

    const searchQuery = `${config.niche} ${config.city}`;
    const locationCode = getLocationCode(config.location);

    console.log(`   Query: "${searchQuery}"`);
    console.log(`   Location Code: ${locationCode}\n`);

    const competitors = await getTopCompetitors(searchQuery, locationCode);

    if (competitors.length === 0) {
        console.error('❌ No se encontraron competidores. Verifica:');
        console.error('   - Que el nicho y ciudad sean correctos');
        console.error('   - Que las credenciales de DataForSEO sean válidas');
        process.exit(1);
    }

    // Selección interactiva de competidores
    const selectedDomains = await selectCompetitors(competitors);

    console.log(`\n✅ Competidores seleccionados: ${selectedDomains.length}`);
    selectedDomains.forEach(d => console.log(`   - ${d}`));

    // ========================================================================
    // PASO 2: Generar clusters
    // ========================================================================

    console.log('\n🧠 PASO 2: Generando clusters inteligentes...\n');

    try {
        const plan = await generateSmartClusters(
            config.niche,
            config.city,
            selectedDomains,
            config.location,
            {
                top10Filter: config.top10Filter,
                minRelevanceScore: config.minRelevanceScore,
                includeInformational: config.includeInformational,
                maxKeywordsForAI: 150
            }
        );

        // ====================================================================
        // PASO 3: Mostrar resumen
        // ====================================================================

        console.log('\n' + '═'.repeat(60));
        console.log('📊 RESUMEN DEL PLAN GENERADO');
        console.log('═'.repeat(60) + '\n');

        console.log(`📝 Análisis de Mercado:`);
        console.log(`   ${plan.market_analysis}\n`);

        console.log(`🎯 Clusters de Servicio (${plan.clusters?.filter(c => c.intent === 'COMMERCIAL').length || 0}):\n`);

        plan.clusters?.filter(c => c.intent === 'COMMERCIAL').forEach((cluster, i) => {
            console.log(`   ${i + 1}. ${cluster.name}`);
            console.log(`      Main KW: ${cluster.main_keyword}`);
            console.log(`      Volumen: ${cluster.volume?.toLocaleString()} búsquedas/mes`);
            console.log(`      Keywords: ${cluster.keywords?.length || 0}`);
            console.log('');
        });

        const infoClusters = plan.clusters?.filter(c => c.intent === 'INFORMATIONAL') || [];
        if (infoClusters.length > 0) {
            console.log(`📚 Clusters Informativos (${infoClusters.length}):\n`);
            infoClusters.forEach((cluster, i) => {
                console.log(`   ${i + 1}. ${cluster.name}`);
                console.log(`      Main KW: ${cluster.main_keyword}`);
                console.log(`      Volumen: ${cluster.volume?.toLocaleString()}`);
                console.log('');
            });
        }

        if (plan.locations?.length > 0) {
            console.log(`📍 Zonas/Barrios sugeridos:`);
            plan.locations.forEach(loc => console.log(`   - ${loc}`));
            console.log('');
        }

        console.log('═'.repeat(60));
        console.log('💾 ARCHIVOS GENERADOS:');
        console.log('   - project_plan.json (plan completo)');
        console.log('   - clustering_analysis.md (análisis detallado)');
        console.log('═'.repeat(60) + '\n');

        console.log('✨ ¡Listo! Ahora puedes ejecutar generate_site.js para crear el sitio.\n');

    } catch (error) {
        console.error('❌ Error durante el clustering:', error.message);
        process.exit(1);
    }
}

// Ejecutar
main().catch(console.error);
