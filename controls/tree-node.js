var jsgui = require('../html-core/html-core');
var Plus_Minus_Toggle_Button = require('./plus-minus-toggle-button');
var Vertical_Expander = require('./vertical-expander');

var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof,
	def = jsgui.def;
var Control = jsgui.Control;

var fields = [
	//['text', String]
	['toggle_button', Control],
	['inner_control', Control],
	['expander', Control]
];

class Tree_Node extends Control {

	constructor(spec) {
		// Wont fields have been set?
		spec = spec || {};
		//console.log('1) spec', spec);
		spec.__type_name = spec.__type_name || 'tree_node';

		//spec.expandable = spec.expandable || true;

		if (!def(spec.expandable)) spec.expandable = true;

		super(spec);
		//console.log('2) spec', spec);
		// Can take an image
		// Can take some text.
		//  That's all I'll have in the tree node for now.
		//this.__type_name = 'tree_node';

		// Styling has regressed.
		//  jsgui controls no longer being constructed with these extra params.
		//  the pre-es6 class system was better in some ways.
		// now: no abstract classes (can use JSON / POJO)
		// now: no add and make in constructors.
		//  can that be fixed?
		//  may be tricky hacking
		//  can improve add and make functions.
		//   [Class, {params}]
		//   can use different syntax.

		// have .add set the context too.

		const add = item => this.add(item);
		const make = item => this.make(item);
		//console.log('3) spec', spec);
		//if (!this._abstract) {
		const spec2 = spec;
		//console.log('spec.el', spec.el);
		this.expandable = spec.expandable;

		if (def(spec.depth)) this.depth = spec.depth;

		if (typeof spec2.el === 'undefined') {
			//console.log('4) spec', spec);
			//console.log('5) spec2', spec2);
			//console.log('typeof spec2', typeof spec2);



			var spec_state = spec2.state,
				state;
			//console.log('**** spec.img_src', spec.img_src);
			if (spec2.img_src) {
				//this.set('img_src', spec.img_src);
				var img_src = this.img_src;
				//console.log('img_src', img_src);
				//console.log('this._', this._);
				//throw '1) stop;'
			}
			if (spec2.text) {
				//this.set('text', spec.text);
				this.text = spec2.text;
			}

			if (spec2) {
				//console.log('spec_state', spec_state);
				if (spec_state === 'expanded' || spec_state === 'contracted') {
					this.state = spec_state;
				} else {
					this.state = 'contracted';
					//throw 'spec.state expects "expanded" or "contracted".';
				}
			} else {
				//state = this.set('state', 'expanded');
				this.state = 'expanded';
			}
			//console.log('!!this.context', !!this.context);
			//throw 'stop';
			//let my = p => p.context = this.context;

			let my = (p) => {
				p.context = this.context;
				return p;
			}

			// Old way of doing things...
			//  allowed classes to be involked without new, meaning they were in a passive mode and held params describing them.

			var top_line = add(new Control(my({
				'class': 'top-line'
			})));
			let rest_of_top_line;
			if (def(this.depth)) {
				// add that many depth blocks
				//console.log('this.depth', this.depth);
				for (let c = 0; c < this.depth; c++) {
					let depth_block = new Control({
						context: this.context,
						'class': 'depth-block'
					})
					top_line.add(depth_block);
				}
			}

			rest_of_top_line = new Control(my({
				'class': 'rest-of'
			}));
			top_line.add(rest_of_top_line);


			//var plus_minus = make(new Plus_Minus_Toggle_Button({}));
			//top_line.add(plus_minus);

			let plus_minus, inner_control;
			let spec3 = {};
			if (this.state === 'contracted') {
				spec3.state = '+';

			}
			rest_of_top_line.add(plus_minus = new Plus_Minus_Toggle_Button(my(spec3)));

			//plus_minus.hide();
			//var img_src = ;

			if (this.img_src) {
				rest_of_top_line.add(new jsgui.img({
					'dom': {
						'attributes': {
							'src': this.img_src
						}
					}
				}));
			}
			//var img = make(new jsgui.img({}));
			//img.dom.attributes.src = img_src;
			// Also add the text to the top line.
			//var span = make(new jsgui.span({}));
			//var text = this.text;
			//console.log('this.text', this.text);
			//span.add(text);
			rest_of_top_line.add(new jsgui.span({
				context: this.context,
				text: this.text,
				'class': 'text'
			}));

			var clearall = add(new Control(my({
				'class': 'clearall'
			})));

			// expandable by default.
			//  Some won't be.

			let expander;
			//console.log('this.expandable', this.expandable);
			if (this.expandable) {
				expander = add(new Vertical_Expander(my({
					state: this.state
				})));
				//var inner_control = make(new Control({ 'class': 'inner' }));
				expander.add(inner_control = new Control(my({
					'class': 'inner'
				})));
				var inner_control_content = inner_control.content;
				inner_control_content.on('change', function (e_change) {
					//console.log('Tree_Node inner_control_content change', e_change);
					//throw 'stop';
					var l = inner_control_content.length();
					//console.log('l', l);
					if (l > 0) {
						// so could / should be hidden bydefault anyway.
						plus_minus.show();
					}
					//throw 'stop';
				});
				this.toggle_button = plus_minus;
				//console.log('pre set inner_control');
				this.inner_control = inner_control;
				//console.log('post set inner_control');
				this.expander = expander;
			} else {
				//console.log('should hide plus_minus');
				plus_minus.hide();
			}

			var ctrl_fields = {
				'toggle_button': plus_minus._id() //,
				//'inner_control': inner_control._id()//,
				//'expander': expander._id()
			};

			if (expander) {
				ctrl_fields.inner_control = inner_control._id()
				ctrl_fields.expander = expander._id()
			}

			//this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));

			this.dom.attributes['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");

			this.add_class('tree-node');
			this.active();
		}

		this.selectable();
		//}
	}
	// I think a pre-render function would be useful.
	//  Something that sets data-jsgui DOM attributes.


	// Seems we need a separate 'register' stage, where controls, with their DOM els get registered with the central jsgui system.

	// whenever something is added to the DOM, the nodes need to be registered.
	//  within the page context


	'activate' (el) {
		super.activate(el);
		this.selectable();

		//console.log('activate Tree_Node');
		// ctrl-fields not working?
		// Need to listen to the toggle event of the plus minus toggle button

		// This will be done through the ctrl~_fields system.
		//  Would like an easier way of setting that up.
		var toggle_button = this.toggle_button;
		//console.log('toggle_button', toggle_button);

		var inner_control = this.inner_control;
		var expander = this.expander;
		//console.log('inner_control', inner_control);

		if (expander) {
			if (toggle_button) {
				toggle_button.on('toggle', e_toggle => {

					// set the expander state depending on the value.

					// '-' state means open at that time.
					let state = e_toggle.state;

					if (state === '-') {
						expander.open();
						this.raise('expand');
						this.raise('open');
					} else {
						expander.close();
						this.raise('contract');
						this.raise('close');
					}

					//console.log('tree-node toggle e_toggle', e_toggle);
					// need to expand or contract the
					// need to expand or contract the inner control.
					//  Mixins could be good for this type of functionality.
					//  Something that enhances a Control without making a new Class.

					//expander.toggle();
				})
			}

			expander.state.on('change', e => {
				console.log('** e', e);
			})
		}

	}
}
module.exports = Tree_Node;