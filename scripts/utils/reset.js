import fs from 'fs/promises';
import path from 'path';

const GLOBAL_YAML_TEMPLATE = `_spintax: ''
siteName: SITE_NAME
niche: NICHE_DESCRIPTION
businessType: LocalBusiness
siteUrl: https://example.com
ctaText: Pedir Presupuesto
phone: '+34 000 00 00 00'
whatsapp: '34000000000'
email: info@example.com
city: CITY_NAME
coordinates:
  lat: '0.0000'
  lng: '0.0000'
schedule: Lun-Vie 9:00-18:00
nif: 00000000X
ownerName: OWNER_NAME
seo: '{"title":"SITE_NAME | NICHE_DESCRIPTION en CITY_NAME","description":"DESCRIPTION_HERE"}'
slogan: SLOGAN_HERE
foundingDate: '2024'
facebook: ''
instagram: ''
googleAnalyticsId: ''
gtmId: ''
searchConsoleVerification: ''
n8nWebhookUrl: ''
areaServed:
  - CITY_NAME
serviceRadius: 0
priceRange: €€
paymentAccepted:
  - Cash
  - Credit Card
openingHours:
  - dayOfWeek:
      - Monday
      - Tuesday
      - Wednesday
      - Thursday
      - Friday
    opens: '09:00'
    closes: '18:00'
servicePriority: []
locationPriority: []
ctaTagline: "Presupuesto gratuito · Sin compromiso"
`;

const HOME_MDX_TEMPLATE = `---
seoControls: >-
  {"title":"HOME_TITLE","description":"HOME_DESCRIPTION"}
blocks:
  - discriminant: hero
    value:
      content: >-
        {"heading":"HERO_HEADING","headingHighlight":"HERO_HIGHLIGHT","subheading":"HERO_SUBHEADING","ctaPrimaryText":"Llámanos","ctaSecondaryText":"WhatsApp","features":"Feature 1\\nFeature 2\\nFeature 3","bgColor":"#0a0a0a"}
      backgroundImageAlt: Hero image alt
      ctaPrimaryLink: tel:+34000000000
  - discriminant: home_intro
    value:
      heading: INTRO_HEADING
      paragraph: INTRO_PARAGRAPH
  - discriminant: services_grid
    value:
      variant: grid
      title: NUESTROS SERVICIOS
      subtitle: Descripción de los servicios
      services: {}
  - discriminant: contact
    value:
      title: Cuéntanos tu proyecto
      subtitle: Contacta con nosotros para un presupuesto gratuito
      responseTime: "lo antes posible"
seoContentTitle: CONTENIDO_SEO_TITLE
stickyPhone: false
whatsappFloat: true
---

# Bienvenidos a SITE_NAME
`;

async function resetProject() {
    console.log('🗑️  INICIANDO LIMPIEZA COMPLETA (FRESH START)...');

    const pathsToClear = [
        { path: 'src/content/services', type: 'dir' },
        { path: 'src/content/locations', type: 'dir' },
        { path: 'src/content/blog', type: 'dir' },
        { path: 'src/content/projects', type: 'dir' },
        { path: 'src/content/testimonials', type: 'dir' },
        { path: 'src/assets/images', type: 'dir', keep: ['hero-home.webp', 'logo.svg', 'favicon.svg'] },
        { path: 'optimized-images', type: 'dir' },
        { path: 'incoming-images', type: 'dir' },
        { path: 'project_plan.json', type: 'file' },
        { path: 'clustering_analysis.md', type: 'file' }
    ];

    for (const item of pathsToClear) {
        try {
            const fullPath = path.resolve(process.cwd(), item.path);
            const stats = await fs.stat(fullPath).catch(() => null);

            if (stats) {
                if (item.type === 'dir') {
                    if (item.keep) {
                        const files = await fs.readdir(fullPath);
                        for (const file of files) {
                            if (!item.keep.includes(file)) {
                                await fs.rm(path.join(fullPath, file), { recursive: true, force: true });
                            }
                        }
                        console.log(`🧹 Carpeta filtrada: ${item.path} (manteniendo esenciales)`);
                    } else {
                        await fs.rm(fullPath, { recursive: true, force: true });
                        await fs.mkdir(fullPath, { recursive: true });
                        console.log(`✅ Carpeta vaciada: ${item.path}`);
                    }
                } else {
                    await fs.unlink(fullPath);
                    console.log(`✅ Archivo eliminado: ${item.path}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error al procesar ${item.path}:`, error);
        }
    }

    // Reset global.yaml
    try {
        await fs.writeFile(path.resolve(process.cwd(), 'src/content/business/global.yaml'), GLOBAL_YAML_TEMPLATE);
        console.log('✅ Reseteado: src/content/business/global.yaml');
    } catch (e) {
        console.error('❌ Error al resetear global.yaml:', e.message);
    }

    // Reset home.mdx
    try {
        await fs.writeFile(path.resolve(process.cwd(), 'src/content/pages/home.mdx'), HOME_MDX_TEMPLATE);
        console.log('✅ Reseteado: src/content/pages/home.mdx');
    } catch (e) {
        console.error('❌ Error al resetear home.mdx:', e.message);
    }

    // Asegurar que existan carpetas mínimas para Astro
    const essentialDirs = [
        'src/content/services',
        'src/content/locations',
        'src/content/blog',
        'src/content/projects',
        'src/content/testimonials'
    ];
    
    for (const dir of essentialDirs) {
        await fs.mkdir(path.resolve(process.cwd(), dir), { recursive: true }).catch(() => {});
        // Añadir un .gitkeep para que no se pierdan las carpetas vacías si se sube a git
        await fs.writeFile(path.join(path.resolve(process.cwd(), dir), '.gitkeep'), '').catch(() => {});
    }

    console.log('\n✨ PROYECTO LISTO PARA EMPEZAR DE CERO.');
    console.log('👉 Pasos recomendados:');
    console.log('1. Configura src/content/business/global.yaml');
    console.log('2. Lanza el generador de contenido.');
}

resetProject();
