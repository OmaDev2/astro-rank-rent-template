
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

console.log("🧪 TESTING CSV PARSER LOGIC...\n");

const filePath = '/Users/olga/DESARROLLO/WEB_PROYECTOS/Template_RANK AND RENT/kwfinder_gote_export.csv';

function importKeywordsFromCSV(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo CSV no existe: ${filePath}`);
    }

    let fileContent = fs.readFileSync(filePath, 'utf8');

    // 1. Eliminar BOM
    fileContent = fileContent.replace(/^\uFEFF/, '');
    console.log(`   📂 Archivo leído. Bytes: ${fileContent.length}`);

    // 2. Detectar delimitador (force comma approach if looks like standard csv)
    const firstLine = fileContent.split('\n')[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    let delimiter = ',';
    // Si hay muchos más ; que , usamos ;
    if (semicolonCount > commaCount && semicolonCount > 2) delimiter = ';';

    console.log(`   🔍 CSV Debug: Detected Delimiter: "${delimiter}" (Commas: ${commaCount}, Semicolons: ${semicolonCount})`);

    // Parseo síncrono
    const records = parse(fileContent, {
        columns: false, // Control manual
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_column_count: true,
        relax_quotes: true,
        quote: '"'
    });

    console.log(`   🔍 Total Rows Parsed: ${records.length}`);
    if (records.length === 0) return [];

    // 4. Detectar Header real
    const firstRow = records[0];
    const firstCol = String(firstRow[0]).trim().toLowerCase();
    console.log('   🔍 Row 0, Cell 0:', firstCol);

    let hasHeader = false;
    // La primera columna se llama "Keyword"
    if (firstCol.includes('keyword') || firstCol.includes('word') || firstCol.includes('palabra')) {
        hasHeader = true;
        console.log('   ✅ Header Detected: YES');
    } else {
        console.log('   ❌ Header Detected: NO (Will use fallbacks if implemented)');
    }

    const keywords = records.map((row, index) => {
        // Skip header row
        if (hasHeader && index === 0) return null;

        let term = '';
        let vol = 0;
        let cpc = 0;
        let kd = 0; // Keyword Difficulty

        if (hasHeader) {
            // Mapeo EXACTO basado en la inspección del usuario
            // 0: Keyword
            // 1: Volume
            // 6: CPC
            // 8: KD
            term = row[0];
            vol = row[1];
            cpc = row[6];
            kd = row[8];
        } else {
            term = row[0];
            vol = row[1];
            cpc = row[6];
            kd = row[8];
        }

        // Output raw data for first 3 rows to debug
        if (index < 4) {
            console.log(`\n   --- Row ${index} Raw ---`);
            console.log(`   [0] Keyword: ${row[0]}`);
            console.log(`   [1] Volume:  ${row[1]}`);
            console.log(`   [6] CPC:     ${row[6]}`);
            console.log(`   [7] PPC (old): ${row[7]}`);
            console.log(`   [8] KD (new):  ${row[8]}`);
        }

        // Limpieza y Conversión
        if (!term || typeof term !== 'string' || term.length < 2) return null;
        term = term.replace(/^["']|["']$/g, '').trim();

        // Numeros
        if (typeof vol === 'string') vol = parseInt(vol.replace(/[^0-9]/g, ''), 10);
        if (typeof cpc === 'string') cpc = parseFloat(cpc.replace(',', '.').replace(/[^0-9.]/g, ''));
        if (typeof kd === 'string') kd = parseInt(kd.replace(/[^0-9]/g, ''), 10);

        const result = {
            keyword: term,
            volume: isNaN(vol) ? 0 : vol,
            cpc: isNaN(cpc) ? 0 : cpc,
            competition: isNaN(kd) ? 0 : kd
        };

        if (index < 4) {
            console.log('   --> Mapped:', result);
        }

        return result;
    }).filter(k => k !== null);

    return keywords;
}

try {
    const data = importKeywordsFromCSV(filePath);
    console.log(`\n✅ RESULTADO FINAL: ${data.length} keywords extraídas.`);
    if (data.length > 0) {
        console.log("First item:", data[0]);
    }
} catch (e) {
    console.error("❌ ERROR CRÍTICO:", e);
}
