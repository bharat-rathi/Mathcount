#!/bin/bash
# Builds the zip to upload to the Chrome Web Store: dist/mathlete-daily-coach-<version>.zip
# Only the files the extension needs at runtime go in (no tests, store assets or setup scripts).
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
node tests/run-tests.mjs > /dev/null
node -e "const m=require('./manifest.json'); if (m.key) { console.error('Remove \"key\" from manifest.json before publishing.'); process.exit(1); } if (m.description.length > 132) { console.error('manifest description is over 132 characters'); process.exit(1); }"
mkdir -p dist
OUT="dist/mathlete-daily-coach-$VERSION.zip"
rm -f "$OUT"
zip -qr -X "$OUT" manifest.json background.js app.html app.css app.js blocked.html blocked.js icons lib
echo "Built $OUT ($(du -h "$OUT" | cut -f1)) — upload this file in the Chrome Web Store dashboard."
