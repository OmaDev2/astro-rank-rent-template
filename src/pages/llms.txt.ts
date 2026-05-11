import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSettings } from '@/lib/settings';

export const GET: APIRoute = async () => {
    const settings = await getSettings();
    const { siteName, niche, city, siteUrl, phone, email, whatsapp, schedule, slogan, areaServed } = settings;

    const services = await getCollection('services').catch(() => []);
    const locations = await getCollection('locations').catch(() => []);

    const serviceLines = services
        .sort((a, b) => a.data.title.localeCompare(b.data.title, 'es'))
        .map(s => `- **${s.data.title}:** ${s.data.description || s.data.title}`)
        .join('\n');

    const zonaNames = locations.length > 0
        ? locations.map(l => l.data.name || l.id).join(', ')
        : (areaServed as string[])?.join(', ') || city;

    const contactLines = [
        phone    && `- **Teléfono:** ${phone}`,
        whatsapp && `- **WhatsApp:** ${whatsapp}`,
        email    && `- **Email:** ${email}`,
        city     && `- **Ciudad principal:** ${city}`,
        zonaNames && `- **Zona de Servicio:** ${zonaNames}`,
        schedule && `- **Horario:** ${schedule}`,
    ].filter(Boolean).join('\n');

    const navLines = [
        `- Inicio: ${siteUrl}/`,
        `- Servicios: ${siteUrl}/servicios/`,
        `- Zonas: ${siteUrl}/zonas/`,
        `- Blog: ${siteUrl}/blog/`,
        `- Contacto: ${siteUrl}/contacto/`,
        `- Sobre Nosotros: ${siteUrl}/nosotros/`,
    ].join('\n');

    const body = [
        `# ${siteName}${slogan ? ` — ${slogan}` : ''}`,
        '',
        '## Descripción',
        `${siteName} es una empresa local especializada en ${niche} en ${city}.`,
        '',
        services.length > 0 ? '## Servicios Principales' : '',
        services.length > 0 ? serviceLines : '',
        '',
        contactLines ? '## Información de Contacto' : '',
        contactLines,
        '',
        '## Navegación del Sitio',
        navLines,
    ].filter(line => line !== undefined).join('\n').trim();

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
};
