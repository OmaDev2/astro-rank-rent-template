import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function exportClient() {
    // 1. Obtener nombre del cliente (argumento o default)
    const clientName = process.argv[2];
    if (!clientName) {
        console.error('❌ Por favor, especifica el nombre del cliente/carpeta.');
        console.error('   Ejemplo: npm run export cliente-pintores-bcn');
        process.exit(1);
    }

    const currentDir = process.cwd();
    const targetDir = path.resolve(currentDir, '..', clientName);

    console.log(`📦 EXPORTANDO PROYECTO A: ${targetDir}`);

    try {
        // 2. Crear directorio destino
        await fs.mkdir(targetDir, { recursive: true });

        // 3. Copiar archivos base (Excluyendo node_modules, .git, dist, scripts, etc.)
        // Usamos rsync si está disponible (Mac/Linux) para facilitar las exclusiones
        const excludeList = [
            'node_modules',
            '.git',
            '.astro',
            'dist',
            'scripts', // ⛔️ AQUÍ BORRAMOS LA IA
            '.env',
            'project_plan.json',
            'clustering_analysis.md',
            'package-lock.json',
            '.DS_Store'
        ];

        const excludeString = excludeList.map(item => `--exclude '${item}'`).join(' ');

        console.log('   ⏳ Copiando archivos...');
        await execAsync(`rsync -av --progress ${excludeString} . "${targetDir}"`);

        // 4. LIMPIEZA ESPECÍFICA EN DESTINO
        console.log('   🧹 Limpiando "Salsa Secreta" (Scripts de IA)...');

        // SOLO borramos la carpeta scripts, que es donde está la IA y los Prompts.
        // MANTENEMOS Keystatic para poder editar la web en el futuro.
        const filesToRemove = [
            'scripts', // ⛔️ AQUÍ BORRAMOS LA IA
            'project_plan.json', // Borramos el plan de generación
            'clustering_analysis.md' // Borramos el análisis
        ];

        for (const file of filesToRemove) {
            const fullPath = path.join(targetDir, file);
            await fs.rm(fullPath, { recursive: true, force: true }).catch(() => { });
        }

        // 5. LIMPIAR PACKAGE.JSON
        console.log('   📝 Ajustando package.json...');
        const pkgPath = path.join(targetDir, 'package.json');
        const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));

        // Eliminar scripts de generación y reset
        delete pkgData.scripts['reset'];
        delete pkgData.scripts['export'];
        // Podríamos eliminar dependencias de IA si las hubiera en dependencies (suelen estar en scripts)

        await fs.writeFile(pkgPath, JSON.stringify(pkgData, null, 4));

        // 6. INICIALIZAR GIT NUEVO
        console.log('   git Inicializando repositorio limpio...');
        await execAsync(`cd "${targetDir}" && git init`);

        console.log('\n✅ EXPORTACIÓN COMPLETADA CON ÉXITO');
        console.log(`👉 Tu proyecto limpio está en: ${targetDir}`);
        console.log('   Pasos siguientes:');
        console.log(`   1. cd "${targetDir}"`);
        console.log('   2. npm install');
        console.log('   3. git add . && git commit -m "Initial commit"');
        console.log('   4. Subir a GitHub y conectar a Netlify.');

    } catch (error) {
        console.error('❌ Error durante la exportación:', error);
    }
}

exportClient();
