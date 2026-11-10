#!/bin/bash
# ============================================================
# CV Studio — one-command publish
# Usage:  GITHUB_TOKEN=your_personal_access_token bash scripts/publish.sh
# The token needs only the "repo" scope (classic) or
# "Contents: read & write" (fine-grained) for assmmsto/CV.
# ============================================================
set -e
cd "$(dirname "$0")/.."

if [ -z "$GITHUB_TOKEN" ]; then
  echo "خطأ: مرر التوكن هكذا:  GITHUB_TOKEN=ghp_xxxx bash scripts/publish.sh"
  exit 1
fi

echo "[1/3] pushing main branch..."
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/assmmsto/CV.git" main

echo ""
echo "[2/3] GitHub Pages will rebuild automatically (source: main /docs)."
echo "      Wait ~1-2 minutes, then check:"
echo "      - Download page : https://assmmsto.github.io/CV/"
echo "      - Web app       : https://assmmsto.github.io/CV/app/"
echo "      - APK           : https://assmmsto.github.io/CV/cv-studio.apk  (v1.2.1)"

echo ""
echo "[3/3] verifying live deployment..."
sleep 90
for path in "" "app/" "cv-studio.apk"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://assmmsto.github.io/CV/$path")
  echo "  /CV/$path -> $code"
done
echo "DONE"
