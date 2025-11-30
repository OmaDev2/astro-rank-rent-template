import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const POST = async ({ request }) => {
    try {
        const plan = await request.json();

        // 1. Guardamos el plan aprobado por el humano como el plan definitivo
        await fs.writeFile('project_plan.json', JSON.stringify(plan, null, 2));
        console.log("💾 Plan aprobado guardado desde el Dashboard.");

        // 2. Ejecutamos el script generador en segundo plano
        // Nota: En producción esto debería ser un worker, pero en local funciona así.
        // Usamos un comando de shell para lanzar el script que ya tienes
        console.log("🚀 Lanzando constructor...");

        // Ejecutamos el script y esperamos el resultado
        const { stdout, stderr } = await execPromise('node scripts/generate_site.js');

        console.log(stdout);
        if (stderr) console.error(stderr);

        return new Response(JSON.stringify({
            success: true,
            message: "Sitio generado correctamente",
            logs: stdout
        }), { status: 200 });

    } catch (e) {
        console.error("❌ Generation Error:", e);
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}