import { config } from '@keystatic/core';

// Singletons
import { business } from './src/config/keystatic/singletons/business';
import { design } from './src/config/keystatic/singletons/design';
import { social } from './src/config/keystatic/singletons/social';
import { analytics } from './src/config/keystatic/singletons/analytics';
import { schema } from './src/config/keystatic/singletons/schema';
import { navigation } from './src/config/keystatic/singletons/navigation';
import { footer } from './src/config/keystatic/singletons/footer';
import { homepage } from './src/config/keystatic/singletons/homepage';

// Collections
import { services } from './src/config/keystatic/collections/services';
import { locations } from './src/config/keystatic/collections/locations';
import { projects } from './src/config/keystatic/collections/projects';
import { testimonials } from './src/config/keystatic/collections/testimonials';
import { blog } from './src/config/keystatic/collections/blog';

export default config({
    storage: {
        kind: 'local',
    },

    // --- INTERFAZ DE USUARIO ---
    ui: {
        // Marca personalizada
        brand: {
            name: 'Rank & Rent Template',
        },

        // Navegación organizada
        navigation: {
            '📝 Contenido': ['services', 'locations', 'projects', 'testimonials', 'blog', 'homepage'],
            '---': [],
            '⚙️ Configuración': ['business', 'design', 'social', 'analytics', 'schema', 'navigation', 'footer'],
        },
    },

    // --- SINGLETONS (Configuración Global) ---
    singletons: {
        business,
        design,
        social,
        analytics,
        schema,
        navigation,
        footer,
        homepage,
    },

    // --- COLECCIONES ---
    collections: {
        services,
        locations,
        projects,
        testimonials,
        blog,
    },
});