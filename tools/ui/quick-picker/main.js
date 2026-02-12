const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('http');

let mainWindow;
let server;
let pendingResponse = null;

// Parse --cli flag early at module scope
const cliMode = process.argv.includes('--cli');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false, // Frameless for a "tool" feel
    alwaysOnTop: true,
    transparent: true,
    resizable: true
  });

  mainWindow.loadFile('index.html');

  // Parse args — Electron args include binary and script path
  const argv = process.argv;
  let optionsFilePath = null;
  let agentsFilePath = null;
  let theme = null;

  for (const arg of argv) {
    if (arg.startsWith('--options-file=')) {
      optionsFilePath = arg.split('=')[1];
    } else if (arg.startsWith('--agents-file=')) {
      agentsFilePath = arg.split('=')[1];
    } else if (arg.startsWith('--theme=')) {
      theme = arg.split('=')[1];
    } else if (arg === '--cli') {
      // handled at module scope
    }
  }

  if (!theme) theme = 'wlilo';

  // Load options from file (prompt mode)
  if (optionsFilePath) {
    try {
      const content = fs.readFileSync(optionsFilePath, 'utf8');
      const options = JSON.parse(content);

      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-options', options);
        mainWindow.webContents.send('set-theme', theme);
      });
    } catch (e) {
      console.error('Failed to read options file:', e);
      app.quit();
    }
  }

  // Load agents from file (adopt mode)
  if (agentsFilePath) {
    try {
      const content = fs.readFileSync(agentsFilePath, 'utf8');
      const agents = JSON.parse(content);

      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-agents', agents);
        mainWindow.webContents.send('set-theme', theme);
      });
    } catch (e) {
      console.error('Failed to read agents file:', e);
      app.quit();
    }
  }

  // Handle selection
  ipcMain.on('selection-made', (event, payload) => {
    // Allow payload to be a string or structured object
    const data = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : { selection: payload };
    const option = data.option || null;
    const selection = data.selection ?? (option ? option.value || option.label : null);
    const phase = data.phase || (option && option.phase) || null;

    const responseData = { selection, option, phase, success: true, cancelled: false };

    if (pendingResponse) {
      pendingResponse.writeHead(200, { 'Content-Type': 'application/json' });
      pendingResponse.end(JSON.stringify(responseData));
      pendingResponse = null;
    } else {
      console.log(JSON.stringify(responseData));
    }

    if (cliMode) {
      app.quit();
    } else {
      mainWindow.hide();
    }
  });

  // Handle close/cancel
  ipcMain.on('cancel', () => {
    const responseData = { selection: null, cancelled: true, success: false };

    if (pendingResponse) {
      pendingResponse.writeHead(200, { 'Content-Type': 'application/json' });
      pendingResponse.end(JSON.stringify(responseData));
      pendingResponse = null;
    } else {
      console.log(JSON.stringify(responseData));
    }

    if (cliMode) {
      app.quit();
    } else {
      mainWindow.hide();
    }
  });

  // Context menu per option
  ipcMain.on('context-menu', (event, payload) => {
    if (!payload || !payload.option) return;
    const option = payload.option;
    const targetWindow = BrowserWindow.fromWebContents(event.sender) || mainWindow;

    const sendAction = (action) => {
      event.sender.send('context-action', { action, option });
    };

    const menu = Menu.buildFromTemplate([
      { label: '🔍 Explore', click: () => sendAction('explore') },
      { label: '🧪 Test', click: () => sendAction('test') },
      { label: '🛠️ Implement', click: () => sendAction('implement') },
      { label: '🛡️ Fix', click: () => sendAction('fix') }
    ]);

    menu.popup({ window: targetWindow });
  });
}

function startServer() {
  server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', pid: process.pid }));
      return;
    }

    if (req.url === '/prompt' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);

          // If a previous request was pending, cancel it
          if (pendingResponse) {
            pendingResponse.writeHead(409, { 'Content-Type': 'application/json' });
            pendingResponse.end(JSON.stringify({ error: 'New prompt took over' }));
          }

          pendingResponse = res;

          // Show window and update options
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            if (payload.options) {
              mainWindow.webContents.send('set-options', payload.options);
            }
            if (payload.theme) {
              mainWindow.webContents.send('set-theme', payload.theme);
            }
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    if (req.url === '/adopt' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);

          if (pendingResponse) {
            pendingResponse.writeHead(409, { 'Content-Type': 'application/json' });
            pendingResponse.end(JSON.stringify({ error: 'New prompt took over' }));
          }

          pendingResponse = res;

          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('set-agents', payload.agents || []);
            if (payload.theme) {
              mainWindow.webContents.send('set-theme', payload.theme);
            }
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(3333, '127.0.0.1', () => {
    console.log('Pick Server listening on port 3333');
  });
}

app.whenReady().then(() => {
  // In CLI mode, skip HTTP server — we exit after one selection
  if (!cliMode) {
    startServer();
  }
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Do not quit on window close, keep server running
app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') app.quit(); 
});
