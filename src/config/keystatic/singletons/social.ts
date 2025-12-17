import { fields, singleton } from '@keystatic/core';

export const social = singleton({
    label: '🌐 Redes Sociales',
    path: 'src/content/social/global',
    schema: {
        facebook: fields.text({
            label: 'Facebook URL',
            description: 'URL completa (ej: https://facebook.com/tunegocio)'
        }),
        instagram: fields.text({
            label: 'Instagram URL',
            description: 'URL completa (ej: https://instagram.com/tunegocio)'
        }),
    },
});
