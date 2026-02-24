const jsgui = require('../../html-core/html-core');
const context = new jsgui.Page_Context();
const div = new jsgui.div({ context });
div.add(jsgui.tpl`<span>Test</span>`);
console.log(div.content._arr.length);
console.log(div.html);
