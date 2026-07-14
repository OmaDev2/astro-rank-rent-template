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

## FASE 2/3 — `home`, `service`, `zona`: escribir las páginas

```bash
npm run seo-wizard home
npm run seo-wizard service <slug>
npm run seo-wizard zona <slug>
npm run seo-wizard status                    # ver qué queda del plan
```

Cada página: análisis de los 3 primeros competidores de Google, texto con la voz real
del dueño (contexto) dirigido a sus buyer personas, checklist automático de cobertura
de keywords (reintegra las que falten), y doble FAQ (transaccional + citable por LLMs).

**La regla de honestidad se aplica aquí con más fuerza que en ningún otro paso**: el
prompt prohíbe explícitamente afirmar diferenciadores, garantías, plazos de respuesta o
capacidades ("taller propio", "atendemos urgencias") que no estén confirmados en el
contexto. Si el cliente no lo dijo, la página no lo dice.

**Salida:** el `.mdx` real en `src/content/` (con backup automático) + un doc de
revisión en `seo-proyecto/0N-<tipo>-<slug>.md`.

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
#    → revisar seo-proyecto/03-plan.md
npm run seo-wizard home
npm run seo-wizard service <slug>     # los del plan, por prioridad
npm run seo-wizard zona <slug>

# 4. Lo que la IA no hace: imágenes reales + testimonios reales (Keystatic)
# 5. Publicar
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
| Quiero regenerar una página | Vuelve a lanzar el comando: hace backup `.bak-<timestamp>.mdx` automático |
| Quiero empezar de cero | Borra la carpeta `seo-proyecto/` (o `npm run reset` en el repo del template) |

---

## Por qué este flujo y no un prompt suelto

1. **El contexto es del cliente, no de la IA.** Ni tú ni el modelo os inventáis
   diferenciadores — si el cliente no lo dijo, no está.
2. **Arquitectura antes que texto.** No se escribe ni una página sin saber qué páginas
   existen y qué keyword ataca cada una.
3. **Datos reales de volumen**, no intuición.
4. **Checklist de cobertura verificado por código**, no solo prometido por la IA.
5. **GEO integrado** — FAQ citables por LLMs en cada página.
6. **Honestidad verificable**: cada afirmación de la web remonta a una línea del
   contexto. Lo que no se puede automatizar (testimonios, fotos), no se automatiza.

---

## Relación con los scripts legacy

`content-wizard` (página suelta) y `strategy-wizard` (planificación con Gemini) quedan
**sustituidos** por este pipeline. No los uses para proyectos nuevos.
