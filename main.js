const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let isAlwaysOnTop = false;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Default dimensions for Pixel 8/9 Pro + chassis bezel (412 + 24, 915 + 24)
  const initialWidth = 436;
  const initialHeight = 939;

  // Position window centered-right on screen
  const posX = Math.max(50, Math.floor(screenWidth - initialWidth - 80));
  const posY = Math.max(30, Math.floor((screenHeight - initialHeight) / 2));

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    resizable: false, // Strictly non-resizable manually
    hasShadow: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // Native Chromium webview
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allows loading any localhost or external site seamlessly
    }
  });

  mainWindow.loadFile('index.html');

  // Handle popups / window.open inside webview to open as tabs
  app.on('web-contents-created', (event, contents) => {
    if (contents.getType() === 'webview') {
      contents.setWindowOpenHandler(({ url }) => {
        if (mainWindow) {
          mainWindow.webContents.send('open-new-tab-url', url);
        }
        return { action: 'deny' };
      });
    }
  });

  // IPC Handlers
  ipcMain.on('resize-window', (event, { width, height }) => {
    if (!mainWindow) return;
    mainWindow.setResizable(true);
    mainWindow.setSize(Math.round(width), Math.round(height), true);
    mainWindow.setResizable(false);
  });

  ipcMain.on('toggle-always-on-top', (event, forceState) => {
    if (!mainWindow) return;
    isAlwaysOnTop = (typeof forceState === 'boolean') ? forceState : !isAlwaysOnTop;
    mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
    event.reply('always-on-top-changed', isAlwaysOnTop);
  });

  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
