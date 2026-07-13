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
seoControls: '{"title":"","description":""}'
blocks:
  - discriminant: hero
    value:
      heading: SERVICIO en
      headingHighlight: CIUDAD
      subheading: >-
        Descripción breve del servicio. Sin intermediarios. Presupuesto cerrado
        antes de empezar.
      ctaPrimaryText: Pedir Presupuesto
      ctaSecondaryText: WhatsApp
      ctaPrimaryLink: '#contacto'
      ctaSecondaryLink: ''
      features:
        - Servicio Rápido
        - Garantía Total
        - Presupuesto Gratis
      titleTag: h1
      backgroundImageAlt: ''

  - discriminant: home_intro
    value:
      heading: 'Especialistas en SERVICIO en CIUDAD'
      paragraph: >-
        Texto introductorio SEO (2-3 frases). Describe quién eres, qué haces y
        para quién. Incluye ciudad y servicio principal de forma natural.

  - discriminant: features
    value:
      title: Por qué confiar en nosotros
      titleTag: h2
      variant: grid
      features:
        - title: +10 años de experiencia
          description: Especialistas en SERVICIO para viviendas, comunidades y negocios.
          icon: Award
        - title: Trabajo a medida
          description: Medimos, presupuestamos e instalamos según las necesidades reales.
          icon: Ruler
        - title: Precio cerrado
          description: Te damos un presupuesto claro antes de empezar. Sin sorpresas.
          icon: ShieldCheck

  - discriminant: services_grid
    value:
      variant: featured
      title: Nuestros Servicios
      titleHighlight: en CIUDAD
      subtitle: >-
        Trabajamos sin intermediarios con el mismo equipo desde la visita hasta
        el acabado final.
      services: {}

  - discriminant: stats
    value:
      title: Expertos en SERVICIO en CIUDAD
      subtitle: ''
      titleTag: h2
      stats:
        - label: Años de experiencia
          value: '10'
          suffix: +
          icon: Award
        - label: Proyectos realizados
          value: '500'
          suffix: +
          icon: CheckCircle
        - label: Satisfacción
          value: '100'
          suffix: '%'
          icon: Star

  - discriminant: about
    value:
      title: NOMBRE_EMPRESA — SERVICIO en
      titleHighlight: CIUDAD
      titleTag: h2
      description: >-
        Llevamos más de 10 años especializados en SERVICIO en CIUDAD para
        viviendas, comunidades y locales. Trabajamos sin subcontratas.
      yearsExperience: '10+'
      projectsCompleted: '500+'
      image: null
      features:
        - title: Sin intermediarios
          description: Trato directo con los técnicos que hacen el trabajo.
          icon: Users
        - title: Presupuesto cerrado
          description: Sin sorpresas en el precio final.
          icon: FileCheck
      buttonText: Quiénes somos
      buttonLink: /nosotros/

  - discriminant: process
    value:
      title: Cómo trabajamos
      subtitle: Un proceso claro y sin sorpresas de principio a fin.
      titleTag: h2
      variant: timeline
      steps:
        - title: '1. Visita y medición'
          description: Nos desplazamos a medir sin compromiso.
          icon: ClipboardCheck
          duration: Gratis
        - title: '2. Presupuesto cerrado'
          description: Recibes precio exacto por escrito antes de empezar.
          icon: FileText
          duration: 24-48h
        - title: '3. Instalación profesional'
          description: Nuestro equipo ejecuta el trabajo en el plazo acordado.
          icon: Hammer
          duration: Según proyecto
        - title: '4. Entrega y garantía'
          description: Revisamos juntos el resultado y te dejamos la garantía por escrito.
          icon: BadgeCheck
          duration: Garantía incluida

  - discriminant: testimonials
    value:
      title: Lo que dicen nuestros clientes
      subtitle: Opiniones reales de personas que han confiado en nosotros.
      titleTag: h2
      testimonials:
        - quote: Un trabajo impecable. Muy profesionales y puntuales.
          author: María G.
          initials: MG
          location: CIUDAD
          date: '2024'
          rating: 5
          service: SERVICIO
          verified: true
        - quote: Presupuesto claro, sin sorpresas y con muy buen acabado.
          author: Carlos M.
          initials: CM
          location: CIUDAD
          date: '2024'
          rating: 5
          service: SERVICIO
          verified: true
        - quote: Rápidos, limpios y profesionales. Volveré a contratarlos.
          author: Ana R.
          initials: AR
          location: CIUDAD
          date: '2024'
          rating: 5
          service: SERVICIO
          verified: true

  - discriminant: service_areas
    value:
      title: Dónde trabajamos
      subtitle: >-
        Nos desplazamos para medir y presupuestar sin compromiso en toda la zona
        de CIUDAD y alrededores.
      group1:
        title: CIUDAD Capital
        description: Cubrimos todos los barrios y distritos.
        items:
          - name: Zona Centro
            description: ''
            icon: MapPin
            popular: true
          - name: Zona Norte
            description: ''
            icon: MapPin
            popular: false
          - name: Zona Sur
            description: ''
            icon: MapPin
            popular: false
      group2:
        title: Municipios cercanos
        description: Desplazamiento incluido sin coste adicional.
        note: ''
        items:
          - name: Municipio 1
            supplement: ''
            icon: MapPin
          - name: Municipio 2
            supplement: ''
            icon: MapPin

  - discriminant: faq
    value:
      title: Preguntas frecuentes sobre SERVICIO en CIUDAD
      subtitle: Resolvemos las dudas más habituales antes de pedir presupuesto.
      variant: accordion
      questions:
        - question: '¿Cuánto cuesta SERVICIO en CIUDAD?'
          answer: >-
            El precio depende del tipo de trabajo y las dimensiones. Hacemos
            visita gratuita y te damos presupuesto cerrado sin compromiso.
          category: ''
        - question: '¿Dais garantía por el trabajo?'
          answer: >-
            Sí. Todos nuestros trabajos incluyen garantía por escrito.
          category: ''
        - question: '¿Trabajáis en toda la provincia?'
          answer: >-
            Trabajamos en CIUDAD y municipios de la zona. Consúltanos tu
            ubicación y te confirmamos cobertura.
          category: ''

  - discriminant: contact
    value:
      title: Solicita tu presupuesto gratuito
      subtitle: Cuéntanos qué necesitas y te respondemos en menos de 24 horas.
      description: ''
      phone: ''
      whatsapp: ''
      email: ''
      schedule: ''
      responseTime: menos de 24 horas

  - discriminant: cta
    value:
      title: '¿Necesitas SERVICIO en CIUDAD?'
      subtitle: >-
        Llámanos o escríbenos por WhatsApp. Venimos a medir y te damos
        presupuesto cerrado sin compromiso.
      titleTag: h2
      buttonText: Presupuesto gratuito · Sin compromiso
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida

seoContentTitle: ''
stickyPhone: true
whatsappFloat: true
---
`;

const SERVICIOS_MDX_TEMPLATE = `---
seoControls: '{"title":"","description":""}'
blocks:
  - discriminant: hero
    value:
      heading: Nuestros Servicios de
      headingHighlight: SERVICIO en CIUDAD
      subheading: >-
        Fabricamos e instalamos con nuestro propio equipo. Sin intermediarios,
        presupuesto cerrado y garantía incluida.
      ctaPrimaryText: Pedir Presupuesto
      ctaSecondaryText: WhatsApp
      features:
        - Presupuesto Gratis
        - Garantía Total
        - Sin Intermediarios
      titleTag: h1

  - discriminant: trust_strip
    value:
      title: ''
      subtitle: ''
      titleTag: h2
      variant: bar
      items:
        - icon: Gift
          label: Presupuesto gratuito
          description: ''
        - icon: Users
          label: Sin intermediarios
          description: ''
        - icon: ShieldCheck
          label: Garantía incluida
          description: ''
        - icon: FileCheck
          label: Precio cerrado
          description: ''

  - discriminant: features
    value:
      title: Por qué elegirnos
      titleTag: h2
      variant: grid
      features:
        - title: Trabajo a medida
          description: Medimos, presupuestamos e instalamos según las necesidades reales.
          icon: Ruler
        - title: Precio cerrado
          description: Te damos un presupuesto exacto antes de empezar. Sin sorpresas.
          icon: FileCheck
        - title: Equipo propio
          description: El mismo equipo desde la primera visita hasta la instalación final.
          icon: Users

  - discriminant: faq
    value:
      title: Preguntas frecuentes sobre nuestros servicios
      variant: accordion
      faqs:
        - question: '¿Hacéis presupuesto gratuito?'
          answer: >-
            Sí. Nos desplazamos a ver el trabajo sin ningún compromiso y te
            entregamos el presupuesto por escrito en 24-48h.
        - question: '¿Dais garantía por los trabajos?'
          answer: >-
            Sí. Todos nuestros trabajos incluyen garantía por escrito.

  - discriminant: cta
    value:
      title: '¿Necesitas SERVICIO en CIUDAD?'
      subtitle: >-
        Llámanos o escríbenos. Venimos a medir, te damos presupuesto cerrado
        y te decimos exactamente qué vamos a hacer antes de empezar.
      titleTag: h2
      buttonText: Presupuesto gratuito · Sin compromiso
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Presupuesto cerrado
        - Garantía incluida
---
`;

const ZONAS_MDX_TEMPLATE = `---
seoControls: '{"title":"","description":""}'
blocks:
  - discriminant: hero
    value:
      heading: Servicio en
      headingHighlight: CIUDAD y alrededores
      subheading: >-
        Nos desplazamos para medir y presupuestar sin compromiso en toda la
        zona. El mismo equipo, la misma calidad.
      ctaPrimaryText: Ver zonas
      ctaSecondaryText: Pedir presupuesto
      features:
        - Desplazamiento incluido
        - Presupuesto gratis
        - Mismo equipo
      titleTag: h1

  - discriminant: trust_strip
    value:
      title: ''
      subtitle: ''
      titleTag: h2
      variant: bar
      items:
        - icon: MapPin
          label: Desplazamiento incluido
          description: ''
        - icon: Gift
          label: Presupuesto sin compromiso
          description: ''
        - icon: Users
          label: Mismo equipo en toda la zona
          description: ''

  - discriminant: features
    value:
      title: La misma calidad en toda la zona
      titleTag: h2
      variant: grid
      features:
        - title: Desplazamiento incluido
          description: Nos desplazamos a cualquier punto de la zona sin coste adicional.
          icon: MapPin
        - title: Equipo propio
          description: El mismo equipo trabaja en toda el área. Sin subcontratas.
          icon: Users
        - title: Respuesta rápida
          description: Organizamos las visitas por zonas para darte fecha lo antes posible.
          icon: Clock

  - discriminant: cta
    value:
      title: '¿Trabajamos en tu zona?'
      subtitle: >-
        Consúltanos tu ubicación. Nos desplazamos, miramos el trabajo y te damos
        presupuesto cerrado sin compromiso.
      titleTag: h2
      buttonText: Consultar cobertura
      buttonLink: /contacto/
      style: gradient
      features:
        - Visita gratuita
        - Sin desplazamiento extra
        - Presupuesto cerrado
---
`;

async function confirmReset() {
    // Guarda de seguridad: este script BORRA todo el contenido (servicios, zonas,
    // blog, proyectos, testimonios). Solo debe ejecutarse en el repo del template,
    // nunca en la web de un cliente. --yes lo salta (para automatización).
    if (process.argv.includes('--yes')) return true;

    const readline = await import('node:readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n⚠️  ATENCIÓN: esto BORRA servicios, zonas, blog, proyectos, testimonios');
    console.log(`   y resetea la configuración a placeholders.`);
    console.log(`   Carpeta actual: ${process.cwd()}\n`);
    const answer = await new Promise((res) =>
        rl.question('   Escribe SI (en mayúsculas) para continuar: ', (a) => res(a.trim()))
    );
    rl.close();
    return answer === 'SI';
}

async function resetProject() {
    const ok = await confirmReset();
    if (!ok) {
        console.log('\n✋ Cancelado. No se ha borrado nada.');
        process.exit(0);
    }

    console.log('🗑️  INICIANDO LIMPIEZA COMPLETA (FRESH START)...');

    const pathsToClear = [
        { path: 'src/content/services', type: 'dir' },
        { path: 'src/content/locations', type: 'dir' },
        { path: 'src/content/blog', type: 'dir' },
        { path: 'src/content/projects', type: 'dir' },
        { path: 'src/content/testimonials', type: 'dir' },
        { path: 'src/assets/images', type: 'dir', keep: ['hero-home.webp', 'logo.svg', 'favicon.svg', 'about-hero.webp', 'about-main.webp', 'about-us.webp', 'alisado.webp', 'pintura.webp', 'service-default.webp'] },
        { path: 'optimized-images', type: 'dir' },
        { path: 'incoming-images', type: 'dir' },
        { path: 'project_plan.json', type: 'file' },
        { path: 'clustering_analysis.md', type: 'file' },
        { path: 'src/content/business/avatar.yaml', type: 'file' },
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

    // Reset páginas principales
    const pageResets = [
        { file: 'src/content/pages/home.mdx',      template: HOME_MDX_TEMPLATE },
        { file: 'src/content/pages/servicios.mdx',  template: SERVICIOS_MDX_TEMPLATE },
        { file: 'src/content/pages/zonas.mdx',      template: ZONAS_MDX_TEMPLATE },
    ];
    for (const { file, template } of pageResets) {
        try {
            await fs.writeFile(path.resolve(process.cwd(), file), template);
            console.log(`✅ Reseteado: ${file}`);
        } catch (e) {
            console.error(`❌ Error al resetear ${file}:`, e.message);
        }
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
