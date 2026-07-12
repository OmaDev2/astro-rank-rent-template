# Arquitectura web — herreromallorca.es

> Basada en keyword research de Google Keyword Planner (jul 2025–jun 2026, geo: Palma de Mallorca)
> y en las consultas reales de Search Console de herrerozaragoza.com.
> Fecha: 10 julio 2026

## Datos clave del research

- "herrero mallorca" (50/mes, competencia Baja, CPC 0,33–0,86€) → HOME
- "herreria palma" (50/mes, CPC hasta **6,04€** — el lead más caro del nicho) → zona Palma
- "carpintería metálica mallorca" (50/mes, CPC 0,68–1,77€) → servicio
- "carpinteria aluminio mallorca" (500/mes, CPC 0,96–3,19€) → nicho adyacente, ver nota final
- Cluster cerramientos de terraza: el más demandado tras aluminio (toldo/techo/presupuesto cerramiento)
- Clusters sólidos: pérgolas de hierro (94 kws), estructuras metálicas (161 kws), rejas de forja, barandillas, puertas de hierro/portones
- "forja" (500/mes, informacional) → blog

## Home `/`

- **Keyword principal:** herrero mallorca / herrería mallorca
- **Secundarias:** herrero palma de mallorca, herrería palma de mallorca, taller de herrería
- H1: "Herrero en Mallorca" + subtítulo con Palma y toda la isla
- Bloques: hero + servicios destacados + zonas + sobre nosotros + testimonios + FAQ + CTA

## Servicios `/servicios/[slug]` (8 páginas)

| Slug | Keyword objetivo | Secundarias | Prioridad |
|---|---|---|---|
| `rejas-de-forja-mallorca` | rejas de forja mallorca | rejas para ventanas, rejas de forja modernas, rejas metálicas, precios | ⭐ featured |
| `puertas-metalicas-mallorca` | puertas de hierro mallorca | puertas de forja exterior, puertas correderas exterior, puertas entrada principal | Alta |
| `cerramientos-terrazas-mallorca` | cerramiento terraza mallorca | techo cerramiento terraza, toldo cerramiento, presupuesto cerramiento, cortinas de cristal | Alta (mayor demanda) |
| `barandillas-mallorca` | barandillas mallorca | barandillas de forja exterior, barandillas hierro escaleras, pasamanos, inox | Alta |
| `pergolas-de-hierro-mallorca` | pérgolas de hierro mallorca | pérgola hierro jardín, pérgola hierro y madera/policarbonato, pérgola coches | Media-alta (chalets/villas) |
| `portones-y-cancelas-mallorca` | portones de hierro mallorca | cancelas, puertas de jardín hierro, portones de forja, vallas metálicas | Media |
| `estructuras-metalicas-mallorca` | estructuras metálicas mallorca | vigas, altillos para naves, techos de chapa, escaleras metálicas | Media |
| `carpinteria-metalica-mallorca` | carpintería metálica mallorca | taller carpintería metálica, acero inoxidable, trabajos a medida, reparaciones y soldadura | Media |

Notas:
- Espejo casi exacto de los 8 servicios de Zaragoza → reescribir textos desde cero (NO copiar, evitar contenido duplicado entre dominios propios).
- "Reparaciones y soldadura" va como sección dentro de carpintería metálica (volumen bajo, pero lead fácil); si genera consultas, se saca a página propia.
- Escaleras metálicas como sección dentro de estructuras.

## Zonas `/zona/[slug]` (8 páginas)

| Slug | Justificación |
|---|---|
| `palma` | "herrero palma", "herreria palma" (CPC 6€), mayor población |
| `calvia` | 2º municipio, máximo poder adquisitivo (villas → forja, pérgolas, barandillas) |
| `marratxi` | "carpinteria metalica marratxi" aparece en el CSV; polígonos industriales |
| `manacor` | "carpinteria aluminio manacor" en CSV; 2ª ciudad de la isla |
| `inca` | 3ª ciudad, centro de la isla |
| `llucmajor` | Población + costa (s'Arenal) |
| `felanitx` | "carpinteria aluminio felanitx" en CSV — demanda con poca oferta |
| `andratx` | Zona de villas de lujo (puerto de Andratx) |

Cada zona: contenido único (no plantilla clonada), referencia a barrios/urbanizaciones, servicios más demandados en esa zona, FAQ local.

## Páginas fijas

- `/nosotros` — historia, taller, valores
- `/contacto` — formulario + teléfono + WhatsApp
- `/zonas` (hub) y `/servicios` (hub)
- `/aviso-legal`, `/privacidad`, `/cookies`

## Blog (fase 2, tras el deploy)

Prioridad a intención comercial (precios/comparativas), no informacional pura:
1. "¿Cuánto cuesta cerrar una terraza en Mallorca? Precios 2026" (cluster precios cerramiento)
2. "Rejas de forja modernas vs clásicas: cuál elegir" (cluster rejas + precios)
3. "Cómo proteger el hierro del salitre en Mallorca" (diferenciador isla, nadie lo trata bien)
4. "Barandillas de exterior: forja vs acero inoxidable" (cluster barandillas)
5. (Opcional, última prioridad) "Forja mallorquina: tradición artesana" — OJO: el volumen de
   "forja" (500/mes) está inflado con intenciones ajenas (pintura oxirón efecto forja, gaming,
   interés histórico-artesanal). No es keyword comercial. Solo como pieza de autoridad temática.

## Decisión pendiente: carpintería de aluminio

"carpinteria aluminio mallorca" tiene 500/mes (10x el resto) y CPC 0,96–3,19€, PERO:
- Es otro oficio (ventanas/cerramientos de aluminio, no forja) — el herrero inquilino podría no ofrecerlo
- Cae -90% interanual en el CSV (¿artefacto de datos o tendencia real?)
- Competencia Media-Alta con pujas activas

Recomendación: mencionarlo dentro de cerramientos y carpintería metálica sin página propia.
Si el inquilino final trabaja aluminio, crear `/servicios/carpinteria-aluminio-mallorca/` (potencial de ser la página más rentable del sitio).

## Competencia (referencia)

- Fuertes: Metálicas Mallorca (100 años, páginas servicio+zona), Metalistería Ayron (herreriamallorca.es, blog SEO activo)
- Débiles: Herrería Amengual (web anticuada), Reformas Fernández (landing genérica)
- Directorios en top 10 (Milanuncios, Páginas Amarillas, StarOfService) = hueco para web local bien hecha
- Ventajas a explotar: schema LocalBusiness completo, Core Web Vitals, páginas de zona (nadie las trabaja fuera de Palma), FAQ

## Datos del negocio (pendiente de Olga)

- [ ] Marca comercial (propuesta: "Herrero Mallorca")
- [ ] Teléfono / WhatsApp receptor de leads
- [ ] Email
- [x] Dominio: herreromallorca.es (+ registrar herreromallorca.com y redirigir)
