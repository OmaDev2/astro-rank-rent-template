import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  // 🌐 Dominio final del sitio (crucial para sitemap y canonicals)
  site: 'https://herrerozaragoza.com',

  // 🔗 Trailing slash: siempre con barra al final
  trailingSlash: 'always',

  integrations: [react(), keystatic(), mdx(), tailwind(), sitemap({
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
  output: 'static',

  adapter: node({
    mode: 'standalone'
  }),

  // ==========================================================
  // 💡 Configuración del servidor para acceso remoto
  // ==========================================================
  server: {
    // Establece 'host' a true para que el servidor escuche en 0.0.0.0
    // Esto permite que otros dispositivos en tu red local (móvil, tablet)
    // puedan acceder a tu Mac a través de su dirección IP.
    host: true,
  }
  // ==========================================================
});