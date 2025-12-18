import fs from 'fs/promises';
import path from 'path';
import { loadPrompt, escapeYaml, indentYaml } from '../lib/utils.js';
import { injectInternalLinks } from '../content_processor.js';
// Local slugify to avoid module resolution issues


function localSlugify(text) {
  return text.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function generateServices({
  plan,
  cityName,
  serviceClusters,
  cityContextData,
  nlpPhrases,
  userPainPoints,
  linksMap,
  generateData,
  generateFAQs
}) {
  if (plan.one_page_mode === true) {
    console.log(`\n⏸️ MODO ONE PAGE: Saltando generación de páginas de servicios.`);
    return;
  }

  console.log(`\n🛠️ Generando ${serviceClusters.length} Páginas de Servicios...`);

  for (const cluster of serviceClusters) {
    const serviceName = cluster.cluster_name || cluster.name || 'servicio-sin-nombre';
    console.log(`   > ${serviceName}...`);
    const serviceSlug = localSlugify(serviceName);

    const clusterKeywords = cluster.keywords.map(k => k.keyword);
    const selectedIdx = cluster.selected_suggestion || 0;
    const metaTags = cluster.meta_suggestions?.[selectedIdx] || { h1: serviceName, seo_title: serviceName, seo_description: "" };

    const servicePrompt = await loadPrompt('service', {
      serviceName: serviceName,
      cityName: cityName,
      clusterKeywords: clusterKeywords.join(', '),
      h1: metaTags.h1,
      cityContext: cityContextData,
      nlpPhrases: nlpPhrases,
      userPainPoints: userPainPoints,
      niche: plan.niche
    });

    if (!servicePrompt) continue;

    let serviceData = await generateData(servicePrompt, `Service: ${serviceName}`);

    if (serviceData) {
      serviceData = injectInternalLinks(serviceData, linksMap);

      const faqs = await generateFAQs(serviceName, cityName, cluster.keywords, plan.raw_data?.paa_questions || [], cityContextData);
      const faqYaml = faqs.map(q => `  - question: "${q.question}"\n    answer: >-\n      ${q.answer}`);

      const related = serviceClusters.filter(s => s.name !== serviceName).slice(0, 3).map(s => {
        const sSlug = localSlugify(s.name);
        return `- **[${s.name}](/servicios/${sSlug})**: Especialistas en ${s.name.toLowerCase()}.`;
      });

      const contentBody = `
## ${serviceData.problem_agitation?.h2 || "El Problema"}
${serviceData.problem_agitation?.content || ""}

## ${serviceData.solution_technical?.h2 || "Nuestra Solución"}
${serviceData.solution_technical?.content || ""}

## Proceso de Trabajo
${(serviceData.process_steps || []).map(s => `### ${s.step_number}. ${s.title}\n${s.description}`).join('\n\n')}

## ${serviceData.materials_section?.title || "Materiales"}
${(serviceData.materials_section?.items || []).map(i => `- ${i}`).join('\n')}

> **${serviceData.final_cta || "Contáctanos hoy mismo."}**
`;

      const mdx = `---
title: ${escapeYaml(serviceData.hero?.h1 || serviceName)}
shortDesc: ${escapeYaml(serviceData.hero?.lead_text?.slice(0, 160) || "Servicio profesional")}
icon: "${serviceData.hero?.icon_suggestion || 'Hammer'}"
heroImage: "/images/services/default.jpg"
featured: true
seoTitle: ${escapeYaml(serviceData.meta?.title || serviceName)}
seoDesc: ${escapeYaml(serviceData.meta?.description || "")}

blocks:
  - discriminant: "hero"
    value:
      title: ${escapeYaml(serviceData.hero?.h1 || serviceName)}
      subtitle: >-
        ${indentYaml(serviceData.hero?.lead_text || "", 8)}
  - discriminant: "features"
    value:
      title: ${escapeYaml(serviceData.solution_technical?.h2 || "Por qué elegirnos")}
      items:
${(serviceData.why_us_bullets || []).map(f => `        - title: ${escapeYaml(f.title)}\n          desc: ${escapeYaml(f.desc)}\n          icon: "${f.icon_suggestion || 'CheckCircle'}"`).join('\n')}
  - discriminant: "content"
    value: {}
  - discriminant: "faq"
    value:
      title: "Preguntas Frecuentes en ${cityName}"
      faqs:
${faqs.map(q => `        - question: ${escapeYaml(q.question)}\n          answer: >-\n            ${indentYaml(q.answer, 12)}`).join('\n')}
  - discriminant: "cta"
    value:
      title: "¿Necesitas ${serviceName.toLowerCase()} en ${cityName}?"
      buttonText: "PEDIR PRESUPUESTO"
---

${contentBody}

## Otros Servicios en ${cityName}

${related.join('\n')}
`;
      const filePath = path.join('src/content/services', `${serviceSlug}.mdx`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, mdx);
      console.log(`      ✅ Servicio creado: ${serviceSlug}.mdx`);
    }
  }
}
