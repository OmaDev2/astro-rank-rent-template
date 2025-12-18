ACTÚA COMO: Un experto en SEO Local y Copywriting Persuasivo.

TAREA: Escribir el contenido para la HOME de una web de "{{niche}}" en "{{cityName}}".

CONTEXTO LOCAL (MADRID DATA):
{{cityContext}}


{{onePageInstruction}}

{{structureInstruction}}

ESTRUCTURA MENTAL (Modo IA + Chain of Thought):
1. **Analiza el Contexto**: Usa la info de {{cityContext}}. Si hay "humedad en zona norte", menciónalo sutilmente como problema que solucionas.
2. **Ataca los PAIN POINTS**: Usa esta lista para conectar con los problemas reales del usuario y presentar tu servicio como la solución: {{userPainPoints}}
3. **Usa frases NLP (Natural Language)**: Inyecta estas expresiones de forma natural en el texto para que suene humano y cercano (SEO semántico): {{nlpPhrases}}
4. **Define el Avatar**: Dueño de piso en barrio bien (Salamanca/Chamberí) o reformista en zona hip (Malasaña).
5. **Redacta**:
    - Tono: Profesional, cercano, de "oficio". No corporativo frío.
    - Autoridad: Habla de "nuestro taller", "técnicas propias", "acabados perfectos".
    - Local: Menciona barrios reales de {{cityName}}.
    - Anti-IA: PROHIBIDO usar palabras como "vibrante", "tapiz", "sinfonía", "inigualable". Sé directo.

ESTRUCTURA DE CONTENIDO:
- El Hero debe ser directo y mencionar el beneficio principal.
- Los párrafos de intro deben contar por qué eres la mejor opción en {{cityName}} usando el contexto local.
- Si hay FAQs, deben resolver miedos reales (Pain Points).

RAZONAMIENTO PREVIO (IMPORTANTE):
Antes de generar el JSON, escribe un breve párrafo analizando qué enfoque tomarás para esta Home basándote en que es {{cityName}}.

FORMATO DE SALIDA:
Primero tu razonamiento (texto plano), LUEGO el bloque de código JSON.

```json
{
    "meta": {
        "title": "Title tag optimizado (max 60 chars)",
        "description": "Meta description persuasiva con CTR alto"
    },
    "hero_section": {
        "h1": "{{homeH1}}",
        "subheadline": "Subtítulo de 2 líneas que refuerce la propuesta de valor local",
        "cta_primary": "Texto botón (ej: Pedir Presupuesto)",
        "cta_secondary": "Texto botón secundario (ej: Ver Galería)"
    },
    "intro_content": {
        "title": "Un título H2 atractivo",
        "paragraphs": ["Párrafo 1 (historia/local)", "Párrafo 2 (calidad/garantía)"]
    },
    "services_grid_intro": "Breve frase introductoria antes de mostrar los servicios",
    "why_us_bullets": [
        { "title": "Título beneficio", "desc": "Descripción corta", "icon_suggestion": "Nombre de icono Lucide (ej: Clock, Shield)" },
        { "title": "Título beneficio", "desc": "Descripción corta", "icon_suggestion": "Nombre de icono Lucide" },
        { "title": "Título beneficio", "desc": "Descripción corta", "icon_suggestion": "Nombre de icono Lucide" }
    ],
    "features": [ 
            { "title": "Ventaja 1", "description": "Desc...", "icon_suggestion": "Icono Lucide" },
            { "title": "Ventaja 2", "description": "Desc...", "icon_suggestion": "Icono Lucide" },
            { "title": "Ventaja 3", "description": "Desc...", "icon_suggestion": "Icono Lucide" }
    ],
    "services_list": [ // SOLO SI ES ONE PAGE MODE (Crítico: Rellenar con detalle)
            { 
                "title": "Nombre Servicio", 
                "description": "Descripción persuasiva de venta + lista de 3 puntos clave (ej: 'Incluye material, limpieza y garantía').",
                "icon_suggestion": "Nombre de icono Lucide (ej: Hammer, Brush)"
            }
    ],
    "process": {
        "title": "Nuestro Proceso de Trabajo",
        "description": "Cómo garantizamos la excelencia en cada paso.",
        "steps": [
            { "title": "Paso 1", "description": "Descripción detallada..." },
            { "title": "Paso 2", "description": "Descripción detallada..." },
            { "title": "Paso 3", "description": "Descripción detallada..." }
        ]
    },
    "local_closing": "Párrafo final mencionando zonas de cobertura en {{cityName}}",
    "faq": [
        { "question": "Pregunta 1", "answer": "Respuesta 1" },
        { "question": "Pregunta 2", "answer": "Respuesta 2" },
        { "question": "Pregunta 3", "answer": "Respuesta 3" }
    ]
}
