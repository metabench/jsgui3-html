/**
 * Status_Bar.check.js — Extensive validation for Status_Bar control.
 *
 * Tests cover:
 *   1.  Default construction
 *   2.  Custom text / meta_text
 *   3.  Status levels: info, success, warning, error
 *   4.  Items array and center region
 *   5.  Items with labels
 *   6.  Items without labels (value only)
 *   7.  Items with state attribute
 *   8.  Dense mode
 *   9.  Custom aria-live
 *   10. set_text method (including edge cases)
 *   11. set_meta_text method
 *   12. set_status method (all levels)
 *   13. set_item method (update value, add state)
 *   14. set_item with non-existent ID (no-op)
 *   15. clear_item method
 *   16. clear_item with non-existent ID (no-op)
 *   17. Multiple items with separator rendering
 *   18. No items — no center region
 *   19. CSS static property validation
 *   20. ARIA attributes
 *   21. Combination tests
 */

const Status_Bar = require('../status_bar');
const jsgui = require('../../../../../html-core/html-core');
const Page_Context = jsgui.Page_Context;

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) { passed++; }
    else { console.error(`  ✗ FAIL: ${name}`); failed++; }
}

function section(title) { console.log(`\n── ${title} ──`); }

const context = new Page_Context();

// ═══════════════════════════════════════════════════════════
section('1. Default construction');
// ═══════════════════════════════════════════════════════════

const sb1 = new Status_Bar({ context });
const html1 = sb1.all_html_render();

assert(html1.includes('jsgui-status-bar'), '1a: has jsgui class');
assert(html1.includes('role="status"'), '1b: role=status');
assert(html1.includes('aria-live="polite"'), '1c: aria-live=polite');
assert(html1.includes('data-status="info"'), '1d: default status=info');
assert(html1.includes('status-bar-left'), '1e: has left region');
assert(html1.includes('status-bar-right'), '1f: has right region');
assert(html1.includes('Ready'), '1g: default text "Ready"');
assert(!html1.includes('status-bar-center'), '1h: no center when no items');
assert(!html1.includes('data-dense'), '1i: not dense by default');
assert(sb1.status === 'info', '1j: .status property');
assert(sb1.text === 'Ready', '1k: .text property');
assert(sb1.meta_text === '', '1l: .meta_text property');
assert(sb1.dense === false, '1m: .dense property');
assert(Array.isArray(sb1.items), '1n: .items is array');
assert(sb1.items.length === 0, '1o: .items starts empty');

// ═══════════════════════════════════════════════════════════
section('2. Custom text and meta_text');
// ═══════════════════════════════════════════════════════════

const sb2 = new Status_Bar({ context, text: 'Loading...', meta_text: 'v2.5.1' });
const html2 = sb2.all_html_render();
assert(html2.includes('Loading...'), '2a: custom text');
assert(html2.includes('v2.5.1'), '2b: custom meta_text');

// ═══════════════════════════════════════════════════════════
section('3. Status levels');
// ═══════════════════════════════════════════════════════════

['info', 'success', 'warning', 'error'].forEach(s => {
    const bar = new Status_Bar({ context, status: s });
    const h = bar.all_html_render();
    assert(h.includes(`data-status="${s}"`), `3-${s}: data-status="${s}"`);
    assert(bar.status === s, `3-${s}: .status property`);
});

// ═══════════════════════════════════════════════════════════
section('4. Items with labels');
// ═══════════════════════════════════════════════════════════

const sb4 = new Status_Bar({
    context,
    items: [
        { id: 'cpu', label: 'CPU', value: '45%' },
        { id: 'mem', label: 'Memory', value: '2.1 GB' },
        { id: 'disk', label: 'Disk', value: '60%' }
    ]
});
const html4 = sb4.all_html_render();

assert(html4.includes('status-bar-center'), '4a: center region created');
assert(html4.includes('status-bar-item'), '4b: has items');
assert(html4.includes('CPU: 45%'), '4c: label:value format');
assert(html4.includes('Memory: 2.1 GB'), '4d: second item');
assert(html4.includes('Disk: 60%'), '4e: third item');
assert(html4.includes('data-item-id="cpu"'), '4f: item ID attribute');
assert(html4.includes('data-item-id="mem"'), '4g: second item ID');
assert(html4.includes('data-item-id="disk"'), '4h: third item ID');

// ═══════════════════════════════════════════════════════════
section('5. Items without labels');
// ═══════════════════════════════════════════════════════════

const sb5 = new Status_Bar({
    context,
    items: [{ id: 'errors', value: '0 errors' }]
});
const html5 = sb5.all_html_render();
assert(html5.includes('0 errors'), '5a: value-only rendering');

// ═══════════════════════════════════════════════════════════
section('6. Items with state');
// ═══════════════════════════════════════════════════════════

const sb6 = new Status_Bar({
    context,
    items: [{ id: 'build', label: 'Build', value: 'passing', state: 'success' }]
});
const html6 = sb6.all_html_render();
assert(html6.includes('data-state="success"'), '6a: data-state attribute');

// ═══════════════════════════════════════════════════════════
section('7. Separator between items');
// ═══════════════════════════════════════════════════════════

const sb7 = new Status_Bar({
    context,
    items: [
        { id: 'a', value: 'A' },
        { id: 'b', value: 'B' }
    ]
});
const html7 = sb7.all_html_render();
assert(html7.includes('status-bar-separator'), '7a: separator between items');

// Only 1 separator for 2 items (not 2, not 0)
const sepCount = (html7.match(/status-bar-separator/g) || []).length;
assert(sepCount === 1, '7b: exactly 1 separator for 2 items');

// ═══════════════════════════════════════════════════════════
section('8. Dense mode');
// ═══════════════════════════════════════════════════════════

const sb8 = new Status_Bar({ context, dense: true });
const html8 = sb8.all_html_render();
assert(html8.includes('data-dense="true"'), '8a: data-dense attribute');
assert(sb8.dense === true, '8b: .dense property');

// ═══════════════════════════════════════════════════════════
section('9. Custom aria-live');
// ═══════════════════════════════════════════════════════════

const sb9 = new Status_Bar({ context, aria_live: 'assertive' });
const html9 = sb9.all_html_render();
assert(html9.includes('aria-live="assertive"'), '9a: custom aria-live');

// ═══════════════════════════════════════════════════════════
section('10. set_text method');
// ═══════════════════════════════════════════════════════════

const sb10 = new Status_Bar({ context });
assert(sb10.text === 'Ready', '10a: starts with Ready');
sb10.set_text('Processing...');
assert(sb10.text === 'Processing...', '10b: updated text');
sb10.set_text('');
assert(sb10.text === '', '10c: empty string accepted');
sb10.set_text(null);
assert(sb10.text === '', '10d: null becomes empty');
sb10.set_text('Done');
assert(sb10.text === 'Done', '10e: can set again');

// ═══════════════════════════════════════════════════════════
section('11. set_meta_text method');
// ═══════════════════════════════════════════════════════════

const sb11 = new Status_Bar({ context, meta_text: 'v1' });
assert(sb11.meta_text === 'v1', '11a: initial meta_text');
sb11.set_meta_text('v2');
assert(sb11.meta_text === 'v2', '11b: updated meta_text');
sb11.set_meta_text('');
assert(sb11.meta_text === '', '11c: empty string');
sb11.set_meta_text(null);
assert(sb11.meta_text === '', '11d: null becomes empty');

// ═══════════════════════════════════════════════════════════
section('12. set_status method');
// ═══════════════════════════════════════════════════════════

const sb12 = new Status_Bar({ context });
['success', 'warning', 'error', 'info'].forEach(s => {
    sb12.set_status(s);
    assert(sb12.status === s, `12-${s}: set_status('${s}')`);
    assert(sb12.dom.attributes['data-status'] === s, `12-${s}: data-attr`);
});

sb12.set_status('');
assert(sb12.status === 'info', '12-empty: empty falls back to info');
sb12.set_status(null);
assert(sb12.status === 'info', '12-null: null falls back to info');

// ═══════════════════════════════════════════════════════════
section('13. set_item method');
// ═══════════════════════════════════════════════════════════

const sb13 = new Status_Bar({
    context,
    items: [
        { id: 'x', label: 'X', value: '10' },
        { id: 'y', label: 'Y', value: '20' }
    ]
});

sb13.set_item('x', { value: '99' });
assert(sb13.items[0].value === '99', '13a: item value updated');
assert(sb13.items[0].label === 'X', '13b: label preserved');
assert(sb13.items.length === 2, '13c: item count unchanged');

// Update with state
sb13.set_item('y', { value: '0', state: 'error' });
assert(sb13.items[1].value === '0', '13d: second item updated');
assert(sb13.items[1].state === 'error', '13e: state added');

// ═══════════════════════════════════════════════════════════
section('14. set_item with non-existent ID');
// ═══════════════════════════════════════════════════════════

const sb14 = new Status_Bar({
    context,
    items: [{ id: 'a', value: '1' }]
});
sb14.set_item('non_existent', { value: '999' });
assert(sb14.items.length === 1, '14a: no item added for unknown ID');
assert(sb14.items[0].value === '1', '14b: existing item unchanged');

// ═══════════════════════════════════════════════════════════
section('15. clear_item method');
// ═══════════════════════════════════════════════════════════

const sb15 = new Status_Bar({
    context,
    items: [
        { id: 'a', value: 'A' },
        { id: 'b', value: 'B' },
        { id: 'c', value: 'C' }
    ]
});

sb15.clear_item('b');
assert(sb15.items.length === 2, '15a: item removed');
assert(sb15.items[0].id === 'a', '15b: first item intact');
assert(sb15.items[1].id === 'c', '15c: last item intact');

sb15.clear_item('a');
assert(sb15.items.length === 1, '15d: another item removed');

sb15.clear_item('c');
assert(sb15.items.length === 0, '15e: all items cleared');

// ═══════════════════════════════════════════════════════════
section('16. clear_item with non-existent ID');
// ═══════════════════════════════════════════════════════════

const sb16 = new Status_Bar({
    context,
    items: [{ id: 'z', value: 'Z' }]
});
sb16.clear_item('non_existent');
assert(sb16.items.length === 1, '16a: no item removed for unknown ID');

// ═══════════════════════════════════════════════════════════
section('17. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Status_Bar.css === 'string', '17a: .css is string');
assert(Status_Bar.css.includes('.jsgui-status-bar'), '17b: root selector');
assert(Status_Bar.css.includes('.status-bar-left'), '17c: left region CSS');
assert(Status_Bar.css.includes('.status-bar-center'), '17d: center region CSS');
assert(Status_Bar.css.includes('.status-bar-right'), '17e: right region CSS');
assert(Status_Bar.css.includes('.status-bar-item'), '17f: item CSS');
assert(Status_Bar.css.includes('data-dense="true"'), '17g: dense mode CSS');
assert(Status_Bar.css.includes('data-status="info"'), '17h: info status CSS');
assert(Status_Bar.css.includes('data-status="success"'), '17i: success status CSS');
assert(Status_Bar.css.includes('data-status="warning"'), '17j: warning status CSS');
assert(Status_Bar.css.includes('data-status="error"'), '17k: error status CSS');
assert(Status_Bar.css.includes('--j-border'), '17l: uses --j-border');
assert(Status_Bar.css.includes('--j-fg'), '17m: uses --j-fg');
assert(Status_Bar.css.includes('--j-success'), '17n: uses --j-success');
assert(Status_Bar.css.includes('--j-warning'), '17o: uses --j-warning');
assert(Status_Bar.css.includes('--j-danger'), '17p: uses --j-danger');
assert(!Status_Bar.css.includes('--admin-'), '17q: no deprecated --admin-');

// ═══════════════════════════════════════════════════════════
section('18. Internal structure');
// ═══════════════════════════════════════════════════════════

assert(sb1.left_ctrl !== undefined, '18a: left_ctrl exists');
assert(sb1.right_ctrl !== undefined, '18b: right_ctrl exists');
assert(sb4.center_ctrl !== undefined, '18c: center_ctrl exists when items present');
assert(sb1.center_ctrl === undefined, '18d: no center_ctrl without items');

// ═══════════════════════════════════════════════════════════
section('19. Combination: dense + error + custom text + items');
// ═══════════════════════════════════════════════════════════

const sb19 = new Status_Bar({
    context,
    dense: true,
    status: 'error',
    text: 'Connection failed',
    meta_text: 'Retry in 5s',
    items: [{ id: 'host', label: 'Host', value: 'db01.example.com' }]
});
const html19 = sb19.all_html_render();

assert(html19.includes('data-dense="true"'), '19a: dense');
assert(html19.includes('data-status="error"'), '19b: error status');
assert(html19.includes('Connection failed'), '19c: text');
assert(html19.includes('Retry in 5s'), '19d: meta_text');
assert(html19.includes('Host: db01.example.com'), '19e: item');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Status_Bar: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Status_Bar checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
