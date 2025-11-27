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
    schema: z.object({
        title: z.string(),
        image: z.string(),
        locationTag: z.string(),
    }),
});

const settings = defineCollection({
    type: 'data',
    schema: z.object({
        siteName: z.string(),
        niche: z.string(),
        city: z.string(),
        phone: z.string(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        nif: z.string().optional(),
        ctaText: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
    }),
});

const pages = defineCollection({
    schema: z.object({
        // Hero Section
        hero: z.object({
            heading: z.string().optional(),
            subheading: z.string().optional(),
            backgroundImage: z.string().optional(),
        }).optional(),

        // Features Section
        features: z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
        })).optional(),

        // SEO Content
        seoContentTitle: z.string().optional(),

        // FAQ
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
    }),
});

export const collections = {
    locations,
    services,
    projects,
    settings,
    pages,
};
