import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import robotsTxt from 'astro-robots-txt';

// ── Keystatic: solo en desarrollo ────────────────────────────
// En producción no queremos el panel admin ni sus rutas /keystatic
const isDev = process.env.NODE_ENV !== 'production';
let keystatic;
if (isDev) {
  keystatic = (await import('@keystatic/astro')).default;
}

// Leer siteUrl desde global.yaml manualmente (no podemos usar astro:content aquí)
function getSiteUrl() {
  try {
    const fileContent = fs.readFileSync('./src/content/business/global.yaml', 'utf-8');
    const match = fileContent.match(/siteUrl:\s*['"]?(.*?)['"]?\s*$/m);
    const url = match ? match[1].trim() : '';
    return url || 'https://localhost:4321';
  } catch (e) {
    return 'https://localhost:4321';
  }
}

const siteUrl = getSiteUrl();

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio
  site: siteUrl,

  // 🔗 Trailing slash: ignorar para evitar conflictos con el CMS
  trailingSlash: 'ignore',

  image: {
    domains: ["images.unsplash.com"],
  },

  integrations: [
    react(),
    // Keystatic solo en desarrollo — en producción no se genera /keystatic
    ...(isDev && keystatic ? [keystatic()] : []),
    mdx(),
    tailwind(),
    sitemap({
      filter: (page) =>
        !page.includes('/aviso-legal') &&
        !page.includes('/privacidad') &&
        !page.includes('/cookies') &&
        !page.includes('/gracias') &&
        !page.includes('/404') &&
        !page.includes('/keystatic') &&
        !page.includes('/_keystatic') &&
        !page.includes('/admin') &&
        !page.includes('/api') &&
        !page.includes('/generar'),
      serialize(item) {
        const lastmod = new Date().toISOString().split('T')[0];
        // Home — máxima prioridad
        if (item.url === siteUrl + '/' || item.url === siteUrl) {
          return { ...item, changefreq: 'weekly', priority: 1.0, lastmod };
        }
        // Zonas individuales — money pages del rank & rent
        if (item.url.includes('/zona/')) {
          return { ...item, changefreq: 'monthly', priority: 0.9, lastmod };
        }
        // Hub de zonas
        if (item.url.includes('/zonas')) {
          return { ...item, changefreq: 'monthly', priority: 0.7, lastmod };
        }
        // Servicios individuales
        if (item.url.match(/\/servicios\/[^/]+/)) {
          return { ...item, changefreq: 'monthly', priority: 0.8, lastmod };
        }
        // Hub de servicios
        if (item.url.includes('/servicios')) {
          return { ...item, changefreq: 'monthly', priority: 0.7, lastmod };
        }
        // Blog posts
        if (item.url.match(/\/blog\/[^/]+/)) {
          return { ...item, changefreq: 'weekly', priority: 0.7, lastmod };
        }
        // Blog index
        if (item.url.includes('/blog')) {
          return { ...item, changefreq: 'weekly', priority: 0.6, lastmod };
        }
        // Nosotros, contacto, proyectos
        return { ...item, changefreq: 'monthly', priority: 0.5, lastmod };
      },
    }),
    robotsTxt({
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/keystatic/',
            '/_keystatic/',
            '/admin/',
            '/api/',
            '/gracias/',
            '/generar/',
          ],
        },
        // Bloquear bots de IA (protección de contenido)
        { userAgent: 'GPTBot',        disallow: '/' },
        { userAgent: 'ChatGPT-User',  disallow: '/' },
        { userAgent: 'CCBot',         disallow: '/' },
        { userAgent: 'anthropic-ai',  disallow: '/' },
        { userAgent: 'Claude-Web',    disallow: '/' },
        { userAgent: 'Bytespider',    disallow: '/' },
      ],
      sitemap: true,
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],

  // ✅ MODO STATIC con SSR opt-in por ruta (equivalente al antiguo 'hybrid' en Astro v5)
  output: 'static',
  // El adaptador de Netlify en dev intercepta /_keystatic/api/* y rompe Keystatic.
  // Solo se carga en producción (build).
  adapter: isDev ? undefined : netlify({ imageCDN: true }),

  vite: {
    ssr: {
      // Solo necesario en dev para Keystatic
      noExternal: isDev ? ['@keystatic/core', '@keystatic/astro', '@keystar/ui'] : [],
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  }
});