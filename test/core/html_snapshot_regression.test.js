const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');
const { htmlSnapshot } = require('../helpers/snapshot');
const Rating_Stars = require('../../controls/organised/0-core/0-basic/1-compositional/rating-stars');
const Chart_Base = require('../../controls/charts/Chart_Base');
const DateTime_Picker = require('../../controls/organised/0-core/0-basic/1-compositional/datetime-picker');

describe('HTML Snapshot Regression Tests - Core Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('DateTime_Picker should match its HTML output snapshot', () => {
        const dt_picker = new DateTime_Picker({
            context,
            value: '2025-01-01T12:00:00',
            layout: 'tabbed'
        });

        // Use htmlSnapshot matching. This freezes the exact structure.
        htmlSnapshot('datetime_picker_tabbed', dt_picker.html);
    });

    it('Color_Picker_Tabbed should match its HTML output snapshot', () => {
        const color_picker = new controls.Color_Picker_Tabbed({
            context,
            value: '#3b82f6',
            variant: 'standard'
        });

        htmlSnapshot('color_picker_tabbed_standard', color_picker.html);
    });

    it('Rating_Stars should match its HTML output snapshot', () => {
        const rating_stars = new Rating_Stars({
            context,
            value: 3,
            max: 5,
            half: true
        });

        htmlSnapshot('rating_stars_half_filled', rating_stars.html);
    });

    it('Chart_Base (subclassed) should match its SVG generation snapshot', () => {
        // Create an anonymous subclass since Chart_Base is meant to be extended
        class Mock_Chart extends Chart_Base {
            render_chart() {
                super.render_chart(); // Renders grids
                const rect = this.svg_element('rect', { width: 100, height: 50, fill: 'red' });
                this._svg.add(rect);
            }
        }

        const chart = new Mock_Chart({
            context,
            data: { labels: ['A'], series: [{ name: 'S1', values: [10] }] }
        });

        htmlSnapshot('chart_base_svg_mock', chart.html);
    });
});
