/**
 * Rich Text Editor Demo Server
 */

const net = require('node:net');
const { Server } = require('jsgui3-server');
const { Demo_UI } = require('./client');

const HOST = '127.0.0.1';
const DEFAULT_PORT = parseInt(process.env.PORT || '52010', 10);
const MAX_PORT_PROBES = 10;
const EXPIRY_MS = parseInt(process.env.EXPIRY_MS || '0', 10);

// Create server instance
const server = new Server({
    Ctrl: Demo_UI,
    src_path_client_js: require.resolve('./client.js'),
    debug: true
});
server.allowed_addresses = [HOST];

let has_started_http = false;
let shutting_down = false;
let expiry_timer = null;

process.on('unhandledRejection', (reason) => graceful_exit('Unhandled promise rejection', reason));
process.on('uncaughtException', (err) => graceful_exit('Uncaught exception', err));
process.once('SIGINT', () => graceful_exit('Received SIGINT', null, 0));
process.once('SIGTERM', () => graceful_exit('Received SIGTERM', null, 0));

const router = server.router;
if (router && typeof router.on === 'function') {
    router.on('error', (err) => {
        graceful_exit('Router error', err);
    });
}

console.log('Preparing Rich Text Editor demo...');
console.log('Building client bundle...');

server.on('ready', async () => {
    if (has_started_http) {
        return;
    }
    has_started_http = true;

    console.log('✓ Server ready');
    console.log('✓ Client bundle built');

    try {
        const port = await find_available_port(DEFAULT_PORT, HOST, MAX_PORT_PROBES);
        if (port !== DEFAULT_PORT) {
            console.warn(`Port ${DEFAULT_PORT} is busy. Using ${port} instead.`);
        }
        await start_http_server(port);
        print_instructions(port);
        schedule_expiry();
    } catch (err) {
        graceful_exit('Unable to launch HTTP server', err);
    }
});

async function start_http_server(port) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const settle = (err) => {
            if (!settled) {
                settled = true;
                err ? reject(err) : resolve();
            }
        };
        try {
            server.start(port, (err) => {
                if (err) {
                    settle(err);
                } else {
                    settle();
                }
            });
        } catch (err) {
            settle(err);
        }
    });
}

async function find_available_port(preferred, host, max_attempts) {
    let port = preferred;
    for (let attempt = 0; attempt < max_attempts; attempt++, port++) {
        const open = await can_listen(port, host);
        if (open) {
            return port;
        }
    }
    throw new Error(`No available port found starting from ${preferred}`);
}

function can_listen(port, host) {
    return new Promise((resolve, reject) => {
        const tester = net.createServer();
        const clean = () => {
            tester.removeAllListeners('error');
            tester.removeAllListeners('listening');
        };
        tester.once('error', (err) => {
            clean();
            if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
                resolve(false);
            } else {
                reject(err);
            }
        });
        tester.once('listening', () => {
            clean();
            tester.close(() => resolve(true));
        });
        try {
            tester.listen(port, host);
        } catch (err) {
            clean();
            reject(err);
        }
    });
}

function print_instructions(port) {
    console.log('');
    console.log('================================================');
    console.log('📝 Rich Text Editor Demo Started');
    console.log('================================================');
    console.log('');
    console.log('Open your browser to:');
    console.log(`  http://${HOST}:${port}`);
    console.log('');
    console.log('Features:');
    console.log('  • Bold, Italic, Underline formatting');
    console.log('  • Ordered and unordered lists');
    console.log('  • Hyperlink insertion');
    console.log('  • Clear formatting');
    console.log('  • Clean paste (strips formatting)');
    console.log('  • Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)');
    console.log('  • HTML output with sanitization');
    console.log('  • Character/word count');
    console.log('  • Read-only mode toggle');
    console.log('');
    console.log('Try it out:');
    console.log('  1. Type some text in the editor');
    console.log('  2. Select text and click formatting buttons');
    console.log('  3. Watch the HTML output update live');
    console.log('  4. Click "Get HTML" to see full markup');
    console.log('  5. Toggle read-only to disable editing');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('================================================');
    console.log('');
}

function schedule_expiry() {
    if (EXPIRY_MS > 0 && !expiry_timer) {
        expiry_timer = setTimeout(() => {
            graceful_exit(`Expiry reached after ${EXPIRY_MS}ms`, null, 0);
        }, EXPIRY_MS);
        if (typeof expiry_timer.unref === 'function') {
            expiry_timer.unref();
        }
    }
}

function graceful_exit(message, err, exit_code = 1) {
    if (shutting_down) {
        return;
    }
    shutting_down = true;

    if (message) {
        if (exit_code === 0) {
            console.log(message);
        } else {
            console.error(message);
        }
    }
    if (err) {
        if (err instanceof Error) {
            console.error(err.stack || err.message);
        } else {
            console.error(err);
        }
    }

    if (expiry_timer) {
        clearTimeout(expiry_timer);
        expiry_timer = null;
    }

    const finalize = () => {
        process.exit(exit_code);
    };

    try {
        if (typeof server.close === 'function') {
            server.close(finalize);
            const timeout = setTimeout(finalize, 1000);
            if (timeout && typeof timeout.unref === 'function') {
                timeout.unref();
            }
        } else {
            finalize();
        }
    } catch (close_err) {
        console.error('Error while closing server:', close_err);
        finalize();
    }
}
