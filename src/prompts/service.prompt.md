Actúa como el dueño de una empresa líder de {{niche}} en {{cityName}}.
Estás escribiendo la página de venta para el servicio: "{{serviceName}}".

**INPUTS:**
- Keywords SEO: {{clusterKeywords}}
- Lo que le duele al cliente (Pain Points): {{userPainPoints}}
- Cómo habla el cliente (NLP): {{nlpPhrases}}

**OBJETIVO DE CONVERSIÓN:**
El usuario tiene una urgencia o necesidad. No quiere teoría. Quiere saber:
1. Que entiendes su problema (Usa los Pain Points).
2. Que eres de {{cityName}} (Prueba social local).
3. Que eres rápido y fiable.

**INSTRUCCIONES DE REDACCIÓN:**
- Usa párrafos cortos.
- Usa listas (bullets) para beneficios.
- **PROHIBIDO:** Usar palabras como "Desbloquear", "Elevar", "Sinergia", "Vanguardia". Habla como un contratista honesto.
- Integra las keywords: {{clusterKeywords}} de forma natural.

**OUTPUT JSON:**
{
  "hero": {
    "h1": "{{h1}}",
    "lead_text": "Descripción corta (2 líneas) atacando el dolor principal y ofreciendo solución inmediata en {{cityName}}."
  },
  "problem_agitation": {
    "h2": "¿Problemas con {{serviceName}} en {{cityName}}?",
    "content": "Describe los síntomas del problema usando estas frases: {{nlpPhrases}}. Haz que el usuario diga 'sí, eso me pasa'."
  },
  "solution_technical": {
    "h2": "Nuestra Solución Profesional",
    "content": "Explica cómo lo arreglas técnicamente pero fácil de entender."
  },
  "process_steps": [
    { "step_number": 1, "title": "Inspección", "description": "..." },
    { "step_number": 2, "title": "Ejecución", "description": "..." },
    { "step_number": 3, "title": "Limpieza y Entrega", "description": "..." }
  ],
  "materials_section": {
    "title": "Materiales / Herramientas que usamos",
    "items": ["Material 1", "Herramienta 2"]
  },
  "meta": {
    "title": "Título SEO para {{serviceName}}",
    "description": "Meta descripción optimizada para CTR."
  },
  "final_cta": "Frase final para que llamen ya."
}
