import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSettings } from '@/lib/settings';

export const prerender = true;

// Escapado XML seguro para títulos/descripciones.
const esc = (s = '') =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
    const settings = await getSettings();
    const base = (site?.href || settings.siteUrl || '').replace(/\/$/, '');

    // Colección blog (vacía por defecto → feed válido sin items; se rellena al activar el blog).
    const posts = await getCollection('blog').catch(() => []);
    const items = posts
        .map((p: any) => ({
            title: p.data.title || p.id,
            slug: p.slug || p.id,
            description: p.data.description || p.data.intro || '',
            pubDate: p.data.pubDate ? new Date(p.data.pubDate) : null,
        }))
        .sort((a, b) => (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0));

    const itemsXml = items.map((it) => `
    <item>
      <title>${esc(it.title)}</title>
      <link>${base}/blog/${it.slug}/</link>
      <guid>${base}/blog/${it.slug}/</guid>
      ${it.description ? `<description>${esc(it.description)}</description>` : ''}
      ${it.pubDate ? `<pubDate>${it.pubDate.toUTCString()}</pubDate>` : ''}
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(settings.siteName || '')} — Blog</title>
    <link>${base}/blog/</link>
    <description>${esc(settings.slogan || `Novedades de ${settings.siteName || ''}`)}</description>
    <language>es-ES</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};
