const jsgui = require('../../html-core/html-core');
const context = new jsgui.Page_Context();
const div = new jsgui.div({ context });

console.log('Is span in map_Controls?', !!context.map_Controls['span']);
console.log('Keys in map_Controls:', Object.keys(context.map_Controls));
