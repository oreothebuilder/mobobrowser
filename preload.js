const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  toggleAlwaysOnTop: (forceState) => ipcRenderer.send('toggle-always-on-top', forceState),
  onAlwaysOnTopChanged: (callback) => ipcRenderer.on('always-on-top-changed', (event, val) => callback(val)),
  onOpenNewTabUrl: (callback) => ipcRenderer.on('open-new-tab-url', (event, url) => callback(url)),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close')
});
