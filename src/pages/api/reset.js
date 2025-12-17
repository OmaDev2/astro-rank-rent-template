
import fs from 'fs/promises';
import path from 'path';

export const POST = async ({ request }) => {
    console.log('🗑️  API: INICIANDO RESET DEL PROYECTO...');

    const pathsToDelete = [
        'src/content/pages/home.mdx',
        'src/content/services',
        'src/content/locations',
        'src/content/blog',
        'project_plan.json',
        'clustering_analysis.md'
    ];

    const deletedItems = [];
    const errors = [];

    for (const p of pathsToDelete) {
        try {
            const fullPath = path.resolve(process.cwd(), p);
            const stats = await fs.stat(fullPath).catch(() => null);

            if (stats) {
                if (stats.isDirectory()) {
                    await fs.rm(fullPath, { recursive: true, force: true });
                    // Recrear la carpeta vacía para que no de error Astro
                    await fs.mkdir(fullPath, { recursive: true });
                    deletedItems.push(`Carpeta vaciada: ${p}`);
                } else {
                    await fs.unlink(fullPath);
                    deletedItems.push(`Archivo eliminado: ${p}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error al eliminar ${p}:`, error);
            errors.push(`Error eliminando ${p}: ${error.message}`);
        }
    }

    if (errors.length > 0) {
        return new Response(JSON.stringify({ success: false, deleted: deletedItems, errors }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, deleted: deletedItems }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
