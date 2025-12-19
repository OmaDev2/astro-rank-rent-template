export interface Service {
    slug: string;
    data: {
        title: string;
        shortDesc: string;
        icon: string;
        heroImage?: string;
        seoTitle?: string;
        seoDesc?: string;
        featured?: boolean;
        faq?: Array<{ question: string; answer: string }>;
    };
}

export interface Location {
    slug: string;
    data: {
        name: string;
        type: 'residencial' | 'industrial' | 'centro';
        seoTitle: string;
        seoDesc: string;
        heroImage?: string;
        coordinates?: { lat?: string; lng?: string };
        zipCodes: string[];
        faq?: Array<{ question: string; answer: string }>;
    };
}

export type BlockDiscriminant = 'hero' | 'features' | 'map' | 'content' | 'cta' | 'faq' | 'services' | 'services_grid' | 'services_list' | 'about' | 'process' | 'testimonials' | 'locations' | 'contact' | 'price_from' | 'pricing' | 'stats' | 'logos' | 'before_after' | 'service_areas';

export interface Block {
    discriminant: BlockDiscriminant;
    value?: any;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface Coordinates {
    lat?: string;
    lng?: string;
}

// Minimal interface for MDX content
export interface MDXContent {
    Content: any; // Astro/MDX doesn't have a simple strict type for this yet but it's better than implicit any
    headings: any[];
    remarkPluginFrontmatter: any;
}
