const jsgui = require('../../html-core/html-core');
const context = new jsgui.Page_Context();
const div = new jsgui.div({ context });
jsgui.tpl`<ul class="pagination-list" data-jsgui-ctrl="list"></ul>`.mount(div);
console.log('div content length:', div.content && div.content._arr ? div.content._arr.length : 0);
div._wire_jsgui_ctrls();
console.log('div.list:', div.list ? 'exists' : 'undefined');
