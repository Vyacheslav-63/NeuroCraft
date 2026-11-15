#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.." || cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "Для сборки .dmg на Mac требуется Node.js (https://nodejs.org/)."
  exit 1
fi

echo "=== NeuroCraft macOS Universal (.dmg) Builder ==="
if [ ! -d "node_modules" ]; then
  echo "Установка зависимостей проекта..."
  npm install
fi

if [ ! -d "dist" ]; then
  echo "Сборка веб-приложения..."
  npm run build
fi

echo "Установка Electron и electron-builder..."
npm install --no-save electron electron-builder

echo "Создание универсального образа .dmg (Apple Silicon + Intel)..."
export CSC_IDENTITY_AUTO_DISCOVERY=false
npx electron-builder --mac --universal --publish never

echo "Готово! Открываю папку release/ в Finder..."
open release/ 2>/dev/null || true
