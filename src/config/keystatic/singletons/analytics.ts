import { fields, singleton } from '@keystatic/core';

export const analytics = singleton({
    label: '📊 Analytics y Tracking',
    path: 'src/content/analytics/global',
    schema: {
        googleAnalyticsId: fields.text({
            label: 'Google Analytics 4 ID',
            description: 'Ej: G-XXXXXXXXXX'
        }),
        gtmId: fields.text({
            label: 'Google Tag Manager ID',
            description: 'Ej: GTM-XXXXXXX'
        }),
        searchConsoleVerification: fields.text({
            label: 'Google Search Console - Código de Verificación',
            description: 'Código meta tag de verificación (solo el contenido, sin <meta>). Ej: abc123def456...',
        }),
        n8nWebhookUrl: fields.text({
            label: 'n8n Webhook URL (Click Tracking)',
            description: 'URL del webhook n8n para tracking de clics en teléfono y WhatsApp. Ej: https://tu-n8n.com/webhook/tracking-clicks',
        }),
    },
});
