# 🧙 seo-wizard — Guía completa

> Pipeline SEO por fases con Claude CLI. De los audios del cliente a la web con contenido
> que posiciona — cada fase alimenta a la siguiente, y tú revisas entre fase y fase.
>
> Basado en el playbook "SEO con Claude" de Rank Masters, adaptado a este template
> (aquí el schema, la maquetación y el interlinking ya son automáticos).

---

## La idea en 30 segundos

La diferencia entre pedirle a una IA "escríbeme una página de fontanero" y usar bien la IA
es **la secuencia**: primero contexto real del negocio, luego estrategia validada con
datos, y solo al final el texto. Así el contenido no suena a IA — porque no lo es del todo:
**parte de lo que el propio dueño cuenta**.

```
🎙️ Audios/entrevista → 📄 contexto.md → 🗺️ seo_plan.json → 🏠 home → 🔧 servicios → 📍 zonas
      (Fase 0)            (revisas tú)      (revisas tú)     (Fase 2)     (Fase 3)
```

**Regla de oro del pipeline: entre fase y fase, revisas tú.** El wizard hace el 90% del
trabajo, pero las dos revisiones manuales (contexto y plan) son las que garantizan que
todo lo demás salga bien.

---

## Requisitos

| Qué | Obligatorio | Para qué |
|---|---|---|
| `claude` CLI con sesión activa | ✅ | Todo el pipeline (es el motor) |
| `npm run init-niche` ejecutado | ✅ | El wizard lee ciudad/nicho/zonas de `business/global.yaml` |
| `DATAFORSEO_LOGIN/PASSWORD` en `.env` | Recomendado | Volúmenes de búsqueda reales + top 3 de Google automático |
| CSVs de Google Keyword Planner | Alternativa | Validación de keywords si no tienes DataForSEO |
| Audios/transcripción del cliente | Recomendado | La materia prima del contexto (si no, modo entrevista) |

Sin DataForSEO ni CSVs el wizard funciona igual, pero el plan queda marcado como
**"sin validar"** (hipótesis) — sirve para arrancar, no para decidir arquitectura.

---

## FASE 0 — `contexto`: la base de todo

```bash
npm run seo-wizard contexto                          # interactivo (pegar o entrevista)
npm run seo-wizard contexto -- --transcript notas.txt  # desde archivo
```

**Qué hace:** convierte lo que el cliente cuenta en un documento estructurado:
datos del negocio, servicios concretos, diferenciadores reales (con citas textuales),
servicios más rentables, cliente ideal, zona de servicio, **voz y tono del dueño**,
y 1-3 **buyer personas** con sus frases de búsqueda en Google.

**De dónde sale la materia prima** (3 opciones):

1. **Transcripción de audios de WhatsApp** — pídele al cliente que te mande notas de voz
   contando: qué hace, por qué es mejor que otros, quién le contrata, qué zona cubre y
   cómo trabaja. Transcríbelas (NotebookLM gratis) y pásale el .txt.
2. **Reunión grabada** (Meet/Zoom) — transcripción igual.
3. **Modo entrevista** — el wizard te hace 8 preguntas y respondes tú con lo que sepas
   del negocio. Funciona, pero cuanto más real sea la fuente, menos "a IA" sonará el texto.

**La regla que lo cambia todo:** el prompt lleva la instrucción *"No inventes NADA.
Solo extrae y estructura lo que dice el propio cliente"*. Lo que falte queda marcado
como `(sin datos — completar)` en vez de rellenarse con humo.

**Salida:** `src/content/business/contexto.md`

**✋ REVISA ANTES DE SEGUIR:** lee el documento entero. Corrige lo malentendido, completa
los `(sin datos)` que sepas, borra lo que el cliente no quiera publicar (precios, etc.).
Este documento es la fuente de TODO el contenido posterior.

> 💡 Ejemplo real de lo que captura (de una prueba con una cerrajería):
> el wizard extrajo como diferenciador *"Otros van y te revientan el bombín aunque no
> haga falta, para cobrarte el bombín nuevo. Nosotros no"* — cita textual del dueño.
> Ese tipo de frase es la que luego hace que la web no suene a agencia.

---

## FASE 1 — `plan`: estrategia validada con datos

```bash
npm run seo-wizard plan                       # con DataForSEO si hay credenciales
npm run seo-wizard plan -- --csv mis-csvs/    # con CSVs de Keyword Planner
```

**Qué hace, en 3 pasos:**

1. **Brainstorm de arquitectura** — a partir del contexto, propone hasta 10 páginas de
   servicio. Solo servicios que el negocio ofrece de verdad y solo **intención
   transaccional** (quien busca "qué es una acometida" investiga; quien busca
   "acometida eléctrica Sabadell" contrata).
2. **Validación con datos reales** — volúmenes de búsqueda por keyword:
   - Con **DataForSEO**: automático (volúmenes + keywords relacionadas por semilla).
   - Con **CSVs**: exporta de [Google Keyword Planner](https://ads.google.com/aw/keywordplanner)
     cada semilla como CSV, mételos todos en una carpeta y pásala con `--csv`.
     (Soporta el formato UTF-16 con tabuladores que exporta Google.)
3. **Limpieza + clustering** — descarta marcas de competidores y términos informativos,
   agrupa por intención real, asigna cada cluster a una página y saca la **lista
   exhaustiva de variantes semánticas** de cada una (esto es lo que luego garantiza
   que el texto no se deje keywords fuera).

Además añade automáticamente una página de **zona** por cada municipio de `areaServed`.

**Salida:** `seo_plan.json` + un bloque de **notas estratégicas** en consola.

**✋ REVISA ANTES DE SEGUIR:** abre `seo_plan.json` y borra/edita páginas que no encajen.
Lee las notas: avisan de canibalizaciones entre páginas, keywords trampa y oportunidades.

> 💡 En la prueba real, las notas del plan incluyeron cosas como: descartar "cerrajeros
> baratos" (90 búsquedas/mes) por ser tráfico caza-gangas que no convierte con un
> posicionamiento de precio cerrado; la regla exacta para que "cambio de cerradura" y
> "cerradura antibumping" no se canibalicen; y que el Google Business Profile iba a mover
> más facturación que cualquier página ("trátalo como la novena página"). No es una
> lista de keywords: es estrategia.

---

## FASE 2 — `home`: la página más importante

```bash
npm run seo-wizard home                                    # top 3 de Google automático
npm run seo-wizard home -- --competitors url1,url2,url3    # o pásale los competidores tú
npm run seo-wizard home -- --dry-run                       # ver el JSON sin escribir nada
```

**Qué hace:**

1. **Análisis de la competencia real** — busca el top 3 de Google para tu keyword
   (vía DataForSEO) o usa las URLs que le pases, y las analiza con WebFetch:
   qué estructura tienen, qué hacen bien, qué les falta. El contenido se genera
   para **superarlos**, no para imitarlos.
2. **Generación completa** — hero, intro, diferenciadores, "cómo trabajamos", zonas,
   FAQ y CTAs, escritos con la **voz del dueño** (del contexto) y con las reglas duras:
   - Prohibidas las frases genéricas ("somos líderes", "amplia experiencia"…)
   - Cada H2/H3 integra una variante real del cluster (nada de "Nuestros servicios")
   - La intro engancha en 2 frases; los CTAs son específicos, no "contáctanos"
3. **Checklist de cobertura de keywords** ✓/✗ — comprueba programáticamente que TODAS
   las variantes del cluster están en el texto. Las que faltan se reintegran
   automáticamente en una segunda pasada y se re-verifica:

   ```
   CHECKLIST DE KEYWORDS (home):
     ✓ cerrajero en Granada
     ✓ cerrajero 24 horas Granada
     ✓ cerrajero urgente Granada
     ...
   ```
4. **Doble FAQ:**
   - `faqSeo` — 5 preguntas transaccionales de Google, formato answer-first
   - `faqGeo` — 5 preguntas conversacionales para ChatGPT/Perplexity: respuestas
     autocontenidas de 60-100 palabras, mencionan la zona y el negocio (es lo que
     hace que un LLM te cite cuando alguien pregunta "¿buen cerrajero en Granada?")

**Salida:** `src/content/pages/home.mdx` (con **backup automático** de la anterior:
`home.bak-<timestamp>.mdx`). El schema JSON-LD (LocalBusiness, FAQPage…) lo emite el
template solo — no hay que hacer nada.

**✋ Pendiente manual tras generar:** imagen del hero y **testimonios reales** desde
Keystatic. El wizard no inventa testimonios, nunca (política del template).

---

## FASE 3 — `service` y `zona`: el resto del plan

```bash
npm run seo-wizard status                    # ver qué queda pendiente
npm run seo-wizard service apertura-de-puertas-granada
npm run seo-wizard zona armilla
```

Mismo pipeline que la home (competencia + voz + checklist + doble FAQ), una página del
plan cada vez. Los slugs son los de `seo_plan.json` — si escribes uno que no existe,
te lista los disponibles. Cada página generada se marca en el plan (`npm run seo-wizard
status` te dice el progreso).

**Consejo de orden:** genera primero los 2-3 servicios con más potencial de negocio
(el plan viene ordenado así), revisa cómo quedan en el navegador, y sigue.

---

## Flags de referencia

| Flag | Fases | Qué hace |
|---|---|---|
| `--transcript <archivo>` | contexto | Cargar transcripción desde archivo en vez de pegar/entrevista |
| `--csv <carpeta>` | plan | Validar con CSVs de Google Keyword Planner |
| `--competitors u1,u2,u3` | home, service, zona | URLs de competidores a mano (si no, top 3 vía DataForSEO) |
| `--dry-run` | home, service, zona | Muestra el JSON generado sin escribir archivos |

> Recuerda la sintaxis de npm: los flags van tras `--` →
> `npm run seo-wizard plan -- --csv carpeta/`

---

## El flujo completo de un proyecto nuevo, de cero a publicado

```bash
# 1. Clonar template + datos básicos + diseño
npm install
npm run init-niche            # 8 preguntas + ADN de diseño

# 2. Pipeline de contenido
npm run seo-wizard contexto -- --transcript audios-cliente.txt
#    → revisar src/content/business/contexto.md
npm run seo-wizard plan
#    → revisar seo_plan.json y las notas estratégicas
npm run seo-wizard home
npm run seo-wizard service <slug>     # los del plan, por orden de prioridad
npm run seo-wizard zona <slug>

# 3. Lo que la IA no hace
#    → imágenes reales (npm run images:prepare) y testimonios reales (Keystatic)
#    → repasar todo en npm run dev

# 4. Publicar
npm run build                 # el preflight avisa si algo quedó flojo
git add . && git commit && git push   # Netlify despliega
npm run indexnow              # (opcional) avisar a Bing/IA
```

Tiempo realista: **30-45 min de máquina + tus dos revisiones**. Cada generación de
página tarda 1-3 minutos (varias llamadas a Claude + análisis de competidores).

---

## Problemas típicos

| Síntoma | Causa y solución |
|---|---|
| `claude CLI error: exit 1` | Sin sesión activa → ejecuta `claude` una vez e inicia sesión |
| `terminado por señal SIGTERM (¿timeout?)` | Generación muy larga o red lenta. El wizard reintenta solo 1 vez; si persiste, relanza el comando |
| Competidores "✗ (saltado)" | La web bloquea el fetch o falló la extracción. No es crítico (se genera sin ese análisis) — o pásalos con `--competitors` |
| "Muy poco material (mínimo ~30 palabras)" | La transcripción/entrevista es demasiado corta. Con tan poco, el contexto saldría inventado |
| El plan queda "⚠ SIN validar" | No hay DataForSEO ni CSVs. Puedes seguir (hipótesis) o validar después re-ejecutando `plan -- --csv` |
| Keywords ✗ en el checklist tras la reintegración | Esa variante no encajaba de forma natural en ningún sitio. Decisión correcta del sistema: mejor fuera que forzada. Puedes meterla a mano en Keystatic |
| Quiero regenerar una página | Vuelve a lanzar el comando: hace backup `.bak-<timestamp>.mdx` del anterior automáticamente |

---

## Qué hace el wizard que un prompt suelto no hace

1. **Contexto real persistente** — todo parte de lo que dijo el cliente, no de lo que
   la IA supone de un "fontanero en Madrid" genérico.
2. **Arquitectura antes que texto** — no se escribe ni una página sin saber qué páginas
   existen, qué keyword ataca cada una y con qué variantes (adiós canibalizaciones).
3. **Datos reales** — volúmenes de Google, no intuición.
4. **Checklist de cobertura verificado por código** — la IA promete integrar keywords;
   aquí se comprueba con regex y se corrige. Es el paso que un prompt manual siempre se salta.
5. **GEO integrado** — cada página sale con FAQ citables por LLMs, no solo para Google.
6. **Lo que no se puede automatizar, no se automatiza** — testimonios e imágenes son
   reales o no son. El wizard te lo recuerda en cada generación.

---

## Relación con los scripts legacy

`content-wizard` (página suelta) y `strategy-wizard` (planificación con Gemini) quedan
**sustituidos** por este pipeline. Siguen en el repo temporalmente; no los uses para
proyectos nuevos.
