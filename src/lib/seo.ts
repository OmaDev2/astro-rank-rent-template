// ─────────────────────────────────────────────────────────────────────────────
// Schema.org Knowledge Graph builder
// Patrón: factory functions (piezas) + orchestrators (buildXxxGraph)
// Cada página llama a UN orchestrator → emite UN bloque @graph
// ─────────────────────────────────────────────────────────────────────────────

// ── URL helpers ──────────────────────────────────────────────────────────────

/** Elimina la barra final para evitar dobles // en los @id */
function norm(url: string): string {
    return (url || '').replace(/\/$/, '');
}

/** Garantiza URL absoluta para JSON-LD (Google no resuelve rutas relativas) */
function absUrl(url: string | undefined, siteUrl: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${norm(siteUrl)}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Genera @id consistentes. Google distingue mayúsculas, barras y fragmentos. */
const schemaId = {
    business:   (siteUrl: string) => `${norm(siteUrl)}/#business`,
    website:    (siteUrl: string) => `${norm(siteUrl)}/#website`,
    webpage:    (pageUrl: string) => `${norm(pageUrl)}#webpage`,
    breadcrumb: (pageUrl: string) => `${norm(pageUrl)}#breadcrumb`,
    service:    (pageUrl: string) => `${norm(pageUrl)}#service`,
    image:      (pageUrl: string) => `${norm(pageUrl)}#primaryimage`,
    faq:        (pageUrl: string) => `${norm(pageUrl)}#faq`,
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface SiteSettings {
    siteName?: string;
    siteUrl?: string;
    logo?: string;
    niche?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
    coordinates?: { lat?: string; lng?: string };
    businessType?: string;
    priceRange?: string;
    openingHours?: { dayOfWeek: string[]; opens: string; closes: string }[];
    paymentAccepted?: string[];
    areaServed?: any[];
    serviceRadius?: number;
    slogan?: string;
    foundingDate?: string;
    facebook?: string;
    instagram?: string;
    ownerName?: string;
}

// ── Entity builders ───────────────────────────────────────────────────────────
// Devuelven objetos planos SIN @context. El @context va solo en wrapGraph().

export function buildBusinessEntity(settings: SiteSettings, siteUrl: string): Record<string, any> {
    const entity: Record<string, any> = {
        "@type": settings.businessType || "LocalBusiness",
        "@id": schemaId.business(siteUrl),
        name: settings.siteName,
        url: norm(siteUrl),
        telephone: settings.phone,
        priceRange: settings.priceRange || "€€",
        currenciesAccepted: "EUR",
        inLanguage: "es-ES",
    };

    // Address — solo si hay datos reales. SABs sin dirección física omiten este bloque.
    if (settings.city || settings.address) {
        const addr: Record<string, any> = {
            "@type": "PostalAddress",
            addressCountry: "ES",
        };
        if (settings.city)    addr.addressLocality = settings.city;
        if (settings.address) addr.streetAddress   = settings.address;
        entity.address = addr;
    }

    const logoUrl = absUrl(settings.logo, siteUrl);
    if (logoUrl) {
        entity.logo  = { "@type": "ImageObject", url: logoUrl, inLanguage: "es-ES" };
        entity.image = logoUrl;
    }
    if (settings.email) entity.email = settings.email;
    if (settings.slogan) entity.slogan = settings.slogan;
    if (settings.foundingDate) entity.foundingDate = settings.foundingDate;
    if (settings.ownerName) {
        entity.founder = {
            "@type": "Person",
            name: settings.ownerName
        };
    }
    if (settings.paymentAccepted?.length) {
        entity.paymentAccepted = settings.paymentAccepted.join(", ");
    }
    if (settings.openingHours?.length) {
        entity.openingHours = settings.openingHours.map(h => {
            const days = Array.isArray(h.dayOfWeek) ? h.dayOfWeek.join(",") : h.dayOfWeek;
            return `${days} ${h.opens}-${h.closes}`;
        });
    }
    if (settings.coordinates?.lat && settings.coordinates?.lng) {
        entity.geo = {
            "@type": "GeoCoordinates",
            latitude: settings.coordinates.lat,
            longitude: settings.coordinates.lng,
        };
        entity.hasMap = `https://www.google.com/maps?q=${settings.coordinates.lat},${settings.coordinates.lng}`;
    }

    // areaServed: lista de ciudades > GeoCircle > undefined
    if (settings.areaServed?.length) {
        entity.areaServed = settings.areaServed.map(a =>
            typeof a === 'string' ? { "@type": "City", name: a } : a
        );
    } else if (settings.serviceRadius && settings.serviceRadius > 0 && settings.coordinates?.lat) {
        entity.areaServed = {
            "@type": "GeoCircle",
            geoMidpoint: {
                "@type": "GeoCoordinates",
                latitude: parseFloat(settings.coordinates.lat),
                longitude: parseFloat(settings.coordinates.lng ?? '0'),
            },
            geoRadius: String(settings.serviceRadius * 1000),
        };
    }

    // sameAs — consolida la entidad con perfiles sociales
    const sameAs: string[] = [];
    if (settings.facebook) sameAs.push(settings.facebook);
    if (settings.instagram) sameAs.push(settings.instagram);
    if (sameAs.length) entity.sameAs = sameAs;

    if (settings.ownerName) {
        entity.founder = {
            "@type": "Person",
            name: settings.ownerName
        };
    }

    return entity;
}

export function buildWebSiteEntity(settings: SiteSettings, siteUrl: string): Record<string, any> {
    return {
        "@type": "WebSite",
        "@id": schemaId.website(siteUrl),
        name: settings.siteName,
        url: norm(siteUrl),
        inLanguage: "es-ES",
        publisher: { "@id": schemaId.business(siteUrl) },
    };
}

export function buildWebPageEntity(opts: {
    url: string;
    title: string;
    description?: string;
    image?: string;
    siteUrl: string;
    type?: string;
}): Record<string, any> {
    const { url, title, description, image, siteUrl, type = "WebPage" } = opts;
    const entity: Record<string, any> = {
        "@type": type,
        "@id": schemaId.webpage(url),
        url,
        name: title,
        inLanguage: "es-ES",
        isPartOf: { "@id": schemaId.website(siteUrl) },
        about: { "@id": schemaId.business(siteUrl) },
        breadcrumb: { "@id": schemaId.breadcrumb(url) },
    };
    if (description) entity.description = description;
    const imageUrl = absUrl(image, siteUrl);
    if (imageUrl) {
        entity.primaryImageOfPage = {
            "@type": "ImageObject",
            "@id": schemaId.image(url),
            url: imageUrl,
        };
    }
    return entity;
}

export function buildBreadcrumbEntity(
    items: { name: string; item?: string }[],
    pageUrl: string
): Record<string, any> {
    return {
        "@type": "BreadcrumbList",
        "@id": schemaId.breadcrumb(pageUrl),
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            ...(item.item ? { item: item.item } : {}),
        })),
    };
}

export function buildServiceEntity(opts: {
    pageUrl: string;
    title: string;
    serviceName?: string;
    serviceType?: string;
    description?: string;
    image?: string;
    siteUrl: string;
    locationNames?: string[];
}): Record<string, any> {
    const { pageUrl, title, serviceName, serviceType, description, image, siteUrl, locationNames = [] } = opts;
    const entity: Record<string, any> = {
        "@type": "Service",
        "@id": schemaId.service(pageUrl),
        name: serviceName ?? title,
        serviceType: serviceType ?? serviceName ?? title,
        inLanguage: "es-ES",
        provider: { "@id": schemaId.business(siteUrl) },
    };
    if (description) entity.description = description;
    const imageUrl = absUrl(image, siteUrl);
    if (imageUrl) entity.image = imageUrl;
    if (locationNames.length) {
        entity.areaServed = locationNames.map(name => ({ "@type": "City", name }));
    }
    return entity;
}

export function buildFaqEntity(faqs: { question: string; answer: string }[]): Record<string, any> | null {
    if (!faqs?.length) return null;
    return {
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };
}

export function buildAggregateRating(testimonials: any[]): Record<string, any> | null {
    if (!testimonials?.length) return null;
    const count = testimonials.length;
    const total = testimonials.reduce((acc, t) => acc + (t.data?.rating ?? t.rating ?? 5), 0);
    return {
        "@type": "AggregateRating",
        ratingValue: (total / count).toFixed(1),
        reviewCount: count,
        bestRating: "5",
        worstRating: "1",
    };
}

// ── Graph orchestrators ───────────────────────────────────────────────────────
// Cada orchestrator monta el @graph completo para un tipo de página.

function wrapGraph(entities: (Record<string, any> | null)[]): Record<string, any> {
    return {
        "@context": "https://schema.org",
        "@graph": entities.filter(Boolean),
    };
}

/** Página de inicio */
export function buildHomeGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
    image?: string;
    testimonials?: any[];
    faqs?: { question: string; answer: string }[];
    serviceNames?: string[];
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description, image, testimonials = [], faqs = [], serviceNames = [] } = opts;

    const business = buildBusinessEntity(settings, siteUrl);
    const rating = buildAggregateRating(testimonials);
    if (rating) business.aggregateRating = rating;
    if (serviceNames.length) {
        business.knowsAbout = serviceNames;
        business.hasOfferCatalog = {
            "@type": "OfferCatalog",
            name: `Servicios de ${settings.niche || settings.siteName}`,
            itemListElement: serviceNames.map(name => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name },
            })),
        };
    }

    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        business,
        buildWebPageEntity({ url: pageUrl, title, description, image, siteUrl }),
        buildBreadcrumbEntity([{ name: "Inicio", item: pageUrl }], pageUrl),
        faqs.length ? { ...buildFaqEntity(faqs), "@id": schemaId.faq(pageUrl) } : null,
    ]);
}

/** Páginas de zona/localización */
export function buildLocationGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
    image?: string;
    locationName: string;
    testimonials?: any[];
    faqs?: { question: string; answer: string }[];
    breadcrumbs?: { name: string; item?: string }[];
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description, image, locationName, testimonials = [], faqs = [], breadcrumbs } = opts;

    const business = buildBusinessEntity(settings, siteUrl);
    const rating = buildAggregateRating(testimonials);
    if (rating) business.aggregateRating = rating;

    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: "Zonas", item: `${norm(siteUrl)}/zonas/` },
        { name: locationName, item: pageUrl },
    ];

    const webpage = buildWebPageEntity({ url: pageUrl, title, description, image, siteUrl });
    // Esta página trata sobre el negocio Y sobre la ciudad concreta
    webpage.about = [
        { "@id": schemaId.business(siteUrl) },
        { "@type": "City", name: locationName },
    ];

    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        business,
        webpage,
        buildBreadcrumbEntity(breadcrumbs ?? defaultBreadcrumbs, pageUrl),
        faqs.length ? { ...buildFaqEntity(faqs), "@id": schemaId.faq(pageUrl) } : null,
    ]);
}

/** Páginas de servicio */
export function buildServiceGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    serviceName?: string;
    serviceType?: string;
    description?: string;
    image?: string;
    testimonials?: any[];
    faqs?: { question: string; answer: string }[];
    locationNames?: string[];
    breadcrumbs?: { name: string; item?: string }[];
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, serviceName, serviceType, description, image, testimonials = [], faqs = [], locationNames = [], breadcrumbs } = opts;

    const business = buildBusinessEntity(settings, siteUrl);
    const rating = buildAggregateRating(testimonials);
    if (rating) business.aggregateRating = rating;

    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: "Servicios", item: `${norm(siteUrl)}/servicios/` },
        { name: title, item: pageUrl },
    ];

    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        business,
        buildWebPageEntity({ url: pageUrl, title, description, image, siteUrl }),
        buildServiceEntity({ pageUrl, title, serviceName, serviceType, description, image, siteUrl, locationNames }),
        buildBreadcrumbEntity(breadcrumbs ?? defaultBreadcrumbs, pageUrl),
        faqs.length ? { ...buildFaqEntity(faqs), "@id": schemaId.faq(pageUrl) } : null,
    ]);
}

/** Páginas genéricas (about, legal...) */
export function buildGenericGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
    breadcrumbs?: { name: string; item?: string }[];
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description, breadcrumbs } = opts;
    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: title, item: pageUrl },
    ];
    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        buildBusinessEntity(settings, siteUrl),
        buildWebPageEntity({ url: pageUrl, title, description, siteUrl }),
        buildBreadcrumbEntity(breadcrumbs ?? defaultBreadcrumbs, pageUrl),
    ]);
}

/** Listado del blog (con paginación opcional) */
export function buildBlogListGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
    posts?: { url: string; title: string; image?: string; datePublished?: string }[];
    breadcrumbs?: { name: string; item?: string }[];
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description, posts = [], breadcrumbs } = opts;
    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: "Blog", item: pageUrl },
    ];
    const itemList = posts.length ? {
        "@type": "ItemList",
        "@id": `${norm(pageUrl)}#itemlist`,
        name: title,
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: p.url,
            name: p.title,
        })),
    } : null;
    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        buildBusinessEntity(settings, siteUrl),
        buildWebPageEntity({ url: pageUrl, title, description, siteUrl, type: "CollectionPage" }),
        buildBreadcrumbEntity(breadcrumbs ?? defaultBreadcrumbs, pageUrl),
        itemList,
    ]);
}

/** Artículos individuales del blog */
export function buildBlogPostGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description, image, datePublished, dateModified, author } = opts;

    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: "Blog", item: `${norm(siteUrl)}/blog/` },
        { name: title, item: pageUrl },
    ];

    const article: Record<string, any> = {
        "@type": "BlogPosting",
        "@id": `${norm(pageUrl)}#article`,
        headline: title,
        url: pageUrl,
        inLanguage: "es-ES",
        isPartOf: { "@id": schemaId.website(siteUrl) },
        mainEntityOfPage: { "@id": schemaId.webpage(pageUrl) },
        publisher: { "@id": schemaId.business(siteUrl) },
        breadcrumb: { "@id": schemaId.breadcrumb(pageUrl) },
    };
    if (description) article.description = description;
    const imageUrl = absUrl(image, siteUrl);
    if (imageUrl) {
        article.image = { "@type": "ImageObject", "@id": schemaId.image(pageUrl), url: imageUrl };
        article.thumbnailUrl = imageUrl;
    }
    if (datePublished) article.datePublished = datePublished;
    article.dateModified = dateModified || datePublished || new Date().toISOString().split('T')[0];
    article.author = author
        ? { "@type": "Person", name: author }
        : { "@id": schemaId.business(siteUrl) };

    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        buildBusinessEntity(settings, siteUrl),
        buildWebPageEntity({ url: pageUrl, title, description, image, siteUrl, type: "WebPage" }),
        article,
        buildBreadcrumbEntity(defaultBreadcrumbs, pageUrl),
    ]);
}

/** Página de contacto */
export function buildContactGraph(opts: {
    settings: SiteSettings;
    siteUrl: string;
    pageUrl: string;
    title: string;
    description?: string;
}): Record<string, any> {
    const { settings, siteUrl, pageUrl, title, description } = opts;
    const defaultBreadcrumbs = [
        { name: "Inicio", item: `${norm(siteUrl)}/` },
        { name: "Contacto", item: pageUrl },
    ];
    const webpage = buildWebPageEntity({ url: pageUrl, title, description, siteUrl, type: "ContactPage" });
    return wrapGraph([
        buildWebSiteEntity(settings, siteUrl),
        buildBusinessEntity(settings, siteUrl),
        webpage,
        buildBreadcrumbEntity(defaultBreadcrumbs, pageUrl),
    ]);
}

// ── Legacy exports ─────────────────────────────────────────────────────────────
// Mantienen compatibilidad con páginas no migradas todavía.

export function getAggregateRating(testimonials: any[]) {
    return buildAggregateRating(testimonials);
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    if (!faqs?.length) return null;
    const entity = buildFaqEntity(faqs);
    return entity ? { "@context": "https://schema.org", ...entity } : null;
}

export function generateBreadcrumbsList(items: { name: string; item?: string }[]) {
    const lastItem = items[items.length - 1]?.item || '';
    return {
        "@context": "https://schema.org",
        ...buildBreadcrumbEntity(items, lastItem),
    };
}

export function formatAreaServed(areaData: any, radius?: number, coordinates?: { lat?: string; lng?: string }) {
    if (areaData && Array.isArray(areaData) && areaData.length > 0) {
        return areaData.map((item: any) =>
            typeof item === 'string' ? { "@type": "City", name: item } : item
        );
    }
    if (radius && radius > 0 && coordinates?.lat && coordinates?.lng) {
        return {
            "@type": "GeoCircle",
            geoMidpoint: {
                "@type": "GeoCoordinates",
                latitude: parseFloat(coordinates.lat),
                longitude: parseFloat(coordinates.lng),
            },
            geoRadius: String(radius * 1000),
        };
    }
    return areaData;
}

export function generateLocalBusinessSchema(settings: SiteSettings & { siteUrl?: string }, testimonials: any[] = [], url: string) {
    const siteUrl = settings.siteUrl || norm(url);
    const entity = buildBusinessEntity(settings, siteUrl);
    const rating = buildAggregateRating(testimonials);
    if (rating) entity.aggregateRating = rating;
    return { "@context": "https://schema.org", ...entity };
}

export function generateWebSiteSchema(siteName: string, siteUrl: string) {
    return {
        "@context": "https://schema.org",
        ...buildWebSiteEntity({ siteName }, siteUrl),
    };
}
