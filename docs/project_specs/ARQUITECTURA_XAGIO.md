# 🚀 Sistema de Keyword Research y Clustering - Arquitectura Completa

## Replicando Xagio con Gemini AI + DataForSEO

Este documento describe la arquitectura completa para construir un sistema de keyword research y clustering similar a Xagio, utilizando la API de DataForSEO para datos y Gemini AI para el clustering inteligente.

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [APIs Necesarias](#apis-necesarias)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Problemas Identificados y Soluciones](#problemas-identificados-y-soluciones)
6. [Código Actualizado](#código-actualizado)
7. [Funcionalidades de Xagio vs Nuestra Implementación](#funcionalidades-xagio)
8. [Próximos Pasos](#próximos-pasos)

---

## 1. Visión General {#visión-general}

### Objetivo
Crear un sistema automatizado que:
1. Investigue keywords relevantes para un nicho y ubicación específica
2. Agrupe keywords en clusters temáticos (páginas de servicio)
3. Genere meta tags optimizados para cada cluster
4. Identifique oportunidades de contenido y gaps competitivos

### Stack Tecnológico
- **DataForSEO API**: Keyword research, SERP analysis, competitor intelligence
- **Gemini AI (2.5 Flash)**: Clustering semántico, generación de meta tags
- **Node.js**: Backend y scripts de automatización
- **Astro + Keystatic**: Generación de sitios web

---

## 2. APIs Necesarias {#apis-necesarias}

### DataForSEO (Principal)

| Endpoint | Uso | Coste Aprox. |
|----------|-----|--------------|
| `/serp/google/organic/live/advanced` | Obtener TOP 10 competidores de SERP | $0.002/task |
| `/dataforseo_labs/google/ranked_keywords/live` | Keywords de competidores | $0.05/task |
| `/dataforseo_labs/google/related_keywords/live` | Expansión de keywords | $0.05/task |
| `/dataforseo_labs/google/keyword_suggestions/live` | Autocomplete suggestions | $0.05/task |
| `/serp/google/locations` | Obtener location codes | Gratis |

**Coste estimado por proyecto**: $1-5 USD dependiendo del número de competidores

### Gemini AI

| Modelo | Uso | Coste |
|--------|-----|-------|
| gemini-2.5-flash | Clustering, meta tags, análisis | Gratis hasta 60 requests/min |

### APIs Opcionales (Para funcionalidades avanzadas)

| API | Uso |
|-----|-----|
| Google Search Console | Rank tracking (posiciones reales) |
| PageSpeed Insights | Métricas de rendimiento |
| Screaming Frog / Custom Scraper | Análisis de estructura de competidores |

---

## 3. Arquitectura del Sistema {#arquitectura-del-sistema}

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SISTEMA DE KEYWORD RESEARCH                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                        │
│  │   USER INPUT     │                                                        │
│  │  - Nicho         │                                                        │
│  │  - Ciudad        │                                                        │
│  │  - Location Code │                                                        │
│  └────────┬─────────┘                                                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    FASE 1: RECOPILACIÓN DE DATOS                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │  SERP Analysis  │  │   Competitor    │  │    Related      │      │   │
│  │  │  (TOP 10)       │  │   Keywords      │  │    Keywords     │      │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │   │
│  │           │                    │                    │               │   │
│  │           └────────────────────┼────────────────────┘               │   │
│  │                                ▼                                    │   │
│  │                    ┌─────────────────────┐                          │   │
│  │                    │  RAW KEYWORDS POOL  │                          │   │
│  │                    │  (500-1000+ KWs)    │                          │   │
│  │                    └──────────┬──────────┘                          │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    FASE 2: FILTRADO INTELIGENTE                      │   │
│  │                                                                      │   │
│  │  1. 🗑️ Eliminar ruido universal                                     │   │
│  │     (instagram, memes, traductor, etc.)                             │   │
│  │                                                                      │   │
│  │  2. 📍 Filtrar por ciudad                                           │   │
│  │     (Eliminar keywords con otras ciudades españolas)                │   │
│  │                                                                      │   │
│  │  3. 🎯 Scoring de relevancia                                        │   │
│  │     - +5 por término del nicho                                      │   │
│  │     - +4 por ciudad objetivo                                        │   │
│  │     - +3 por intención comercial                                    │   │
│  │     - +2 por fuente competidor                                      │   │
│  │     - -10 por otra ciudad                                           │   │
│  │                                                                      │   │
│  │  4. 🏷️ Clasificar intención                                         │   │
│  │     (COMMERCIAL / INFORMATIONAL / MIXED)                            │   │
│  │                                                                      │   │
│  │                    ┌─────────────────────┐                          │   │
│  │                    │  FILTERED KEYWORDS  │                          │   │
│  │                    │  (100-150 KWs)      │                          │   │
│  │                    └──────────┬──────────┘                          │   │
│  └───────────────────────────────┼──────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    FASE 3: CLUSTERING CON AI                         │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐         ┌─────────────────────────────────┐   │   │
│  │  │  Gemini 2.5     │ ◄────── │  Prompt Optimizado:             │   │   │
│  │  │  Flash          │         │  - Keywords filtradas           │   │   │
│  │  └────────┬────────┘         │  - Preguntas PAA                │   │   │
│  │           │                  │  - Contexto de ubicación        │   │   │
│  │           │                  │  - Reglas de clustering         │   │   │
│  │           │                  └─────────────────────────────────┘   │   │
│  │           ▼                                                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐     │   │
│  │  │                    CLUSTERS                               │     │   │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │     │   │
│  │  │  │ Servicio 1 │ │ Servicio 2 │ │ Servicio N │           │     │   │
│  │  │  │ - Main KW  │ │ - Main KW  │ │ - Main KW  │           │     │   │
│  │  │  │ - Keywords │ │ - Keywords │ │ - Keywords │           │     │   │
│  │  │  │ - Volume   │ │ - Volume   │ │ - Volume   │           │     │   │
│  │  │  │ - Metas    │ │ - Metas    │ │ - Metas    │           │     │   │
│  │  │  └────────────┘ └────────────┘ └────────────┘           │     │   │
│  │  └──────────────────────────────────────────────────────────┘     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    FASE 4: OUTPUT                                    │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │ project_plan.   │  │ clustering_     │  │ Astro/Keystatic │      │   │
│  │  │ json            │  │ analysis.md     │  │ Site Gen        │      │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Datos {#flujo-de-datos}

### 4.1 Input → SERP Analysis

```javascript
// Entrada del usuario
const input = {
    niche: "quitar gotele",
    city: "Barcelona",
    location: "barcelona"  // Se convierte a location_code: 1005492
};

// Búsqueda en Google SERP
const searchQuery = `${niche} ${city}`;  // "quitar gotele Barcelona"
const competitors = await getTopCompetitors(searchQuery, 1005492);
// → [{domain: "reformas-barcelona.es", ...}, ...]
```

### 4.2 Competitor Analysis → Keywords Pool

```javascript
// Por cada competidor, extraemos sus keywords
for (const domain of competitors) {
    const keywords = await getCompetitorKeywords(domain, location, city, top10Only);
    // API devuelve: ranked_keywords donde el competidor está en TOP 10
    // Filtramos inmediatamente por ciudad
}
```

### 4.3 Filtrado Inteligente

```javascript
// El filtrado ocurre en varias etapas:

// 1. Filtro de ruido (patterns universalmente irrelevantes)
const NOISE = ['instagram', 'tiktok', 'meme', ...];
keywords = keywords.filter(k => !NOISE.some(n => k.includes(n)));

// 2. Filtro de ciudad (elimina keywords con otras ciudades)
const OTHER_CITIES = ['madrid', 'valencia', 'sevilla', ...];
keywords = keywords.filter(k => {
    return !OTHER_CITIES.some(city => k.keyword.includes(city));
});

// 3. Scoring de relevancia
keywords = keywords.map(k => ({
    ...k,
    relevanceScore: calculateRelevance(k, niche, targetCity)
}));

// 4. Filtrar por score mínimo
keywords = keywords.filter(k => k.relevanceScore >= 3);
```

### 4.4 Clustering con Gemini

```javascript
const prompt = `
PROYECTO: ${niche} en ${city}

KEYWORDS (filtradas por relevancia y ubicación):
${JSON.stringify(keywords)}

INSTRUCCIONES:
1. Agrupa por servicio/tema
2. Cada cluster = 1 página de servicio
3. Evita canibalización
4. Genera 5 variaciones de meta tags

FORMATO: JSON con clusters, meta_suggestions, etc.
`;

const result = await model.generateContent(prompt);
const plan = JSON.parse(result.response.text());
```

---

## 5. Problemas Identificados y Soluciones {#problemas-identificados-y-soluciones}

### ❌ Problema 1: Location Code Ignorado

**Código Original:**
```javascript
// seo_client.js línea 97
const locationName = "Spain";  // HARDCODED - ignora el parámetro
```

**Solución:**
```javascript
// seo_client_v2.js
export function getLocationName(location) {
    const nameMap = {
        'barcelona': 'Barcelona,Catalonia,Spain',
        'madrid': 'Madrid,Autonomous Community of Madrid,Spain',
        // ...
    };
    return nameMap[location.toLowerCase()] || location;
}
```

### ❌ Problema 2: Sin Filtrado por Ciudad

**Código Original:**
```javascript
// No existía filtrado por ciudad
// Keywords de Madrid entraban para búsquedas de Barcelona
```

**Solución:**
```javascript
// seo_client_v2.js
export function filterByCity(keywords, targetCity) {
    const otherCities = SPANISH_CITIES.filter(c => c !== targetCity.toLowerCase());
    
    return keywords.filter(k => {
        const kwLower = k.keyword.toLowerCase();
        // Regex con word boundaries para evitar falsos positivos
        return !otherCities.some(city => 
            new RegExp(`\\b${city}\\b`, 'i').test(kwLower)
        );
    });
}
```

### ❌ Problema 3: Prompt de Clustering Sin Contexto Local

**Código Original:**
```javascript
// El prompt no mencionaba la ciudad objetivo
const prompt = `
    INPUT DATA (Keywords + Contexto):
    ${JSON.stringify(keywords)}
    // ...sin instrucciones sobre ubicación
`;
```

**Solución:**
```javascript
// keyword_researcher_v2.js
const prompt = `
PROYECTO: ${niche} en ${city}
OBJETIVO: Crear arquitectura de páginas para posicionar en Google LOCAL.

// ...keywords ya filtradas por ciudad...

IMPORTANTE:
- Todas las keywords ya están filtradas para ${city}
- Los meta tags deben incluir referencias a ${city}
- Las locations sugeridas deben ser barrios/zonas de ${city}
`;
```

### ❌ Problema 4: Scoring de Relevancia Débil

**Código Original:**
```javascript
// +3 puntos por término del nicho (insuficiente)
// Sin penalización por otras ciudades
```

**Solución:**
```javascript
// keyword_researcher_v2.js
function advancedRelevanceScore(keyword, niche, targetCity) {
    let score = 0;
    
    // +5 por término del nicho
    nicheTerms.forEach(term => {
        if (kwLower.includes(term)) score += 5;
    });
    
    // +4 si contiene ciudad objetivo
    if (kwLower.includes(cityLower)) score += 4;
    
    // +3 por intención comercial
    if (COMMERCIAL_PATTERNS.some(p => kwLower.includes(p))) score += 3;
    
    // -10 si contiene OTRA ciudad (penalización severa)
    if (otherCities.some(city => kwLower.includes(city))) score -= 10;
    
    return score;
}
```

---

## 6. Código Actualizado {#código-actualizado}

Los archivos actualizados son:

| Archivo | Descripción |
|---------|-------------|
| `seo_client_v2.js` | Cliente DataForSEO corregido con location codes y filtrado por ciudad |
| `keyword_researcher_v2.js` | Clustering inteligente con scoring avanzado |
| `research_niche_v2.js` | Script principal con interfaz interactiva |

### Uso:

```bash
# Opción 1: Configuración por defecto (editar DEFAULT_CONFIG en el archivo)
node research_niche_v2.js

# Opción 2: Argumentos de línea de comandos
node research_niche_v2.js --niche "quitar gotele" --city "Barcelona"

# Opción 3: Con todas las opciones
node research_niche_v2.js \
    --niche "instalador parquet" \
    --city "Madrid" \
    --top10 true \
    --min-relevance 3 \
    --include-info true
```

---

## 7. Funcionalidades de Xagio vs Nuestra Implementación {#funcionalidades-xagio}

| Funcionalidad Xagio | Estado | Implementación |
|---------------------|--------|----------------|
| Keyword Research | ✅ | DataForSEO API |
| AI Keyword Clustering | ✅ | Gemini 2.5 Flash |
| Competitor Analysis | ✅ | ranked_keywords endpoint |
| Meta Tag Generation | ✅ | Prompt de Gemini |
| Keyword Cannibalization | ✅ | Clusters exclusivos |
| Schema Markup | 🔄 Parcial | Disponible en Keystatic |
| Rank Tracking | ⏳ Pendiente | Google Search Console API |
| Silo Structure | ⏳ Pendiente | Interno linking automation |
| Content Editor | ❌ | Fuera de alcance |

### Funcionalidades Adicionales Nuestras

| Funcionalidad | Descripción |
|---------------|-------------|
| Filtrado por Ciudad | Elimina automáticamente keywords de otras ciudades |
| Scoring de Relevancia | Sistema de puntuación para priorizar keywords |
| Clasificación de Intent | Separa COMMERCIAL vs INFORMATIONAL |
| People Also Ask | Extrae preguntas para FAQs |
| Análisis Detallado | Log en markdown con todo el proceso |

---

## 8. Próximos Pasos {#próximos-pasos}

### Corto Plazo (1-2 semanas)

1. **Integrar los archivos v2** en tu proyecto actual
2. **Probar con "quitar gotele Barcelona"** y verificar que no aparezcan keywords de Madrid
3. **Ajustar el scoring** si es necesario (minRelevanceScore)

### Medio Plazo (1 mes)

1. **Internal Linking**: Conectar páginas de servicios relacionados
2. **FAQ Generation**: Usar PAA data para generar secciones de FAQs
3. **Location Pages**: Generar páginas servicio+barrio automáticamente

### Largo Plazo (2-3 meses)

1. **Rank Tracking**: Integrar Google Search Console API
2. **Content Scoring**: Evaluar calidad de contenido generado
3. **Dashboard Web**: Interfaz visual para gestionar proyectos

---

## 📁 Estructura de Archivos Recomendada

```
scripts/
├── lib/
│   ├── seo_client.js          # Original (backup)
│   └── seo_client_v2.js       # ✨ NUEVO - Cliente corregido
├── logic/
│   ├── keyword_researcher.js  # Original (backup)
│   └── keyword_researcher_v2.js  # ✨ NUEVO - Clustering inteligente
├── research_niche.js          # Original (backup)
├── research_niche_v2.js       # ✨ NUEVO - Script principal
└── generate_site.js           # Sin cambios necesarios
```

---

## 🔑 Variables de Entorno Necesarias

```env
# .env
DATAFORSEO_LOGIN=tu_email@ejemplo.com
DATAFORSEO_PASSWORD=tu_api_key

GEMINI_API_KEY=AIza...tu_gemini_key
```

---

## 📞 Soporte

Si encuentras problemas con el clustering o filtrado, verifica:

1. Que el `location_code` sea correcto para tu ciudad
2. Que los competidores seleccionados sean relevantes
3. Que el `minRelevanceScore` no sea demasiado alto (3-5 es óptimo)

El archivo `clustering_analysis.md` generado contiene un log detallado de todo el proceso para debugging.
