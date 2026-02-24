const jsgui = require('../../html-core/html-core');
console.log('Is span in jsgui.controls?', !!jsgui.controls['span']);
console.log('Is div in jsgui.controls?', !!jsgui.controls['div']);
console.log('Keys in jsgui.controls:', Object.keys(jsgui.controls).length);
