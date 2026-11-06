#!/bin/bash
# Static export of the Next.js app for the Android APK WebView.
# API routes must be removed for export mode (no server runtime inside the APK).
set -e
cd /home/z/my-project

API_BAK=$(mktemp -d)
cleanup() { rm -rf "$API_BAK"; }
trap cleanup EXIT

echo "[1/4] moving src/app/api away -> $API_BAK"
mv src/app/api "$API_BAK/api"

echo "[2/4] static export build"
STATIC_EXPORT=1 npx next build || { echo "restoring api routes"; mv "$API_BAK/api" src/app/api; exit 1; }

echo "[3/4] restoring api routes"
mv "$API_BAK/api" src/app/api

echo "[4/4] verifying out/"
test -f out/index.html || { echo "FATAL: out/index.html missing"; exit 1; }
du -sh out
echo "STATIC EXPORT OK"
