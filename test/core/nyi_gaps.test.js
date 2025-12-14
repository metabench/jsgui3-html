const { expect } = require('chai');

const controls = require('../../controls/controls');
const jsgui = require('../../html-core/html-core');
const display_mixin = require('../../control_mixins/display');
const Validation_State = require('../../html-core/Validation_State');

describe('NYI gap closures', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Grid.get_cell', () => {
        it('should return the expected cell for multiple coordinate shapes', () => {
            const grid = new controls.Grid({
                context,
                grid_size: [2, 2],
                cell_size: [10, 10]
            });

            const cell_0_0 = grid.get_cell(0, 0);
            expect(cell_0_0).to.exist;
            expect(cell_0_0.x).to.equal(0);
            expect(cell_0_0.y).to.equal(0);

            const cell_1_1 = grid.get_cell([1, 1]);
            expect(cell_1_1).to.exist;
            expect(cell_1_1.x).to.equal(1);
            expect(cell_1_1.y).to.equal(1);

            const cell_0_1 = grid.get_cell({ x: 0, y: 1 });
            expect(cell_0_1).to.exist;
            expect(cell_0_1.x).to.equal(0);
            expect(cell_0_1.y).to.equal(1);

            expect(grid.get_cell(99, 99)).to.equal(undefined);
        });
    });

    describe('Tabbed_Panel tab normalization', () => {
        it('should accept Control instances and primitives as tab entries', () => {
            const tab_control = new controls.Button({
                context,
                text: 'Tab Content'
            });

            expect(() => {
                const tabbed_panel = new controls.Tabbed_Panel({
                    context,
                    tabs: [
                        tab_control,
                        123,
                        { title: 'Tab 3', content: 'Content 3' }
                    ]
                });

                expect(tabbed_panel).to.exist;
                expect(tabbed_panel.html).to.be.a('string');
            }).to.not.throw();
        });
    });

    describe('Validation_State.set', () => {
        it('should accept booleans, objects, and messages without throwing', () => {
            const state = new Validation_State();
            const events = [];
            state.on('change', e => events.push(e));

            state.set(true);
            expect(state.valid).to.equal(true);

            state.set({
                valid: false,
                message: 'Invalid input',
                code: 'invalid_input',
                details: { reason: 'test' }
            });

            expect(state.valid).to.equal(false);
            expect(state.message).to.equal('Invalid input');
            expect(state.code).to.equal('invalid_input');
            expect(state.details).to.deep.equal({ reason: 'test' });

            state.set('neutral');
            expect(state.valid).to.equal(undefined);

            expect(events.some(e => e.name === 'valid')).to.equal(true);
        });

        it('should default validity to false when setting a message', () => {
            const state = new Validation_State();
            state.set('Email is required');
            expect(state.valid).to.equal(false);
            expect(state.message).to.equal('Email is required');
        });
    });

    describe('Control selector matching', () => {
        it('should support single-part and descendant selectors', () => {
            const root = new jsgui.Control({
                context,
                __type_name: 'root',
                tagName: 'div'
            });

            const container = new jsgui.Control({
                context,
                __type_name: 'container',
                tagName: 'div'
            });
            container.add_class('container');
            container.state = 'open';

            const button = new jsgui.Control({
                context,
                __type_name: 'button',
                tagName: 'button'
            });
            button.dom.attributes.id = 'btn1';

            container.add(button);
            root.add(container);

            expect(button.$match('button')).to.equal(true);
            expect(button.$match(':button')).to.equal(true);
            expect(button.$match('#btn1')).to.equal(true);
            expect(container.$match('[state=open]')).to.equal(true);

            expect(button.$match('.container button')).to.equal(true);
            expect(button.matches_selector('.container button')).to.equal(true);

            const found = root.find('.container button');
            expect(found).to.have.lengthOf(1);
            expect(found[0]).to.equal(button);
        });
    });

    describe('span.text updates', () => {
        it('should insert or update a Text_Node without throwing', () => {
            const span = new jsgui.controls.span({
                context
            });

            const strong = new jsgui.Control({
                context,
                tagName: 'strong',
                content: 'X'
            });
            span.add(strong);

            expect(() => {
                span.text = 'Hello';
            }).to.not.throw();

            const text_nodes = span.content._arr.filter(item => item instanceof jsgui.Text_Node);
            expect(text_nodes).to.have.lengthOf(1);
            expect(text_nodes[0].text).to.equal('Hello');
            expect(span.content._arr[1]).to.equal(strong);

            span.text = 'Hello again';
            expect(text_nodes[0].text).to.equal('Hello again');
        });
    });

    describe('Object-valued DOM attributes', () => {
        it('should render object attributes without throwing', () => {
            const ctrl = new jsgui.Control({
                context,
                __type_name: 'div',
                tagName: 'div'
            });

            ctrl.dom.attributes['data-test'] = { a: 1, b: 'x' };

            expect(() => ctrl.html).to.not.throw();
            expect(ctrl.html).to.include('data-test="');
            expect(ctrl.html).to.include("'a'");
        });
    });

    describe('Resource.load_compiler', () => {
        it('should register a compiler resource and call transform', () => {
            const jsgui_html = require('../../html.js');
            if (jsgui_html.Resource.compilers) delete jsgui_html.Resource.compilers.test_compiler;

            const pool = new jsgui_html.Resource_Pool();
            const compiler = jsgui_html.Resource.load_compiler(
                'test_compiler',
                (input) => String(input).toUpperCase(),
                { pool }
            );

            expect(compiler).to.exist;
            expect(typeof compiler.transform).to.equal('function');
            expect(compiler.transform('abc')).to.equal('ABC');

            expect(jsgui_html.Resource.compilers.test_compiler).to.equal(compiler);
            expect(pool.get_resource('test_compiler')).to.equal(compiler);
        });
    });

	    describe('display mixin', () => {
	        it('should attach ctrl.display and allow setting a mode value', () => {
	            const ctrl = new jsgui.Control({
	                context,
                __type_name: 'div',
                tagName: 'div'
            });

            const ctrl_display = display_mixin(ctrl);
            expect(ctrl_display).to.exist;
            expect(ctrl.display).to.equal(ctrl_display);

            ctrl.display = 'mini';
            expect(ctrl.display.modes.value).to.equal('mini');

	            const ctrl_display_2 = display_mixin(ctrl);
	            expect(ctrl_display_2).to.equal(ctrl_display);
	        });
	    });

	    describe('Selectable mixin reapplication', () => {
	        it('should not throw when re-applied to an already-selectable control', function() {
	            const Selectable = require('../../control_mixins/selectable');

	            const ctrl = new jsgui.Control({
	                context,
	                __type_name: 'div',
	                tagName: 'div'
	            });
	            ctrl.dom.el = document.createElement('div');

	            Selectable(ctrl);
	            ctrl.selectable = true;

	            expect(() => Selectable(ctrl)).to.not.throw();
	            expect(typeof ctrl.select).to.equal('function');
	            expect(typeof ctrl.deselect).to.equal('function');
	        });

	        it('should allow applying before dom.el exists and completing later', function() {
	            const Selectable = require('../../control_mixins/selectable');

	            const ctrl = new jsgui.Control({
	                context,
	                __type_name: 'div',
	                tagName: 'div'
	            });

	            Selectable(ctrl);
	            ctrl.dom.el = document.createElement('div');
	            expect(() => Selectable(ctrl)).to.not.throw();

	            ctrl.selectable = true;
	            expect(typeof ctrl.select).to.equal('function');
	        });
	    });

	    describe('Page_Context DOM helpers', () => {
	        it('should expose context.body() and append controls into document.body', () => {
	            const body_ctrl = context.body();
	            expect(body_ctrl).to.exist;
	            expect(body_ctrl.dom.el).to.equal(document.body);

	            const child = new jsgui.Control({
	                context,
	                __type_name: 'div',
	                tagName: 'div'
	            });

	            body_ctrl.add(child);

	            const found = document.body.querySelector('[data-jsgui-id="' + child._id() + '"]');
	            expect(found).to.exist;
	            expect(context.get_ctrl_el(child)).to.equal(found);
	        });
	    });

	    describe('Compositional model accepts Control instances', () => {
	        it('should allow Control instances in composition arrays', () => {
	            const child = new jsgui.Control({
	                context,
	                __type_name: 'child',
	                tagName: 'div'
	            });

	            const named = new jsgui.Control({
	                context,
	                __type_name: 'named_child',
	                tagName: 'span'
	            });

	            const parent = new jsgui.Control({
	                context,
	                __type_name: 'parent',
	                tagName: 'div',
	                composition: [
	                    child,
	                    ['named', named]
	                ]
	            });

	            expect(parent.content._arr).to.include(child);
	            expect(parent.named).to.equal(named);
	            expect(parent._ctrl_fields.named).to.equal(named);
	        });
	    });

	    describe('Rendering content containing Data_Model', () => {
	        it('should render data models without throwing', () => {
	            const { Data_Model } = require('lang-tools');

	            const ctrl = new jsgui.Control({
	                context,
	                __type_name: 'div',
	                tagName: 'div'
	            });

	            const model = new Data_Model({ context });
	            ctrl.add(model);

	            expect(() => ctrl.html).to.not.throw();
	            expect(ctrl.html).to.include('__data_model');
	        });
	    });
	});
