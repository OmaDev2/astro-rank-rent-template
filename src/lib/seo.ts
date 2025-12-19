import type {
    WithContext,
    LocalBusiness,
    AggregateRating,
    BreadcrumbList,
    ListItem,
    FAQPage,
    Question,
    Answer
} from "schema-dts";

/**
 * Calcula el AggregateRating basado en una lista de testimonios
 */
export function getAggregateRating(testimonials: any[]): AggregateRating | undefined {
    if (!testimonials || testimonials.length === 0) return undefined;

    const count = testimonials.length;
    const totalRating = testimonials.reduce((acc, t) => acc + (t.data?.rating || t.rating || 5), 0);
    const average = (totalRating / count).toFixed(1);

    return {
        "@type": "AggregateRating",
        ratingValue: average,
        reviewCount: count,
        bestRating: "5",
        worstRating: "1"
    };
}

/**
 * Genera el FAQ Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]): WithContext<FAQPage> | null {
    if (!faqs || faqs.length === 0) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
            }
        }))
    };
}

/**
 * Genera el BreadcrumbList Schema
 */
export function generateBreadcrumbsList(items: { name: string; item?: string }[]): WithContext<BreadcrumbList> {
    const itemListElement: ListItem[] = items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item // URL completa
    }));

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement
    };
}

interface LocalBusinessSettings {
    siteName?: string;
    phone?: string;
    city?: string;
    address?: string;
    coordinates?: { lat?: string; lng?: string };
    image?: string;
    priceRange?: string;
    businessType?: string;
    description?: string;
    areaServed?: any;
    serviceRadius?: number;
    openingHours?: any[]; // Añadido
    paymentAccepted?: string[]; // Añadido
    knowsAbout?: string[]; // Añadido por SEO
    slogan?: string; // Añadido
}

/**
 * Helper para formatear areaServed correctamente (City list o GeoCircle)
 */
export function formatAreaServed(areaData: any, radius?: number, coordinates?: { lat?: string; lng?: string }) {
    // Opción A: Si hay una lista explícita, priorizarla (Mejor SEO semántico)
    if (areaData && Array.isArray(areaData) && areaData.length > 0) {
        return areaData.map(item => {
            if (typeof item === 'string') {
                return {
                    "@type": "City",
                    name: item
                };
            }
            return item;
        }) as any;
    }

    // Opción B: Si hay un radio definido y coordenadas, usar GeoCircle (Automatización)
    if (radius && radius > 0 && coordinates?.lat && coordinates?.lng) {
        return {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": parseFloat(coordinates.lat),
                "longitude": parseFloat(coordinates.lng)
            },
            "geoRadius": (radius * 1000).toString() // Convertir km a metros
        };
    }

    // Opción C: Si es un objeto individual (fallback)
    return areaData;
}

/**
 * Genera el esquema LocalBusiness mejorado
 */
export function generateLocalBusinessSchema(
    settings: LocalBusinessSettings,
    testimonials: any[] = [],
    url: string
): WithContext<LocalBusiness> {
    const aggregateRating = getAggregateRating(testimonials);

    const schema: WithContext<LocalBusiness> = {
        "@context": "https://schema.org",
        "@type": (settings.businessType as any) || "LocalBusiness",
        name: settings.siteName || "Negocio Local",
        image: settings.image,
        telephone: settings.phone,
        url: url,
        description: settings.description,
        address: {
            "@type": "PostalAddress",
            addressLocality: settings.city || "",
            addressRegion: settings.city || "",
            addressCountry: "ES",
            streetAddress: settings.address || settings.city || ""
        },
        priceRange: settings.priceRange || "€",
        currenciesAccepted: "EUR",
    };

    if (settings.slogan) {
        schema.slogan = settings.slogan;
    }

    if (settings.paymentAccepted && settings.paymentAccepted.length > 0) {
        schema.paymentAccepted = settings.paymentAccepted.join(", ");
    }

    if (settings.openingHours && settings.openingHours.length > 0) {
        // Formato Schema: "Mo-Fr 09:00-18:00"
        schema.openingHours = settings.openingHours.map(h => {
            const days = Array.isArray(h.dayOfWeek) ? h.dayOfWeek.join(",") : h.dayOfWeek;
            return `${days} ${h.opens}-${h.closes}`;
        });
    }

    // Campo CRÍTICO: Indica de qué somos expertos
    if (settings.knowsAbout && settings.knowsAbout.length > 0) {
        (schema as any).knowsAbout = settings.knowsAbout;
    }

    if (aggregateRating) {
        schema.aggregateRating = aggregateRating;
    }

    if (settings.coordinates?.lat && settings.coordinates?.lng) {
        // CORRECCIÓN: URL válida y clicable de Google Maps
        schema.hasMap = `https://www.google.com/maps?q=${settings.coordinates.lat},${settings.coordinates.lng}`;

        schema.geo = {
            "@type": "GeoCoordinates",
            latitude: settings.coordinates.lat,
            longitude: settings.coordinates.lng
        };
    }

    // Lógica mejorada para areaServed
    if (settings.areaServed || settings.serviceRadius) {
        schema.areaServed = formatAreaServed(
            settings.areaServed,
            settings.serviceRadius,
            settings.coordinates
        );
    }

    return schema;
}
