import type { APIRoute } from 'astro';
import { getSettings } from '@/lib/settings';

// Proxy de tracking same-domain: el navegador postea a /api/track y este endpoint
// reenvía al webhook n8n en el servidor. Así el host del webhook NO aparece en el
// HTML de la web (sin footprint entre clones) y no hace falta abrirlo en la CSP.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const settings = await getSettings();
    const webhookUrl = settings.n8nWebhookUrl;

    // Sin webhook configurado: aceptar y descartar (el cliente no necesita saberlo).
    if (!webhookUrl) return new Response(null, { status: 204 });

    let body: string;
    try {
        body = await request.text();
    } catch {
        return new Response(null, { status: 400 });
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': request.headers.get('content-type')
                    || 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body,
            // El beacon del navegador no espera respuesta; 3s de margen es de sobra.
            signal: AbortSignal.timeout(3000),
        });
    } catch {
        // Fallo del webhook: no filtrar detalles al cliente.
    }

    return new Response(null, { status: 204 });
};
