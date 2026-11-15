/**
 * NeuroCraft Desktop Shell (macOS Universal .app/.dmg & Windows .exe)
 * Embedded static server + offline API bridge so Vite assets and local AI fallbacks work 100% offline.
 * @author Поставной Вячеслав Алексеевич
 * @license MIT
 */
const { app, BrowserWindow, Menu, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.NEUROCRAFT_URL || '';
let localServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function buildOfflineMentorAnswer(question, topicContext, language) {
  const q = `${question || ''} ${topicContext || ''}`.toLowerCase();
  if (language === 'en') {
    return [
      'Desktop Offline Mode (NeuroCraft Knowledge Base):',
      '',
      '1. System Flow: Input Guardrails (Injection + PII masking) -> Hybrid Retrieval (Dense + BM25 + Reranker) -> LLM Planning (ReAct) -> Tools/MCP -> Output Validation.',
      '2. Practice: Open Prompt Trainer and AI Lab to test prompts, agents, and MVP prototypes offline.',
    ].join('\n');
  }
  if (q.includes('mcp') || q.includes('инструм') || q.includes('tool')) {
    return [
      'Model Context Protocol (MCP) — единый стандарт подключения LLM к базам данных, CRM, документам и API:',
      '1. MCP Host (приложение) хранит системный промпт и ведёт диалог.',
      '2. MCP Client получает JSON-схемы доступных инструментов.',
      '3. MCP Server безопасно выполняет запрос к SQL/CRM/1С с проверкой прав.',
    ].join('\n');
  }
  if (q.includes('rag') || q.includes('поиск') || q.includes('чанк')) {
    return [
      'Production RAG состоит из 4 шагов:',
      '1. Chunking (фрагменты 300–500 токенов с перекрытием ~15%).',
      '2. Hybrid Search (векторный поиск + BM25 по точным кодам и номерам).',
      '3. Cross-Encoder Reranker (отбор топ-3–5 лучших фрагментов).',
      '4. Проверка метрик Context Recall и Faithfulness (ответ строго по источнику).',
    ].join('\n');
  }
  return [
    `Разбор вопроса${topicContext ? ` по теме «${topicContext}»` : ''} (офлайн-база знаний NeuroCraft Desktop):`,
    '',
    '1. Архитектура AI-системы: Входные Guardrails -> Контекст/RAG -> План действий (ReAct) -> Вызов инструментов (MCP/API) -> Контроль качества (Evals).',
    '2. Чтобы включить онлайн-поиск Gemini прямо в настольном приложении, запустите с переменной NEUROCRAFT_URL=https://ваш-домен.',
  ].join('\n');
}

function readRequestBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function startLocalStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const urlPath = (req.url || '/').split('?')[0];

      if (urlPath === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, desktopOffline: true }));
        return;
      }

      if (urlPath === '/api/ai-ask' && req.method === 'POST') {
        const body = await readRequestBody(req);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            answer: buildOfflineMentorAnswer(body.question, body.topicContext, body.language || 'ru'),
            sources: [],
            fallbackMode: true,
            fallbackReason: 'desktop-offline',
          })
        );
        return;
      }

      if (urlPath.startsWith('/api/')) {
        res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            code: 'RESOURCE_EXHAUSTED',
            error: 'Локальный режим настольного приложения: используется встроенная симуляция.',
          })
        );
        return;
      }

      const safeRelPath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(distDir, safeRelPath === '/' ? 'index.html' : safeRelPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

function setupMacAppMenu() {
  if (process.platform !== 'darwin') return;
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about', label: 'О программе NeuroCraft' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'Завершить NeuroCraft' },
      ],
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Окно',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 390,
    minHeight: 680,
    backgroundColor: '#0B0F19',
    title: 'NeuroCraft — Академия ИИ',
    icon: path.join(__dirname, '..', 'public', 'pwa-512x512.png'),
    titleBarStyle: process.platform === 'darwin' ? 'default' : 'default',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (APP_URL) {
    mainWindow.loadURL(APP_URL);
    return;
  }

  const distDir = path.join(__dirname, '..', 'dist');
  if (!localServer) {
    const started = await startLocalStaticServer(distDir);
    localServer = started.server;
    mainWindow.loadURL(`http://127.0.0.1:${started.port}/`);
  } else {
    const addr = localServer.address();
    mainWindow.loadURL(`http://127.0.0.1:${addr.port}/`);
  }
}

app.whenReady().then(async () => {
  setupMacAppMenu();
  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (localServer) localServer.close();
    app.quit();
  }
});

app.on('before-quit', () => {
  if (localServer) {
    localServer.close();
    localServer = null;
  }
});
