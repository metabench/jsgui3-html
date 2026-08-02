'use strict';

// Demonstrates the reattachment contract: the client rebuilds every control with a
// spec of exactly { context, __type_name, id, el } (html-core/html-core.js:141-146).
// Any constructor behaviour gated on a different spec field silently does not happen
// on the client. Nothing warns.
//
// Run: node lab/experiments/002-spec-survival/check.js

const assert = require('assert');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
// Node 22+ exposes navigator as a getter with no setter; assignment throws in strict mode.
Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
    writable: true
});
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;

const jsgui = require('../../../html-core/html-core');
const { Control, Page_Context } = jsgui;

// A control in the dominant idiom: read spec unconditionally, guard only composition.
// 129 such branches exist across 57 files in controls/.
class Greeter extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'greeter';
        super(spec);

        // Recorded at construction on BOTH server and client.
        this.greeting_seen = spec.greeting;
        this.mode_seen = spec.mode;

        if (!spec.el) {
            this.add(spec.greeting || '(no greeting)');
        }
    }
}

const server_context = new Page_Context();
jsgui.controls = jsgui.controls || {};
server_context.map_Controls = server_context.map_Controls || {};
server_context.map_Controls.greeter = Greeter;

const server_ctrl = new Greeter({
    context: server_context,
    greeting: 'Hello from the server',
    mode: 'expanded'
});

const server_html = server_ctrl.all_html_render();

console.log('--- server ---');
console.log('  spec.greeting seen   :', JSON.stringify(server_ctrl.greeting_seen));
console.log('  spec.mode seen       :', JSON.stringify(server_ctrl.mode_seen));
console.log('  rendered contains it :', server_html.includes('Hello from the server'));

// Reattachment: the client builds the spec from the DOM element alone.
document.body.innerHTML = server_html;
const el = document.body.firstElementChild;

const client_context = new Page_Context({ document });
client_context.map_Controls = { greeter: Greeter };

const client_ctrl = new Greeter({
    context: client_context,
    __type_name: 'greeter',
    id: el.getAttribute('data-jsgui-id'),
    el
});

console.log('--- client (reattached) ---');
console.log('  spec.greeting seen   :', JSON.stringify(client_ctrl.greeting_seen));
console.log('  spec.mode seen       :', JSON.stringify(client_ctrl.mode_seen));
console.log('  markup still shows it:', el.textContent.includes('Hello from the server'));

console.log('');
console.log('The text survives because it is in the MARKUP.');
console.log('The spec fields do not survive, because the client never receives them.');
console.log('A control that needs them must re-read them from data-* attributes,');
console.log('as Data_Table, Date_Picker, Text_Input and Textarea do.');

assert.strictEqual(server_ctrl.greeting_seen, 'Hello from the server');
assert.strictEqual(server_ctrl.mode_seen, 'expanded');
assert.strictEqual(client_ctrl.greeting_seen, undefined, 'expected spec.greeting to be absent on reattach');
assert.strictEqual(client_ctrl.mode_seen, undefined, 'expected spec.mode to be absent on reattach');
assert.ok(el.textContent.includes('Hello from the server'), 'markup should still carry the text');

console.log('');
console.log('Spec-survival contract demonstrated.');
