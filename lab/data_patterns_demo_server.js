/**
 * Data Patterns Demo Server
 * 
 * Uses jsgui3-server for proper SSR + client-side activation.
 * 
 * Run: node lab/data_patterns_demo_server.js
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./data_patterns_demo_client');
const { Data_Patterns_Demo } = jsgui.controls;

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3610;

if (require.main === module) {
    const server = new Server({
        Ctrl: Data_Patterns_Demo,
        src_path_client_js: require.resolve('./data_patterns_demo_client.js'),
        debug: true
    });

    console.log('Building client bundle...');
    server.on('ready', () => {
        console.log('✓ Server ready, bundle built');
        server.start(PORT, (err) => {
            if (err) throw err;
            console.log('');
            console.log('════════════════════════════════════════════════');
            console.log(`  Data Patterns Demo running on http://localhost:${PORT}`);
            console.log('  Using jsgui3-server with framework activation');
            console.log('════════════════════════════════════════════════');
            console.log('');
        });
    });
}

module.exports = { Server };
