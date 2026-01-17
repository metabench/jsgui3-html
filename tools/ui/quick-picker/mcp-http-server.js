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
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    const subprocess = spawn(npmCmd, ['start'], {
        cwd: pickerDir,
        detached: true,
        stdio: 'ignore',
        shell: true,
        windowsHide: false
    });
    subprocess.unref();

    let attempts = 0;
    while (attempts < 20) {
        await new Promise(r => setTimeout(r, 500));
        if (await checkPickerServer()) return;
        attempts++;
    }
    throw new Error('Failed to start picker server');
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
                }
            ]
        };
    });

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name !== 'prompt_user') {
            throw new Error(`Unknown tool: ${request.params.name}`);
        }

        const { options, theme } = request.params.arguments;

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
