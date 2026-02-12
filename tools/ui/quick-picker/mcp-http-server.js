#!/usr/bin/env node
'use strict';

const express = require('express');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MCP_PORT = 3334;
const PICKER_PORT = 3333;

// Check if the picker HTTP server is running
function checkPickerServer() {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${PICKER_PORT}/status`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Ensure the picker server is running
async function ensurePickerServerRunning() {
    const isRunning = await checkPickerServer();
    if (isRunning) return;

    const pickerDir = path.resolve(__dirname, '.');
    const isWin = process.platform === 'win32';

    // Resolve the local Electron binary directly — avoids PATH issues
    let electronBin;
    try {
        const electronPath = require(path.join(pickerDir, 'node_modules', 'electron'));
        electronBin = electronPath;
    } catch (e) {
        electronBin = null;
    }

    if (electronBin) {
        const subprocess = spawn(electronBin, ['.'], {
            cwd: pickerDir,
            detached: true,
            stdio: 'ignore',
            windowsHide: false
        });
        subprocess.unref();
    } else {
        const npmCmd = isWin ? 'npm.cmd' : 'npm';
        const subprocess = spawn(npmCmd, ['start'], {
            cwd: pickerDir,
            detached: true,
            stdio: 'ignore',
            shell: true,
            windowsHide: false
        });
        subprocess.unref();
    }

    let attempts = 0;
    while (attempts < 30) {
        await new Promise(r => setTimeout(r, 500));
        if (await checkPickerServer()) return;
        attempts++;
    }
    throw new Error('Failed to start picker server after 15s');
}

// Send prompt to picker server
async function sendPrompt(options, theme) {
    await ensurePickerServerRunning();

    const payload = JSON.stringify({ options, theme: theme || 'wlilo' });

    const requestOptions = {
        hostname: '127.0.0.1',
        port: PICKER_PORT,
        path: '/prompt',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response from picker'));
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Load agent roster from .agent/agent-roles.json
function loadAgentRoster() {
    const repoRoot = path.resolve(__dirname, '..', '..', '..');
    const rosterPath = path.join(repoRoot, '.agent', 'agent-roles.json');
    try {
        return JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
    } catch (e) {
        return null;
    }
}

// Load agent index from copilot-dl-news
function loadAgentIndex(sourceRepo) {
    const indexPath = path.join(sourceRepo, '.github', 'agents', 'index.json');
    try {
        return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Read full .agent.md content
function readAgentFile(sourceRepo, agentPath) {
    const fullPath = path.join(sourceRepo, agentPath);
    try {
        return fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
        return null;
    }
}

// Build enriched agent options for the picker
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

// Send adopt request to picker server
async function sendAdopt(options, theme) {
    await ensurePickerServerRunning();

    const payload = JSON.stringify({ agents: options, theme: theme || 'wlilo' });

    const requestOptions = {
        hostname: '127.0.0.1',
        port: PICKER_PORT,
        path: '/adopt',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response from picker'));
                }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Create MCP Server
function createMcpServer() {
    const server = new Server(
        {
            name: 'ui-pick-http-server',
            version: '1.0.0'
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    // List available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: 'prompt_user',
                    description: 'Show a selection dialog to the user and wait for their choice.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            options: {
                                type: 'array',
                                description: 'Array of options (strings or objects with label/value/description).',
                                items: {
                                    oneOf: [
                                        { type: 'string' },
                                        {
                                            type: 'object',
                                            properties: {
                                                label: { type: 'string' },
                                                value: { type: 'string' },
                                                description: { type: 'string' }
                                            },
                                            required: ['label']
                                        }
                                    ]
                                }
                            },
                            theme: {
                                type: 'string',
                                description: 'Theme: "wlilo" (dark) or "bright" (light)',
                                default: 'wlilo'
                            }
                        },
                        required: ['options']
                    }
                },
                {
                    name: 'adopt_agent',
                    description: 'Show the agent role picker. Displays available agent personas from copilot-dl-news and returns the selected agent\'s full .agent.md content for the caller to adopt.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task_description: {
                                type: 'string',
                                description: 'Optional description of the current task — used to highlight the best-matching agent role'
                            },
                            theme: {
                                type: 'string',
                                description: 'Theme: "wlilo" (dark) or "bright" (light)',
                                default: 'wlilo'
                            }
                        }
                    }
                }
            ]
        };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const toolName = request.params.name;

        if (toolName === 'prompt_user') {
            const { options, theme } = request.params.arguments || {};

            if (!options || !Array.isArray(options) || options.length === 0) {
                throw new Error('options must be a non-empty array');
            }

            const normalizedOptions = options.map(opt => {
                if (typeof opt === 'string') return { label: opt, value: opt };
                return opt;
            });

            try {
                const result = await sendPrompt(normalizedOptions, theme);
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    isError: true
                };
            }
        }

        if (toolName === 'adopt_agent') {
            const { task_description, theme } = request.params.arguments || {};

            const roster = loadAgentRoster();
            if (!roster) {
                return {
                    content: [{ type: 'text', text: 'Error: No .agent/agent-roles.json found in repo root' }],
                    isError: true
                };
            }

            const agentOptions = buildAgentOptions(roster);
            if (agentOptions.length === 0) {
                return {
                    content: [{ type: 'text', text: 'Error: No agents configured in roster' }],
                    isError: true
                };
            }

            try {
                const result = await sendAdopt(agentOptions, theme);

                if (result.cancelled || !result.selection) {
                    return {
                        content: [{ type: 'text', text: JSON.stringify({ cancelled: true, agent: null }, null, 2) }]
                    };
                }

                const selectedSlug = result.selection;
                const selectedOption = agentOptions.find(a => a.value === selectedSlug);
                let agentContent = null;

                if (selectedOption && selectedOption.agentPath) {
                    agentContent = readAgentFile(roster.source_repo, selectedOption.agentPath);
                }

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({
                            adopted: true,
                            agent_slug: selectedSlug,
                            agent_title: selectedOption ? selectedOption.label : selectedSlug,
                            agent_purpose: selectedOption ? selectedOption.purpose : null,
                            agent_content: agentContent
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    isError: true
                };
            }
        }

        throw new Error(`Unknown tool: ${toolName}`);
    });

    return server;
}

// Express app for SSE
const app = express();
app.use(express.json());

// Store active transports
const transports = {};

// SSE endpoint (GET) - Client connects here to receive events
app.get('/sse', async (req, res) => {
    console.log('SSE client connected');

    const transport = new SSEServerTransport('/messages', res);
    const server = createMcpServer();

    transports[transport.sessionId] = transport;

    res.on('close', () => {
        console.log('SSE client disconnected');
        delete transports[transport.sessionId];
    });

    await server.connect(transport);
});

// Messages endpoint (POST) - Client sends messages here
app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];

    if (!transport) {
        return res.status(400).json({ error: 'No active session' });
    }

    await transport.handlePostMessage(req, res);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', port: MCP_PORT });
});

// Start server
app.listen(MCP_PORT, () => {
    console.log(`MCP HTTP Server (SSE) listening on port ${MCP_PORT}`);
    console.log(`SSE endpoint: http://127.0.0.1:${MCP_PORT}/sse`);
    console.log(`Messages endpoint: http://127.0.0.1:${MCP_PORT}/messages`);
});
