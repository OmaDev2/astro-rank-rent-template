import fs from 'fs/promises';
import { loadPrompt, escapeYaml, indentYaml } from '../lib/utils.js';
import { injectInternalLinks } from '../content_processor.js';

export async function generateHome({
  plan,
  cityName,
  mainCluster,
  serviceClusters,
  cityContextData,
  nlpPhrases,
  userPainPoints,
  linksMap,
  generateData
}) {
  console.log(`\n🏠 Generando Home (Calidad IA)...`);

  const homeH1 = plan.home_structure?.h1 || (mainCluster ? (mainCluster.cluster_name || mainCluster.name) : `${plan.niche} en ${cityName}`);
  const servicesContext = serviceClusters.map(c => ({
    name: c.cluster_name || c.name,
    keywords: c.keywords.slice(0, 5).map(k => k.keyword).join(', ')
  }));

  const isOnePage = plan.one_page_mode === true;
  const onePageInstruction = isOnePage
    ? `🚨 MODO ONE PAGE (LANDING ÚNICA) ACTIVO 🚨
           Esta será la ÚNICA página del sitio. El objetivo es convertir visitas en clientes sin que naveguen a otras páginas.
           
           INSTRUCCIONES CRÍTICAS:
           1. Genera una sección 'services_list' MUY ROBUSTA.
           2. Para cada servicio de la lista (${servicesContext.map(s => s.name).join(', ')}), debes incluir:
              - Título atractivo.
              - Descripción persuasiva de 2-3 líneas (menciona beneficios).
              - Una lista de "features" o puntos clave dentro de la descripción si es posible.
           3. El contenido debe ser suficiente para vender el servicio sin necesidad de hacer clic.
           
           Contexto de Keywords por Servicio:
           ${servicesContext.map(s => `- ${s.name}: ${s.keywords}`).join('\n           ')}`
    : "";

  let structureInstruction = "";
  if (isOnePage && plan.home_structure?.h2s && plan.home_structure.h2s.length > 0) {
    structureInstruction = `ESTRUCTURA VISUAL REQUERIDA (Adapta el JSON a esto):
        El usuario ha definido estos encabezados (H2) que DEBEN estar representados en el contenido (ya sea como secciones, items de lista o features):
        - ${plan.home_structure.h2s.join('\n        - ')}`;
  }

  const homePrompt = await loadPrompt('home', {
    niche: plan.niche,
    cityName: cityName,
    homeH1: homeH1,
    onePageInstruction: onePageInstruction,
    structureInstruction: structureInstruction,
    servicesList: servicesContext.map(s => s.name).join(', '),
    cityContext: cityContextData,
    nlpPhrases: nlpPhrases,
    userPainPoints: userPainPoints
  });

  if (!homePrompt) return;

  let homeData = await generateData(homePrompt, 'Home Page');

  if (homeData) {
    if (linksMap.length > 0) {
      homeData = injectInternalLinks(homeData, linksMap);
    }

    const testimonialsPrompt = await loadPrompt('testimonials', {
      niche: plan.niche,
      cityName: cityName,
      servicesList: servicesContext.map(s => s.name).slice(0, 3).join(', ')
    });

    const testimonialsData = await generateData(testimonialsPrompt, 'Testimonials');

    let finalServicesList = homeData.services_list || [];
    if (isOnePage && finalServicesList.length === 0) {
      finalServicesList = servicesContext.slice(0, 6).map(s => ({
        title: s.name,
        description: `Especialistas en ${s.name.toLowerCase()} en ${cityName}.`
      }));
    }

    const homeMdx = `---
hero:
  heading: ${escapeYaml(homeData.hero_section?.h1)}
  subheading: >-
    ${indentYaml(homeData.hero_section?.subheadline)}
servicesSection:
  title: ${plan.niche.charAt(0).toUpperCase() + plan.niche.slice(1)}
  titleHighlight: en ${cityName}
  subtitle: >-
    ${indentYaml(homeData.services_grid_intro || "Soluciones profesionales a medida.")}
aboutSection:
  title: ${escapeYaml(homeData.intro_content?.title)}
  description: >-
    ${indentYaml(homeData.intro_content?.paragraphs?.join('\n\n') || "")}
  yearsExperience: "15+"
  image: "/images/home/hero-placeholder.jpg"
  features:
${(Array.isArray(homeData.why_us_bullets) ? homeData.why_us_bullets : []).map(f => `    - title: ${escapeYaml(f.title)}\n      description: ${escapeYaml(f.desc)}`).join('\n')}
  buttonText: "Solicitar Visita Técnica"
  buttonLink: "/contacto"
features:
${(Array.isArray(homeData.features) ? homeData.features : []).map(f => `  - title: ${escapeYaml(f.title)}\n    description: ${escapeYaml(f.description)}`).join('\n')}
servicesList:
${finalServicesList.map(s => `  - title: ${escapeYaml(s.title)}\n    description: ${escapeYaml(s.description)}`).join('\n')}
process:
  title: ${escapeYaml(homeData.process?.title || "Nuestro Proceso")}
  description: ${escapeYaml(homeData.process?.description || "")}
  steps:
${(Array.isArray(homeData.process?.steps) ? homeData.process?.steps : []).map(s => `    - title: ${escapeYaml(s.title)}\n      description: ${escapeYaml(s.description)}`).join('\n')}
testimonials:
${(Array.isArray(testimonialsData?.testimonials) ? testimonialsData.testimonials : []).map(t => `  - quote: ${escapeYaml(t.quote)}\n    author: "${t.author}"\n    location: "${t.location}"\n    initials: "${t.initials}"`).join('\n')}
seoContentTitle: "Expertos en ${plan.niche}"
faq:
${(Array.isArray(homeData.faq) ? homeData.faq : []).map(q => `  - question: ${escapeYaml(q.question)}\n    answer: >-\n      ${q.answer}`).join('\n')}
contactSection:
  title: "Contacta con Nosotros"
  subtitle: >-
    ${indentYaml(homeData.local_closing || "Presupuesto sin compromiso.")}
paddingTop: false
stickyPhone: true
blocks:
  - discriminant: "hero"
    value:
      heading: ${escapeYaml(homeData.hero_section?.h1)}
      headingHighlight: en ${cityName}
      subheading: >-
        ${indentYaml(homeData.hero_section?.subheadline)}
${isOnePage ? `  - discriminant: "services_list"
    value:
      title: ${escapeYaml(homeData.servicesSection?.title || plan.niche)}
      subtitle: >-
        ${indentYaml(homeData.servicesSection?.subtitle || "Soluciones profesionales a medida.")}
      items:
${finalServicesList.map(s => `        - title: ${escapeYaml(s.title)}\n          description: ${escapeYaml(s.description)}\n          icon: "${s.icon_suggestion || 'Hammer'}"`).join('\n')}` : `  - discriminant: "services_grid"
    value:
      title: ${escapeYaml(homeData.servicesSection?.title || plan.niche)}
      titleHighlight: en ${cityName}
      subtitle: >-
        ${indentYaml(homeData.services_grid_intro || "Soluciones profesionales a medida.")}`}
  - discriminant: "about"
    value:
      title: ${escapeYaml(homeData.intro_content?.title)}
      description: >-
        ${indentYaml(homeData.intro_content?.paragraphs?.join('\n\n') || "")}
      yearsExperience: "15+"
      features:
${(Array.isArray(homeData.why_us_bullets) ? homeData.why_us_bullets : []).map(f => `        - title: ${escapeYaml(f.title)}\n          description: ${escapeYaml(f.desc)}`).join('\n')}
  - discriminant: "features"
    value:
${(Array.isArray(homeData.why_us_bullets) ? homeData.why_us_bullets : []).map(f => `      - title: ${escapeYaml(f.title)}\n        description: ${escapeYaml(f.desc)}\n        icon: "${f.icon_suggestion || 'CheckCircle'}"`).join('\n')}
  - discriminant: "process"
    value:
      title: ${escapeYaml(homeData.process?.title || "Nuestro Proceso")}
      description: ${escapeYaml(homeData.process?.description || "")}
      steps:
${(Array.isArray(homeData.process?.steps) ? homeData.process?.steps : []).map(s => `        - title: ${escapeYaml(s.title)}\n          description: ${escapeYaml(s.description)}`).join('\n')}
  - discriminant: "testimonials"
    value:
${(Array.isArray(testimonialsData?.testimonials) ? testimonialsData.testimonials : []).map(t => `      - quote: ${escapeYaml(t.quote)}\n        author: "${t.author}"\n        location: "${t.location}"\n        initials: "${t.initials}"`).join('\n')}
  - discriminant: "faq"
    value:
${(Array.isArray(homeData.faq) ? homeData.faq : []).map(q => `      - question: ${escapeYaml(q.question)}\n        answer: >-\n          ${q.answer}`).join('\n')}
  - discriminant: "contact"
    value:
      title: "Contacta con Nosotros"
      subtitle: >-
        ${indentYaml(homeData.local_closing || "Presupuesto sin compromiso.")}
  - discriminant: "cta"
    value:
      title: "¿Necesitas ayuda profesional?"
      buttonText: "PEDIR PRESUPUESTO"
  - discriminant: "content"
    value:
      title: "Expertos en ${plan.niche}"
---

${homeData.intro_content?.paragraphs?.join('\n\n') || ""}
`;
    await fs.mkdir('src/content/pages', { recursive: true });
    await fs.writeFile('src/content/pages/home.mdx', homeMdx);
    console.log(`   ✅ Home generada`);
  }
}
