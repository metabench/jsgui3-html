const jsgui = require('./html-core/html-core');
jsgui.Router = require('./router/router');
jsgui.Resource = require('./resource/resource');
jsgui.Resource_Pool = require('./resource/pool');
jsgui.Resource.Data_KV = require('./resource/data-kv-resource');
jsgui.Resource.Data_Transform = require('./resource/data-transform-resource');
jsgui.Resource.Compilation = require('./resource/compilation-resource');
jsgui.Resource.Compiler = require('./resource/compiler-resource');
jsgui.gfx = require('jsgui3-gfx-core');
jsgui.Resource.load_compiler = (name, jsfn, options) => {
    throw 'NYI';
}
jsgui.controls = jsgui.controls || {};
Object.assign(jsgui.controls, require('./controls/controls'));
Object.assign(jsgui, jsgui.controls);
jsgui.mixins = jsgui.mx = require('./control_mixins/mx');
module.exports = jsgui;