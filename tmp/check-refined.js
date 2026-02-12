// tmp/check-refined.js — Verification for refined components
const jsgui = require('../html-core/html-core');
const Accordion = require('../controls/organised/1-standard/6-layout/accordion');
const Rating_Stars = require('../controls/organised/0-core/0-basic/1-compositional/rating-stars');
const Color_Picker = require('../controls/organised/0-core/0-basic/1-compositional/color-picker');
const Rich_Text_Editor = require('../controls/organised/1-standard/1-editor/Rich_Text_Editor');

const ctx = new jsgui.Page_Context();
const checks = [];
function ok(label, val) { checks.push({ label, pass: !!val }); }

try {
    // === Accordion ===
    const acc = new Accordion({
        context: ctx,
        sections: [
            { title: 'Section 1', content: 'Content 1' },
            { title: 'Section 2', content: 'Content 2' }
        ]
    });
    ok('accordion: jsgui-accordion class', acc.html.includes('jsgui-accordion'));
    ok('accordion: structure', acc.html.includes('accordion-section'));

    // === Rating ===
    const rating = new Rating_Stars({ context: ctx, value: 3, max: 5 });
    ok('rating: jsgui-rating class', rating.html.includes('jsgui-rating'));
    ok('rating: stars rendered', rating.html.includes('star'));

    // === Color Picker ===
    const cp = new Color_Picker({ context: ctx, value: '#ff0000' });
    ok('color-picker: class', cp.html.includes('color-picker'));
    ok('color-picker: hex input', cp.html.includes('cp-hex-input'));
    ok('color-picker: wheel', cp.html.includes('cp-wheel-canvas'));

    // === RTE ===
    const rte = new Rich_Text_Editor({ context: ctx, initial_html: '<p>Hello</p>' });
    ok('rte: class', rte.html.includes('rich-text-editor'));
    ok('rte: jsgui-rte', rte.html.includes('jsgui-rte'));
    ok('rte: toolbar', rte.html.includes('rte-toolbar'));
    ok('rte: editor container', rte.html.includes('rte-editor-container'));
} catch (e) {
    console.error(e);
    ok('EXCEPTION', false);
}

// Report
checks.forEach(c => console.log((c.pass ? '  ✓' : '  ✗') + ' ' + c.label));
const all = checks.every(c => c.pass);
console.log(all ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(all ? 0 : 1);
