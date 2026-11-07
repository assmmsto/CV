#!/bin/bash
# GitHub Pages build of the app itself → docs/app/ (served at https://assmmsto.github.io/CV/app/)
set -e
cd /home/z/my-project

API_BAK=$(mktemp -d)
cleanup() { rm -rf "$API_BAK"; }
trap cleanup EXIT

echo "[1/4] moving src/app/api away -> $API_BAK"
mv src/app/api "$API_BAK/api"

echo "[2/4] pages export build (basePath /CV/app)"
PAGES_EXPORT=1 npx next build || { echo "restoring api routes"; mv "$API_BAK/api" src/app/api; exit 1; }

echo "[3/4] restoring api routes"
mv "$API_BAK/api" src/app/api

echo "[4/4] copying out/ -> docs/app/"
test -f out/index.html || { echo "FATAL: out/index.html missing"; exit 1; }
rm -rf docs/app
mkdir -p docs/app
cp -r out/. docs/app/
du -sh docs/app
echo "PAGES EXPORT OK"
