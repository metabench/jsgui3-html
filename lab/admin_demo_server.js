/**
 * Admin Controls Demo Server
 * 
 * Uses jsgui3-server for SSR + client-side activation.
 * 
 * Run: node lab/admin_demo_server.js
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./admin_demo_client');
const { Admin_Demo } = jsgui.controls;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3620;

if (require.main === module) {
    const server = new Server({
        Ctrl: Admin_Demo,
        src_path_client_js: require.resolve('./admin_demo_client.js'),
        debug: true
    });

    console.log('Building client bundle...');
    server.on('ready', () => {
        console.log('✓ Server ready, bundle built');
        server.start(PORT, (err) => {
            if (err) throw err;
            console.log('');
            console.log('════════════════════════════════════════════════');
            console.log(`  Admin Controls Demo at http://localhost:${PORT}`);
            console.log('  9 upgraded controls with data binding');
            console.log('════════════════════════════════════════════════');
            console.log('');
        });
    });
}

module.exports = { Server };
