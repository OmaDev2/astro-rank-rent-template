/**
 * Configuración centralizada del negocio
 * 
 * Cambia estos valores según los datos reales de tu empresa.
 * Estos datos se utilizan en toda la web automáticamente.
 */

export const businessConfig = {
    // Información básica
    name: "Herrero Zaragoza",
    tagline: "Expertos en Herrería y Forja desde 2010",
    description: "Herreros profesionales en Zaragoza. Especialistas en rejas de seguridad, cerramientos, puertas metálicas y estructuras de hierro a medida.",

    // Contacto
    contact: {
        phone: "644371602",
        phoneRaw: "644371602", // Sin espacios para enlaces tel:
        whatsapp: "34644371602", // Código país + número sin espacios
        email: "herreroenzaragoza@gmail.com",
        address: {
            street: "",
            city: "Zaragoza",
            postalCode: "",
            province: "Zaragoza",
            country: "España"
        }
    },

    // Redes sociales
    social: {
        facebook: "",
        instagram: "",
        linkedin: "", // Dejar vacío si no tienes
        youtube: "",  // Dejar vacío si no tienes
    },

    // Horario de atención
    schedule: {
        weekdays: "Lunes a Viernes: 8:00 - 18:00",
        saturday: "Sábado: 9:00 - 14:00",
        sunday: "Domingo: Cerrado",
        emergency: ""
    },

    // Datos legales
    legal: {
        cif: "",
        registroMercantil: "",
        foundedYear: 2010,
    },

    // Área de servicio
    serviceArea: {
        main: "Zaragoza",
        radius: "50 km",
        provinces: ["Zaragoza"],
    },

    // Características del negocio
    features: [
        "Más de 15 años de experiencia",
        "Taller propio",
        "Presupuesto Gratis sin compromiso",
        "",
        "Materiales de primera calidad",
        "Respuesta en 24h",
    ],

    // SEO por defecto
    seo: {
        defaultTitle: "Herrero Zaragoza | Rejas, Cerramientos y Puertas Metálicas",
        defaultDescription: "Herreros profesionales en Zaragoza con más de 15 años de experiencia. Fabricación e instalación de rejas, cerramientos, puertas y estructuras metálicas a medida.",
        keywords: ["herrero zaragoza", "rejas seguridad", "cerramientos", "puertas metálicas", "forja artesanal"],
        ogImage: "/images/og-image.jpg", // Imagen para compartir en redes sociales
    },

    // Mensajes predefinidos
    messages: {
        whatsapp: "Hola, me gustaría solicitar información sobre sus servicios de herrería.",
        contactForm: "Solicita tu presupuesto gratuito sin compromiso. Te respondemos en menos de 24 horas.",
        emergency: "¿Necesitas un herrero urgente? Llamamos ahora y te atendemos lo antes posible.",
    }
} as const;

// Tipo TypeScript para autocompletado
export type BusinessConfig = typeof businessConfig;

// Helper para formatear el teléfono
export const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
};

// Helper para crear URL de WhatsApp
export const getWhatsAppUrl = (customMessage?: string, location?: string) => {
    let message = customMessage || businessConfig.messages.whatsapp;

    // Si hay una localidad, añadirla al mensaje
    if (location) {
        message = `Hola, me gustaría solicitar información sobre sus servicios de herrería en ${location}.`;
    }

    return `https://wa.me/${businessConfig.contact.whatsapp}?text=${encodeURIComponent(message)}`;
};

// Helper para crear URL de teléfono
export const getPhoneUrl = () => {
    return `tel:${businessConfig.contact.phoneRaw}`;
};

// Helper para crear URL de email
export const getEmailUrl = (subject?: string) => {
    const subjectParam = subject ? `?subject=${encodeURIComponent(subject)}` : '';
    return `mailto:${businessConfig.contact.email}${subjectParam}`;
};
