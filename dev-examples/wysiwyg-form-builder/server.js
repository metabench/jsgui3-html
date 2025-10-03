/**
 * WYSIWYG Form Builder - Server
 * 
 * Demonstrates server-side rendering of a complex interactive application
 */

const { Server } = require('jsgui3-server');
const { Demo_UI } = require('./client');

// Create server instance
const server = new Server({
    Ctrl: Demo_UI,
    src_path_client_js: require.resolve('./client.js'),
    debug: true
});

console.log('Preparing server...');
console.log('Building client bundle...');

// Wait for server to be ready
server.on('ready', () => {
    console.log('✓ Server ready');
    console.log('✓ Client bundle built');
    
    // Start server
    server.start(52002, (err) => {
        if (err) {
            console.error('Failed to start server:', err);
            throw err;
        }
        
        console.log('');
        console.log('================================================');
        console.log('🎨 WYSIWYG Form Builder Started');
        console.log('================================================');
        console.log('');
        console.log('Open your browser to:');
        console.log('  http://localhost:52002');
        console.log('');
        console.log('Features:');
        console.log('  • Click field types to add them to your form');
        console.log('  • Click fields to edit their properties');
        console.log('  • Use ↑ ↓ buttons to reorder fields');
        console.log('  • Toggle Preview mode to see the live form');
        console.log('  • Export/Import JSON form definitions');
        console.log('  • Auto-saves to localStorage');
        console.log('');
        console.log('Try building a form:');
        console.log('  1. Click "Text Input" to add a field');
        console.log('  2. Edit its label and properties');
        console.log('  3. Add more fields (email, password, etc.)');
        console.log('  4. Click Preview to see the rendered form');
        console.log('  5. Export to save your form as JSON');
        console.log('');
        console.log('Press Ctrl+C to stop the server');
        console.log('================================================');
        console.log('');
    });
});
