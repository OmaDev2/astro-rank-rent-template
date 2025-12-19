import { fields, singleton } from '@keystatic/core';

export const legalNotice = singleton({
    label: '⚖️ Aviso Legal',
    path: 'src/content/legal/aviso-legal',
    format: { contentField: 'content' },
    schema: {
        content: fields.mdx({
            label: 'Contenido',
            options: {
                image: false,
            }
        }),
    },
});

export const privacyPolicy = singleton({
    label: '🛡️ Política de Privacidad',
    path: 'src/content/legal/privacidad',
    format: { contentField: 'content' },
    schema: {
        content: fields.mdx({
            label: 'Contenido',
            options: {
                image: false,
            }
        }),
    },
});

export const cookiesPolicy = singleton({
    label: '🍪 Política de Cookies',
    path: 'src/content/legal/cookies',
    format: { contentField: 'content' },
    schema: {
        content: fields.mdx({
            label: 'Contenido',
            options: {
                image: false,
            }
        }),
    },
});
