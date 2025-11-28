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
        // Business info
        siteName: business?.data?.siteName || 'Mi Negocio',
        niche: business?.data?.niche || '',
        logo: business?.data?.logo || '',
        siteUrl: business?.data?.siteUrl || '',
        businessType: business?.data?.businessType || 'LocalBusiness',
        city: business?.data?.city || '',
        address: business?.data?.address || '',
        coordinates: business?.data?.coordinates || { lat: '', lng: '' },
        phone: business?.data?.phone || '',
        whatsapp: business?.data?.whatsapp || '',
        email: business?.data?.email || '',
        schedule: business?.data?.schedule || '',
        nif: business?.data?.nif || '',
        ctaText: business?.data?.ctaText || 'Contactar',

        // Design
        theme: design?.data?.theme || 'industrial',

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
        paymentAccepted: schema?.data?.paymentAccepted || [],
        foundingDate: schema?.data?.foundingDate || '',
        slogan: schema?.data?.slogan || '',
    };
}
