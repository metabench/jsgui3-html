/**
 * Value Editors — Unit Tests
 * 
 * Tests the base class and each concrete editor type.
 */

require('../setup');
const { expect } = require('chai');

const Value_Editor_Base = require('../../controls/organised/1-standard/1-editor/value_editors/Value_Editor_Base');
const Text_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Text_Value_Editor');
const Number_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Number_Value_Editor');
const Boolean_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Boolean_Value_Editor');
const Enum_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Enum_Value_Editor');
const Date_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Date_Value_Editor');
const Color_Value_Editor = require('../../controls/organised/1-standard/1-editor/value_editors/Color_Value_Editor');

describe('Value_Editor_Base', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should store initial value', () => {
        const ed = new Value_Editor_Base({ context, value: 42 });
        expect(ed.get_value()).to.equal(42);
    });

    it('should default to null', () => {
        const ed = new Value_Editor_Base({ context });
        expect(ed.get_value()).to.be.null;
    });

    it('should raise value-change on set_value', () => {
        const ed = new Value_Editor_Base({ context, value: 1 });
        let raised = null;
        ed.on('value-change', e => raised = e);
        ed.set_value(2);
        expect(raised).to.not.be.null;
        expect(raised.old).to.equal(1);
        expect(raised.value).to.equal(2);
    });

    it('should NOT raise when silent', () => {
        const ed = new Value_Editor_Base({ context, value: 1 });
        let raised = false;
        ed.on('value-change', () => raised = true);
        ed.set_value(2, { silent: true });
        expect(raised).to.be.false;
    });

    it('should return valid from validate()', () => {
        const ed = new Value_Editor_Base({ context });
        expect(ed.validate().valid).to.be.true;
    });

    it('should support VARIES state', () => {
        const ed = new Value_Editor_Base({ context, value: 'hello' });
        ed.set_varies();
        expect(ed.is_varies()).to.be.true;
        expect(ed.get_display_text()).to.equal('(varies)');
        expect(ed.get_value()).to.equal(Value_Editor_Base.VARIES);
    });

    it('should clear VARIES on set_value', () => {
        const ed = new Value_Editor_Base({ context });
        ed.set_varies();
        ed.set_value('new');
        expect(ed.is_varies()).to.be.false;
        expect(ed.get_value()).to.equal('new');
    });

    it('should handle keydown with Escape → editor-cancel', () => {
        const ed = new Value_Editor_Base({ context });
        let cancel = false;
        ed.on('editor-cancel', () => cancel = true);
        const result = ed.handle_keydown({ key: 'Escape' });
        expect(result).to.be.true;
        expect(cancel).to.be.true;
    });

    it('should handle keydown with Enter → editor-commit', () => {
        const ed = new Value_Editor_Base({ context, value: 'v' });
        let commit = null;
        ed.on('editor-commit', (e) => commit = e);
        const result = ed.handle_keydown({ key: 'Enter' });
        expect(result).to.be.true;
        expect(commit.value).to.equal('v');
    });

    it('should return false for unhandled keys', () => {
        const ed = new Value_Editor_Base({ context });
        expect(ed.handle_keydown({ key: 'a' })).to.be.false;
    });

    it('should store read_only flag', () => {
        const ed = new Value_Editor_Base({ context, read_only: true });
        expect(ed._read_only).to.be.true;
    });

    it('should generate display text from value', () => {
        const ed = new Value_Editor_Base({ context, value: 'hello' });
        expect(ed.get_display_text()).to.equal('hello');
    });

    it('should return empty string when null', () => {
        const ed = new Value_Editor_Base({ context });
        expect(ed.get_display_text()).to.equal('');
    });
});

describe('Text_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render an input[type="text"]', () => {
        const ed = new Text_Value_Editor({ context, value: 'hello' });
        const html = ed.all_html_render();
        expect(html).to.include('type="text"');
        expect(html).to.include('value="hello"');
    });

    it('should have type_name "text"', () => {
        expect(Text_Value_Editor.type_name).to.equal('text');
    });

    it('should add data-role attribute', () => {
        const ed = new Text_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('data-role="value-input"');
    });

    it('should set readonly when read_only', () => {
        const ed = new Text_Value_Editor({ context, read_only: true });
        const html = ed.all_html_render();
        expect(html).to.include('readonly');
    });

    it('should add class text-value-editor', () => {
        const ed = new Text_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('text-value-editor');
    });
});

describe('Number_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render an input[type="number"]', () => {
        const ed = new Number_Value_Editor({ context, value: 42 });
        const html = ed.all_html_render();
        expect(html).to.include('type="number"');
        expect(html).to.include('value="42"');
    });

    it('should include min/max/step attributes', () => {
        const ed = new Number_Value_Editor({ context, min: 0, max: 100, step: 5 });
        const html = ed.all_html_render();
        expect(html).to.include('min="0"');
        expect(html).to.include('max="100"');
        expect(html).to.include('step="5"');
    });

    it('should validate min', () => {
        const ed = new Number_Value_Editor({ context, value: -5, min: 0 });
        const r = ed.validate();
        expect(r.valid).to.be.false;
        expect(r.message).to.include('Minimum');
    });

    it('should validate max', () => {
        const ed = new Number_Value_Editor({ context, value: 200, max: 100 });
        const r = ed.validate();
        expect(r.valid).to.be.false;
        expect(r.message).to.include('Maximum');
    });

    it('should pass validation for valid value', () => {
        const ed = new Number_Value_Editor({ context, value: 50, min: 0, max: 100 });
        expect(ed.validate().valid).to.be.true;
    });

    it('should report NaN as invalid', () => {
        const ed = new Number_Value_Editor({ context, value: null });
        expect(ed.validate().valid).to.be.false;
    });
});

describe('Boolean_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render a checkbox', () => {
        const ed = new Boolean_Value_Editor({ context, value: true });
        const html = ed.all_html_render();
        expect(html).to.include('type="checkbox"');
        expect(html).to.include('checked');
    });

    it('should render unchecked for false', () => {
        const ed = new Boolean_Value_Editor({ context, value: false });
        const html = ed.all_html_render();
        expect(html).to.include('type="checkbox"');
        expect(html).to.not.include('checked');
    });

    it('should display "Yes" / "No"', () => {
        const tru = new Boolean_Value_Editor({ context, value: true });
        expect(tru.get_display_text()).to.equal('Yes');

        const fal = new Boolean_Value_Editor({ context, value: false });
        expect(fal.get_display_text()).to.equal('No');
    });

    it('should disable when read_only', () => {
        const ed = new Boolean_Value_Editor({ context, read_only: true });
        const html = ed.all_html_render();
        expect(html).to.include('disabled');
    });
});

describe('Enum_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render a <select>', () => {
        const ed = new Enum_Value_Editor({
            context,
            options: ['alpha', 'beta', 'gamma'],
            value: 'beta'
        });
        const html = ed.all_html_render();
        expect(html).to.include('<select');
        expect(html).to.include('<option');
        expect(html).to.include('alpha');
        expect(html).to.include('beta');
        expect(html).to.include('gamma');
    });

    it('should mark selected option', () => {
        const ed = new Enum_Value_Editor({
            context,
            options: ['a', 'b'],
            value: 'b'
        });
        const html = ed.all_html_render();
        // "b" option should have selected
        expect(html).to.include('selected');
    });

    it('should support object options', () => {
        const ed = new Enum_Value_Editor({
            context,
            options: [
                { label: 'Alpha', value: 'a' },
                { label: 'Beta', value: 'b' }
            ],
            value: 'a'
        });
        const html = ed.all_html_render();
        expect(html).to.include('Alpha');
        expect(html).to.include('value="a"');
    });
});

describe('Date_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render inline summary', () => {
        const ed = new Date_Value_Editor({ context, value: '2026-03-15' });
        const html = ed.all_html_render();
        expect(html).to.include('2026-03-15');
        expect(html).to.include('ve-popup-summary');
    });

    it('should render dropdown trigger', () => {
        const ed = new Date_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('ve-popup-trigger');
        expect(html).to.include('aria-haspopup');
    });

    it('should contain a Month_View', () => {
        const ed = new Date_Value_Editor({ context });
        expect(ed._month_view).to.exist;
    });

    it('should render popup as hidden', () => {
        const ed = new Date_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('display:none');
    });

    it('should show "(no date)" when no value', () => {
        const ed = new Date_Value_Editor({ context });
        expect(ed.get_display_text()).to.equal('(no date)');
    });

    it('should show ISO date when set', () => {
        const ed = new Date_Value_Editor({ context, value: '2026-01-01' });
        expect(ed.get_display_text()).to.equal('2026-01-01');
    });

    it('should forward min_date/max_date', () => {
        const ed = new Date_Value_Editor({
            context,
            min_date: '2026-01-01',
            max_date: '2026-12-31'
        });
        expect(ed._min_date).to.equal('2026-01-01');
        expect(ed._max_date).to.equal('2026-12-31');
    });
});

describe('Color_Value_Editor', function () {
    let context;
    beforeEach(() => { context = createTestContext(); });

    it('should render a color swatch', () => {
        const ed = new Color_Value_Editor({ context, value: '#ff0000' });
        const html = ed.all_html_render();
        expect(html).to.include('ve-color-swatch');
        expect(html).to.include('background:#ff0000');
    });

    it('should render popup color grid', () => {
        const ed = new Color_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('ve-color-grid');
        expect(html).to.include('ve-color-cell');
    });

    it('should have 36 default palette colors', () => {
        expect(Color_Value_Editor.DEFAULT_PALETTE).to.have.length(36);
    });

    it('should render data-color attributes', () => {
        const ed = new Color_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('data-color="#ef4444"');
    });

    it('should render popup as hidden', () => {
        const ed = new Color_Value_Editor({ context });
        const html = ed.all_html_render();
        expect(html).to.include('display:none');
    });

    it('should show "(no color)" when no value', () => {
        const ed = new Color_Value_Editor({ context });
        expect(ed.get_display_text()).to.equal('(no color)');
    });

    it('should accept custom palette', () => {
        const palette = ['#000', '#fff'];
        const ed = new Color_Value_Editor({ context, palette });
        expect(ed._palette).to.deep.equal(palette);
    });
});
