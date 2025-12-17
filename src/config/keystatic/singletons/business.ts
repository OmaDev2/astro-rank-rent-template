import { fields, singleton } from '@keystatic/core';

export const business = singleton({
    label: '🏢 Información del Negocio',
    path: 'src/content/business/global',
    schema: {
        siteName: fields.text({ label: 'Nombre del Negocio' }),
        niche: fields.text({ label: 'Nicho (ej: Fontanería, Herrería)' }),

        logo: fields.image({
            label: 'Logo del Negocio',
            description: 'Recomendado: PNG transparente, mínimo 200x200px',
            directory: 'src/assets/images',
            publicPath: '@assets/images',
        }),

        siteUrl: fields.text({
            label: 'URL del Sitio',
            description: 'Con https:// (ej: https://midominio.com)',
        }),

        businessType: fields.select({
            label: 'Tipo de Negocio (Schema.org)',
            description: 'Ayuda a Google a entender tu negocio',
            options: [
                { label: 'Abogado / Despacho (LegalService)', value: 'LegalService' },
                { label: 'Agencia de Viajes (TravelAgency)', value: 'TravelAgency' },
                { label: 'Alquiler de Coches (AutoRental)', value: 'AutoRental' },
                { label: 'Arquitecto (ProfessionalService)', value: 'ProfessionalService' },
                { label: 'Aseguradora (InsuranceAgency)', value: 'InsuranceAgency' },
                { label: 'Barbería (BarberShop)', value: 'BarberShop' },
                { label: 'Bienes Raíces / Inmobiliaria (RealEstateAgent)', value: 'RealEstateAgent' },
                { label: 'Carpintería (ProfessionalService)', value: 'ProfessionalService' },
                { label: 'Centro Deportivo / Gym (SportsActivityLocation)', value: 'SportsActivityLocation' },
                { label: 'Cerrajería (Locksmith)', value: 'Locksmith' },
                { label: 'Clínica Dental (Dentist)', value: 'Dentist' },
                { label: 'Clínica Médica (MedicalBusiness)', value: 'MedicalBusiness' },
                { label: 'Consultoría (ProfessionalService)', value: 'ProfessionalService' },
                { label: 'Contabilidad / Gestoría (AccountingService)', value: 'AccountingService' },
                { label: 'Contratista General (GeneralContractor)', value: 'GeneralContractor' },
                { label: 'Cuidado de Mascotas (PetStore)', value: 'PetStore' },
                { label: 'Electricista (Electrician)', value: 'Electrician' },
                { label: 'Estética / Belleza (HealthAndBeautyBusiness)', value: 'HealthAndBeautyBusiness' },
                { label: 'Farmacia (Pharmacy)', value: 'Pharmacy' },
                { label: 'Floristería (Florist)', value: 'Florist' },
                { label: 'Fontanería (Plumber)', value: 'Plumber' },
                { label: 'Fotografía (ProfessionalService)', value: 'ProfessionalService' },
                { label: 'Herrería / Metalurgia (LocalBusiness)', value: 'LocalBusiness' },
                { label: 'Jardinería / Paisajismo (LocalBusiness)', value: 'LocalBusiness' },
                { label: 'Joyería (JewelryStore)', value: 'JewelryStore' },
                { label: 'Limpieza (ProfessionalService)', value: 'ProfessionalService' },
                { label: 'Mudanzas (MovingCompany)', value: 'MovingCompany' },
                { label: 'Pintores (HousePainter)', value: 'HousePainter' },
                { label: 'Peluquería (HairSalon)', value: 'HairSalon' },
                { label: 'Reformas / Construcción (HomeAndConstructionBusiness)', value: 'HomeAndConstructionBusiness' },
                { label: 'Restaurante (Restaurant)', value: 'Restaurant' },
                { label: 'Reparación de Coches / Taller (AutoRepair)', value: 'AutoRepair' },
                { label: 'Reparación de Techos (RoofingContractor)', value: 'RoofingContractor' },
                { label: 'Seguridad (LocalBusiness)', value: 'LocalBusiness' },
                { label: 'Servicio de Taxis (TaxiService)', value: 'TaxiService' },
                { label: 'Tienda (Store)', value: 'Store' },
                { label: 'Veterinario (VeterinaryCare)', value: 'VeterinaryCare' },
                { label: 'Otro (LocalBusiness Generico)', value: 'LocalBusiness' },
            ],
            defaultValue: 'LocalBusiness',
        }),

        city: fields.text({ label: 'Ciudad Principal' }),
        address: fields.text({ label: 'Dirección Completa' }),

        coordinates: fields.object({
            lat: fields.text({ label: 'Latitud', description: 'Ej: 41.6488' }),
            lng: fields.text({ label: 'Longitud', description: 'Ej: -0.8891' }),
        }, {
            label: 'Coordenadas GPS',
            description: 'Para Google Maps. Búscalas en Google Maps > clic derecho > coordenadas'
        }),

        phone: fields.text({ label: 'Teléfono' }),
        whatsapp: fields.text({ label: 'WhatsApp (ej: 34600000000)' }),
        email: fields.text({ label: 'Email' }),
        schedule: fields.text({
            label: 'Horario de Atención',
            description: 'Ej: Lun-Vie 9:00-20:00, Sáb 10:00-14:00'
        }),

        nif: fields.text({ label: 'NIF / CIF' }),

        ctaText: fields.text({
            label: 'Texto Botón CTA',
            description: 'Ej: Pedir Presupuesto, Llamar Ahora'
        }),
    },
});
