/**
 * Simple Counter Example - Server Side
 * 
 * This server script:
 * 1. Renders the counter UI on the server
 * 2. Bundles the client-side JavaScript
 * 3. Serves the HTML with embedded initial state
 * 4. Client JavaScript "hydrates" the page with interactivity
 */

const { Server } = require('jsgui3-server');
const jsgui = require('./client');

// Only run when executed directly (not when required as a module)
if (require.main === module) {
    const { Demo_UI } = jsgui.controls;
    
    // Create the server
    const server = new Server({
        Ctrl: Demo_UI,                              // Main UI control to render
        src_path_client_js: require.resolve('./client.js'),  // Client entry point
        debug: true                                 // Include source maps for debugging
    });
    
    console.log('Preparing server...');
    console.log('Building client bundle...');
    
    // Wait for server to be ready (builds client bundle)
    server.on('ready', () => {
        console.log('✓ Server ready');
        console.log('✓ Client bundle built');
        
        // Start the HTTP server (use PORT env var or default to 52000)
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 52000;
        server.start(port, (err) => {
            if (err) {
                console.error('Failed to start server:', err);
                throw err;
            }
            
            console.log('');
            console.log('================================================');
            console.log('🚀 Counter Example Server Started');
            console.log('================================================');
            console.log('');
            console.log('Open your browser to:');
            console.log(`  http://localhost:${port}`);
            console.log('');
            console.log('What happens:');
            console.log('  1. Server renders the counter HTML');
            console.log('  2. Browser loads HTML with initial state');
            console.log('  3. Client JavaScript hydrates the page');
            console.log('  4. Buttons become interactive');
            console.log('  5. Data binding keeps display synchronized');
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('================================================');
            console.log('');
        });
    });
}

module.exports = { server: Server };
