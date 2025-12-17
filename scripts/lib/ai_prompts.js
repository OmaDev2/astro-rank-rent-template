export const SERVICE_DISCOVERY_PROMPT = (niche) => `
ACTÚA COMO: Experto en SEO Local, Estrategia de Negocios y Arquitectura Web.

OBJETIVO: Identificar una lista de 10-15 "SERVICIOS COMERCIALES INDEPENDIENTES" para el nicho: "${niche}".

DEFINICIÓN DE "SERVICIO COMERCIAL INDEPENDIENTE":
- Es algo que un cliente buscaría activamente para CONTRATAR.
- Es un servicio por el que se cobra dinero por sí solo.
- NO es una característica (ej: "presupuesto gratis", "protección de muebles").
- NO es un paso del proceso (ej: "preparación de superficie", "limpieza final").
- NO es un material (ej: "pintura plástica").

INSTRUCCIONES CRÍTICAS:
1. DESGLOSA AL MÁXIMO PERO CON SENTIDO COMERCIAL:
   - ❌ MAL: "Alisado y pintura" (Son dos servicios distintos)
   - ✅ BIEN: "Alisado de paredes", "Pintura de interiores"
   - ❌ MAL: "Retirada de muebles" (Nadie contrata a un experto solo para esto, es parte del servicio de pintura)
   - ❌ MAL: "Limpieza post-obra" (Salvo que sea una empresa de limpieza, si es de pintura, esto es un extra)
2. INTENCIÓN DE BÚSQUEDA TRANSACCIONAL:
   - Piensa: "¿Alguien buscaría en Google 'Empresa de [SERVICIO]'?" Si la respuesta es sí, inclúyelo.
   - Si la respuesta es "Eso se da por hecho", "Es un detalle", o "Es un paso intermedio", EXCLÚYELO.
3. VARIACIONES DE ALTO VALOR:
   - Incluye variaciones técnicas si el cliente las busca (ej: "Quitar gotelé al temple" vs "Quitar gotelé pintura plástica").

FORMATO JSON:
{
    "services": [
        "Servicio Comercial 1",
        "Servicio Comercial 2",
        ...
    ],
    "reasoning": "Breve explicación de por qué se eligieron estos servicios y se descartaron los pasos intermedios."
}
`;
