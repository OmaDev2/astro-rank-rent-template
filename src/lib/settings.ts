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
        phone:    b?.phone    || '',
        whatsapp: b?.whatsapp || '',
        email:    b?.email    || '',
        schedule: b?.schedule || 'Lunes a Viernes: 9:00 - 18:00',
        nif:      b?.nif      || '',
        ownerName: b?.ownerName || '',

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
        // ── Diseño (Mapeado de grupos anidados de design.ts) ────────────────
        themeSettings:      d?.identity?.themeSettings || d?.themeSettings,
        fontPair:           d?.identity?.fontPair      || d?.fontPair           || 'modern',
        // Activado por `npm run setup-fonts`: deja de cargar Google Fonts (usa fonts-local.css)
        selfHostFonts:      d?.identity?.selfHostFonts ?? d?.selfHostFonts       ?? false,
        typographyScale:    d?.identity?.typographyScale || d?.typographyScale  || '',

        navbarStyle:        d?.layout?.navbarStyle     || d?.navbarStyle        || 'glass',
        footerStyle:        d?.layout?.footerStyle     || d?.footerStyle        || 'full',
        heroStyle:          d?.layout?.heroStyle       || d?.heroStyle          || 'image',
        headingStyle:       d?.layout?.headingStyle    || d?.headingStyle       || 'normal',
        sectionSpacing:     d?.layout?.sectionSpacing  || d?.sectionSpacing     || 'normal',

        borderRadius:       d?.effects?.borderRadius   || d?.borderRadius       || 'rounded',
        buttonStyle:        d?.effects?.buttonStyle    || d?.buttonStyle        || 'solid',
        shadowStyle:        d?.effects?.shadowStyle    || d?.shadowStyle        || 'elevated',
        heroOverlayOpacity: d?.effects?.heroOverlayOpacity ?? d?.heroOverlayOpacity ?? 0.6,
        animationStyle:     d?.effects?.animationStyle || d?.animationStyle     || 'subtle',
        sectionDivider:     d?.effects?.sectionDivider || d?.sectionDivider     || 'none',
        bgTexture:          d?.effects?.bgTexture      || d?.bgTexture          || 'none',

        favicon:             d?.advanced?.favicon      || d?.favicon             || '',
        themeColor:         d?.advanced?.themeColor    || d?.themeColor         || '',
        customCss:          d?.advanced?.customCss     || d?.customCss          || '',

        // ── Orden de visualización ────────────────────────────────────────────
        servicePriority:  (b?.servicePriority  || []) as string[],
        locationPriority: (b?.locationPriority || []) as string[],
        ctaTagline:       b?.ctaTagline || '',

        // ── Botones flotantes ─────────────────────────────────────────────────
        stickyPhoneMobile:  d?.contact?.stickyPhoneMobile  ?? true,
        stickyPhoneDesktop: d?.contact?.stickyPhoneDesktop ?? false,
        whatsappMobile:     d?.contact?.whatsappMobile     ?? true,
        whatsappDesktop:    d?.contact?.whatsappDesktop    ?? true,
    };
}
