import fs from 'fs/promises';
import path from 'path';

export const POST = async ({ request }) => {
    try {
        const plan = await request.json();

        // Validación básica
        if (!plan || !plan.niche || !plan.city) {
            return new Response(JSON.stringify({
                error: "El plan es inválido: faltan datos requeridos (niche, city)."
            }), { status: 400 });
        }

        // Guardar el plan en la raíz del proyecto
        const filePath = path.resolve('project_plan.json');
        await fs.writeFile(filePath, JSON.stringify(plan, null, 2));

        console.log(`💾 Plan guardado manualmente en: ${filePath}`);

        return new Response(JSON.stringify({
            success: true,
            message: "Plan guardado correctamente"
        }), { status: 200 });

    } catch (e) {
        console.error("❌ Error guardando el plan:", e);
        return new Response(JSON.stringify({
            success: false,
            error: e.message
        }), { status: 500 });
    }
}
