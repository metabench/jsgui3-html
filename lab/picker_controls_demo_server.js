/**
 * Advanced Picker Controls Demo Server
 * 
 * Uses jsgui3-server for proper SSR + client-side activation.
 * 
 * Pattern:
 * 1. Client file (picker_demo_client.js) defines Picker_Demo extending Active_HTML_Document
 * 2. Client file requires jsgui3-client (includes window.onload → activate() handler)
 * 3. Server bundles client via browserify, serves at /js/js.js
 * 4. Browser loads bundle → window.onload → pre_activate() + activate() recursively
 * 
 * Run: node lab/picker_controls_demo_server.js
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./picker_demo_client');
const { Picker_Demo } = jsgui.controls;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3602;

if (require.main === module) {
    const server = new Server({
        Ctrl: Picker_Demo,
        src_path_client_js: require.resolve('./picker_demo_client.js'),
        debug: true
    });

    console.log('Building client bundle...');
    server.on('ready', () => {
        console.log('✓ Server ready, bundle built');
        server.start(PORT, (err) => {
            if (err) throw err;
            console.log('');
            console.log('════════════════════════════════════════════════');
            console.log(`  Picker Controls Demo at http://localhost:${PORT}`);
            console.log('  Using jsgui3-server with framework activation');
            console.log('════════════════════════════════════════════════');
            console.log('');
        });
    });
}

module.exports = { Server };
