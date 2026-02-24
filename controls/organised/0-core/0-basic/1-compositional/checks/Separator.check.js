/**
 * Separator.check.js — Extensive validation for Separator control.
 *
 * Tests cover:
 *   1.  Default construction and HTML structure
 *   2.  Horizontal orientation (default)
 *   3.  Vertical orientation
 *   4.  Decorative mode (default) — aria-hidden
 *   5.  Non-decorative mode — role=separator + aria-orientation
 *   6.  Inset mode — data-inset attribute
 *   7.  Variant: subtle (default)
 *   8.  Variant: solid
 *   9.  Variant: dashed
 *   10. Variant: inset
 *   11. set_variant method — valid values
 *   12. set_variant method — invalid value fallback
 *   13. set_orientation method — horizontal to vertical
 *   14. set_orientation method — updates aria-orientation when non-decorative
 *   15. set_orientation method — does NOT update aria-orientation when decorative
 *   16. Constructor with no spec (empty object)
 *   17. CSS static property exists and contains expected selectors
 *   18. Internal line child element exists
 *   19. All variants produce valid HTML
 *   20. Combination: vertical + dashed + inset
 */

const Separator = require('../separator');
const jsgui = require('../../../../../../html-core/html-core');
const Page_Context = jsgui.Page_Context;

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) {
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${name}`);
        failed++;
    }
}

function section(title) {
    console.log(`\n── ${title} ──`);
}

const context = new Page_Context();

// ═══════════════════════════════════════════════════════════
section('1. Default construction');
// ═══════════════════════════════════════════════════════════

const sep1 = new Separator({ context });
const html1 = sep1.all_html_render();

assert(html1.includes('jsgui-separator'), '1a: root has jsgui-separator class');
assert(html1.includes('separator-line'), '1b: contains separator-line child');
assert(html1.includes('data-orientation="horizontal"'), '1c: defaults to horizontal');
assert(html1.includes('data-variant="subtle"'), '1d: defaults to subtle variant');
assert(html1.includes('aria-hidden="true"'), '1e: decorative by default (aria-hidden)');
assert(!html1.includes('role="separator"'), '1f: no role when decorative');
assert(sep1.orientation === 'horizontal', '1g: .orientation property is horizontal');
assert(sep1.variant === 'subtle', '1h: .variant property is subtle');
assert(sep1.decorative === true, '1i: .decorative property is true');
assert(sep1.inset === false, '1j: .inset property is false');

// ═══════════════════════════════════════════════════════════
section('2. Vertical orientation');
// ═══════════════════════════════════════════════════════════

const sep2 = new Separator({ context, orientation: 'vertical' });
const html2 = sep2.all_html_render();

assert(html2.includes('data-orientation="vertical"'), '2a: data-orientation is vertical');
assert(sep2.orientation === 'vertical', '2b: .orientation is vertical');

// ═══════════════════════════════════════════════════════════
section('3. Non-decorative mode');
// ═══════════════════════════════════════════════════════════

const sep3 = new Separator({ context, decorative: false });
const html3 = sep3.all_html_render();

assert(html3.includes('role="separator"'), '3a: has role=separator');
assert(html3.includes('aria-orientation="horizontal"'), '3b: has aria-orientation');
assert(!html3.includes('aria-hidden'), '3c: no aria-hidden when non-decorative');
assert(sep3.decorative === false, '3d: .decorative is false');

// ═══════════════════════════════════════════════════════════
section('4. Non-decorative vertical');
// ═══════════════════════════════════════════════════════════

const sep4 = new Separator({ context, orientation: 'vertical', decorative: false });
const html4 = sep4.all_html_render();

assert(html4.includes('aria-orientation="vertical"'), '4a: aria-orientation is vertical');
assert(html4.includes('role="separator"'), '4b: role=separator present');

// ═══════════════════════════════════════════════════════════
section('5. Inset mode');
// ═══════════════════════════════════════════════════════════

const sep5 = new Separator({ context, inset: true });
const html5 = sep5.all_html_render();

assert(html5.includes('data-inset="true"'), '5a: data-inset attribute present');
assert(sep5.inset === true, '5b: .inset is true');

// ═══════════════════════════════════════════════════════════
section('6. Variant: solid');
// ═══════════════════════════════════════════════════════════

const sep6 = new Separator({ context, variant: 'solid' });
const html6 = sep6.all_html_render();

assert(html6.includes('data-variant="solid"'), '6a: data-variant is solid');
assert(sep6.variant === 'solid', '6b: .variant is solid');

// ═══════════════════════════════════════════════════════════
section('7. Variant: dashed');
// ═══════════════════════════════════════════════════════════

const sep7 = new Separator({ context, variant: 'dashed' });
const html7 = sep7.all_html_render();

assert(html7.includes('data-variant="dashed"'), '7a: data-variant is dashed');

// ═══════════════════════════════════════════════════════════
section('8. Variant: inset');
// ═══════════════════════════════════════════════════════════

const sep8 = new Separator({ context, variant: 'inset' });
const html8 = sep8.all_html_render();

assert(html8.includes('data-variant="inset"'), '8a: data-variant is inset');

// ═══════════════════════════════════════════════════════════
section('9. set_variant method');
// ═══════════════════════════════════════════════════════════

const sep9 = new Separator({ context });
sep9.set_variant('solid');
assert(sep9.variant === 'solid', '9a: set_variant to solid');
sep9.set_variant('dashed');
assert(sep9.variant === 'dashed', '9b: set_variant to dashed');
sep9.set_variant('inset');
assert(sep9.variant === 'inset', '9c: set_variant to inset');
sep9.set_variant('subtle');
assert(sep9.variant === 'subtle', '9d: set_variant to subtle');

// invalid values
sep9.set_variant('invalid');
assert(sep9.variant === 'subtle', '9e: invalid value falls back to subtle');
sep9.set_variant('');
assert(sep9.variant === 'subtle', '9f: empty string falls back to subtle');
sep9.set_variant(null);
assert(sep9.variant === 'subtle', '9g: null falls back to subtle');
sep9.set_variant(undefined);
assert(sep9.variant === 'subtle', '9h: undefined falls back to subtle');
sep9.set_variant(42);
assert(sep9.variant === 'subtle', '9i: numeric falls back to subtle');

// ═══════════════════════════════════════════════════════════
section('10. set_orientation method');
// ═══════════════════════════════════════════════════════════

const sep10 = new Separator({ context, decorative: false });
sep10.set_orientation('vertical');
assert(sep10.orientation === 'vertical', '10a: set_orientation to vertical');
assert(sep10.dom.attributes['data-orientation'] === 'vertical', '10b: data-attr updated');
assert(sep10.dom.attributes['aria-orientation'] === 'vertical', '10c: aria-attr updated (non-decorative)');

sep10.set_orientation('horizontal');
assert(sep10.orientation === 'horizontal', '10d: set_orientation back to horizontal');

// invalid values default to horizontal
sep10.set_orientation('diagonal');
assert(sep10.orientation === 'horizontal', '10e: invalid defaults to horizontal');
sep10.set_orientation('');
assert(sep10.orientation === 'horizontal', '10f: empty defaults to horizontal');

// ═══════════════════════════════════════════════════════════
section('11. Decorative separator ignores aria-orientation on set_orientation');
// ═══════════════════════════════════════════════════════════

const sep11 = new Separator({ context }); // decorative=true by default
sep11.set_orientation('vertical');
assert(sep11.dom.attributes['aria-orientation'] === undefined, '11a: no aria-orientation when decorative');

// ═══════════════════════════════════════════════════════════
section('12. Combination: vertical + dashed + inset');
// ═══════════════════════════════════════════════════════════

const sep12 = new Separator({ context, orientation: 'vertical', variant: 'dashed', inset: true });
const html12 = sep12.all_html_render();

assert(html12.includes('data-orientation="vertical"'), '12a: vertical');
assert(html12.includes('data-variant="dashed"'), '12b: dashed');
assert(html12.includes('data-inset="true"'), '12c: inset');

// ═══════════════════════════════════════════════════════════
section('13. Internal structure');
// ═══════════════════════════════════════════════════════════

const sep13 = new Separator({ context });
assert(sep13.line !== undefined, '13a: line child exists');
assert(typeof sep13.all_html_render === 'function', '13b: all_html_render is a function');

// ═══════════════════════════════════════════════════════════
section('14. CSS static property');
// ═══════════════════════════════════════════════════════════

assert(typeof Separator.css === 'string', '14a: Separator.css is a string');
assert(Separator.css.includes('.jsgui-separator'), '14b: CSS has root selector');
assert(Separator.css.includes('.separator-line'), '14c: CSS has line selector');
assert(Separator.css.includes('data-variant="subtle"'), '14d: CSS has subtle variant');
assert(Separator.css.includes('data-variant="solid"'), '14e: CSS has solid variant');
assert(Separator.css.includes('data-variant="dashed"'), '14f: CSS has dashed variant');
assert(Separator.css.includes('data-variant="inset"'), '14g: CSS has inset variant');
assert(Separator.css.includes('--j-border'), '14h: CSS uses --j-border token');
assert(!Separator.css.includes('--admin-'), '14i: CSS does NOT use deprecated --admin- tokens');

// ═══════════════════════════════════════════════════════════
section('15. No spec edge case');
// ═══════════════════════════════════════════════════════════

const sep15 = new Separator({ context });
assert(sep15.orientation === 'horizontal', '15a: empty spec defaults orientation');
assert(sep15.variant === 'subtle', '15b: empty spec defaults variant');
assert(sep15.decorative === true, '15c: empty spec defaults decorative');
assert(sep15.inset === false, '15d: empty spec defaults inset');

// ═══════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(50)}`);
console.log(`Separator: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('✓ All Separator checks passed');
else { console.error('✗ Some checks failed'); process.exit(1); }
