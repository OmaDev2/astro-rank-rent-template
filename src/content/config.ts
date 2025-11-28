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

// Business Information
const business = defineCollection({
    type: 'data',
    schema: z.object({
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
        city: z.string(),
        address: z.string().optional(),
        coordinates: z.object({
            lat: z.string(),
            lng: z.string(),
        }).optional(),
        phone: z.string(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        schedule: z.string().optional(),
        nif: z.string().optional(),
        ctaText: z.string().optional(),
    }),
});

// Design & Theme
const design = defineCollection({
    type: 'data',
    schema: z.object({
        theme: z.enum([
            'industrial', 'corporate', 'nature', 'urgent',
            'legal', 'health', 'luxury', 'beauty', 'tech', 'clean_light'
        ]).default('industrial'),
    }),
});

// Social Media
const social = defineCollection({
    type: 'data',
    schema: z.object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
    }),
});

// Analytics
const analytics = defineCollection({
    type: 'data',
    schema: z.object({
        googleAnalyticsId: z.string().optional(),
        gtmId: z.string().optional(),
        searchConsoleVerification: z.string().optional(),
    }),
});

// Schema.org Structured Data
const schema = defineCollection({
    type: 'data',
    schema: z.object({
        priceRange: z.string().optional(),
        openingHours: z.array(z.object({
            dayOfWeek: z.array(z.string()),
            opens: z.string(),
            closes: z.string(),
        })).optional(),
        areaServed: z.array(z.string()).optional(),
        paymentAccepted: z.array(z.string()).optional(),
        foundingDate: z.string().optional(),
        slogan: z.string().optional(),
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
    business,
    design,
    social,
    analytics,
    schema,
    pages,
    testimonials,
};
