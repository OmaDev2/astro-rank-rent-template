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
        // Identidad
        siteName: z.string(),
        niche: z.string(),
        logo: z.string().optional(),
        siteUrl: z.string().optional(),
        businessType: z.enum([
            'Locksmith',
            'Plumber',
            'Electrician',
            'LocalBusiness',
            'HomeAndConstructionBusiness',
            'LegalService',
            'MedicalBusiness',
            'HealthAndBeautyBusiness'
        ]).default('LocalBusiness'),

        // Ubicación
        city: z.string(),
        address: z.string().optional(),
        coordinates: z.object({
            lat: z.string(),
            lng: z.string(),
        }).optional(),

        // Contacto
        phone: z.string(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        schedule: z.string().optional(),

        // Legal
        nif: z.string().optional(),

        // Tema
        theme: z.enum([
            'industrial', 'corporate', 'nature', 'urgent',
            'legal', 'health', 'luxury', 'beauty', 'tech', 'clean_light'
        ]).default('industrial'),

        // CTA
        ctaText: z.string().optional(),

        // Redes
        facebook: z.string().optional(),
        instagram: z.string().optional(),

        // Analytics
        googleAnalyticsId: z.string().optional(),
        gtmId: z.string().optional(),
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


const testimonials = defineCollection({
    schema: z.object({
        name: z.string(),
        initials: z.string(),
        rating: z.number().min(1).max(5).default(5),
        text: z.string(),
        featured: z.boolean().default(true),
    }),
});


export const collections = {
    locations,
    services,
    projects,
    settings,
    pages,
    testimonials,
};
