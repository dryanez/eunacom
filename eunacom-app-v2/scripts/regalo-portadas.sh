#!/bin/sh
# Portada de /regalo/<slug>: primera página del PDF a public/regalo/<slug>.jpg
# Uso: scripts/regalo-portadas.sh <slug> <ruta en books/dist>   (ej. cardiologia 02_Libros_Gordos_90Q/Libro_Gordo_Cardiologia_90Q.pdf)
DIST="${BOOKS_DIST_DIR:-$HOME/Documents/Archive/Apps/eunacom-fotos/books/dist}"
cd "$(dirname "$0")/.." && pdftoppm -f 1 -l 1 -jpeg -jpegopt quality=80 -scale-to-x 480 -scale-to-y -1 -singlefile "$DIST/$2" "public/regalo/$1" \
  && echo "public/regalo/$1.jpg · $(pdfinfo "$DIST/$2" | awk '/Pages/{print $2}') páginas (anótalas en api/_regalos.js)"
