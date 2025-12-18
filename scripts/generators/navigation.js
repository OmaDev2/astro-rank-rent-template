import fs from 'fs/promises';
import { escapeYaml } from '../lib/utils.js';

export async function generateNavigation({ plan }) {
    console.log(`\nnav Generando Navegación...`);

    const hasBlog = plan.blog_topics && plan.blog_topics.length > 0;
    const hasLocations = plan.locations && plan.locations.length > 0;

    const menuItems = [
        { label: "Inicio", url: "/", type: "link" },
        { label: "Servicios", type: "services_dropdown" }
    ];

    if (hasLocations) {
        menuItems.push({ label: "Zonas", type: "locations_dropdown" });
    }

    if (hasBlog) {
        menuItems.push({ label: "Blog", url: "/blog/", type: "link" });
    }

    menuItems.push({ label: "Contacto", url: "/contacto/", type: "link" });

    const navYaml = `menuItems:
${menuItems.map(item => `  - label: ${escapeYaml(item.label)}
    ${item.url ? `url: "${item.url}"` : ''}
    type: ${item.type}`).join('\n')}
`;

    await fs.mkdir('src/content/navigation', { recursive: true });
    await fs.writeFile('src/content/navigation/main.yaml', navYaml);
    console.log(`   ✅ Navegación generada (Blog: ${hasBlog ? 'SÍ' : 'NO'})`);
}
