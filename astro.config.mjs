import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

import netlify from '@astrojs/netlify';

// NOTA: He eliminado la importación de 'node' porque causaba el error en Netlify

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio
  site: process.env.PUBLIC_SITE_URL || 'https://localhost:4321',

  // 🔗 Trailing slash: siempre con barra al final (bueno para SEO)
  trailingSlash: 'ignore',

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
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    })
  ],

  // ✅ MODO SERVER: SSR completo necesario para Keystatic CMS
  // Keystatic requiere server-side rendering para funcionar correctamente
  output: 'server',

  adapter: netlify(),

  vite: {
    ssr: {
      noExternal: ['@keystatic/core', '@keystatic/astro'],
    }
  }
});