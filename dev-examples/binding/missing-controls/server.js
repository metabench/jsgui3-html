const { Server } = require('jsgui3-server');
const jsgui = require('./client');

if (require.main === module) {
    const server = new Server({
        Ctrl: jsgui.controls.Missing_Controls_Demo,
        src_path_client_js: require.resolve('./client.js'),
        debug: true
    });

    server.on('ready', () => {
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 52004;
        server.start(port, err => {
            if (err) {
                throw err;
            }
            process.stdout.write(`Missing controls demo running at http://localhost:${port}\n`);
        });
    });
}

module.exports = { server: Server };
