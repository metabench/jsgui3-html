// Quick verification of all fixed controls
const jsgui = require('../html-core/html-core');
const all_controls = require('../controls/controls');
const palettes = require('../html-core/palettes');

const checks = [];
function ok(label, pass) { checks.push({ label, pass: !!pass }); }

function safe_render(name, spec) {
    try {
        const ctx = new jsgui.Page_Context();
        // Add mock req for controls that need it
        if (name === 'Login' || name === 'File_Upload') {
            ctx.req = { headers: { host: 'localhost:4444' }, url: '/', method: 'GET' };
        }
        const C = all_controls[name];
        if (!C) return { error: 'Not found' };
        const ctrl = new C({ ...spec, context: ctx });
        const html = ctrl.html || '';
        return { html, error: null };
    } catch (e) {
        return { html: '', error: e.message };
    }
}

// 1. File_Upload
{
    const r = safe_render('File_Upload', {});
    ok('File_Upload renders', !r.error && r.html.length > 0);
    ok('File_Upload has input[type=file]', r.html.includes('type="file"'));
    if (r.error) console.log('  File_Upload error:', r.error);
}

// 2. Radio_Button (with no text — should NOT show "undefined")
{
    const r = safe_render('Radio_Button', { group_name: 'test' });
    ok('Radio_Button renders', !r.error && r.html.length > 0);
    ok('Radio_Button no "undefined"', !r.html.includes('>undefined<'));
    if (r.error) console.log('  Radio_Button error:', r.error);
}

// 3. Radio_Button (with text)
{
    const r = safe_render('Radio_Button', { text: 'Choose me', group_name: 'test2' });
    ok('Radio_Button with text renders', !r.error);
    ok('Radio_Button shows text', r.html.includes('Choose me'));
}

// 4. Radio_Button_Tab (with text)
{
    const r = safe_render('Radio_Button_Tab', { text: 'Tab One', group_name: 'tabs' });
    ok('Radio_Button_Tab renders', !r.error && r.html.length > 0);
    ok('Radio_Button_Tab shows text', r.html.includes('Tab One'));
    ok('Radio_Button_Tab no "undefined"', !r.html.includes('>undefined<'));
    if (r.error) console.log('  Radio_Button_Tab error:', r.error);
}

// 5. Radio_Button_Tab (no text — should be empty, not "undefined")
{
    const r = safe_render('Radio_Button_Tab', { group_name: 'tabs2' });
    ok('Radio_Button_Tab (no text) renders', !r.error);
    ok('Radio_Button_Tab (no text) no "undefined"', !r.html.includes('>undefined<'));
}

// 6. Line_Chart
{
    const r = safe_render('Line_Chart', {
        size: [400, 300],
        range: [[0, 0], [100, 100]],
        x_major_notch_spacing: 25,
        y_major_notch_spacing: 25,
        x_minor_notch_spacing: 5,
        y_minor_notch_spacing: 5
    });
    ok('Line_Chart renders', !r.error && r.html.length > 0);
    ok('Line_Chart has SVG', r.html.includes('<svg'));
    ok('Line_Chart has lines', r.html.includes('<line'));
    if (r.error) console.log('  Line_Chart error:', r.error);
}

// 7. Popup_Menu_Button
{
    const r = safe_render('Popup_Menu_Button', {
        text: 'Actions',
        items: ['Edit', 'Delete', 'Copy']
    });
    ok('Popup_Menu_Button renders', !r.error && r.html.length > 0);
    ok('Popup_Menu_Button has text', r.html.includes('Actions'));
    ok('Popup_Menu_Button has items', r.html.includes('Edit') && r.html.includes('Delete'));
    if (r.error) console.log('  Popup_Menu_Button error:', r.error);
}

// 8. Indicator
{
    const r = safe_render('Indicator', { status: 'success', label: 'Online' });
    ok('Indicator renders', !r.error && r.html.length > 0);
    ok('Indicator has dot', r.html.includes('indicator-dot'));
    ok('Indicator has label', r.html.includes('Online'));
    ok('Indicator has color', r.html.includes('#22c55e'));
    if (r.error) console.log('  Indicator error:', r.error);
}

// Print results
console.log('\n━━━ FIX VERIFICATION ━━━\n');
checks.forEach(c => console.log((c.pass ? '  ✓' : '  ✗') + ' ' + c.label));
const passed = checks.filter(c => c.pass).length;
const failed = checks.filter(c => !c.pass).length;
console.log(`\n  ${passed} passed, ${failed} failed`);
console.log(failed === 0 ? '\n=== ALL PASS ✓ ===' : '\n=== SOME FAILED ✗ ===');
process.exit(failed > 0 ? 1 : 0);
