/**
 * NeuroCraft Desktop Shell (Windows & macOS)
 * @author Поставной Вячеслав Алексеевич
 * @license MIT
 */
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const APP_URL = process.env.NEUROCRAFT_URL || '';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 390,
    minHeight: 680,
    backgroundColor: '#0B0F19',
    title: 'NeuroCraft — Академия ИИ',
    icon: path.join(__dirname, '..', 'public', 'pwa-512x512.png'),
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
