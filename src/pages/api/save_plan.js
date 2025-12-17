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

export const GET = async ({ request }) => {
    try {
        const filePath = path.resolve('project_plan.json');

        console.log(`📂 Reading plan from: ${filePath}`);

        try {
            await fs.access(filePath);
        } catch (e) {
            console.error(`❌ Plan file not found at ${filePath}`);
            return new Response(JSON.stringify({ error: 'Plan not found' }), { status: 404 });
        }

        const fileContent = await fs.readFile(filePath, 'utf-8');

        return new Response(fileContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (e) {
        console.error("❌ Error reading plan:", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
