const { Server } = require('jsgui3-server');
const jsgui = require('./client');

if (require.main === module) {
    const server = new Server({
        Ctrl: jsgui.controls.Form_Editor_Features_Demo,
        src_path_client_js: require.resolve('./client.js'),
        debug: true
    });

    server.on('ready', () => {
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 52007;
        server.start(port, err => {
            if (err) {
                throw err;
            }
            process.stdout.write(`Form/editor demo running at http://localhost:${port}\n`);
        });
    });
}

module.exports = { server: Server };
