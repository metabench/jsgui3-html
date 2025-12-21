const { Server } = require('jsgui3-server');
const jsgui = require('./client');

if (require.main === module) {
    const server = new Server({
        Ctrl: jsgui.controls.Layout_Controls_Demo,
        src_path_client_js: require.resolve('./client.js'),
        debug: true
    });

    server.on('ready', () => {
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 52006;
        server.start(port, err => {
            if (err) {
                throw err;
            }
            process.stdout.write(`Layout controls demo running at http://localhost:${port}\n`);
        });
    });
}

module.exports = { server: Server };
