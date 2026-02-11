/**
 * Date Controls E2E Client
 * 
 * Active_HTML_Document with multiple Month_View configurations for E2E testing.
 * Uses jsgui3-server pattern for proper SSR + client-side activation.
 */

const jsgui = require('jsgui3-client');
const { Control, Data_Object } = jsgui;
const Active_HTML_Document = jsgui.controls.Active_HTML_Document || jsgui.Active_HTML_Document;

// Controls are resolved relative to the repo root via jsgui3-server bundler
const Month_View = require('../controls/organised/0-core/0-basic/1-compositional/month-view');
const Date_Picker = require('../controls/organised/0-core/0-basic/_complex_date-picker');
const Grid = require('../controls/organised/0-core/0-basic/1-compositional/grid');

// Register custom controls with jsgui.controls so the standard
// update_standard_Controls() mechanism auto-registers them with
// context.map_Controls during client-side activation.
const controls = jsgui.controls || {};
controls.month_view = Month_View;
controls.grid = Grid;
controls.date_picker = Date_Picker;

class Date_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_controls_demo';
        super(spec);
        this.__type_name = 'date_controls_demo';
        this.add_class('date-controls-demo');

        if (!spec.el) {
            this._compose();
        }
    }

    _compose() {
        const { context } = this;
        const body = this.body || this;

        // ── Inject CSS ──
        const style = new Control({ context, tag_name: 'style' });
        style.add(`
            * { box-sizing: border-box; }
            body {
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                max-width: 900px;
                margin: 0 auto;
                padding: 24px;
                background: #f8fafc;
                color: #1e293b;
            }
            .demo-title { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #1e293b; }
            .demo-section { margin-bottom: 32px; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
            .demo-section h2 { font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #334155; }
            .demo-section p { font-size: 13px; color: #64748b; margin: 0 0 16px 0; }
            .status-bar { font-size: 12px; color: #2563eb; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin-top: 12px; font-family: monospace; }
            .date-picker { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #fff; }
            .left-right.arrows-selector { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 4px 0; }
            .left-right.arrows-selector .item-selector { display: flex; align-items: center; justify-content: center; }
            .button.arrow { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: background 0.15s; }
            .button.arrow:hover { background: #e2e8f0; }
            .button.arrow svg { width: 16px; height: 16px; fill: #334155; stroke: #334155; }
        `);
        if (this.head) {
            this.head.add(style);
        } else {
            body.add(style);
        }

        // Inject component CSS
        const comp_css = new Control({ context, tag_name: 'style' });
        let css_text = '';
        if (Grid.css) css_text += Grid.css;
        if (Month_View.css) css_text += Month_View.css;
        if (Date_Picker.css) css_text += Date_Picker.css;
        comp_css.add(css_text);
        if (this.head) {
            this.head.add(comp_css);
        } else {
            body.add(comp_css);
        }

        // ── Container ──
        const container = new Control({ context, 'class': 'demo-container' });
        container.dom.tagName = 'div';

        // Title
        const title = new Control({ context, 'class': 'demo-title' });
        title.dom.tagName = 'div';
        title.add('jsgui3 Date Controls — E2E Test Harness');
        container.add(title);

        // Use a fixed date for deterministic testing
        const test_year = 2026;
        const test_month = 1; // February (0-indexed for JS Date: 0=Jan, 1=Feb, ...)

        // ── Section 1: Single Select ──
        const s1 = this._make_section(context, container,
            'section-single', 'Section 1: Single Select',
            'Click a day to select. Only one day can be selected at a time.');
        try {
            const mv1 = new Month_View({ context, size: [360, 220], month: test_month, year: test_year });
            mv1.dom.attrs['id'] = 'mv-single';
            s1.add(mv1);
        } catch (e) {
            this._add_error(context, s1, e);
        }

        // ── Section 2: Range Select ──
        const s2 = this._make_section(context, container,
            'section-range', 'Section 2: Range Select',
            'Click once for start, click again for end. Drag also works.');
        const range_status = new Control({ context, tag_name: 'div' });
        range_status.dom.attrs['id'] = 'range-status';
        range_status.add_class('status-bar');
        range_status.add('Range: (none)');
        s2.add(range_status);
        try {
            const mv2 = new Month_View({ context, size: [360, 220], selection_mode: 'range', month: test_month, year: test_year });
            mv2.dom.attrs['id'] = 'mv-range';
            s2.add(mv2);
        } catch (e) {
            this._add_error(context, s2, e);
        }

        // ── Section 3: Multi Select ──
        const s3 = this._make_section(context, container,
            'section-multi', 'Section 3: Multi Select',
            'Ctrl+click to toggle, Shift+click for range, plain click for single.');
        const multi_status = new Control({ context, tag_name: 'div' });
        multi_status.dom.attrs['id'] = 'multi-status';
        multi_status.add_class('status-bar');
        multi_status.add('Selected: (none)');
        s3.add(multi_status);
        try {
            const mv3 = new Month_View({ context, size: [360, 220], selection_mode: 'multi', month: test_month, year: test_year });
            mv3.dom.attrs['id'] = 'mv-multi';
            s3.add(mv3);
        } catch (e) {
            this._add_error(context, s3, e);
        }

        // ── Section 4: Date Picker (Year/Month Nav) ──
        const s4 = this._make_section(context, container,
            'section-datepicker', 'Section 4: Date Picker',
            'Year and month navigation with arrow buttons and Today button.');
        try {
            const dp = new Date_Picker({ context, size: [360, 280] });
            dp.dom.attrs['id'] = 'date-picker';
            s4.add(dp);
        } catch (e) {
            this._add_error(context, s4, e);
        }

        // ── Section 5: Week Numbers ──
        const s5 = this._make_section(context, container,
            'section-weeknums', 'Section 5: Week Numbers',
            'ISO week numbers in left gutter column.');
        try {
            const mv5 = new Month_View({ context, size: [400, 220], show_week_numbers: true, month: test_month, year: test_year });
            mv5.dom.attrs['id'] = 'mv-weeknums';
            s5.add(mv5);
        } catch (e) {
            this._add_error(context, s5, e);
        }

        // ── Section 6: Sunday First ──
        const s6 = this._make_section(context, container,
            'section-sundayfirst', 'Section 6: Sunday First',
            'first_day_of_week: 6 puts Sunday as the first column.');
        try {
            const mv6 = new Month_View({ context, size: [360, 220], first_day_of_week: 6, month: test_month, year: test_year });
            mv6.dom.attrs['id'] = 'mv-sundayfirst';
            s6.add(mv6);
        } catch (e) {
            this._add_error(context, s6, e);
        }

        // ── Section 7: Min/Max Bounds ──
        const display_month = test_month + 1; // 1-indexed for ISO strings: 2 = February
        const min_d = `${test_year}-${String(display_month).padStart(2, '0')}-05`;
        const max_d = `${test_year}-${String(display_month).padStart(2, '0')}-20`;
        const s7 = this._make_section(context, container,
            'section-bounds', 'Section 7: Min/Max Bounds',
            `Only dates ${min_d} to ${max_d} selectable. Others disabled.`);
        try {
            const mv7 = new Month_View({
                context, size: [360, 220], selection_mode: 'range',
                min_date: min_d, max_date: max_d,
                month: test_month, year: test_year
            });
            mv7.dom.attrs['id'] = 'mv-bounds';
            s7.add(mv7);
        } catch (e) {
            this._add_error(context, s7, e);
        }

        body.add(container);
    }

    _make_section(context, container, cls, title_text, desc_text) {
        const section = new Control({ context, tag_name: 'section' });
        section.add_class('demo-section ' + cls);
        const h2 = new Control({ context, tag_name: 'h2' });
        h2.add(title_text);
        section.add(h2);
        const p = new Control({ context, tag_name: 'p' });
        p.add(desc_text);
        section.add(p);
        container.add(section);
        return section;
    }

    _add_error(context, parent, err) {
        const pre = new Control({ context, tag_name: 'pre' });
        pre.add('Error: ' + err.message);
        parent.add(pre);
    }

    activate() {
        super.activate();
        console.log('Date_Controls_Demo activating...');

        // Expose Month_View instances for E2E testing
        const month_views = document.querySelectorAll('.month-view');
        window.__month_views = month_views;
        window.__mv_count = month_views.length;

        // Track events for testing
        window.__last_select_event = null;
        window.__range_events = [];
        window.__multi_events = [];

        // Listen to range-change on mv-range
        const mv_range_el = document.getElementById('mv-range');
        if (mv_range_el) {
            // The jsgui event system works through the control, not DOM
            // We'll poll from the E2E tests instead
        }

        console.log('✅ Date_Controls_Demo activated');
        console.log('  Month_View instances found:', month_views.length);
    }
}

// Register for framework hydration
jsgui.controls = jsgui.controls || {};
jsgui.controls.Date_Controls_Demo = Date_Controls_Demo;

module.exports = jsgui;
