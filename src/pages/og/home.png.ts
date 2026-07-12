import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { getSettings } from '@/lib/settings';
import { generateOgImage } from '@/lib/og';

export const prerender = true;

export const GET: APIRoute = async () => {
    const settings = await getSettings();

    let primaryColor = '99 102 241';
    let secondaryColor = '10 10 10';
    try {
        const design = await getEntry('design', 'global');
        const themeState = design?.data?.themeSettings
            ? JSON.parse(design.data.themeSettings as string)
            : null;
        if (themeState?.colors?.primary) primaryColor = themeState.colors.primary;
        if (themeState?.colors?.secondary) secondaryColor = themeState.colors.secondary;
    } catch { /* usa defaults */ }

    const title = settings.niche && settings.city
        ? `${settings.niche} en ${settings.city}`
        : settings.siteName || settings.niche || '';

    const png = await generateOgImage({
        label: settings.city || undefined,
        title,
        subtitle: settings.slogan || 'Presupuesto sin compromiso',
        siteName: settings.siteName,
        primaryColor,
        secondaryColor,
    });

    return new Response(png, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
};
