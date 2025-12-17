#!/usr/bin/env node
/**
 * 🚀 SMART NICHE RESEARCHER v2.0
 *
 * Script mejorado para investigación de nichos con:
 * - Filtrado inteligente por ciudad
 * - Clasificación de intención (commercial/informational)
 * - Clustering semántico avanzado
 * - Soporte para location codes de DataForSEO
 */
/**
 * RESEARCH NICHE v2.0 (ESPAÑA & LATAM OPTIMIZED)
 *
 * Uso:
 *   node scripts/research_niche_v2.js --niche "quitar gotele" --city "Barcelona"
 */

import {
    getTopCompetitors,
    searchLocations,
    getLocationCode
} from './lib/seo_client_v2.js';
import { generateSmartClusters } from './logic/keyword_researcher.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import readline from 'readline';

dotenv.config();

// ============================================================================
// CONFIGURACIÓN DEL PROYECTO
// ============================================================================

const DEFAULT_CONFIG = {
    niche: "quitar gotele",
    city: "Barcelona",
    location: "barcelona",
    top10Filter: true,
    minRelevanceScore: 5,
    includeInformational: true,
    maxCompetitors: 10,
    mode: 'standard' // 'standard' or 'microservice'
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
                case 'niche': config.niche = value; break;
                case 'city':
                    config.city = value;
                    config.location = value.toLowerCase();
                    break;
                case 'location': config.location = value; break;
                case 'top10': config.top10Filter = value.toLowerCase() === 'true'; break;
                case 'min-relevance': config.minRelevanceScore = parseInt(value) || 3; break;
                case 'include-info': config.includeInformational = value.toLowerCase() === 'true'; break;
                case 'mode': config.mode = value; break;
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

    const config = parseArgs();


    // Verificación de ENV
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
        console.error('❌ Error: Falta configuración de DataForSEO en .env');
        process.exit(1);
    }
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ Error: Falta GEMINI_API_KEY en .env');
        process.exit(1);
    }

    console.log('📋 CONFIGURACIÓN:');
    console.log(`   Nicho: ${config.niche}`);
    console.log(`   Ciudad: ${config.city}`);
    console.log(`   Location: ${config.location}`);
    console.log(`   Mode: ${config.mode}\n`);

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
        console.error('❌ No se encontraron competidores.');
        process.exit(1);
    }

    // Selección interactiva
    const selectedDomains = await selectCompetitors(competitors);

    console.log(`\n✅ Competidores seleccionados: ${selectedDomains.length}`);
    selectedDomains.forEach(d => console.log(`   - ${d}`));

    // PASO 2: Generar Clusters
    console.log('\n🧠 PASO 2: Generando clusters inteligentes...\n');

    try {
        // ... (call to generateSmartClusters same as before)
        const plan = await generateSmartClusters(
            config.niche,
            config.city,
            selectedDomains,
            config.location,
            {
                top10Filter: config.top10Filter,
                minRelevanceScore: config.minRelevanceScore,
                includeInformational: true, // Siempre true ahora para el blog
                maxKeywordsForAI: 150
            }
        );

        // ... (Summary logging adapted to new structure)
        console.log('\n' + '═'.repeat(60));
        console.log('📊 RESUMEN DEL PLAN GENERADO');
        console.log('═'.repeat(60) + '\n');

        const serviceClusters = plan.clusters?.filter(c => c.type === 'SERVICE') || [];
        const blogClusters = plan.clusters?.filter(c => c.type === 'BLOG') || [];

        console.log(`🎯 SERVICIOS (${serviceClusters.length}):\n`);
        serviceClusters.forEach((cluster, i) => {
            console.log(`   ${i + 1}. ${cluster.name} (${cluster.keywords.length} kws)`);
        });

        console.log(`\n📚 BLOG TOPICS (${blogClusters.length}):\n`);
        blogClusters.forEach((cluster, i) => {
            console.log(`   ${i + 1}. ${cluster.name} (${cluster.keywords.length} kws)`);
        });

        // Save plan
        await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));
        console.log('\n💾 Plan guardado en project_plan.json');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main().catch(console.error);
