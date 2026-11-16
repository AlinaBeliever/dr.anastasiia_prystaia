#!/bin/bash
# Подвійний клік на Mac: відкриває сайт у браузері на http://localhost:8080
cd "$(dirname "$0")/site" || exit 1
echo "Сайт запущено: http://localhost:8080  (щоб зупинити, закрийте це вікно)"
(sleep 1 && open "http://localhost:8080") &
python3 -m http.server 8080
