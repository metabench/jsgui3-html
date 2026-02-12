#!/usr/bin/env node
'use strict';

/**
 * pick.js — Standalone CLI entry point for the quick-picker.
 *
 * Usage:
 *   node pick.js --prompt '[{"label":"A","value":"a"},{"label":"B","value":"b"}]'
 *   node pick.js --prompt-file options.json
 *   node pick.js --adopt
 *   node pick.js --adopt --task "refactoring controls"
 *   node pick.js --prompt '["A","B"]' --theme bright
 *
 * Behaviour:
 *   1. If the Electron picker HTTP server is already running on :3333, sends
 *      an HTTP request and waits for the response.
 *   2. Otherwise, spawns Electron in --cli mode (foreground, exits on selection)
 *      and captures stdout.
 *
 * Output: JSON on stdout — { selection, option, phase, success, cancelled }
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PICKER_PORT = 3333;
const PICKER_DIR = __dirname;

// ─── Arg Parsing ───

function parseArgs() {
    const args = process.argv.slice(2);
    const result = { mode: null, data: null, theme: 'wlilo', task: null };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--prompt' && args[i + 1]) {
            result.mode = 'prompt';
            result.data = args[++i];
        } else if (arg === '--prompt-file' && args[i + 1]) {
            result.mode = 'prompt';
            result.data = fs.readFileSync(args[++i], 'utf8');
        } else if (arg === '--adopt') {
            result.mode = 'adopt';
        } else if (arg === '--theme' && args[i + 1]) {
            result.theme = args[++i];
        } else if (arg === '--task' && args[i + 1]) {
            result.task = args[++i];
        } else if (arg === '--help' || arg === '-h') {
            console.log(`Usage:
  node pick.js --prompt '<json array>'   Show prompt picker
  node pick.js --prompt-file <path>      Load options from file
  node pick.js --adopt                   Show agent role picker
  node pick.js --theme <wlilo|bright>    Set theme (default: wlilo)
  node pick.js --task "<description>"    Task hint for adopt mode`);
            process.exit(0);
        }
    }

    return result;
}

// ─── Agent Roster Loading (for --adopt) ───

function loadAgentRoster() {
    const repoRoot = path.resolve(PICKER_DIR, '..', '..', '..');
    const rosterPath = path.join(repoRoot, '.agent', 'agent-roles.json');
    try {
        return JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
    } catch (e) {
        return null;
    }
}

function loadAgentIndex(sourceRepo) {
    const indexPath = path.join(sourceRepo, '.github', 'agents', 'index.json');
    try {
        return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (e) {
        return [];
    }
}

function readAgentFile(sourceRepo, agentPath) {
    const fullPath = path.join(sourceRepo, agentPath);
    try {
        return fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
        return null;
    }
}

function buildAgentOptions(roster) {
    const index = loadAgentIndex(roster.source_repo);
    const indexMap = {};
    for (const entry of index) {
        indexMap[entry.doc_slug] = entry;
    }

    return roster.agents.map(agent => {
        const meta = indexMap[agent.slug] || {};
        return {
            label: meta.title || agent.slug,
            value: agent.slug,
            description: agent.when,
            emoji: (meta.title && meta.title.match(/^[^\w\s]/)) ? meta.title.split(' ')[0] : '\u{1F916}',
            tags: meta.tags || [],
            purpose: meta.purpose || agent.when,
            agentPath: meta.path || null
        };
    });
}

// ─── HTTP Check ───

function checkServer() {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${PICKER_PORT}/status`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
}

// ─── HTTP Mode (server already running) ───

function httpRequest(urlPath, payload) {
    const body = JSON.stringify(payload);
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: PICKER_PORT,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid JSON from server')); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ─── CLI Mode (spawn Electron --cli) ───

function runElectronCli(optionsFile, theme, mode) {
    return new Promise((resolve, reject) => {
        // Resolve local Electron binary
        let electronBin;
        try {
            electronBin = require(path.join(PICKER_DIR, 'node_modules', 'electron'));
        } catch (e) {
            electronBin = null;
        }

        const electronArgs = [
            '.',
            '--cli',
            `--theme=${theme}`
        ];

        if (mode === 'adopt') {
            electronArgs.push(`--agents-file=${optionsFile}`);
        } else {
            electronArgs.push(`--options-file=${optionsFile}`);
        }

        let child;
        if (electronBin) {
            child = spawn(electronBin, electronArgs, {
                cwd: PICKER_DIR,
                stdio: ['ignore', 'pipe', 'pipe']
            });
        } else {
            // Fallback: npx electron
            const isWin = process.platform === 'win32';
            const npxCmd = isWin ? 'npx.cmd' : 'npx';
            child = spawn(npxCmd, ['electron', ...electronArgs], {
                cwd: PICKER_DIR,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
            });
        }

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', chunk => { stdout += chunk.toString(); });
        child.stderr.on('data', chunk => { stderr += chunk.toString(); });

        child.on('close', (code) => {
            // Find the last JSON line in stdout (skip any Electron noise)
            const lines = stdout.trim().split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line.startsWith('{')) {
                    try {
                        resolve(JSON.parse(line));
                        return;
                    } catch (e) { /* not valid JSON, try next */ }
                }
            }
            // No JSON found
            if (code !== 0) {
                reject(new Error(`Electron exited with code ${code}: ${stderr}`));
            } else {
                resolve({ selection: null, cancelled: true, success: false });
            }
        });

        child.on('error', reject);
    });
}

// ─── Main ───

async function main() {
    const args = parseArgs();

    if (!args.mode) {
        console.error('Error: specify --prompt, --prompt-file, or --adopt');
        process.exit(1);
    }

    let options, agentOptions, roster;

    if (args.mode === 'prompt') {
        try {
            options = JSON.parse(args.data);
        } catch (e) {
            console.error('Error: invalid JSON for --prompt');
            process.exit(1);
        }
        // Normalize string options
        options = options.map(opt => {
            if (typeof opt === 'string') return { label: opt, value: opt };
            return opt;
        });
    } else if (args.mode === 'adopt') {
        roster = loadAgentRoster();
        if (!roster) {
            console.error('Error: no .agent/agent-roles.json found');
            process.exit(1);
        }
        agentOptions = buildAgentOptions(roster);
        if (agentOptions.length === 0) {
            console.error('Error: no agents configured in roster');
            process.exit(1);
        }
    }

    // Try HTTP mode first (server already running)
    const serverRunning = await checkServer();

    if (serverRunning) {
        try {
            let result;
            if (args.mode === 'prompt') {
                result = await httpRequest('/prompt', { options, theme: args.theme });
            } else {
                result = await httpRequest('/adopt', { agents: agentOptions, theme: args.theme });
            }

            // For adopt mode, enrich with agent content
            if (args.mode === 'adopt' && result.selection && !result.cancelled) {
                const selectedOption = agentOptions.find(a => a.value === result.selection);
                let agentContent = null;
                if (selectedOption && selectedOption.agentPath) {
                    agentContent = readAgentFile(roster.source_repo, selectedOption.agentPath);
                }
                result = {
                    adopted: true,
                    agent_slug: result.selection,
                    agent_title: selectedOption ? selectedOption.label : result.selection,
                    agent_purpose: selectedOption ? selectedOption.purpose : null,
                    agent_content: agentContent
                };
            }

            console.log(JSON.stringify(result, null, 2));
            process.exit(0);
        } catch (e) {
            // HTTP failed, fall through to CLI mode
            process.stderr.write(`HTTP mode failed (${e.message}), falling back to CLI\n`);
        }
    }

    // CLI mode: write options to temp file, spawn Electron
    const tmpFile = path.join(os.tmpdir(), `pick-${Date.now()}.json`);

    if (args.mode === 'prompt') {
        fs.writeFileSync(tmpFile, JSON.stringify(options));
    } else {
        fs.writeFileSync(tmpFile, JSON.stringify(agentOptions));
    }

    try {
        let result = await runElectronCli(tmpFile, args.theme, args.mode);

        // For adopt mode, enrich with agent content
        if (args.mode === 'adopt' && result.selection && !result.cancelled) {
            const selectedOption = agentOptions.find(a => a.value === result.selection);
            let agentContent = null;
            if (selectedOption && selectedOption.agentPath) {
                agentContent = readAgentFile(roster.source_repo, selectedOption.agentPath);
            }
            result = {
                adopted: true,
                agent_slug: result.selection,
                agent_title: selectedOption ? selectedOption.label : result.selection,
                agent_purpose: selectedOption ? selectedOption.purpose : null,
                agent_content: agentContent
            };
        }

        console.log(JSON.stringify(result, null, 2));
    } finally {
        // Clean up temp file
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
    }
}

main().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
