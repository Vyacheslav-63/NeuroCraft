#!/usr/bin/env bash
set -euo pipefail

echo "1/3 Building NeuroCraft web bundle..."
npm run build

echo "2/3 Installing Electron & electron-builder locally (no-save)..."
npm install --no-save electron electron-builder

echo "3/3 Packaging universal macOS .dmg and .zip (Apple Silicon + Intel)..."
export CSC_IDENTITY_AUTO_DISCOVERY=false
npx electron-builder --mac --universal --publish never

echo "Done! Installers saved in ./release/"
ls -lh release/*.dmg release/*.zip 2>/dev/null || true
