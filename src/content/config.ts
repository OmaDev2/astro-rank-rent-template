import { defineCollection, z } from 'astro:content';

const locations = defineCollection({
    schema: z.object({
        name: z.string(),
        type: z.enum(['residencial', 'industrial', 'centro']),
        seoTitle: z.string(),
        seoDesc: z.string(),
        zipCodes: z.array(z.string()),
    }),
});

const services = defineCollection({
    schema: z.object({
        title: z.string(),
        seoTitle: z.string().optional(),
        seoDesc: z.string().optional(),
        icon: z.string(),
        shortDesc: z.string(),
        featured: z.boolean().default(false),
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
    }),
});

const projects = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        image: image(),
        locationTag: z.string(),
    }),
});

export const collections = {
    locations,
    services,
    projects,
};
