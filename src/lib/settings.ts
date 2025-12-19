import { getEntry } from 'astro:content';

/**
 * Helper para obtener toda la configuración del sitio de forma unificada
 * Combina los datos de business, design, social, analytics y schema
 */
export async function getSettings() {
    const business = await getEntry('business', 'global');
    const design = await getEntry('design', 'global');
    const social = await getEntry('social', 'global');
    const analytics = await getEntry('analytics', 'global');
    const schema = await getEntry('schema', 'global');

    return {
        // Business info (Datos Dummy por defecto para evitar errores)
        siteName: business?.data?.siteName || 'Mi Negocio Local',
        niche: business?.data?.niche || 'Servicio Profesional',
        logo: business?.data?.logo || '',
        siteUrl: business?.data?.siteUrl || 'https://ejemplo.com',
        businessType: business?.data?.businessType || 'LocalBusiness',
        city: business?.data?.city || 'Tu Ciudad',
        address: business?.data?.address || 'Calle Principal 123',
        coordinates: {
            lat: business?.data?.coordinates?.lat || '40.4168',
            lng: business?.data?.coordinates?.lng || '-3.7038'
        },
        phone: business?.data?.phone || '600 000 000',
        whatsapp: business?.data?.whatsapp || '600 000 000',
        email: business?.data?.email || 'contacto@ejemplo.com',
        schedule: business?.data?.schedule || 'Lunes a Viernes: 9:00 - 18:00',
        nif: business?.data?.nif || 'B12345678',
        ctaText: business?.data?.ctaText || 'PEDIR PRESUPUESTO',

        // Design
        themeSettings: design?.data?.themeSettings, // NEW: Full JSON object/string
        fontPair: design?.data?.fontPair || 'modern',
        heroOverlayOpacity: design?.data?.heroOverlayOpacity, // Passed to Layout

        // Social
        facebook: social?.data?.facebook || '',
        instagram: social?.data?.instagram || '',

        // Analytics
        googleAnalyticsId: analytics?.data?.googleAnalyticsId || '',
        gtmId: analytics?.data?.gtmId || '',
        searchConsoleVerification: analytics?.data?.searchConsoleVerification || '',

        // Schema.org
        priceRange: schema?.data?.priceRange || '',
        openingHours: schema?.data?.openingHours || [],
        areaServed: schema?.data?.areaServed || [],
        serviceRadius: schema?.data?.serviceRadius || 0,
        paymentAccepted: schema?.data?.paymentAccepted || [],
        foundingDate: schema?.data?.foundingDate || '',
        slogan: schema?.data?.slogan || '',
    };
}
