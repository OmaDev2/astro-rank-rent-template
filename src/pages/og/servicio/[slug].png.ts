import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { getSettings } from '@/lib/settings';
import { generateOgImage } from '@/lib/og';

export const prerender = true;

export async function getStaticPaths() {
    const services = await getCollection('services');
    return services.map(entry => ({
        params: { slug: entry.slug },
        props: { title: entry.data.title, shortDesc: entry.data.shortDesc },
    }));
}

export const GET: APIRoute = async ({ props }) => {
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

    const png = await generateOgImage({
        label: settings.niche,
        title: (props as any).title,
        subtitle: (props as any).shortDesc || `en ${settings.city}`,
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
