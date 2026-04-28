#!/usr/bin/env bash
set -euo pipefail

SRC="optimized-images"

VENTANAS="public/images/services/ventanas-de-aluminio-malaga"
PUERTAS="public/images/services/puertas-de-aluminio-malaga"
CERRAMIENTOS="public/images/services/cerramientos-aluminio-malaga"
BARANDILLAS="public/images/services/barandillas-metalicas-malaga"
ARMARIOS="public/images/services/armarios-aluminio-malaga"
COCINAS="public/images/services/cocinas-exteriores-aluminio-malaga"
PERSIANAS="public/images/services/persianas-de-aluminio-malaga"
TALLER="public/images/metalisur/taller"

mkdir -p "$VENTANAS" "$PUERTAS" "$CERRAMIENTOS" "$BARANDILLAS" "$ARMARIOS" "$COCINAS" "$PERSIANAS" "$TALLER"

rename_pair() {
  old="$1"
  new="$2"

  for ext in jpg webp jpeg png; do
    if [ -f "$SRC/$old.$ext" ]; then
      mv "$SRC/$old.$ext" "$SRC/$new.$ext"
      echo "✏️ Renombrado: $old.$ext → $new.$ext"
    fi
  done
}

move_pair() {
  base="$1"
  dest="$2"

  for ext in jpg webp jpeg png; do
    src="$SRC/$base.$ext"

    if [ -f "$src" ]; then
      file_name="$(basename "$src")"

      if [ -f "$dest/$file_name" ]; then
        echo "⚠️ Ya existe, no movido: $dest/$file_name"
      else
        mv "$src" "$dest/"
        echo "✅ Movido: $file_name → $dest"
      fi
    fi
  done
}

# Corrección de nombres con erratas
rename_pair "cierre-alumini-madera-oficina" "cierre-aluminio-madera-oficina"
rename_pair "puerta-aluminio-gris-cristal-exterior-vivienda-metalisu" "puerta-aluminio-gris-cristal-exterior-vivienda-metalisur"
rename_pair "puertas-armario-alumini-bajo" "puertas-armario-aluminio-bajo"
rename_pair "mueble-aluminio-exterior-barbacoa-metalisur2" "mueble-aluminio-exterior-barbacoa-metalisur-02"
rename_pair "puerta-aluminio-panel-opaco-interior-metalisur2" "puerta-aluminio-panel-opaco-interior-metalisur-02"

# Ventanas
move_pair "ventana-aluminio-alargada" "$VENTANAS"
move_pair "ventana-aluminio-blanca" "$VENTANAS"
move_pair "ventana-aluminio-blanco-persiana-vivienda-metalisur" "$VENTANAS"
move_pair "ventana-aluminio-color-madera" "$VENTANAS"
move_pair "ventana-aluminio-color-madera2" "$VENTANAS"
move_pair "ventana-aluminio-color-oscuro" "$VENTANAS"
move_pair "ventana-aluminio-gris-abatible-taller-metalisur" "$VENTANAS"
move_pair "ventana-aluminio-gris-abatible-taller-propio-metalisur" "$VENTANAS"
move_pair "ventana-aluminio-gris-fabricada-medida-metalisur" "$VENTANAS"
move_pair "ventana-aluminio-larga" "$VENTANAS"
move_pair "ventana-aluminio-recien-instalada" "$VENTANAS"
move_pair "ventana-corredera-aluminio-blanco-persiana-metalisur" "$VENTANAS"
move_pair "ventana-corredera-aluminio-blanco-persiana-taller-metalisur" "$VENTANAS"
move_pair "ventana-corredera-aluminio-blanco-zona-interior-metalisur" "$VENTANAS"
move_pair "ventanal-aluminio-imitacion-madera-vivienda-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-blanco-fabricadas-taller-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-gris-listas-instalacion-taller-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-gris-preparadas-instalacion-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-gris-preparadas-taller-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-gris-preparadas-transporte-metalisur" "$VENTANAS"
move_pair "ventanas-aluminio-gris-taller-metalisur-recorte" "$VENTANAS"
move_pair "instalacion-ventana-aluminio-blanco-persiana-vivienda-metalisur" "$VENTANAS"

# Taller
move_pair "perfiles-aluminio-taller-carpinteria-metalica-metalisur" "$TALLER"
move_pair "fabricacion-ventanas-aluminio-gris-taller-metalisur" "$TALLER"
move_pair "fabricacion-ventanas-aluminio-taller-metalisur" "$TALLER"
move_pair "taller-fabricacion-ventana-aluminio-gris-metalisur" "$TALLER"

# Cerramientos
move_pair "cerramiento-acristalado-aluminio-blanco-oficina-metalisur" "$CERRAMIENTOS"
move_pair "cerramiento-aluminio-blanco-cristal-local-comercial-metalisur" "$CERRAMIENTOS"
move_pair "cerramiento-aluminio-blanco-cristal-local-metalisur" "$CERRAMIENTOS"
move_pair "cerramiento-aluminio-blanco-local-comercial-metalisur" "$CERRAMIENTOS"
move_pair "cerramiento-interior-aluminio-imitacion-madera-vivienda-metalisur" "$CERRAMIENTOS"
move_pair "cerramiento-patio-aluminio-imitacion-madera-cristal-metalisur" "$CERRAMIENTOS"
move_pair "cierre-aluminio-madera-oficina" "$CERRAMIENTOS"

# Puertas
move_pair "detalle-puerta-aluminio-panel-opaco-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-blanca-caseta" "$PUERTAS"
move_pair "puerta-aluminio-cristal-exterior-vivienda-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-cristal-gris-exterior-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-gris-cristal-exterior-vivienda-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-panel-opaco-interior-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-panel-opaco-interior-metalisur-02" "$PUERTAS"
move_pair "puerta-aluminio-panel-opaco-zona-interior-metalisur" "$PUERTAS"
move_pair "puerta-aluminio-salida-terraza" "$PUERTAS"
move_pair "puerta-metalica-verde-barrotes-taller-metalisur" "$PUERTAS"

# Persianas / lamas
move_pair "puertas-lamas-aluminio-blanco-garaje-metalisur" "$PERSIANAS"

# Barandillas
move_pair "barandilla-metalica-negra-terraza-vistas-mar-metalisur" "$BARANDILLAS"
move_pair "barandillas-aluminio-malaga-comunidad" "$BARANDILLAS"
move_pair "barandillas-edificio" "$BARANDILLAS"

# Armarios
move_pair "armario-aluminio-blanco-corredero-terraza-metalisur" "$ARMARIOS"
move_pair "armario-aluminio-blanco-terraza-metalisur" "$ARMARIOS"
move_pair "puertas-armario-aluminio-bajo" "$ARMARIOS"
move_pair "puertas-armario-aluminio-blanco" "$ARMARIOS"
move_pair "puertas-color-armario-fregadero" "$ARMARIOS"

# Cocinas exteriores
move_pair "mueble-aluminio-exterior-barbacoa-metalisur" "$COCINAS"
move_pair "mueble-aluminio-exterior-barbacoa-metalisur-02" "$COCINAS"
move_pair "mueble-aluminio-exterior-cocina-barbacoa-metalisur" "$COCINAS"

echo ""
echo "🎉 Movimiento terminado."
echo ""
echo "Archivos que quedan en optimized-images:"
find "$SRC" -type f | sort
