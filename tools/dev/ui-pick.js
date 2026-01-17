#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Args Parsing
const args = process.argv.slice(2);
let options = [];
let useJson = false;
let outputFile = null;
let theme = 'wlilo'; // Default theme

function showHelp() {
  console.log('Usage: node tools/dev/ui-pick.js [--options-file=...] [--theme=...] <option...>');
  process.exit(0);
}

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--help' || arg === '-h') {
    showHelp();
  } else if (arg === '--json') {
    useJson = true;
  } else if (arg.startsWith('--options-file=')) {
    const filePath = arg.slice('--options-file='.length);
    try {
      options = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error('Error reading options file:', e.message);
      process.exit(2);
    }
  } else if (arg.startsWith('--output-file=')) {
    outputFile = arg.slice('--output-file='.length);
  } else if (arg.startsWith('--theme=')) {
    theme = arg.split('=')[1];
  } else if (arg.startsWith('--')) {
    // Ignore unknown flags or handle specifically?
  } else {
    options.push(arg);
  }
}

// Normalize strings to objects
const normalizedOptions = options.map(opt => {
  if (typeof opt === 'string') return { label: opt, value: opt };
  return opt;
});

const PICKER_PORT = 3333;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PICKER_PORT}/status`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function ensureServerRunning() {
  const isRunning = await checkServer();
  if (isRunning) return;

  const pickerDir = path.resolve(__dirname, '../ui/quick-picker');
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'npm.cmd' : 'npm';

  // Spawn detached
  const subprocess = spawn(npmCmd, ['start'], {
    cwd: pickerDir,
    detached: true,
    stdio: 'ignore', // 'ignore' allows it to run independently
    shell: true,
    windowsHide: false
  });

  subprocess.unref();

  // Wait for server to boot
  let attempts = 0;
  while (attempts < 20) {
    await new Promise(r => setTimeout(r, 500));
    if (await checkServer()) return;
    attempts++;
  }
  throw new Error('Failed to start picker server');
}

async function sendPrompt() {
  await ensureServerRunning();

  const payload = JSON.stringify({
    options: normalizedOptions,
    theme: theme
  });

  const options = {
    hostname: '127.0.0.1',
    port: PICKER_PORT,
    path: '/prompt',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 0 // Wait indefinitely (long poll)
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Main Execution
sendPrompt().then(result => {
  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  } else if (useJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.cancelled) {
    console.log('Cancelled');
  } else {
    console.log(result.selection);
  }
  process.exit(result.cancelled ? 1 : 0);
}).catch(err => {
  console.error('Picker Error:', err);
  process.exit(1);
});
