#!/usr/bin/env node

/**
 * Script de ayuda para generar sitios Rank & Rent con IA
 * 
 * Uso:
 *   node scripts/utils/help.js
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🚀 GENERADOR DE SITIOS RANK & RENT CON IA                   ║
╚═══════════════════════════════════════════════════════════════╝

📋 WORKFLOW COMPLETO:

1️⃣  INVESTIGACIÓN DE NICHO
   Comando: node scripts/research_niche.js
   
   Qué hace:
   - Busca competidores en Google usando DataForSEO
   - Analiza su estructura SEO (H1, H2, H3, meta tags)
   - Genera con IA una estrategia de servicios y ubicaciones
   - Guarda el plan en: project_plan.json
   
   ⚙️  Configura tu nicho en: scripts/research_niche.js
   const PROJECT = {
       niche: "Tu Servicio",
       city: "Tu Ciudad",
       targetAudience: "Tu Audiencia"
   };

2️⃣  GENERACIÓN DE PÁGINAS
   Comando: node scripts/generate_site.js
   
   Qué hace:
   - Lee el plan de project_plan.json
   - Genera contenido SEO con Gemini 2.5 Flash
   - Crea archivos MDX en src/content/services/
   - Crea archivos MDX en src/content/locations/
   - Configura Keystatic automáticamente
   
   ⏱️  Tiempo estimado: ~2 minutos (con rate limiting)

3️⃣  DESARROLLO LOCAL
   Comando: npm run dev
   
   Accede a:
   - Web: http://localhost:4321
   - Keystatic CMS: http://localhost:4321/keystatic

╔═══════════════════════════════════════════════════════════════╗
║  🔧 CONFIGURACIÓN REQUERIDA                                   ║
╚═══════════════════════════════════════════════════════════════╝

Archivo .env necesario:

GEMINI_API_KEY=tu_api_key_aqui
DATAFORSEO_LOGIN=tu_login_aqui
DATAFORSEO_PASSWORD=tu_password_aqui

📚 Obtener API Keys:
- Gemini: https://ai.google.dev/
- DataForSEO: https://dataforseo.com/

╔═══════════════════════════════════════════════════════════════╗
║  📊 MODELOS GEMINI DISPONIBLES                                ║
╚═══════════════════════════════════════════════════════════════╝

✅ gemini-2.5-flash      (Recomendado - Rápido y económico)
✅ gemini-2.0-flash-exp  (Experimental)
❌ gemini-1.5-flash      (Deprecado)
❌ gemini-pro            (No disponible)

Para cambiar el modelo, edita: scripts/generate_site.js
Línea 10: model: "gemini-2.5-flash"

╔═══════════════════════════════════════════════════════════════╗
║  ⚠️  SOLUCIÓN DE PROBLEMAS                                    ║
╚═══════════════════════════════════════════════════════════════╝

❌ Error: "Quota exceeded"
   → Solución: Espera 1 minuto o actualiza tu plan de API

❌ Error: "Model not found"
   → Solución: Usa gemini-2.5-flash en generate_site.js

❌ No se generan archivos
   → Solución: Revisa los logs de error en la consola
   → Verifica que GEMINI_API_KEY esté configurada

❌ DataForSEO no responde
   → Solución: Verifica credenciales en .env
   → Revisa límites de tu plan

╔═══════════════════════════════════════════════════════════════╗
║  📁 ESTRUCTURA DE ARCHIVOS GENERADOS                          ║
╚═══════════════════════════════════════════════════════════════╝

src/content/
├── services/          ← Páginas de servicios (MDX)
├── locations/         ← Páginas de ubicaciones (MDX)
├── business/          ← Configuración global (JSON)
└── pages/             ← Configuración de páginas (JSON)

╔═══════════════════════════════════════════════════════════════╗
║  🎯 PRÓXIMOS PASOS DESPUÉS DE GENERAR                         ║
╚═══════════════════════════════════════════════════════════════╝

1. Revisa el contenido generado en Keystatic CMS
2. Personaliza textos, imágenes y CTAs
3. Configura datos de contacto reales
4. Genera imágenes optimizadas para servicios
5. Configura Google Analytics y Search Console
6. Deploy a Netlify o Vercel

╔═══════════════════════════════════════════════════════════════╗
║  📖 DOCUMENTACIÓN                                             ║
╚═══════════════════════════════════════════════════════════════╝

- README.md           → Guía general del template
- SETUP_GUIDE.md      → Configuración paso a paso
- docs/               → Documentación adicional

¿Necesitas ayuda? Revisa los logs de error o contacta soporte.

`);
