Escribe una Landing Page Local para "{{niche}}" en el barrio/zona de "{{location}}", {{cityName}}.

CONTEXTO GENERAL DE LA CIUDAD:
{{cityContext}}

IMPORTANTE - CONTEXTO LOCAL:
- Investiga (simula conocimiento) sobre el tipo de viviendas en {{location}} (ej: pisos antiguos, obra nueva, casas).
- Usa el JSON de contexto: ¿Es un barrio de clase trabajadora, "hip" o de lujo? Adapta el tono.
- Menciona calles principales o puntos de referencia de {{location}} si es posible.

OUTPUT FORMAT:
Razonamiento breve sobre el barrio -> ```json {...} ```

```json
{
    "name": "{{location}}",
    "seoTitle": "{{niche}} en {{location}} | Servicio Local",
    "seoDesc": "Servicio de {{niche}} en {{location}}. Llegamos rápido, conocemos la zona. Presupuesto gratis.",
    "hero": {
        "title": "{{niche}} en {{location}}",
        "subtitle": "Servicio rápido y cercano en tu barrio."
    },
    "features": [
        { "title": "Rapidez", "description": "Llegamos en 20min a {{location}}", "icon": "Clock" },
        { "title": "Vecinos", "description": "Ya hemos trabajado en tu zona", "icon": "MapPin" },
        { "title": "Garantía", "description": "100% Garantizado", "icon": "ShieldCheck" }
    ],
    "content": "Markdown (300 palabras). Muy enfocado en la cercanía y conocimiento del barrio."
}
