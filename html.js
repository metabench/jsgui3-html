/**
 * jsgui3-html — main entry point.
 *
 * Re-exports the full framework surface: core engine (`html-core`),
 * all registered controls, mixins, router, resource system, and
 * the `jsgui3-gfx-core` graphics bridge.
 *
 * @module jsgui3-html
 *
 * @example
 * const jsgui = require('jsgui3-html');
 * const { Page_Context, Control, Button, Panel } = jsgui;
 *
 * const ctx  = new Page_Context();
 * const btn  = new Button({ context: ctx, text: 'Hello' });
 * console.log(btn.html);  // server-rendered HTML string
 */
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
    const compiler_name = name;
    const compiler_fn = jsfn;
    const compiler_options = options || {};

    if (typeof compiler_name !== 'string' || compiler_name.length === 0) {
        throw new Error('Resource.load_compiler(name, fn, options) requires a non-empty string name');
    }
    if (typeof compiler_fn !== 'function') {
        throw new Error('Resource.load_compiler(name, fn, options) requires a function compiler implementation');
    }

    const compiler_resource = new jsgui.Resource.Compiler({ name: compiler_name });
    compiler_resource.transform = (input, transform_options = {}) => {
        const merged_options = Object.assign({}, compiler_options, transform_options);
        return compiler_fn(input, merged_options);
    };

    jsgui.Resource.compilers = jsgui.Resource.compilers || {};
    jsgui.Resource.compilers[compiler_name] = compiler_resource;

    const pool = compiler_options.pool || compiler_options.resource_pool;
    if (pool && typeof pool.add === 'function') {
        pool.add(compiler_resource);
    }

    return compiler_resource;
}
jsgui.controls = jsgui.controls || {};
//jsgui.controls.Active_HTML_Document = jsgui.Active_HTML_Document = require('./controls/organised/1-standard/5-ui/Active_HTML_Document');
Object.assign(jsgui.controls, require('./controls/controls'));
Object.assign(jsgui, jsgui.controls);
if (jsgui.parse_mount) jsgui.parse_mount.default_control_set = jsgui.controls;
jsgui.mixins = jsgui.mx = require('./control_mixins/mx');
module.exports = jsgui;
