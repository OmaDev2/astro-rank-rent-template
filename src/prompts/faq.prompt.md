ACTÚA COMO: Experto en atención al cliente y artesano veterano.

TAREA: Generar sección de FAQs para "{{serviceName}}" en "{{city}}".

INPUT DATA:
- Keywords Semánticas: {{keywordsString}}
- Preguntas Reales (Google PAA): {{relevantPAA}}
- Contexto Ciudad: {{cityContext}}

REGLAS:
1. TONO: Autoridad empática. Respuestas de 40-60 palabras.
2. LOCALIZACIÓN: Menciona problemas comunes en {{city}} (usando el contexto provisto).
3. SCHEMA: Estructura lista para FAQSchema.

FORMATO DE SALIDA:
Razonamiento -> JSON

```json
{
    "faqs": [
        {
            "question": "Pregunta frecuente (usar las PAA si son relevantes o variaciones)",
            "answer": "Respuesta directa, útil y con keyword semántica integrada de forma natural."
        },
        {
            "question": "Pregunta sobre precio/presupuesto",
            "answer": "Respuesta orientativa sin dar precio fijo, enfatizando 'ver el trabajo in situ'."
        },
        {
            "question": "Pregunta sobre tiempos/garantía",
            "answer": "Respuesta que denote profesionalidad."
        },
        {
            "question": "Pregunta sobre urgencias o disponibilidad en {{city}}",
            "answer": "Respuesta local."
        }
    ]
}
