import { config } from '@keystatic/core';

// Singletons
import { business } from './src/config/keystatic/singletons/business';
import { design } from './src/config/keystatic/singletons/design';
import { navigation } from './src/config/keystatic/singletons/navigation';
import { footer } from './src/config/keystatic/singletons/footer';
import { legalNotice, privacyPolicy, cookiesPolicy } from './src/config/keystatic/singletons/legal';
import { homepage } from './src/config/keystatic/singletons/homepage';
import { about } from './src/config/keystatic/singletons/about';
import { zonasPage } from './src/config/keystatic/singletons/zonasPage';
import { serviciosPage } from './src/config/keystatic/singletons/serviciosPage';

// Collections
import { services } from './src/config/keystatic/collections/services';
import { locations } from './src/config/keystatic/collections/locations';
import { serviceAreas } from './src/config/keystatic/collections/serviceAreas';
import { projects } from './src/config/keystatic/collections/projects';
import { testimonials } from './src/config/keystatic/collections/testimonials';
import { blog } from './src/config/keystatic/collections/blog';

export default config({
    storage: {
        kind: 'local',
    },

    ui: {
        brand: {
            name: 'Rank & Rent CMS',
        },
        navigation: {
            '⚙️ Configuración': ['business', 'design'],
            '---': [],
            '📝 Contenido': ['homepage', 'about', 'serviciosPage', 'zonasPage', 'services', 'locations', 'serviceAreas', 'projects', 'testimonials', 'blog'],
            '----': [],
            '📄 Páginas Legales': ['navigation', 'footer', 'legalNotice', 'privacyPolicy', 'cookiesPolicy'],
        },
    },

    singletons: {
        business,
        design,
        navigation,
        footer,
        legalNotice,
        privacyPolicy,
        cookiesPolicy,
        homepage,
        about,
        serviciosPage,
        zonasPage,
    },

    collections: {
        services,
        locations,
        serviceAreas,
        projects,
        testimonials,
        blog,
    },
});
