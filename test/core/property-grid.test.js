/**
 * Property_Grid — Unit Tests
 */

require('../setup');
const { expect } = require('chai');

const Property_Grid = require('../../controls/organised/1-standard/1-editor/Property_Grid');

describe('Property_Grid', function () {
    let context;
    const basic_schema = [
        { key: 'name', type: 'text', label: 'Name' },
        { key: 'age', type: 'number', label: 'Age', min: 0, max: 150 },
        { key: 'enabled', type: 'boolean', label: 'Enabled' }
    ];
    const make_data = () => ({ name: 'Alice', age: 30, enabled: true });

    beforeEach(() => { context = createTestContext(); });

    describe('constructor', () => {
        it('should create editor per schema field', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            expect(grid._editors.size).to.equal(3);
        });

        it('should add class property-grid', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('property-grid');
        });

        it('should set role="grid"', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('role="grid"');
        });

        it('should render labels', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('Name');
            expect(html).to.include('Age');
            expect(html).to.include('Enabled');
        });

        it('should render initial values', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('value="Alice"');
            expect(html).to.include('value="30"');
            expect(html).to.include('checked');
        });
    });

    describe('grouped schema', () => {
        it('should render group headers', () => {
            const grid = new Property_Grid({
                context,
                schema: [
                    {
                        group: 'Personal', fields: [
                            { key: 'name', type: 'text', label: 'Name' }
                        ]
                    },
                    {
                        group: 'Settings', fields: [
                            { key: 'enabled', type: 'boolean', label: 'Enabled' }
                        ]
                    }
                ],
                data: { name: 'Bob', enabled: false }
            });
            const html = grid.all_html_render();
            expect(html).to.include('Personal');
            expect(html).to.include('Settings');
            expect(html).to.include('pg-group-header');
        });
    });

    describe('get_values / set_values', () => {
        it('should return all values', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const vals = grid.get_values();
            expect(vals.name).to.equal('Alice');
            expect(vals.age).to.equal(30);
            expect(vals.enabled).to.equal(true);
        });

        it('should set values silently', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            grid.set_values({ name: 'Bob', age: 25 });
            expect(grid.get_values().name).to.equal('Bob');
            expect(grid.get_values().age).to.equal(25);
            // enabled should be unchanged
            expect(grid.get_values().enabled).to.equal(true);
        });
    });

    describe('get_editor', () => {
        it('should return editor by key', () => {
            const grid2 = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const ed = grid2.get_editor('name');
            expect(ed).to.not.be.null;
            expect(ed.get_value()).to.equal('Alice');
        });

        it('should return undefined for unknown key', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            expect(grid.get_editor('nonexistent')).to.be.undefined;
        });
    });

    describe('validate_all', () => {
        it('should validate all editors', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const result = grid.validate_all();
            expect(result.valid).to.be.true;
            expect(result.errors).to.be.empty;
        });

        it('should report invalid editors', () => {
            const grid = new Property_Grid({
                context,
                schema: basic_schema,
                data: { name: 'X', age: 200, enabled: false }
            });
            const result = grid.validate_all();
            expect(result.valid).to.be.false;
            expect(result.errors).to.have.length(1);
            expect(result.errors[0].key).to.equal('age');
        });
    });

    describe('ARIA attributes', () => {
        it('should set aria-label on grid', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('aria-label="Properties"');
        });

        it('should set custom aria-label', () => {
            const grid = new Property_Grid({
                context, schema: basic_schema, data: make_data(),
                aria_label: 'Item Properties'
            });
            const html = grid.all_html_render();
            expect(html).to.include('aria-label="Item Properties"');
        });

        it('should set role="row" on rows', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('role="row"');
        });

        it('should set role="rowheader" on labels', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('role="rowheader"');
        });

        it('should set role="gridcell" on values', () => {
            const grid = new Property_Grid({ context, schema: basic_schema, data: make_data() });
            const html = grid.all_html_render();
            expect(html).to.include('role="gridcell"');
        });
    });

    describe('all editor types in one grid', () => {
        it('should render all 6 editor types', () => {
            const grid = new Property_Grid({
                context,
                schema: [
                    { key: 'name', type: 'text', label: 'Name' },
                    { key: 'age', type: 'number', label: 'Age' },
                    { key: 'on', type: 'boolean', label: 'On' },
                    { key: 'role', type: 'enum', label: 'Role', options: ['a', 'b'] },
                    { key: 'date', type: 'date', label: 'Date' },
                    { key: 'color', type: 'color', label: 'Color' }
                ],
                data: {
                    name: 'test', age: 42, on: true,
                    role: 'a', date: '2026-01-01', color: '#ff0000'
                }
            });
            expect(grid._editors.size).to.equal(6);
            const html = grid.all_html_render();
            expect(html).to.include('text-value-editor');
            expect(html).to.include('number-value-editor');
            expect(html).to.include('boolean-value-editor');
            expect(html).to.include('enum-value-editor');
            expect(html).to.include('date-value-editor');
            expect(html).to.include('color-value-editor');
        });
    });
});
