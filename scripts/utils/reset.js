import fs from 'fs/promises';
import path from 'path';

async function resetProject() {
    console.log('🗑️  INICIANDO RESET DEL PROYECTO...');

    const pathsToDelete = [
        'src/content/pages/home.mdx',
        'src/content/services', // Borraremos la carpeta entera y la recrearemos
        'src/content/locations', // ✅ Borramos también las zonas generadas
        'src/content/blog', // ✅ Borramos el blog antiguo
        'project_plan.json',
        'clustering_analysis.md'
    ];

    for (const p of pathsToDelete) {
        try {
            const fullPath = path.resolve(process.cwd(), p);
            const stats = await fs.stat(fullPath).catch(() => null);

            if (stats) {
                if (stats.isDirectory()) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    // Recrear la carpeta vacía para que no de error Astro
                    await fs.mkdir(fullPath);
                    console.log(`✅ Carpeta vaciada: ${p}`);
                } else {
                    await fs.unlink(fullPath);
                    console.log(`✅ Archivo eliminado: ${p}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error al eliminar ${p}:`, error);
        }
    }

    console.log('\n✨ PROYECTO LIMPIO. Listo para la siguiente web.');
    console.log('👉 Siguiente paso: Edita src/data/settings.json y lanza el generador.');
}

resetProject();
