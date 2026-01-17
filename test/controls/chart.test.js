/**
 * Chart Controls Tests
 * 
 * Comprehensive test suite covering:
 * - Chart_Base: Data binding, coordinate helpers
 * - Bar_Chart: Grouped/stacked modes
 * - Pie_Chart: Pie/donut modes
 */

require('../setup');
const { expect } = require('chai');

describe('Chart Controls', () => {
    let Chart_Base, Bar_Chart, Pie_Chart, context;

    before(() => {
        Chart_Base = require('../../controls/charts/Chart_Base');
        Bar_Chart = require('../../controls/charts/Bar_Chart');
        Pie_Chart = require('../../controls/charts/Pie_Chart');
    });

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    // ===== Chart_Base Tests =====
    describe('Chart_Base', () => {
        describe('Instantiation', () => {
            it('instantiates without errors', () => {
                const chart = new Chart_Base({ context, abstract: true });
                expect(chart).to.exist;
                // Check chart class was added
                const html = chart.all_html_render();
                expect(html).to.include('chart');
            });

            it('applies theme params', () => {
                const chart = new Chart_Base({ context, abstract: true });
                expect(chart._chart_params).to.exist;
            });

            it('resolves size from variant', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    variant: 'compact'
                });
                expect(chart._chart_width).to.equal(300); // small size
            });
        });

        describe('Data Binding', () => {
            it('sets data via constructor', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    data: {
                        labels: ['A', 'B', 'C'],
                        series: [{ name: 'Test', values: [1, 2, 3] }]
                    }
                });

                expect(chart._labels).to.deep.equal(['A', 'B', 'C']);
                expect(chart._series).to.have.lengthOf(1);
                expect(chart._series[0].values).to.deep.equal([1, 2, 3]);
            });

            it('normalizes simple array series', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    data: {
                        labels: ['X', 'Y'],
                        series: [[10, 20], [30, 40]]
                    }
                });

                expect(chart._series).to.have.lengthOf(2);
                expect(chart._series[0].name).to.equal('Series 1');
                expect(chart._series[1].values).to.deep.equal([30, 40]);
            });

            it('assigns colors from palette', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    data: {
                        series: [{ values: [1] }, { values: [2] }]
                    }
                });

                expect(chart._series[0].color).to.exist;
                expect(chart._series[1].color).to.exist;
                expect(chart._series[0].color).to.not.equal(chart._series[1].color);
            });
        });

        describe('Coordinate Helpers', () => {
            it('calculates value range', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    data: {
                        series: [{ values: [10, 50, 30] }]
                    }
                });

                const { min, max } = chart.get_value_range();
                expect(min).to.be.at.most(10);
                expect(max).to.be.at.least(50);
            });

            it('gets chart area with margins', () => {
                const chart = new Chart_Base({ context, abstract: true });
                const area = chart.get_chart_area();

                expect(area).to.have.property('x');
                expect(area).to.have.property('y');
                expect(area).to.have.property('width');
                expect(area).to.have.property('height');
            });
        });

        describe('Theme Variants', () => {
            it('resolves minimal variant', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    variant: 'minimal'
                });

                expect(chart._show_grid).to.equal(false);
                expect(chart._show_legend).to.equal('none');
            });

            it('resolves colorful variant', () => {
                const chart = new Chart_Base({
                    context,
                    abstract: true,
                    variant: 'colorful'
                });

                expect(chart._show_legend).to.equal('right');
            });
        });
    });

    // ===== Bar_Chart Tests =====
    describe('Bar_Chart', () => {
        describe('Instantiation', () => {
            it('instantiates without errors', () => {
                const chart = new Bar_Chart({ context, abstract: true });
                expect(chart).to.exist;
                expect(chart.__type_name).to.equal('bar_chart');
            });

            it('defaults to grouped mode', () => {
                const chart = new Bar_Chart({ context, abstract: true });
                expect(chart._mode).to.equal('grouped');
            });

            it('defaults to vertical orientation', () => {
                const chart = new Bar_Chart({ context, abstract: true });
                expect(chart._orientation).to.equal('vertical');
            });
        });

        describe('Rendering', () => {
            it('renders valid HTML', () => {
                const chart = new Bar_Chart({
                    context,
                    data: {
                        labels: ['Q1', 'Q2'],
                        series: [{ name: 'Sales', values: [100, 150] }]
                    }
                });
                const html = chart.all_html_render();

                expect(html).to.be.a('string');
                expect(html).to.include('bar-chart');
                expect(html).to.include('<svg');
            });

            it('includes chart classes', () => {
                const chart = new Bar_Chart({ context, abstract: true });
                const html = chart.all_html_render();

                expect(html).to.include('chart');
                expect(html).to.include('bar-chart');
            });
        });

        describe('Modes', () => {
            it('accepts stacked mode', () => {
                const chart = new Bar_Chart({
                    context,
                    abstract: true,
                    mode: 'stacked'
                });
                expect(chart._mode).to.equal('stacked');
            });

            it('accepts horizontal orientation', () => {
                const chart = new Bar_Chart({
                    context,
                    abstract: true,
                    orientation: 'horizontal'
                });
                expect(chart._orientation).to.equal('horizontal');
            });
        });
    });

    // ===== Pie_Chart Tests =====
    describe('Pie_Chart', () => {
        describe('Instantiation', () => {
            it('instantiates without errors', () => {
                const chart = new Pie_Chart({ context, abstract: true });
                expect(chart).to.exist;
                expect(chart.__type_name).to.equal('pie_chart');
            });

            it('defaults to pie mode', () => {
                const chart = new Pie_Chart({ context, abstract: true });
                expect(chart._mode).to.equal('pie');
                expect(chart._inner_radius).to.equal(0);
            });

            it('sets inner radius for donut mode', () => {
                const chart = new Pie_Chart({
                    context,
                    abstract: true,
                    mode: 'donut'
                });
                expect(chart._mode).to.equal('donut');
                expect(chart._inner_radius).to.equal(0.5);
            });
        });

        describe('Rendering', () => {
            it('renders valid HTML', () => {
                const chart = new Pie_Chart({
                    context,
                    data: {
                        labels: ['A', 'B', 'C'],
                        series: [{ values: [30, 40, 30] }]
                    }
                });
                const html = chart.all_html_render();

                expect(html).to.be.a('string');
                expect(html).to.include('pie-chart');
                expect(html).to.include('<svg');
            });

            it('includes donut class when in donut mode', () => {
                const chart = new Pie_Chart({
                    context,
                    mode: 'donut',
                    data: {
                        labels: ['X', 'Y'],
                        series: [{ values: [60, 40] }]
                    }
                });
                const html = chart.all_html_render();

                expect(html).to.include('donut');
            });
        });

        describe('Calculations', () => {
            it('calculates total correctly', () => {
                const chart = new Pie_Chart({
                    context,
                    abstract: true,
                    data: {
                        series: [{ values: [25, 25, 50] }]
                    }
                });

                expect(chart.get_total()).to.equal(100);
            });

            it('handles empty data', () => {
                const chart = new Pie_Chart({ context, abstract: true });
                expect(chart.get_total()).to.equal(0);
            });
        });
    });

    // ===== Backward Compatibility =====
    describe('Backward Compatibility', () => {
        it('data model interface exists', () => {
            const chart = new Bar_Chart({
                context,
                abstract: true,
                data: {
                    labels: ['A'],
                    series: [{ values: [1] }]
                }
            });

            expect(chart.data).to.exist;
            expect(chart.data.model).to.exist;
        });
    });

    // ===== Area_Chart Tests =====
    describe('Area_Chart', () => {
        let Area_Chart;

        before(() => {
            Area_Chart = require('../../controls/charts/Area_Chart');
        });

        describe('Instantiation', () => {
            it('instantiates without errors', () => {
                const chart = new Area_Chart({ context, abstract: true });
                expect(chart).to.exist;
            });

            it('defaults to overlap mode', () => {
                const chart = new Area_Chart({ context, abstract: true });
                expect(chart._mode).to.equal('overlap');
            });

            it('accepts stacked mode', () => {
                const chart = new Area_Chart({ context, abstract: true, mode: 'stacked' });
                expect(chart._mode).to.equal('stacked');
            });
        });

        describe('Rendering', () => {
            it('renders valid HTML', () => {
                const chart = new Area_Chart({
                    context,
                    data: {
                        labels: ['A', 'B', 'C'],
                        series: [{ name: 'Test', values: [10, 20, 15] }]
                    }
                });
                const html = chart.all_html_render();

                expect(html).to.be.a('string');
                expect(html).to.include('area-chart');
                expect(html).to.include('<svg');
                expect(html).to.include('<path');
            });
        });
    });

    // ===== Scatter_Chart Tests =====
    describe('Scatter_Chart', () => {
        let Scatter_Chart;

        before(() => {
            Scatter_Chart = require('../../controls/charts/Scatter_Chart');
        });

        describe('Instantiation', () => {
            it('instantiates without errors', () => {
                const chart = new Scatter_Chart({ context, abstract: true });
                expect(chart).to.exist;
            });

            it('has default point size', () => {
                const chart = new Scatter_Chart({ context, abstract: true });
                expect(chart._point_size).to.equal(6);
            });

            it('accepts custom point size', () => {
                const chart = new Scatter_Chart({ context, abstract: true, point_size: 10 });
                expect(chart._point_size).to.equal(10);
            });
        });

        describe('Data Handling', () => {
            it('normalizes scatter series with points array', () => {
                const chart = new Scatter_Chart({
                    context,
                    abstract: true,
                    data: {
                        series: [{
                            name: 'Test',
                            points: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
                        }]
                    }
                });

                expect(chart._series).to.have.lengthOf(1);
                expect(chart._series[0].points).to.have.lengthOf(2);
            });

            it('calculates scatter range', () => {
                const chart = new Scatter_Chart({
                    context,
                    abstract: true,
                    data: {
                        series: [{
                            points: [{ x: 10, y: 20 }, { x: 50, y: 80 }]
                        }]
                    }
                });

                const range = chart.get_scatter_range();
                expect(range.x_min).to.be.at.most(10);
                expect(range.x_max).to.be.at.least(50);
                expect(range.y_min).to.be.at.most(20);
                expect(range.y_max).to.be.at.least(80);
            });
        });

        describe('Rendering', () => {
            it('renders valid HTML with circles', () => {
                const chart = new Scatter_Chart({
                    context,
                    data: {
                        series: [{
                            name: 'Test',
                            points: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
                        }]
                    }
                });
                const html = chart.all_html_render();

                expect(html).to.be.a('string');
                expect(html).to.include('scatter-chart');
                expect(html).to.include('<circle');
            });
        });
    });
});
