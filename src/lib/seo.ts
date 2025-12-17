import type {
    WithContext,
    LocalBusiness,
    AggregateRating,
    BreadcrumbList,
    ListItem
} from "schema-dts";

/**
 * Calcula el AggregateRating basado en una lista de testimonios
 */
export function getAggregateRating(testimonials: any[]): AggregateRating | undefined {
    if (!testimonials || testimonials.length === 0) return undefined;

    const count = testimonials.length;
    // Si los testimonios tienen rating numérico, calcular media. 
    // Si no, asumimos 5 estrellas por defecto como en el schema original de Keystatic.
    const totalRating = testimonials.reduce((acc, t) => acc + (t.data.rating || 5), 0);
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
    siteName: string;
    phone: string;
    city: string;
    address?: string;
    coordinates?: { lat?: string; lng?: string };
    image?: string;
    priceRange?: string;
    businessType?: string;
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
        name: settings.siteName,
        image: settings.image,
        telephone: settings.phone,
        url: url,
        address: {
            "@type": "PostalAddress",
            addressLocality: settings.city,
            addressCountry: "ES",
            streetAddress: settings.address
        },
        priceRange: settings.priceRange || "€",
    };

    if (aggregateRating) {
        schema.aggregateRating = aggregateRating;
    }

    if (settings.coordinates?.lat && settings.coordinates?.lng) {
        schema.hasMap = `https://www.google.com/maps?q=${settings.coordinates.lat},${settings.coordinates.lng}`;
        schema.geo = {
            "@type": "GeoCoordinates",
            latitude: settings.coordinates.lat,
            longitude: settings.coordinates.lng
        };
    }

    return schema;
}
