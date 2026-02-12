/**
 * Sprint Tracker — Electron Main Process
 * 
 * Opens a BrowserWindow pointed at the tracker server.
 * The server is started automatically if not already running.
 * 
 * Usage:
 *   npx electron tools/sprint-tracker/main.js
 *   (or: cd tools/sprint-tracker && npx electron .)
 */

'use strict';

const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = parseInt(process.env.TRACKER_PORT || '3700');
const SERVER_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let serverProcess = null;

// ── Check if the server is already running ────────────────

function check_server(url) {
    return new Promise(resolve => {
        http.get(url + '/api/stats', res => {
            resolve(res.statusCode === 200);
        }).on('error', () => resolve(false));
    });
}

// ── Start the tracker server ──────────────────────────────

function start_server() {
    return new Promise((resolve, reject) => {
        const server_path = path.join(__dirname, 'tracker_server.js');
        serverProcess = spawn(process.execPath, [server_path], {
            env: { ...process.env, TRACKER_PORT: String(PORT) },
            stdio: 'pipe'
        });

        serverProcess.stdout.on('data', data => {
            const output = data.toString();
            console.log('[server]', output.trim());
            if (output.includes('Sprint Tracker Server')) {
                // Server is ready
                setTimeout(resolve, 200);
            }
        });

        serverProcess.stderr.on('data', data => {
            console.error('[server:err]', data.toString().trim());
        });

        serverProcess.on('error', err => {
            console.error('Failed to start server:', err);
            reject(err);
        });

        serverProcess.on('exit', code => {
            console.log('Server exited with code:', code);
            serverProcess = null;
        });

        // Fallback: resolve after 3s even if no stdout marker
        setTimeout(resolve, 3000);
    });
}

// ── Create the Electron window ────────────────────────────

function create_window() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 860,
        minWidth: 800,
        minHeight: 600,
        title: 'jsgui3 Sprint Tracker',
        backgroundColor: '#0f1117',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: false,
        show: false
    });

    mainWindow.loadURL(SERVER_URL);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ── Menu ──────────────────────────────────────────────────

function create_menu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export CSV',
                    click: () => {
                        if (mainWindow) {
                            shell.openExternal(`${SERVER_URL}/api/export/csv`);
                        }
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Refresh',
                    accelerator: 'CommandOrControl+R',
                    click: () => mainWindow && mainWindow.reload()
                },
                {
                    label: 'Dashboard',
                    click: () => mainWindow && mainWindow.loadURL(SERVER_URL)
                },
                { type: 'separator' },
                {
                    label: 'API Stats (in browser)',
                    click: () => shell.openExternal(`${SERVER_URL}/api/stats`)
                },
                { type: 'separator' },
                { role: 'toggleDevTools' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Sprint Tracker',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Sprint Tracker',
                            message: 'jsgui3 Sprint Tracker',
                            detail: 'Tracks progress and agent time across the control suite build.\n\nAPI: ' + SERVER_URL + '/api/stats'
                        });
                    }
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App lifecycle ─────────────────────────────────────────

app.whenReady().then(async () => {
    const already_running = await check_server(SERVER_URL);
    if (!already_running) {
        console.log('Starting tracker server...');
        await start_server();
    } else {
        console.log('Tracker server already running on port', PORT);
    }

    create_menu();
    create_window();
});

app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        create_window();
    }
});
