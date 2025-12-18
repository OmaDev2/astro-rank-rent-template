import fs from 'fs/promises';
import path from 'path';
import { loadPrompt, escapeYaml } from '../lib/utils.js';

function localSlugify(text) {
    return text.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function generateBlog({
    plan,
    cityName,
    cityContextData,
    nlpPhrases,
    userPainPoints,
    generateData
}) {
    const blogPosts = plan.blog_topics || [];
    if (blogPosts.length === 0) {
        console.log(`\n📰 No hay artículos de blog planificados.`);
        return;
    }

    console.log(`\n📰 Generando ${blogPosts.length} Artículos de Blog...`);

    for (const post of blogPosts) {
        const articleTitle = post.name;
        console.log(`   > ${articleTitle}...`);
        const postSlug = localSlugify(articleTitle);

        const keywordsString = post.keywords?.map(k => k.keyword).join(', ') || "";
        const mainKeyword = post.main_keyword || articleTitle;

        const blogPrompt = await loadPrompt('blog', {
            niche: plan.niche,
            cityName: cityName,
            articleTitle: articleTitle,
            mainKeyword: mainKeyword,
            keywordsString: keywordsString,
            cityContext: cityContextData,
            nlpPhrases: nlpPhrases,
            userPainPoints: userPainPoints
        });

        if (!blogPrompt) continue;

        let blogData = await generateData(blogPrompt, `Blog: ${articleTitle}`);

        if (blogData) {
            const sectionsMd = (blogData.sections || []).map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');

            const finalMdx = `---
title: ${escapeYaml(blogData.title)}
pubDate: "${new Date().toISOString().split('T')[0]}"
description: ${escapeYaml(blogData.seoDesc)}
author: "Equipo ${plan.niche}"
image: "/images/blog/default.jpg"
tags: ["${plan.niche}", "${cityName}"]
category: "Guías"
featured: false
intro: >-
  ${blogData.intro ? blogData.intro.replace(/\n/g, '\n  ') : ''}
---

${sectionsMd}

## Conclusión
${blogData.final_thoughts}
`;
            const filePath = path.join('src/content/blog', `${postSlug}.mdx`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, finalMdx);
            console.log(`      ✅ Post creado: ${postSlug}.mdx`);
        }
    }
}
