import type { Block } from '../types';

export type ServicePreset = 'standard_service' | 'visual_service' | 'technical_service' | 'price_focused_service';
export type LocationPreset = 'standard_location' | 'seo_location' | 'trust_location' | 'compact_location';
export type PagePreset = ServicePreset | LocationPreset;

const SERVICE_PRESETS: Record<ServicePreset, Block[]> = {
    standard_service: [
        { discriminant: 'hero' },
        { discriminant: 'trust_strip' },
        { discriminant: 'problem_solution' },
        { discriminant: 'price_factors' },
        { discriminant: 'faq' },
        { discriminant: 'cta' },
    ],
    visual_service: [
        { discriminant: 'hero' },
        { discriminant: 'gallery' },
        { discriminant: 'materials' },
        { discriminant: 'before_after' },
        { discriminant: 'testimonials' },
        { discriminant: 'cta' },
    ],
    technical_service: [
        { discriminant: 'hero' },
        { discriminant: 'materials' },
        { discriminant: 'comparison' },
        { discriminant: 'process' },
        { discriminant: 'price_factors' },
        { discriminant: 'faq' },
        { discriminant: 'cta' },
    ],
    price_focused_service: [
        { discriminant: 'hero' },
        { discriminant: 'trust_strip' },
        { discriminant: 'price_factors' },
        { discriminant: 'comparison' },
        { discriminant: 'testimonials' },
        { discriminant: 'faq' },
        { discriminant: 'cta' },
    ],
};

const LOCATION_PRESETS: Record<LocationPreset, Block[]> = {
    standard_location: [
        { discriminant: 'hero' },
        { discriminant: 'content' },
        { discriminant: 'location_services' },
        { discriminant: 'map' },
        { discriminant: 'cta' },
    ],
    seo_location: [
        { discriminant: 'hero' },
        { discriminant: 'content' },
        { discriminant: 'service_areas' },
        { discriminant: 'location_services' },
        { discriminant: 'faq' },
        { discriminant: 'map' },
        { discriminant: 'cta' },
    ],
    trust_location: [
        { discriminant: 'hero' },
        { discriminant: 'trust_strip' },
        { discriminant: 'testimonials' },
        { discriminant: 'location_services' },
        { discriminant: 'faq' },
        { discriminant: 'map' },
        { discriminant: 'cta' },
    ],
    compact_location: [
        { discriminant: 'hero' },
        { discriminant: 'location_services' },
        { discriminant: 'map' },
        { discriminant: 'cta' },
    ],
};

export function getPresetBlocks(
    pageType: 'service' | 'location',
    preset: string | undefined,
): Block[] {
    if (pageType === 'service' && preset) {
        return SERVICE_PRESETS[preset as ServicePreset] ?? SERVICE_PRESETS.standard_service;
    }
    if (pageType === 'location' && preset) {
        return LOCATION_PRESETS[preset as LocationPreset] ?? LOCATION_PRESETS.standard_location;
    }
    return [];
}
