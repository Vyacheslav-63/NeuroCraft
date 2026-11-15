#!/usr/bin/env bash
set -euo pipefail

# NeuroCraft — Автоматический установщик на сервер (Ubuntu/Debian/Linux VPS)
# Автор: Поставной Вячеслав Алексеевич

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-3000}"

echo "=========================================="
echo "  NeuroCraft — Установка на сервер"
echo "=========================================="

if [ ! -f "$APP_DIR/.env" ]; then
  if [ -f "$APP_DIR/.env.example" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  else
    cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=$PORT
GEMINI_API_KEY=
APP_URL=http://localhost:$PORT
EOF
  fi
  echo "[1/4] Создан файл настроек .env (при желании добавьте туда GEMINI_API_KEY)"
else
  echo "[1/4] Используется существующий файл .env"
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "[2/4] Обнаружен Docker Compose — запуск через контейнер..."
  cd "$APP_DIR"
  docker compose up -d --build
  echo ""
  echo "Готово! NeuroCraft запущен в Docker на порту $PORT."
  echo "Проверка: curl -s http://127.0.0.1:$PORT/api/health"
  exit 0
fi

echo "[2/4] Проверка Node.js (требуется v22.18+)..."
NEED_NODE=0
if ! command -v node >/dev/null 2>&1; then
  NEED_NODE=1
else
  NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
  NODE_MINOR=$(node -p "process.versions.node.split('.')[1]")
  if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 18 ]; }; then
    NEED_NODE=1
  fi
fi

if [ "$NEED_NODE" -eq 1 ]; then
  echo "Устанавливаю Node.js 22 LTS..."
  if command -v apt-get >/dev/null 2>&1 && [ "$(id -u)" -eq 0 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  else
    echo "ОШИБКА: Установите Node.js 22.18+ (https://nodejs.org/) или Docker и запустите скрипт снова."
    exit 1
  fi
fi

echo "[3/4] Установка зависимостей и сборка..."
cd "$APP_DIR"
npm install
npm run build

echo "[4/4] Настройка автозапуска..."
if [ "$(id -u)" -eq 0 ] && command -v systemctl >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
  cat > /etc/systemd/system/neurocraft.service <<EOF
[Unit]
Description=NeuroCraft AI Academy Server
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
Environment=NODE_ENV=production
ExecStart=$NODE_BIN $APP_DIR/server.ts
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable --now neurocraft
  echo ""
  echo "Готово! Сервис neurocraft запущен через systemd на порту $PORT."
  echo "Логи: journalctl -u neurocraft -f"
  echo "Совет для PWA (Android/iOS): подключите домен по HTTPS (см. Caddyfile.example)."
else
  echo "Запускаю сервер напрямую (для фоновой работы используйте pm2 или systemd)..."
  NODE_ENV=production PORT="$PORT" npm start
fi
