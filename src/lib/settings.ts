import { getEntry } from 'astro:content';

/**
 * Obtiene la configuración completa del sitio.
 * Fuente única: business (todo) + design (tema y fuentes).
 */
export async function getSettings() {
    const [business, design] = await Promise.all([
        getEntry('business', 'global'),
        getEntry('design', 'global'),
    ]);

    const b = business?.data as any;
    const d = design?.data as any;

    let seoTitle = '';
    let seoDescription = '';
    try {
        const seoData = b?.seo ? JSON.parse(b.seo) : {};
        seoTitle = seoData.title || '';
        seoDescription = seoData.description || '';
    } catch(e) {}

    return {
        // ── Negocio ──────────────────────────────────────────────────────────
        siteName:     b?.siteName     || 'Mi Negocio Local',
        niche:        b?.niche        || 'Servicio Profesional',
        logo:         b?.logo         || '',
        siteUrl:      b?.siteUrl      || 'https://localhost:4321',
        businessType: b?.businessType || 'LocalBusiness',
        ctaText:      b?.ctaText      || 'Pedir Presupuesto',

        // ── Contacto ─────────────────────────────────────────────────────────
        city:     b?.city     || 'Tu Ciudad',
        address:  b?.address  || '',
        coordinates: {
            lat: b?.coordinates?.lat || '40.4168',
            lng: b?.coordinates?.lng || '-3.7038',
        },
        phone:    b?.phone    || '600 000 000',
        whatsapp: b?.whatsapp || '34600000000',
        email:    b?.email    || 'contacto@ejemplo.com',
        schedule: b?.schedule || 'Lunes a Viernes: 9:00 - 18:00',
        nif:      b?.nif      || '',

        // ── SEO ───────────────────────────────────────────────────────────────
        seoTitle:       seoTitle,
        seoDescription: seoDescription,
        slogan:         b?.slogan         || '',
        foundingDate:   b?.foundingDate   || '',

        // ── Social ────────────────────────────────────────────────────────────
        facebook:  b?.facebook  || '',
        instagram: b?.instagram || '',

        // ── Analytics ─────────────────────────────────────────────────────────
        googleAnalyticsId:         b?.googleAnalyticsId         || '',
        gtmId:                     b?.gtmId                     || '',
        searchConsoleVerification: b?.searchConsoleVerification || '',
        n8nWebhookUrl:             b?.n8nWebhookUrl             || '',

        // ── Schema.org ────────────────────────────────────────────────────────
        priceRange:      b?.priceRange      || '',
        openingHours:    b?.openingHours    || [],
        areaServed:      b?.areaServed      || [],
        serviceRadius:   b?.serviceRadius   || 0,
        paymentAccepted: b?.paymentAccepted || [],

        // ── Diseño (solo desde design singleton) ─────────────────────────────
        themeSettings:      d?.themeSettings,
        fontPair:           d?.fontPair           || 'modern',
        borderRadius:       d?.borderRadius       || 'rounded',
        buttonStyle:        d?.buttonStyle        || 'solid',
        heroOverlayOpacity: d?.heroOverlayOpacity ?? 0.6,
    };
}
