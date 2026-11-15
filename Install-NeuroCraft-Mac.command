#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "Для сборки .dmg / .app на Mac требуется Node.js: https://nodejs.org/"
  read -r -p "Нажмите Enter для выхода..."
  exit 1
fi

echo "=== Сборка NeuroCraft.app и NeuroCraft.dmg для macOS ==="
if [ ! -d "node_modules" ]; then
  npm install
fi

if [ ! -d "dist" ]; then
  npm run build
fi

npm install --no-save electron electron-builder
export CSC_IDENTITY_AUTO_DISCOVERY=false
npx electron-builder --mac --universal --publish never

echo "Готово! Установочные файлы находятся в папке release/"
open release/ 2>/dev/null || true
