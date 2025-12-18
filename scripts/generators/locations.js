import fs from 'fs/promises';
import path from 'path';
import { loadPrompt, escapeYaml } from '../lib/utils.js';

function localSlugify(text) {
    return text.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function spin(text) {
    if (!text || typeof text !== 'string') return text;
    const regex = /\{([^{}]+)\}/g;
    let processed = text;
    while (regex.test(processed)) {
        processed = processed.replace(regex, (m, c) => {
            const opt = c.split('|');
            return opt[Math.floor(Math.random() * opt.length)];
        });
    }
    return processed;
}

export async function generateLocations({
    plan,
    cityName,
    cityContextData,
    generateData
}) {
    if (!plan.generate_locations || !plan.locations || plan.locations.length === 0) {
        console.log(`\n🌍 Saltando generación de zonas (Desactivado o sin datos en configuración).`);
        return;
    }

    if (plan.generation_mode === 'spintax' && plan.spintax_template) {
        console.log(`\n🏭 MODO SPINTAX: Generando ${plan.locations.length} Zonas usando Template...`);

        for (const location of plan.locations) {
            const vars = { Location: location, City: cityName, Niche: plan.niche };
            const processTemplate = (tpl) => {
                let text = tpl;
                for (const [key, val] of Object.entries(vars)) {
                    text = text.replace(new RegExp(`{{${key}}}`, 'gi'), val);
                }
                text = text.replace(/{Location}/gi, location).replace(/{City}/gi, cityName).replace(/{Niche}/gi, plan.niche);
                return spin(text);
            };

            const slug = localSlugify(location);
            const tpl = plan.spintax_template;

            const mdx = `---
name: "${processTemplate(tpl.name || location)}"
type: "residencial"
zipCodes: []
seoTitle: "${processTemplate(tpl.seoTitle)}"
seoDesc: "${processTemplate(tpl.seoDesc)}"
blocks:
  - discriminant: "hero"
  - discriminant: "features"
  - discriminant: "map"
  - discriminant: "content"
  - discriminant: "cta"
---
${processTemplate(tpl.content)}`;

            const filePath = path.join('src/content/locations', `${slug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, mdx);
            if (plan.locations.indexOf(location) % 10 === 0) process.stdout.write('.');
        }
        console.log(`\n      ✅ ${plan.locations.length} zonas generadas (Modo Spintax).`);
    } else {
        console.log(`\n🌍 Generando ${plan.locations.length} Zonas (Modo Local IA)...`);
        for (const location of plan.locations) {
            console.log(`   > ${location}...`);
            const slug = localSlugify(location);

            const locationPrompt = await loadPrompt('location', {
                niche: plan.niche,
                location: location,
                cityName: cityName,
                cityContext: cityContextData
            });

            if (!locationPrompt) continue;

            const data = await generateData(locationPrompt, `Zona: ${location}`);
            if (data) {
                const mdx = `---
name: "${data.name}"
type: "residencial"
zipCodes: []
seoTitle: "${data.seoTitle}"
seoDesc: "${data.seoDesc}"
blocks:
  - discriminant: "hero"
    value:
      title: ${escapeYaml(data.hero?.title || data.name)}
      subtitle: ${escapeYaml(data.hero?.subtitle || "")}
  - discriminant: "features"
    value:
      items:
${(data.features || []).map(f => `        - title: ${escapeYaml(f.title)}\n          description: ${escapeYaml(f.description)}\n          icon: "${f.icon || 'MapPin'}"`).join('\n')}
  - discriminant: "map"
    value:
      query: "${data.name}, ${cityName}"
  - discriminant: "content"
    value:
      title: "Servicio local en ${data.name}"
  - discriminant: "cta"
    value:
      title: "¿Vives en ${data.name}?"
---
${data.content}`;

                const filePath = path.join('src/content/locations', `${slug}.mdx`);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, mdx);
                console.log(`      ✅ Zona creada: ${slug}.mdx`);
            }
        }
    }
}
