/**
 * Date Controls E2E Server
 * 
 * Uses jsgui3-server for proper SSR + client-side activation.
 * 
 * Run: node lab/date_controls_e2e_server.js
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./date_controls_e2e_client');
const { Date_Controls_Demo } = jsgui.controls;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3611;
process.env.PORT = String(PORT);

if (require.main === module) {
    const server = new Server({
        Ctrl: Date_Controls_Demo,
        src_path_client_js: require.resolve('./date_controls_e2e_client.js'),
        port: PORT,
        debug: true
    });

    console.log('Building client bundle...');
    server.on('ready', () => {
        console.log('✓ Server ready, bundle built');
        server.start(PORT, (err) => {
            if (err) throw err;
            console.log('');
            console.log('════════════════════════════════════════════════');
            console.log(`  Date Controls E2E Demo on http://localhost:${PORT}`);
            console.log('  Using jsgui3-server with framework activation');
            console.log('════════════════════════════════════════════════');
            console.log('');
        });
    });
}

module.exports = { Server };
