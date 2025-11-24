import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_Lmuh2Td-.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image/index.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/keystatic/_---params_.astro.mjs');
const _page3 = () => import('./pages/aviso-legal.astro.mjs');
const _page4 = () => import('./pages/contacto.astro.mjs');
const _page5 = () => import('./pages/cookies.astro.mjs');
const _page6 = () => import('./pages/gracias.astro.mjs');
const _page7 = () => import('./pages/keystatic/_---params_.astro.mjs');
const _page8 = () => import('./pages/nosotros.astro.mjs');
const _page9 = () => import('./pages/privacidad.astro.mjs');
const _page10 = () => import('./pages/proyectos.astro.mjs');
const _page11 = () => import('./pages/zona/_slug_.astro.mjs');
const _page12 = () => import('./pages/zonas.astro.mjs');
const _page13 = () => import('./pages/_slug_.astro.mjs');
const _page14 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["node_modules/@keystatic/astro/internal/keystatic-api.js", _page2],
    ["src/pages/aviso-legal.astro", _page3],
    ["src/pages/contacto.astro", _page4],
    ["src/pages/cookies.astro", _page5],
    ["src/pages/gracias.astro", _page6],
    ["node_modules/@keystatic/astro/internal/keystatic-astro-page.astro", _page7],
    ["src/pages/nosotros.astro", _page8],
    ["src/pages/privacidad.astro", _page9],
    ["src/pages/proyectos.astro", _page10],
    ["src/pages/zona/[slug].astro", _page11],
    ["src/pages/zonas.astro", _page12],
    ["src/pages/[slug].astro", _page13],
    ["src/pages/index.astro", _page14]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "50472861-4e66-4920-afa6-ba4fc941a769"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
