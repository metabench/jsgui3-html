const lab = require('./experiments/parse_mount_perf_lab.js');
const jsgui = require('../html-core/html-core');

lab.run({
    create_lab_context: () => new jsgui.Page_Context(),
    assert: { equal: () => { } },
    cleanup: () => { }
}).then(res => console.log('Done', res)).catch(err => console.error(err));
