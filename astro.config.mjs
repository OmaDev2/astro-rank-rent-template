import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';

// NOTA: He eliminado la importación de 'node' porque causaba el error en Netlify

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio
  site: 'https://herrerozaragoza.com',

  // 🔗 Trailing slash: siempre con barra al final (bueno para SEO)
  trailingSlash: 'always',

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

  // ✅ MODO ESTÁTICO: Esto generará archivos .html que Netlify entiende perfectamente
  output: 'static',

  // HE BORRADO EL "adapter: node(...)". 
  // Al quitarlo, Astro usará el modo estático por defecto y Netlify funcionará.
});