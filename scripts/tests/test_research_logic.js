import { runFullResearch } from './logic/keyword_researcher.js';

async function test() {
    const plan = await runFullResearch('parquetista', 'Barcelona');
    console.log('✅ Research completed');
    console.log(JSON.stringify(plan.raw_data.top_keywords, null, 2));
}

test();
