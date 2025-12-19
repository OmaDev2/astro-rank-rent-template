import { defineCollection, z } from 'astro:content';
import { optional } from 'astro:schema';

const locations = defineCollection({
    schema: z.object({
        name: z.string(),
        type: z.enum(['residencial', 'industrial', 'centro']),
        seoTitle: z.string(),
        seoDesc: z.string(),
        heroImage: z.string().optional(),
        coordinates: z.object({
            lat: z.string().optional(),
            lng: z.string().optional(),
        }).optional(),
        zipCodes: z.array(z.string()),
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),

        // --- PAGE BUILDER: Define el orden de las secciones ---
        blocks: z.array(
            z.discriminatedUnion('discriminant', [
                z.object({ discriminant: z.literal('hero') }),
                z.object({ discriminant: z.literal('features') }),
                z.object({ discriminant: z.literal('map') }),
                z.object({ discriminant: z.literal('content') }),
                z.object({ discriminant: z.literal('cta') }),
                z.object({ discriminant: z.literal('pricing'), value: z.any() }),
                z.object({ discriminant: z.literal('stats'), value: z.any() }),
                z.object({ discriminant: z.literal('logos'), value: z.any() }),
                z.object({ discriminant: z.literal('before_after'), value: z.any() }),
                z.object({ discriminant: z.literal('service_areas'), value: z.any() }),
            ])
        ).optional(), // Opcional para no romper zonas antiguas sin este campo
    }),
});

const services = defineCollection({
    schema: z.object({
        title: z.string(),
        heroImage: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDesc: z.string().optional(),
        icon: z.string(),
        shortDesc: z.string(),
        featured: z.boolean().default(false),

        // --- PAGE BUILDER: Define el orden de las secciones ---
        blocks: z.array(
            z.discriminatedUnion('discriminant', [
                z.object({ discriminant: z.literal('hero'), value: z.any() }),
                z.object({ discriminant: z.literal('features'), value: z.any() }),
                z.object({ discriminant: z.literal('content'), value: z.any() }),
                z.object({
                    discriminant: z.literal('faq'),
                    value: z.object({
                        title: z.string().optional(),
                        faqs: z.array(z.object({
                            question: z.string(),
                            answer: z.string(),
                        }))
                    })
                }),
                z.object({ discriminant: z.literal('cta'), value: z.any() }),
                z.object({ discriminant: z.literal('price_from'), value: z.any() }),
                z.object({ discriminant: z.literal('pricing'), value: z.any() }),
                z.object({ discriminant: z.literal('stats'), value: z.any() }),
                z.object({ discriminant: z.literal('logos'), value: z.any() }),
                z.object({ discriminant: z.literal('before_after'), value: z.any() }),
                z.object({ discriminant: z.literal('service_areas'), value: z.any() }),
            ])
        ).optional(), // Opcional para no romper servicios antiguos sin este campo
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
    }).passthrough(),
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
        siteName: z.string().optional(),
        niche: z.string().optional(),
        logo: z.string().optional(),
        siteUrl: z.string().optional(),
        businessType: z.enum([
            'LocalBusiness',
            'Locksmith',
            'Plumber',
            'Electrician',
            'LegalService',
            'TravelAgency',
            'AutoRental',
            'ProfessionalService',
            'InsuranceAgency',
            'BarberShop',
            'RealEstateAgent',
            'SportsActivityLocation',
            'Dentist',
            'MedicalBusiness',
            'AccountingService',
            'GeneralContractor',
            'PetStore',
            'HealthAndBeautyBusiness',
            'Pharmacy',
            'Florist',
            'HomeAndConstructionBusiness',
            'JewelryStore',
            'MovingCompany',
            'HousePainter',
            'HairSalon',
            'Restaurant',
            'AutoRepair',
            'RoofingContractor',
            'TaxiService',
            'Store',
            'VeterinaryCare'
        ]).default('LocalBusiness'),
        city: z.string().optional(),
        address: z.string().optional(),
        coordinates: z.object({
            lat: z.string().optional(),
            lng: z.string().optional(),
        }).optional(),
        phone: z.string().optional(),
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
        themeSettings: z.string().optional(), // NEW: JSON string with theme + colors
        theme: z.enum([
            'industrial', 'corporate', 'nature', 'urgent',
            'legal', 'health', 'luxury', 'beauty', 'tech', 'clean_light',
            'clay_paper', 'forest_stone', 'classic_workshop'
        ]).optional().default('industrial'),

        fontPair: z.enum([
            'modern', 'robust', 'elegant', 'friendly', 'tech',
            'artisan_warm', 'artisan_natural', 'artisan_classic'
        ]).optional().default('modern'),
        heroOverlayOpacity: z.number().optional().default(0.6), // NEW: Opacity control
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
        serviceRadius: z.number().optional().default(0),
        paymentAccepted: z.array(z.string()).optional(),
        foundingDate: z.string().optional(),
        slogan: z.string().optional(),
    }),
});

const pages = defineCollection({
    schema: z.object({
        // --- PAGE BUILDER: Nuevo Modelo de Datos ---
        blocks: z.array(
            z.discriminatedUnion('discriminant', [
                z.object({ discriminant: z.literal('hero'), value: z.any() }),
                z.object({ discriminant: z.literal('services_grid'), value: z.any() }),
                z.object({
                    discriminant: z.literal('services_list'),
                    value: z.object({
                        title: z.string().optional(),
                        subtitle: z.string().optional(),
                        items: z.array(z.object({
                            title: z.string(),
                            description: z.string(),
                            image: z.string().optional(),
                            icon: z.string().optional(),
                        })).optional()
                    })
                }),
                z.object({ discriminant: z.literal('about'), value: z.any() }),
                z.object({ discriminant: z.literal('features'), value: z.any() }),
                z.object({ discriminant: z.literal('process'), value: z.any() }),
                z.object({ discriminant: z.literal('contact'), value: z.any() }),
                z.object({ discriminant: z.literal('testimonials'), value: z.any() }),
                z.object({ discriminant: z.literal('content'), value: z.any() }),
                z.object({ discriminant: z.literal('faq'), value: z.any() }),
                z.object({ discriminant: z.literal('locations'), value: z.any() }),
                z.object({ discriminant: z.literal('cta'), value: z.any() }),
                z.object({ discriminant: z.literal('pricing'), value: z.any() }),
                z.object({ discriminant: z.literal('stats'), value: z.any() }),
                z.object({ discriminant: z.literal('logos'), value: z.any() }),
                z.object({ discriminant: z.literal('before_after'), value: z.any() }),
                z.object({ discriminant: z.literal('service_areas'), value: z.any() }),
            ])
        ).optional(),

        // Campos Adicionales
        seoContentTitle: z.string().optional(),
        stickyPhone: z.boolean().optional().default(true),

        // Legacy/Generator Fields
        hero: z.any().optional(),
        servicesSection: z.any().optional(),
        aboutSection: z.any().optional(),
        features: z.any().optional(),
        servicesList: z.any().optional(),
        process: z.any().optional(),
        testimonials: z.any().optional(),
        faq: z.any().optional(),
        contactSection: z.any().optional(),
        paddingTop: z.boolean().optional(),
    }).passthrough(),
});


const testimonials = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string(),
        initials: z.string(),
        rating: z.number().min(1).max(5).default(5),
        text: z.string(),
        featured: z.boolean().default(true),
    }),
});

const form = defineCollection({
    type: 'data', // <--- ESTO ES LA CLAVE. Sin esto, Astro busca Markdown y falla.
    schema: z.object({
        // ... (el esquema que te pasé antes)
        title: z.string().optional(),
        subtitle: z.string().optional(),
        submitText: z.string().optional(),
        successUrl: z.string().optional(),
        formFields: z.array(z.any()).optional(), // Usamos any por ahora para simplificar si da problemas
    }),
});


const navigation = defineCollection({
    type: 'data',
    schema: z.object({
        menuItems: z.array(
            z.object({
                label: z.string(),
                url: z.string().optional(),
                type: z.enum(['link', 'services_dropdown', 'locations_dropdown']).default('link'),
            })
        ),
    }),
});

const footer = defineCollection({
    type: 'data',
    schema: z.object({
        description: z.string().optional(),
        footerLinks: z.array(
            z.object({
                label: z.string(),
                url: z.string(),
            })
        ).optional(),
        disclaimer: z.string().optional(),
    }),
});

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        pubDate: z.string().optional(), // ISO date string
        description: z.string().optional(),
        author: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z.string().optional(),
        featured: z.boolean().default(false),
        intro: z.string().optional(), // Added intro field for entryLayout compatibility

        // Content blocks for rich layout if needed
        blocks: z.array(
            z.discriminatedUnion('discriminant', [
                z.object({ discriminant: z.literal('content') }),
                z.object({ discriminant: z.literal('faq') }),
                z.object({ discriminant: z.literal('cta') }),
                z.object({ discriminant: z.literal('related_posts') }), // Future proofing
            ])
        ).optional(),
    }),
});


const about = defineCollection({
    type: 'data',
    schema: z.object({
        hero: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
        }).optional(),
        mainImage: z.object({
            image: z.string().optional(),
            experienceBadge: z.string().optional(),
        }).optional(),
        history: z.object({
            subtitle: z.string().optional(),
            title: z.string().optional(),
            content: z.string().optional(),
            stats: z.array(z.object({
                value: z.string(),
                label: z.string(),
            })).optional(),
        }).optional(),
        values: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            items: z.array(z.object({
                icon: z.string(),
                title: z.string(),
                description: z.string(),
            })).optional(),
        }).optional(),
        whyChooseUs: z.object({
            title: z.string().optional(),
            items: z.array(z.object({
                title: z.string(),
                description: z.string(),
            })).optional(),
        }).optional(),
        team: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
        }).optional(),
        seo: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
        }).optional(),
    }).passthrough(),
});

const legal = defineCollection({
    type: 'content',
    schema: z.object({}),
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
    navigation,
    form,
    footer,
    blog,
    legal,
    about,

};

// Force reload
