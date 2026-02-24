const jsgui = require('../../html-core/html-core');
const context = new jsgui.Page_Context();
const div = new jsgui.div({ context });
const res = jsgui.tpl`<span>Test</span>`.mount(div);
console.log('Returned type:', typeof res);
if (res instanceof Promise) {
    res.then(() => {
        console.log('HTML:', div.html);
    }).catch(e => {
        console.error('Promise rejected:', e.stack);
    });
} else {
    console.log('HTML:', div.html);
}
