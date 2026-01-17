#!/usr/bin/env node
'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PICKER_PORT = 3333;

// Check if the picker HTTP server is running
function checkServer() {
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
async function ensureServerRunning() {
    const isRunning = await checkServer();
    if (isRunning) return;

    const pickerDir = path.resolve(__dirname, '.');
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    // Spawn detached Electron process
    const subprocess = spawn(npmCmd, ['start'], {
        cwd: pickerDir,
        detached: true,
        stdio: 'ignore',
        shell: true,
        windowsHide: false
    });
    subprocess.unref();

    // Wait for server to start
    let attempts = 0;
    while (attempts < 20) {
        await new Promise(r => setTimeout(r, 500));
        if (await checkServer()) return;
        attempts++;
    }
    throw new Error('Failed to start picker server');
}

// Send prompt to picker server
async function sendPrompt(options, theme) {
    await ensureServerRunning();

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
const server = new Server(
    {
        name: 'ui-pick-server',
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
                description: 'Show a selection dialog to the user and wait for their choice. Returns the selected option.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        options: {
                            type: 'array',
                            description: 'Array of options. Each option can be a string or an object with label, value, description, and emoji properties.',
                            items: {
                                oneOf: [
                                    { type: 'string' },
                                    {
                                        type: 'object',
                                        properties: {
                                            label: { type: 'string' },
                                            value: { type: 'string' },
                                            description: { type: 'string' },
                                            emoji: { type: 'string' }
                                        },
                                        required: ['label']
                                    }
                                ]
                            }
                        },
                        theme: {
                            type: 'string',
                            description: 'Theme to use: "wlilo" (dark) or "bright" (light)',
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

    // Normalize options
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'string') return { label: opt, value: opt };
        return opt;
    });

    try {
        const result = await sendPrompt(normalizedOptions, theme);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`
                }
            ],
            isError: true
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('UI Pick MCP Server running on stdio');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
