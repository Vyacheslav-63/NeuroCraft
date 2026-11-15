# NeuroCraft — Интерактивная академия и игра по изучению ИИ

Интерактивное веб-приложение (Mobile-first & Desktop) в формате Duolingo / Brilliant для изучения современных LLM, промпт-инжиниринга, создания AI-агентов, веб-кодинга с ИИ, Production RAG, Evals, Guardrails и стратегий монетизации.

**Создатель и автор проекта:** Поставной Вячеслав Алексеевич

---

## Основные возможности

1. **Карта приключений (7 глав · 21 модуль · 63 проверочных вопроса)**
   - **Глава 1:** Основы нейросетей (токены, контекст, temperature, галлюцинации и базовый RAG)
   - **Глава 2:** Мастер промптинга (анатомия промпта, Few-Shot, Chain-of-Thought, системные инструкции)
   - **Глава 3:** Создание AI-агентов (цикл ReAct, Function Calling и API, векторная память и мультиагенты)
   - **Глава 4:** Веб-кодинг с ИИ (спецификация до кода, итеративная отладка, безопасный сервер `/api/*` и релиз MVP)
   - **Глава 5:** Стратегии монетизации (ценность B2B, юнит-экономика микро-SaaS, первый контракт за 7 дней)
   - **Глава 6:** Production RAG, MCP и Fine-Tuning (чанкинг, гибридный поиск Dense + BM25, Cross-Encoder реранкер, Model Context Protocol, выбор между Prompt / RAG / LoRA)
   - **Глава 7:** Evals, Безопасность и Guardrails (Golden Dataset, LLM-as-a-Judge, защита от Prompt Injection, маскировка PII, трейсинг и SLA)
   - **11 интерактивных песочниц** внутри уроков и **сноски с готовыми запросами к ИИ** при неверном ответе.

2. **Тренажер промптов (9 практических квестов)**
   - Проверка формулировок в реальном времени (локальная рубрика + серверная оценка через Gemini API по шкалам точности, контекста и роли/формата).
   - Подсказки, конструктор быстрых блоков и эталонные сноски при доработке запроса.

3. **AI Лаборатория (Конструктор агентов и Веб-кодинг MVP)**
   - **6 профессиональных пресетов:** Агент поддержки, Финансовый аналитик, B2B-квалификатор, Юрист по договорам, Рекламщик и маркетолог, Бухгалтер и налоговый ассистент.
   - Подключение инструментов (RAG, **MCP-коннектор**, CRM, калькуляторы), настройка памяти и **Guardrails продакшена** (защита от Prompt Injection, маскировка PII, `maxSteps`), кнопка стресс-теста **Red-Team**.
   - **Генератор веб-MVP** с живым предпросмотром под экран телефона, десктопа и исходным HTML-кодом.

4. **Бизнес-Хаб, Миссии и Именные сертификаты**
   - **12 бизнес-кейсов** с симулятором решений и калькулятором дохода в `RUB / USD / EUR / GBP`.
   - **Миссии недели** с обновлением каждый понедельник и коллекцией эксклюзивных значков.
   - **Бонусы за этапы и сертификаты (PNG и HTML/PDF)** с итоговой оценкой, списком изученных дисциплин и перечнем всех освоенных вопросов + добровольная регистрация студента.
   - **Глобальный AI-ментор** с живым поиском Google Search для актуальных вопросов по ИИ.

---

## Технологический стек

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend:** Node.js, Express, `@google/genai` (серверные маршруты `/api/*`)
- **Языки интерфейса и валюты:** `RU / EN / ES` · `RUB / USD / EUR / GBP`

---

## Локальный запуск и сборка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте файл `.env.example` в `.env` и укажите ваш API-ключ Gemini:
```bash
cp .env.example .env
```

Содержимое `.env`:
```env
GEMINI_API_KEY="ВАШ_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 3. Режим разработки
```bash
npm run dev
```
Приложение будет доступно по адресу `http://localhost:3000`.

### 4. Проверка типов и production-сборка
```bash
npm run lint
npm run build
npm start
```

---

## Установка на Android, iOS, Windows и macOS

### Вариант 1: Мгновенная установка как PWA (без магазинов приложений)
Приложение полностью соответствует стандартам PWA (`vite-plugin-pwa`, Web App Manifest, Service Worker с офлайн-кэшем, иконки `192x192`, `512x512`, `maskable`, `apple-touch-icon.png` и `favicon.ico`) и имеет встроенную кнопку **«Установить NeuroCraft»**:
- **Android (Chrome / Edge / Яндекс Браузер):** нажмите **«Установить»** внутри приложения или в меню браузера выберите *«Добавить на главный экран»*.
- **iOS / iPadOS (Safari):** откройте сайт в Safari → **«Поделиться»** → **«На экран «Домой»** → **«Добавить»**.
- **Windows 10 / 11 (Edge / Chrome):** нажмите кнопку установки в правой части адресной строки или кнопку **«Установить»** в боковой панели.
- **macOS (Safari 17+ / Chrome):** в Safari выберите *«Файл» → «Добавить в Dock»*, либо установите через Chrome как отдельное приложение.

### Вариант 2: Сборка нативных пакетов (`.apk`, `.ipa`, `.exe`, `.dmg`)
В репозитории уже подготовлены конфигурационные файлы:
- **Android (`.apk` / `.aab`) и iOS (`.ipa`)** — через Capacitor (`capacitor.config.ts`):
  ```bash
  npm run build
  npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
  npx cap add android
  npx cap add ios
  npx cap sync
  ```
- **macOS (`.dmg` и `.zip` Universal для Apple Silicon M1–M4 и Intel):**
  ```bash
  npm run build:mac
  ```
  Готовые файлы появятся в папке `release/` (либо запустите GitHub Action **`Build Installable Apps`** — `.github/workflows/build-apps.yml`).
- **Windows (`.exe`) и macOS (`.dmg`) вручную** — через Electron (`electron/main.cjs` и `electron-builder.yml`):
  ```bash
  npm run build
  npm i -D electron electron-builder
  npx electron-builder --win --mac
  ```

---

## Глобальный деплой (доступ из любой страны без AI Studio)

Ссылки вида `*.run.app` внутри AI Studio ограничены авторизацией и региональной политикой Google AI Studio. Чтобы приложение открывалось, устанавливалось как PWA и раздавало дистрибутивы **у любого пользователя в любой стране мира**:

- **Автоматическая установка на VPS (Ubuntu / Debian / Docker):**
  Скачайте архив сборки прямо из приложения (вкладка **«Сервер / Linux»** → `/api/download/server-bundle`) и выполните на сервере:
  ```bash
  tar -xzf NeuroCraft-Server-Deploy.tar.gz
  sudo bash install-server.sh
  ```
  Скрипт автоматически установит Node.js 22 (или использует Docker Compose), соберёт проект и запустит системный сервис `neurocraft` на порту `3000`. Для автоматического HTTPS (необходимо для PWA на Android и iOS) используйте `Caddyfile.example`.
- **Docker Compose (1 команда):**
  ```bash
  docker compose up -d --build
  ```
- **Render.com (1 клик через `render.yaml`):** подключите GitHub-репозиторий как Blueprint или Web Service (`Build: npm install && npm run build`, `Start: npm start`, опционально `GEMINI_API_KEY`).
- **Docker / Railway / Fly.io вручную:**
  ```bash
  docker build -t neurocraft .
  docker run -p 3000:3000 -e GEMINI_API_KEY="ВАШ_КЛЮЧ" neurocraft
  ```

---

## Лицензия

Проект распространяется под лицензией MIT. Подробнее см. файл [LICENSE](./LICENSE).

Автор: **Поставной Вячеслав Алексеевич**

