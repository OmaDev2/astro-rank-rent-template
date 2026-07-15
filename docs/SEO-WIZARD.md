# 🧙 seo-wizard — Guía completa

> Pipeline SEO por fases con Claude CLI. De los audios del cliente a la web con contenido
> que posiciona — cada fase alimenta a la siguiente, y tú revisas entre fase y fase.
>
> Sigue el playbook "SEO con Claude" de Rank Masters **al pie de la letra**: el contexto
> se extrae de lo que dice el cliente (nunca se inventa), los buyer personas los genera
> la IA a partir de ese contexto (Paso 02), y todo queda numerado en una carpeta
> `seo-proyecto/` para revisar en orden, como las capturas del playbook.

---

## La idea en 30 segundos

La diferencia entre pedirle a una IA "escríbeme una página de fontanero" y usar bien la IA
es **la secuencia** y **quién aporta cada cosa**:

```
👤 CLIENTE           🤖 IA                🤖 IA              🤖 IA
   aporta datos  →   ESTRUCTURA      →   GENERA          →  ESCRIBE
   (audios/texto)     (no inventa)        buyer personas      páginas
                                                                (solo hechos
                                                                confirmados)
```

```
00-preguntas → 00-material-cliente → 01-contexto → 02-buyer-personas → 03-plan → páginas
  (para el          (lo que el          (Prompt 01)      (Paso 02)      (03+04)
   cliente)           cliente da)
```

**Regla de oro nº1: el contexto no se inventa.** Solo se estructura lo que el cliente
cuenta. Si algo falta, el documento dice `(sin datos — completar)`.

**Regla de oro nº2: la página tampoco inventa.** Ninguna página puede afirmar
"taller propio", "garantía", "atendemos urgencias 24h" o cualquier otro diferenciador
que no conste explícitamente en el contexto. Mejor una página más corta y verdadera
que una convincente pero falsa (esto es E-E-A-T: Google penaliza el contenido genérico
y premia la experiencia real).

**Regla de oro nº3: entre fase y fase, revisas tú.** El wizard hace el 90% del trabajo,
pero cada documento se guarda para que lo repases antes de dar el siguiente paso.

---

## La carpeta de trabajo: `seo-proyecto/`

Todo lo que genera el wizard se guarda **numerado, en orden**, para que puedas ir
abriendo cada archivo y revisándolo como en el playbook:

```
seo-proyecto/
├── 00-preguntas-cliente.md     ← cuestionario para enviarle al cliente (opcional)
├── 00-material-cliente.txt     ← lo que aportó el cliente, tal cual (trazabilidad)
├── 01-contexto.md              ← Prompt 01: contexto estructurado, sin inventar
├── 02-buyer-personas.md        ← Paso 02: personas generados desde el contexto
├── 03-plan.md                  ← arquitectura + keywords (legible)
├── plan.json                   ← el mismo plan, en formato que lee el wizard
├── 04-home-home.md             ← revisión de lo generado para la home
├── 05-service-<slug>.md        ← revisión de cada servicio generado
└── 06-zona-<slug>.md           ← revisión de cada zona generada
```

> El `.mdx` real que usa la web vive en `src/content/`. Los archivos de `seo-proyecto/`
> son la versión **legible para revisar** — título, hero, FAQ, checklist de keywords y
> competencia analizada, sin YAML de por medio.

---

## Requisitos

| Qué | Obligatorio | Para qué |
|---|---|---|
| `claude` CLI con sesión activa | ✅ | Todo el pipeline (es el motor) |
| `npm run init-niche` ejecutado | ✅ | El wizard lee ciudad/nicho/zonas de `business/global.yaml` |
| `DATAFORSEO_LOGIN/PASSWORD` en `.env` | Recomendado | Volúmenes de búsqueda reales + top 3 de Google automático |
| CSVs de Google Keyword Planner | Alternativa | Validación de keywords si no tienes DataForSEO |
| Audios/transcripción del cliente | **Muy recomendado** | Es la materia prima real — sin esto, el contexto sale con huecos honestos, no inventado |

---

## FASE 0a — `preguntas`: el cuestionario para el cliente

```bash
npm run seo-wizard preguntas
```

Genera `seo-proyecto/00-preguntas-cliente.md`: un cuestionario de discovery listo para
mandarle al cliente por WhatsApp, para que responda por notas de voz o por escrito.
Cubre servicios, diferenciadores reales, rentabilidad, clientes típicos, zona, proceso
de trabajo, y precios. Es la forma de conseguir la materia prima cuando no la tienes
todavía.

Una vez tengas su respuesta, transcríbela (audios → texto con
[NotebookLM](https://notebooklm.google.com), gratis) y pasa a la Fase 0b.

---

## FASE 0b — `contexto`: estructurar, no inventar (Prompt 01)

```bash
npm run seo-wizard contexto -- --transcript audios-cliente.txt   # desde archivo
npm run seo-wizard contexto                                       # pegar en la terminal
```

**Qué hace:** toma el material que aportas (transcripción de audios, notas del cliente,
lo que sea) y lo **estructura** en 6 secciones — nunca añade nada que no esté ahí:

```
## DATOS DEL NEGOCIO
## QUÉ HACE (servicios concretos)
## DIFERENCIADORES REALES
## SERVICIOS MÁS RENTABLES
## CLIENTE IDEAL
## ZONA DE SERVICIO
## VOZ Y TONO
```

Si el material no cubre una sección, el documento dice honestamente
`(sin datos — completar)`. **Esto es intencional**: es mejor saber qué preguntarle al
cliente en una segunda vuelta que rellenar el hueco con una suposición plausible.

**Al ejecutarlo sin `--transcript`**, te pide pegar el texto en la terminal (útil si
copias directamente una transcripción o notas). No hay "modo entrevista" que te pida
inventar datos que no tienes — si no tienes material real, ejecuta primero `preguntas`.

**Salida:** `seo-proyecto/01-contexto.md` + `00-material-cliente.txt` (el original,
para trazabilidad).

**✋ REVISA ANTES DE SEGUIR:** completa a mano los `(sin datos)` que sepas, corrige lo
mal entendido, borra lo que el cliente no quiera publicar.

> 💡 Ejemplo real (herrero de Almería, de una transcripción corta): el wizard detectó
> que el cliente nunca mencionó taller propio, garantía ni precios, y marcó esas
> secciones como pendientes en vez de inventarlas — incluso avisando exactamente qué
> preguntarle en una segunda ronda ("¿motoriza las cancelas o no? Nunca lo confirma").

---

## FASE 0c — `personas`: buyer personas (Paso 02, los genera la IA)

```bash
npm run seo-wizard personas
```

A diferencia del contexto, **aquí sí es la IA la que construye** — a partir de lo que
consta en `01-contexto.md`, define 1-3 buyer personas (quién es, qué quiere conseguir,
qué le frena, cómo busca en Google, qué le haría elegir el negocio). Si algo lo
extrapola (edad, un miedo no confirmado), lo marca `(a validar)`.

Las frases de "Cómo busca en Google" de cada persona son las semillas del keyword
research de la fase siguiente.

**Salida:** `seo-proyecto/02-buyer-personas.md`

---

## FASE 1 — `plan`: arquitectura + keywords validadas

```bash
npm run seo-wizard plan                       # con DataForSEO si hay credenciales
npm run seo-wizard plan -- --csv mis-csvs/    # con CSVs de Keyword Planner
```

3 pasos: brainstorm de páginas (solo transaccional, solo lo que el negocio ofrece de
verdad), validación con volúmenes reales, y clustering con variantes exhaustivas +
detección de canibalizaciones. Añade automáticamente una zona por cada municipio de
`areaServed`.

**Salida:** `seo-proyecto/03-plan.md` (legible) + `plan.json` (el que lee el wizard).

**✋ REVISA ANTES DE SEGUIR:** lee las notas estratégicas y borra/edita páginas
editando `plan.json`.

---

## FASE 2 — `home`: pipeline dedicado

```bash
npm run seo-wizard home [-- --competitors u1,u2]
```

La home usa componentes propios (HomeIntro, HomeServices con datos reales de la
colección `services`, ServiceAreas con `areaServed`) que no tienen equivalente 1:1 en
el catálogo de bloques genérico — se genera en un único paso (texto + copy + FAQ GEO
ya combinados), fiel al resto de reglas (honestidad, checklist de keywords).

**Salida:** `src/content/pages/home.mdx` (con backup automático) + `seo-proyecto/content-home.md`.

---

## FASE 3 — `service`/`zona`: outline → write (pasos 05+06+07 → 08+09+10)

A diferencia de la home, cada servicio y cada zona pasan por **dos comandos con una
revisión humana en medio** — así es como lo diseña el playbook ("Tú eres el que decide.
Hay que iterar") y es lo que evita que dos páginas acaben compitiendo por la misma
búsqueda (canibalización).

```bash
npm run seo-wizard outline service <slug> [-- --competitors u1,u2]   # pasos 05+06+07
#    → seo-proyecto/outline-service-<slug>.json (+ .md legible)
#    ✋ REVISA: jerarquía de encabezados y qué bloques eligió, y por qué

npm run seo-wizard write service <slug>                              # pasos 08+09+10
#    → src/content/services/<slug>.mdx + seo-proyecto/content-service-<slug>.md

npm run seo-wizard outline zona <slug>
npm run seo-wizard write zona <slug>

npm run seo-wizard status                    # ver qué queda del plan (○ / ◐ outline / ✓)
```

### `outline` (05+06+07) — competencia, jerarquía y maquetación

1. **Competencia** — analiza los 3 primeros resultados de Google para la keyword
   (DataForSEO SERP + Claude WebFetch, o pásalos con `--competitors`).
2. **Jerarquía H1/H2/H3** — cada H2/H3 usa una variante real del cluster; nunca un
   título sin búsqueda detrás como "Nuestros servicios".
3. **Maquetación** — elige, de un catálogo de bloques del template (`trust_strip`,
   `problem_solution`, `materials`, `comparison`, `process`, `price_factors`, `stats`,
   `content`, + `faq`/`cta` siempre), cuáles usar y en qué orden, con el motivo de por
   qué cada uno responde a la intención en ese punto del scroll. Nunca propone bloques
   que necesiten datos no confirmados (p. ej. `stats` sin cifras reales en el contexto).

**Los bloques `materials` y `comparison` son la pieza clave contra la canibalización**:
cuando un servicio tiene variantes de producto (tipos, opción A vs B), se cubren
*dentro* de la misma página en vez de partirse en dos páginas que acaban compitiendo
por la misma búsqueda (el caso real que motivó este rediseño: "pérgola de hierro" y
"cerramiento de porche" competían por lo mismo — ahora es una sola página con un
bloque `comparison` tipo "¿pérgola abierta o cerramiento acristalado? Cómo elegir").

**Salida:** `seo-proyecto/outline-<tipo>-<slug>.json` (fuente de verdad, editable) +
`.md` legible. **No escribe ningún `.mdx` todavía.**

**✋ REVISA ANTES DE SEGUIR:** añade/quita bloques o encabezados editando el `.json`
si algo no encaja.

### `write` (08+09+10) — texto, copy y FAQ GEO

1. **Texto** siguiendo exactamente la estructura del outline aprobado (no la cambia).
2. **Capa de copy — llamada SEPARADA**, como manda el playbook: mejora intro, CTAs y
   cierre sin tocar la lista de bloques ni perder keywords.
3. **FAQ GEO** integrado en el bloque `faq` (5 transaccionales + 5 citables por LLMs).
4. **Checklist de cobertura** verificado tras ambas pasadas, con reintegración
   automática de las keywords que falten.
5. **Red de seguridad anti-duplicados**: si el modelo repite un mismo bloque para
   cubrir un encabezado que no tenía asignado (a veces pasa), el wizard se queda solo
   con la primera aparición — nunca dos bloques `materials` compitiendo dentro de la
   misma página.

**Salida:** el `.mdx` real en `src/content/` (con backup automático) + doc de revisión
en `seo-proyecto/content-<tipo>-<slug>.md`.

**✋ Pendiente manual siempre:** imagen del hero y **testimonios reales** desde
Keystatic. El wizard nunca inventa testimonios.

---

## El flujo completo, de cero a publicado

```bash
# 1. Datos básicos + diseño
npm install && npm run init-niche

# 2. Conseguir contexto real (si no lo tienes ya)
npm run seo-wizard preguntas
#    → enviar a WhatsApp del cliente, recoger audios, transcribir (NotebookLM)

# 3. Pipeline de contenido
npm run seo-wizard contexto -- --transcript transcripcion.txt
#    → revisar seo-proyecto/01-contexto.md
npm run seo-wizard personas
#    → revisar seo-proyecto/02-buyer-personas.md
npm run seo-wizard plan
#    → revisar seo-proyecto/03-plan.md (¿alguna fusión de canibalización pendiente?)
npm run seo-wizard home

# 4. Por cada servicio/zona del plan (por prioridad):
npm run seo-wizard outline service <slug>
#    → revisar seo-proyecto/outline-service-<slug>.json
npm run seo-wizard write service <slug>
# ...repite con zona <slug>

# 5. Lo que la IA no hace: imágenes reales + testimonios reales (Keystatic)
# 6. Publicar
npm run build && git push   # + npm run indexnow (opcional)
```

---

## Problemas típicos

| Síntoma | Causa y solución |
|---|---|
| `claude CLI error: exit 1` | Sin sesión activa → ejecuta `claude` una vez e inicia sesión |
| La respuesta dice "no tengo permiso de escritura" o pide aprobar antes de darte el documento | Bug conocido de `claude --print` en repos de Claude Code con prompts largos tipo "documento" — el wizard ya lo neutraliza con `--append-system-prompt`. Si lo ves, tu copia del script está desactualizada: sincroniza `scripts/seo-wizard.mjs` desde el template |
| `contexto.md` con muchos `(sin datos)` | Correcto si el material era escaso — no es un bug. Complétalo a mano o consigue más material del cliente |
| Competidores "✗ (saltado)" | La web bloquea el fetch. No es crítico, o pásalos con `--competitors` |
| El plan queda "⚠ SIN validar" | No hay DataForSEO ni CSVs. Puedes seguir (hipótesis) o validar después con `plan -- --csv` |
| `write` dice "Falta el outline" | Ejecuta primero `outline service/zona <slug>` — `write` no genera nada sin un outline aprobado |
| El mismo bloque aparece dos veces en la página | El wizard ya lo detecta y avisa ("El modelo repitió N bloque(s)...") quedándose con la primera aparición — no debería llegar al `.mdx`, pero si lo ves, vuelve a lanzar `write` |
| Quiero cambiar la estructura de una página ya escrita | Edita `seo-proyecto/outline-<tipo>-<slug>.json` y vuelve a lanzar `write` |
| Quiero regenerar una página | Vuelve a lanzar el comando: hace backup `.bak-<timestamp>.mdx` automático |
| Quiero empezar de cero | Borra la carpeta `seo-proyecto/` (o `npm run reset` en el repo del template) |

---

## Por qué este flujo y no un prompt suelto

1. **El contexto es del cliente, no de la IA.** Ni tú ni el modelo os inventáis
   diferenciadores — si el cliente no lo dijo, no está.
2. **Arquitectura antes que texto**, y **estructura antes que texto**: dos puertas de
   revisión (`plan` y `outline`) antes de escribir una sola línea, tal como pide el
   playbook ("Tú eres el que decide").
3. **Datos reales de volumen**, no intuición.
4. **Anti-canibalización en dos capas**: auditoría par-a-par de intenciones en `plan`
   (fusiona páginas que compiten por lo mismo) + bloques `materials`/`comparison` en
   `outline` (cubren variantes de producto dentro de una página en vez de partirlas).
5. **Checklist de cobertura verificado por código**, no solo prometido por la IA.
6. **GEO integrado** — FAQ citables por LLMs en cada página.
7. **Honestidad verificable**: cada afirmación de la web remonta a una línea del
   contexto. Lo que no se puede automatizar (testimonios, fotos), no se automatiza.

---

## Relación con los scripts legacy

`content-wizard` (página suelta) y `strategy-wizard` (planificación con Gemini) quedan
**sustituidos** por este pipeline. No los uses para proyectos nuevos.
