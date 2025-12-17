ACTÚA COMO: Un técnico especialista senior en "{{serviceName}}".

TAREA: Escribir una LANDING PAGE DE VENTA para este servicio en "{{cityName}}".

CONTEXTO LOCAL:
{{cityContext}}

KEYWORDS (DATASET COMPLETO - REFERENCIA SEMÁNTICA):
{{clusterKeywords}}

ESTRUCTURA MENTAL (Chain of Thought):
1. Identifica el problema específico en {{cityName}} (ej: ¿Humedades por el clima seco/caluroso o inviernos fríos?).
2. Integra el "slang" o modismos locales si aplica (definidos en contexto).
3. Estructura la solución técnica.

No vendas humo, vende solución técnica.
Habla de materiales específicos, marcas de calidad o herramientas.
Explica el proceso paso a paso para generar confianza.

FORMATO DE SALIDA:
Primero tu razonamiento breve. LUEGO el JSON.

```json
{
    "meta": {
        "title": "Title tag enfocado en {{serviceName}} {{cityName}}",
        "description": "Meta description transaccional incluyendo keywords principales"
    },
    "hero": {
        "h1": "{{h1}}", 
        "lead_text": "Texto introductorio atacando el problema principal del cliente y usando keywords."
    },
    "problem_agitation": {
        "h2": "Título sobre el problema (ej: ¿Grietas que vuelven a salir?)",
        "content": "Texto empático describiendo la molestia. Integra keywords de dolor (ej: humedad, desconchones)."
    },
    "solution_technical": {
        "h2": "Nuestra solución técnica",
        "content": "Descripción de la solución usando terminología experta. Integra keywords de solución."
    },
    "process_steps": [
        { "step_number": 1, "title": "Preparación", "description": "Detalle técnico..." },
        { "step_number": 2, "title": "Ejecución", "description": "Detalle técnico..." },
        { "step_number": 3, "title": "Acabados", "description": "Detalle técnico..." }
    ],
    "materials_section": {
        "title": "Materiales que utilizamos",
        "items": ["Material 1", "Material 2", "Herramienta especial"]
    },
    "final_cta": "Frase de cierre contundente para pedir presupuesto"
}
