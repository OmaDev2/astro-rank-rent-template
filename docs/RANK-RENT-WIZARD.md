# Rank & Rent Wizard v2

Wizard paralelo al `seo-wizard` actual. Está diseñado para posicionar una web antes
de tener profesional, sin confundir investigación de mercado con pruebas de empresa.

## Interfaz gráfica local

Para trabajar sin recordar comandos, abre el cuaderno de producción:

```bash
npm run rank-rent-ui
```

Se abre en `http://localhost:3466` y orquesta exactamente el mismo wizard: crear
proyecto, pegar brief, subir/validar CSV, generar y aprobar el plan, revisar cada
outline/borrador y publicar. Nada se publica sin confirmación explícita. Si el puerto
está ocupado: `PORT=3467 npm run rank-rent-ui`.

## Flujo market

```bash
npm run rank-rent-wizard init -- --niche "Herrería" --city "Zaragoza"
npm run rank-rent-wizard brief -- --file investigacion-mercado.md
npm run rank-rent-wizard plan -- --csv carpeta-csvs/
npm run rank-rent-wizard approve -- plan
npm run rank-rent-wizard outline service rejas-zaragoza
npm run rank-rent-wizard approve -- outline service-rejas-zaragoza
npm run rank-rent-wizard draft service rejas-zaragoza
npm run rank-rent-wizard approve -- draft service-rejas-zaragoza
npm run rank-rent-wizard publish service rejas-zaragoza
```

Todos los artefactos se guardan en `rank-rent-proyecto/`. Los pasos de aprobación
impiden que un borrador generado se convierta en contenido publicado sin revisión.

`plan -- --csv carpeta-csvs/` lee los CSV exportados desde Google Keyword Planner
(UTF-8 o UTF-16LE; separador coma, punto y coma o tabulación). Extrae palabra clave,
volumen y competencia cuando existen, los agrupa por intención y guarda en el plan
si la arquitectura está validada con datos reales o sigue siendo una hipótesis.

Antes puedes comprobar el parseo:

```bash
npm run rank-rent-wizard csv -- carpeta-csvs/
```

## Dos clases de afirmaciones

`market_safe` se puede usar antes de alquilar: problemas habituales, servicios,
criterios de compra, factores de precio, normativa pública y contenido local útil.

`operator_proof` necesita una fuente real del profesional: reseñas, años de
experiencia, taller, equipo, garantías, certificaciones, proyectos, marcas, plazos,
precios concretos y material visual. Un borrador con estas afirmaciones no se publica
hasta corregirlo o aportar evidencias en la fase `operator`.

## Cuando entra el profesional

```bash
npm run rank-rent-wizard operator -- --file entrevista-profesional.md
```

El comando guarda la evidencia sin modificar páginas existentes. La siguiente iteración
del wizard usará esas evidencias para enriquecer páginas ya posicionadas, actualizar
schema/legal y desbloquear pruebas de confianza verificables.
