# Mejoras Implementadas - Sistema de Keywords

## Fecha: 2025-12-03

### ✅ Cambios de Prioridad Alta Implementados

#### 1. **Scoring de Relevancia Mejorado**

**Antes**:
- Ciudad: +10 puntos
- Sin término del nicho: -20 puntos (muy severo)
- Otra ciudad: -10 puntos

**Ahora**:
- Ciudad: **+15 puntos** (aumentado)
- Sin término del nicho: **-5 puntos** (solo si position > 20)
- Otra ciudad: **-15 puntos** (aumentado)
- **NUEVO**: +3 por múltiples términos del nicho
- **NUEVO**: +5 si muy comercial (2+ patrones)
- **NUEVO**: +3 si competidor top 10
- **NUEVO**: +2 si es pregunta (FAQ)
- **NUEVO**: +3 por long-tail comercial

#### 2. **Filtro de Volumen Mínimo**

**Añadido**: `minSearchVolume = 10`
- Ahora se ignoran keywords con menos de 10 búsquedas/mes
- Reduce ruido de keywords sin tráfico real

#### 3. **Prompt de Gemini Mejorado**

**Antes**:
```
- **DEBES INCLUIR TODAS LAS KEYWORDS**
- NO descartes keywords solo porque no encajen
```

**Ahora**:
```
- Incluye SOLO las keywords más relevantes
- Descarta keywords que no encajen naturalmente
- Prioriza CALIDAD sobre CANTIDAD
- 10-25 keywords por cluster (las más relevantes)
```

#### 4. **Configuración por Defecto Optimizada**

**Backend** (`keyword_researcher_v2.js`):
```javascript
{
    top10Filter: false,  // Extraer todas las posiciones
    minRelevanceScore: 0,  // Sin filtro (controlado por frontend)
    minSearchVolume: 10,  // NUEVO: Mínimo 10 búsquedas/mes
    maxKeywordsForAI: 200,  // Reducido de 300 a 200
    includeInformational: false  // Solo comerciales
}
```

**Frontend** (`GeneratorApp.jsx`):
```javascript
{
    top10Only: false,  // Extraer todas las posiciones
    minRelevance: 5,  // Filtro moderado (era 0)
    includeInfo: false,
    maxKeywords: 200  // Reducido de 300
}
```

---

## Resultados Esperados

### Antes de las Mejoras ❌
- Keywords irrelevantes: "minecraft", "periodista", "libreria"
- Penalización muy severa (-20) eliminaba keywords valiosas
- Gemini forzado a incluir TODO el ruido
- Keywords con 1-5 búsquedas incluidas

### Después de las Mejoras ✅
- Keywords irrelevantes filtradas por scoring mejorado
- Penalización suave (-5) solo para mal posicionadas
- Gemini prioriza calidad sobre cantidad
- Solo keywords con 10+ búsquedas/mes
- Mejor scoring para:
  - Keywords con ciudad (+15 vs +10)
  - Long-tail comerciales (+3)
  - Preguntas FAQ (+2)
  - Múltiples términos del nicho (+3)

---

## Próximos Pasos Recomendados

### Prioridad Media
1. Añadir control de `minVolume` en frontend (slider)
2. Implementar `validateNiche()` opcional

### Prioridad Baja
3. Añadir expansión de `specificServices` (feature avanzado)

---

## Testing

Para probar las mejoras:

1. Ir a `/admin/dashboard`
2. Buscar: "herrero" + "Barcelona"
3. **Verificar** que el slider esté en **5** por defecto
4. Seleccionar competidores (evitar habitissimo)
5. Analizar

**Resultados esperados**:
- 6-12 clusters específicos
- 10-25 keywords por cluster
- Sin keywords irrelevantes (minecraft, periodista, etc.)
- Solo keywords con 10+ búsquedas/mes
