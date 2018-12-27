var jsgui = require('../html-core/html-core');
var Plus_Minus_Toggle_Button = require('./plus-minus-toggle-button');
var Vertical_Expander = require('./vertical-expander');

const mx_selectable = require('../control_mixins/selectable');
const {
	prop,
	field
} = require('obext');

const {
	stringify,
	each,
	tof,
	def,
	Control
} = jsgui;

/*
var stringify = jsgui.stringify,
	each = jsgui.each,
	tof = jsgui.tof,
	def = jsgui.def;
var Control = jsgui.Control;
*/

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
		mx_selectable(this);

		field(this, 'depth');
		field(this, 'state', 'open');
		this.expandable = spec.expandable;
		if (def(spec.depth)) this.depth = spec.depth;
		if (spec) {
			var spec_state = spec.state,
				state;
			//this.depth = spec.depth || 0;
			//console.log('spec_state', spec_state);
			if (spec_state === 'open' || spec_state === 'closed') {
				this.state = spec_state;
			} else {
				//this.state = 'closed';
				//throw 'spec.state expects "expanded" or "contracted".';
			}
			if (spec.text) {
				//this.set('text', spec.text);
				this.text = spec.text;
			} else {
				if (spec.name) {
					//this.set('text', spec.text);
					this.text = spec.name;
				}
			}
		} else {
			//state = this.set('state', 'expanded');
			this.state = 'open';
		}

		if (spec.img_src) {
			//this.set('img_src', spec.img_src);
			//var img_src = this.img_src;
			//console.log('img_src', img_src);
			//console.log('this._', this._);
			//throw '1) stop;'
		}
		if (typeof spec.el === 'undefined') {
			//console.log('4) spec', spec);
			//console.log('5) spec2', spec2);
			//console.log('typeof spec2', typeof spec2);
			//console.log('**** spec.img_src', spec.img_src);
			this.compose_tree_node(spec);
			// Tree node name, or text.
			//  Could give it a name
		}
		//this.selectable = true;
		//}

		// need to listen to content change...
		//  how many tree nodes are in the content.

		// inner_control content change

		if (this.inner_control) {
			this.inner_control.content.on('change', e_change => {
				//console.log('tree inner_control content change', e_change);

				let coll = e_change.target;
				// then does the collection contain at least one Tree_Node?

				// can we do has by type?
				//  has an instance of a function constructor.
				let has_tree_node = false;
				each(coll, (v, i, stop) => {
					if (v instanceof Tree_Node) {
						has_tree_node = true;
						stop();
					}
				});

				if (has_tree_node) {
					this.toggle_button.show();
				} else {
					this.toggle_button.hide();
				}

			})
		}



	}

	'compose_tree_node'(spec) {
		//console.log('!!this.context', !!this.context);
		//throw 'stop';
		//let my = p => p.context = this.context;
		let my = (p) => {
			p.context = this.context;
			return p;
		}
		const add = item => this.add(item);
		const make = item => this.make(item);
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
				let depth_block = new Control(my({
					'class': 'depth-block'
				}))
				top_line.add(depth_block);
			}
		}
		/*
		rest_of_top_line = new Control(my({
			'class': 'rest-of'
		}));
		top_line.add(rest_of_top_line);
		*/
		//var plus_minus = make(new Plus_Minus_Toggle_Button({}));
		//top_line.add(plus_minus);
		let plus_minus, inner_control;
		let spec3 = {};
		if (this.state === 'closed') {
			spec3.state = '+';
		}

		// only if there are other nodes within this node?

		top_line.add(plus_minus = new Plus_Minus_Toggle_Button(my(spec3)));
		this.toggle_button = plus_minus;
		plus_minus.hide();

		// Whenever the collection of nodes changes, if there are 0 nodes, then hide this plus minus button.






		var main_box = top_line.add(new Control(my({
			'class': 'main-box'
		})));

		//plus_minus.hide();
		//var img_src = ;

		if (this.img_src) {
			rest_of_top_line.add(new jsgui.img(my({
				'dom': {
					'attributes': {
						'src': this.img_src
					}
				}
			})));
		}
		//var img = make(new jsgui.img({}));
		//img.dom.attributes.src = img_src;
		// Also add the text to the top line.
		//var span = make(new jsgui.span({}));
		//var text = this.text;
		//console.log('this.text', this.text);
		//span.add(text);
		// inner_box
		main_box.add(new jsgui.span(my({
			text: this.text,
			'class': 'text'
		})));

		/*
		var clearall = add(new Control(my({
			'class': 'clearall'
		})));
		*/
		// expandable by default.
		//  Some won't be.

		let expander;
		//console.log('this.expandable', this.expandable);
		if (this.expandable) {
			expander = add(new Vertical_Expander(my({
				//state: this.state
			})));
			//var inner_control = make(new Control({ 'class': 'inner' }));
			expander.add(inner_control = new Control(my({
				'class': 'inner'
			})));

			/*
			var inner_control_content = inner_control.content;
			inner_control_content.on('change', e_change => {
				//console.log('Tree_Node inner_control_content change', e_change);
				//throw 'stop';
				var l = inner_control_content.length();
				console.log('inner_control_content', l);
				if (l > 0) {
					// so could / should be hidden bydefault anyway.
					plus_minus.show();
				}
				//throw 'stop';
			});
			*/
			
			//console.log('pre set inner_control');
			this.inner_control = inner_control;
			//console.log('post set inner_control');
			this.expander = expander;

			if (spec.nodes) {
				for (let node of spec.nodes) {
					node.context = this.context;
					node.depth = this.depth + 1;
					let tn = new Tree_Node(node);
					this.inner_control.add(tn);
				}
				expander.state = this.state = 'open';
			} else {
				expander.state = this.state = 'closed';
				//plus_minus.hide();
				//expander.close();
			}
		} else {
			//console.log('should hide plus_minus');
			plus_minus.hide();
		}

		var ctrl_fields = this._ctrl_fields = Object.assign(this._ctrl_fields || {}, {
			'toggle_button': plus_minus
		});
		if (expander) {
			ctrl_fields.inner_control = inner_control;
			ctrl_fields.expander = expander;
		}
		this.add_class('tree-node');
		// only active on the server.
		//  on the client, we don't need those extra references?
		this.active();
	}

	// adding a node - need to set up its depth?


	// I think a pre-render function would be useful.
	//  Something that sets data-jsgui DOM attributes.

	// Seems we need a separate 'register' stage, where controls, with their DOM els get registered with the central jsgui system.

	// whenever something is added to the DOM, the nodes need to be registered.
	//  within the page context

	// Want automatic activation of any control that gets added.
	//  Added to an active control.

	// __is_active


	'activate'(el) {
		if (!this.__active) {
			super.activate(el);

			this.rec_desc_ensure_ctrl_el_refs();
			//this.selectable();

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

			//console.log('expander', expander);
			//console.log('toggle_button', toggle_button);

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
							//console.log('expander', expander);
							//console.log('expander.close', expander.close);
							//console.log('Object.keys(expander)', Object.keys(expander));
							expander.close();
							this.raise('contract');
							this.raise('close');
						}
					})

					//console.log('toggle_button.__active', toggle_button.__active);
				}
			}
		}



	}
}
module.exports = Tree_Node;