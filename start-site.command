#!/bin/bash
# Подвійний клік на Mac: збирає сторінки з content/*.json і відкриває сайт на http://localhost:8080
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null && node tools/build/build.mjs
cd site || exit 1
echo "Сайт запущено: http://localhost:8080  (щоб зупинити, закрийте це вікно)"
(sleep 1 && open "http://localhost:8080") &
python3 -m http.server 8080
