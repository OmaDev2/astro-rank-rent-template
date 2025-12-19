import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';
import robotsTxt from 'astro-robots-txt';

// Leer siteUrl desde global.yaml manualmente (no podemos usar astro:content aquí)
function getSiteUrl() {
  try {
    const fileContent = fs.readFileSync('./src/content/business/global.yaml', 'utf-8');
    const match = fileContent.match(/siteUrl:\s*['"]?(.*?)['"]?\s*$/m);
    return match ? match[1] : 'https://localhost:4321';
  } catch (e) {
    return 'https://localhost:4321';
  }
}

const siteUrl = getSiteUrl();

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio
  site: siteUrl,

  // 🔗 Trailing slash: siempre con barra al final (bueno para SEO)
  trailingSlash: 'ignore',

  image: {
    domains: ["images.unsplash.com"],
  },

  integrations: [
    react(),
    keystatic(),
    mdx(),
    tailwind(),
    sitemap({
      // Excluir páginas legales del sitemap
      filter: (page) =>
        !page.includes('/aviso-legal') &&
        !page.includes('/privacidad') &&
        !page.includes('/cookies')
    }),
    robotsTxt(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],

  // ✅ MODO SERVER: SSR completo necesario para Keystatic CMS
  output: 'static',
  adapter: netlify(),

  vite: {
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
    }
  }
});