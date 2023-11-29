var jsgui = require('lang-tools');
const {
	get_a_sig,
	each,
	tof,
	def
} = jsgui;
const v_subtract = jsgui.util.v_subtract;
const {
	prom_or_cb
} = require('fnl');
const Text_Node = require('./text-node');
var Control_Core = require('./control-core');
const has_window = typeof window !== 'undefined';


// Maybe worth moving some core shapes somewhere else, lower level, and not require gfx-core.

// Also seems like a bit of testing here to do with making a control with the Data_Model system, rendering it,
//   changing a value in the Data_Model, re-rendering.
// Can't really test client-side things so well here.
//   But can test many of the things that are depended on on the client-side.

// Making a (simulated) Data_Model stack that's similar to controls could help here.
//   For the moment, worth focusing a lot on the Text_Input Control and it's various data models and values.
//   Make it easy to make it so it can represent a number or integer.
//     (parsed types)
//   Representing (hex or css) colors.
//     Data types that can be represented as (some) strings seems like a very important thing to get right.

// data type translations when syncing between data models of different data_type???


// Let's get this all working for representing integers as strings within a Text_Input.


















const gfx = require('jsgui3-gfx-core');
const {Rect} = gfx;

const model_data_view_compositional_representation = require('../control_mixins/model_data_view_compositional_representation');

// Maybe this can / can be used to assign parents to the child controls.

// Next make Data_Model_View_Model_Control extend this....

var desc = (ctrl, callback) => {
	if (ctrl.get) {
		var content = ctrl.get('content');
		if (content) {
			var t_content = typeof content;
			if (t_content === 'string' || t_content === 'number') {} else {
				var arr = content._arr;
				var c, l = arr.length;
				var item, t_item;
				for (c = 0; c < l; c++) {
					item = arr[c];
					t_item = typeof item;
					if (t_item === 'string' || t_item === 'numbers') {} else {
						callback(arr[c]);
						desc(arr[c], callback);
					}
				}
			}
		}
	}
}


var dom_desc = (el, callback) => {
	callback(el);
	var cns = el.childNodes;
	var l = cns.length;
	for (var c = 0; c < l; c++) {
		dom_desc(cns[c], callback);
	}
}


const mapDomEventNames = {
	'change': true,
	'click': true,
	'dblclick': true,
	'mousedown': true,
	'mouseup': true,
	'mousemove': true,
	'mouseover': true,
	'mouseout': true,
	'blur': true,
	'focus': true,
	'keydown': true,
	'keyup': true,
	'keypress': true,
	'contextmenu': true,
	'touchstart': true,
	'touchmove': true,
	'touchend': true,
	'touchcancel': true,
	'touchforcechange': true,
	'transitionend': true,
	'abort': true,
	'canplay': true,
	'canplaythrough': true,
	'durationchange': true,
	'emptied': true,
	'ended': true,
	'error': true,
	'loadeddata': true,
	'loadedmetadata': true,
	'loadstart': true,
	'pause': true,
	'play': true,
	'playing': true,
	'progress': true,
	'ratechange': true,
	'seeked': true,
	'seeking': true,
	'submit': true,
	'stalled': true,
	'suspend': true,
	'timeupdate': true,
	'volumechange': true,
	'waiting': true
};

// Basically everything extends this control.
//   Late 2023 this works, don't want to break it, but it should be functionally refined somewhat.
//   Some parts moved deeper into the namespace such as view.ui.commands perhaps.
//     Then there could be shortcuts to get to them.
//     May be able to further simplify the core code of controls themselves, moving other code into mixins.








class Control extends Control_Core {
	constructor(spec, fields) {

		//console.log('construct ctrl-enh');

		spec = spec || {};
		super(spec, fields);

		// Slows it down maybe 20 to 30 percent here.
		//   But the flexibility could be worth it!
		const o_repr = {};
		if (spec.data) o_repr.data = spec.data;
		model_data_view_compositional_representation(this, o_repr);

		if (spec.id) {
			this.__id = spec.id;
		}
		if (spec.__id) {
			this.__id = spec.__id;
		}
		if (spec.__type_name) {
			this.__type_name = spec.__type_name;
		}
		this.map_raises_dom_events = {};
		if (spec.el) {
			var jgf = spec.el.getAttribute('data-jsgui-fields');
			if (jgf) {
				var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, '\'');
				s_pre_parse = s_pre_parse.replace(/\'/g, '"');
				var props = JSON.parse(s_pre_parse);
				let exempt_prop_names = {}
				each(props, (v, i) => {
					if (exempt_prop_names[i]) {} else {
						spec[i] = v;
					}
				});
			}
		}
		if (spec.el) {
			if (def(this.selection_scope)) {
				this.selection_scope = this.context.new_selection_scope(this);
			}
			var tn = spec.el.getAttribute('data-jsgui-type');
			if (tn) this.__type_name = tn;
			var id = spec.el.getAttribute('data-jsgui-id');
			if (id) this.__id = id;

			
		}

		if (!spec.el) {
			this.compose_using_compositional_model();

			// And when this model gets changed it should recompose using it.
			
			// this.view.ui.compositional.model.on('change'....?)
			//  and when its value changes....

			// or this.view.ui.compositional.on('change' model) perhaps....

			// Need to work on making the compositional model change work best.

			// model.on change 'self' even???
			//   as in it changes to a new model even, not just changing the value?





		}

		// and maybe a 'has_composed'???

		this.view.ui.compositional.on('change', e => {
			//console.log('e', e);
			const {name} = e;
			if (name === 'model') {
				console.log('ctrl-enh constructor handle view.ui.compositional change model');

				this.recompose_using_compositional_model();

			}

		});


		if (spec.size) {
			this.size = spec.size;
		}
		if (spec.background) {
			if (spec.background.color) {
				this.background.color = spec.background.color;
			}
		}

		// view.ui.compositional.model

		const set_view_ui_composition_model_from_spec = () => {
			if (spec.comp) {
				this.view.ui.compositional.model = spec.comp;
			} else if (spec.composition) {
				this.view.ui.compositional.model = spec.composition;
			} else if (spec.view) {
				if (spec.view.ui) {
					if (spec.view.ui.compositional) {
						if (spec.view.ui.compositional.model) {
							this.view.ui.compositional.model = spec.view.ui.compositional.model;
						}
					}
				}
			}
		}
		set_view_ui_composition_model_from_spec();



	}

	recompose_using_compositional_model() {
		//console.log('recompose_using_compositional_model');
		this.content.clear();
		this.compose_using_compositional_model();
	}

	// In the fairly near term this should help make controls such as Text_Field more concise in the definition,
	//   as well as make data and view model interactions clearer.
	
	



	compose_using_compositional_model() {
		//console.log('ctrl-enh compose_using_compositional_model');

		let cm;

		const {context} = this;

		// view.ui.compositional.model

		if (this.view.ui.compositional.model) {
			cm = this.view.ui.compositional.model;
		}

		/*

		if (this.view.ui.active.compositional.data.model) {
			cdm = this.view.ui.active.compositional.data.model;
		} else if (this.view.ui.compositional.data.model) {
			cdm = this.view.ui.compositional.data.model;
		}
		*/

		const tcm = tof(cm);
		//console.log('tcm', tcm);

		const compose_from_compositional_model_array = (arr_cm) => {
			const l = arr_cm.length;
			if (l > 0) {
				for (let c = 0; c < l; c++) {
					const composition_item = arr_cm[c];

					const tci = tof(composition_item);
					//console.log('tci', tci);

					if (tci === 'function' || tci === 'control') {
						//control

						// just create that control, no spec given here.

						const ctrl = new composition_item({context});
						this.add(ctrl);

					} else if (tci === 'array') { // otherwise an array [Control_Class, spec]
						
						if (composition_item.length === 2) {

							const [t0, t1] = [tof(composition_item[0]), tof(composition_item[1])];

							if ((t0 === 'function' || t0 === 'control') && t1 === 'object') {
								composition_item[1].context = context;
								const ctrl = new composition_item[0](composition_item[1]);
								this.add(ctrl);

							} else if (t0 === 'string' && (t1 === 'function' || t1 === 'control')) {
								//composition_item[1].context = context;
								const ctrl = new composition_item[1]({context});
								this.add(ctrl);

								this._ctrl_fields = this._ctrl_fields || {};
								this._ctrl_fields[composition_item[0]] = ctrl;

								//console.log('composition_item[0]', composition_item[0]);
							} else {

								console.log('[t0, t1]', [t0, t1]);

								console.trace();
								throw 'stop / nyi';

							}



						} else if (composition_item.length === 3) {
							// then what are the types...???
							const [t0, t1, t2] = [tof(composition_item[0]), tof(composition_item[1]), tof(composition_item[2])];
							


							if ((t0 === 'string') && (t1 === 'function' || t1 === 'control') && t2 === 'object') {
								composition_item[2].context = context;



								const ctrl = new composition_item[1](composition_item[2]);
								this.add(ctrl);

								this._ctrl_fields = this._ctrl_fields || {};
								this._ctrl_fields[composition_item[0]] = ctrl;

								//console.log('composition_item[0]', composition_item[0]);

							} else {

								console.log('[t0, t1, t2]', [t0, t1, t2]);
								console.trace();
								throw 'stop / nyi';

							}


							//console.trace();
							//throw 'stop / nyi';

						} else {
							console.trace();
							throw 'stop / nyi';
						}



					}





				}

			}


		}

		if (tcm === 'array') {
			// Simple enough for the moment....
			compose_from_compositional_model_array(cm);
		}

		/*

		if (cm !== undefined) {

			console.log('cm', cm);


			if (cm.value !== undefined) {
				console.log('ctrl-enh compose_using_compositional_model found compositional model cm:', cm);

				// Then compose accordingly....

				console.trace();
				throw 'stop';
			}	

			
		}
		*/

	}
	'ctrls' (obj_ctrls) {
		this._ctrl_fields = this._ctrl_fields || {};
		let cf = this._ctrl_fields;
		each(obj_ctrls, (ctrl, name) => {
			cf[name] = this[name] = ctrl;
			this.add(ctrl);
		});
		return this;
	}

	// Maybe it's a DOM method, through .DOM?
	// . While there is the 'DOM facade' it may be suitable as part of the Control itself.


	// change this to getter and setter.
	//.  would be a breaking API change.
	//.  also worth making it return a Rectangle object with a matching API.

	'bcr' () {



		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);

		if (sig === '[]') {
			var el = this.dom.el;
			var bcr = el.getBoundingClientRect();

			/*
			var res = [
				[bcr.left, bcr.top],
				[bcr.right, bcr.bottom],
				[bcr.width, bcr.height]
			];
			*/

			const res_rect = new Rect([bcr.width, bcr.height], [bcr.left, bcr.top]);

			//console.log('res_rect', res_rect);
			return res_rect;
		} else if (sig === '[a]') {

			// Likely to need a different and improved kind of bcr setting system.



			// Set the bcr

			// want more flexibility in terms of how it gets set?
			//.  size will / may be before pos when defining rectangles.

			// Though 2DPosition and 2DRectangleSize could help.


			let [pos, br_pos, size] = a[0];
			this.style({
				'position': 'absolute',
				'left': pos[0] + 'px',
				'top': pos[1] + 'px',
				'width': size[0] + 'px',
				'height': size[1] + 'px'
			});
		}
	}


	// Presuming pixels when?
	//.  Probably should change to a more advanced size system / algorithm.
	//.    Size being integrated with some 'box' or 'rect' property perhaps. Or rect.box? .rect.size perhaps?
	//.  with .size being a shortcut to .rect.size perhaps.
	//     then would want the rect to have change events.

	// a change_events function could help.
	//. change_events(this) in the constructor.
	//.  this.change(object) raises the change event, this.change(fn) adds a handler.



	get size() {
		if (this._size) {
			return this._size;
		} else {
			if (this.dom.el) {
				var bcr = this.dom.el.getBoundingClientRect();
				return [bcr.width, bcr.height];
			}
		}
	}


	'add_text' (value) {
		//console.log('add_text', value);
		//console.trace();
		var tn = new Text_Node({
			'context': this.context,
			'text': value + ''
		})
		this.add(tn);
		return tn;
	}
	'computed_style' () {
		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);
		var y;
		if (sig == '[s]') {
			var property_name = a[0];
			var el = this.dom.el;
			if (el.currentStyle)
				y = el.currentStyle[styleProp];
			else if (window.getComputedStyle)
				y = document.defaultView.getComputedStyle(el, null).getPropertyValue(property_name);
			return y;
		}
	}
	'padding' () {
		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var left, top, right, bottom;
			var c_padding = this.computed_style('padding');
			var s_c_padding = c_padding.split(' ');
			if (s_c_padding.length == 3) {
				top = parseInt(s_c_padding[0], 10);
				right = parseInt(s_c_padding[1], 10);
				bottom = parseInt(s_c_padding[2], 10);
				return [0, top, right, bottom];
			}
		} else {
			console.trace();
			throw 'Required argument: (array)'
		}
	}
	'border' () {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var left, top, right, bottom;
			var c_border = this.computed_style('border');
			console.log('c_border', c_border);
			throw 'stop';
		} else {
			console.trace();
			throw 'Required argument: (array)'
		}
	}
	'border_thickness' () {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var left, top, right, bottom;
			var c_border = this.computed_style('border');
			var b2 = c_border.split(', ').join('');
			var s_c_border = b2.split(' ');
			var thickness = parseInt(s_c_border[0], 10);
			return thickness;
		}
	}
	'activate_recursive' () {
		var el = this.dom.el;
		var context = this.context;
		var map_controls = context.map_controls;
		var parent_control;
		recursive_dom_iterate_depth(el, el2 => {
			const nt = el2.nodeType;
			if (nt == 1) {
				var jsgui_id = el2.getAttribute('data-jsgui-id');
				if (jsgui_id) {
					var ctrl = map_controls[jsgui_id];
					if (!ctrl.__active) ctrl.activate(el2);
				}
			}
		})
	}
	'add_dom_event_listener' (event_name, fn_handler) {
		if (has_window) {
			const {
				context
			} = this;
			const el = this.dom.el;
			const m = this.map_handlers_to_outer_handlers = this.map_handlers_to_outer_handlers || new Map();
			let outer_handler;
			if (m.has(fn_handler)) {
				outer_handler = m.get(fn_handler);
			} else {
				outer_handler = e => {
					const {
						target
					} = e;
					const jid = target.getAttribute('data-jsgui-id');
					if (jid) {
						e.ctrl_target = context.map_controls[jid];
					}
					fn_handler(e);
				};
				m.set(fn_handler, outer_handler);
			}
			if (el) {
				el.addEventListener(event_name, outer_handler, false);
			}
		}
	}
	'remove_dom_event_listener' (event_name, fn_handler) {
		if (has_window) {
			const m = this.map_handlers_to_outer_handlers;
			let outer_handler;
			if (m) {
				if (m.has(fn_handler)) {
					outer_handler = m.get(fn_handler);
				}
			}
			outer_handler = outer_handler || fn_handler;
			const el = this.dom.el;
			if (el) {
				el.removeEventListener(event_name, outer_handler, false);
			}
		}
		const old_way = () => {
			var listener = this._bound_events[event_name];
			let outer_handler;
			const m = this.map_handlers_to_outer_handlers;
			if (m) {
				if (m.has(fn_handler)) {
					outer_handler = m.get(fn_handler);
				}
			}
			outer_handler = outer_handler || fn_handler;
			var el = this.dom.el;
			if (el) {
				var t_listener = tof(listener);
				let tfnh;
				tfnh = fn_handler;
				if (t_listener === 'array') {
					let c_removed = 0;
					each(listener, (listener) => {
						if (listener === tfnh) {
							el.removeEventListener(event_name, listener, false);
							c_removed++;
						}
					});
					if (c_removed === listener.length) {
						this.map_raises_dom_events[event_name] = false;
					}
				} else {
					let tfnh;
					tfnh = fn_handler.event_inner || fn_handler;
					if (listener === tfnh) {
						el.removeEventListener(event_name, listener, false);
					}
				}
			}
		}
	}
	'remove_event_listener' () {
		// Part of the 'DOM facade / interop system?
		const a = arguments;
		const sig = get_a_sig(a, 1);
		if (sig === '[s,f]') {
			let [event_name, fn_handler] = a;
			if (mapDomEventNames[event_name]) {
				this.remove_dom_event_listener(event_name, fn_handler);
			}
			Control_Core.prototype.remove_event_listener.apply(this, a);
		} else if (sig === '[o]') {
			each(a[0], (v, i) => {
				this.remove_event_listener(i, v);
			});
		}
	}
	'add_event_listener' () {
		const a = arguments;
		const l = a.length;
		const sig = get_a_sig(a, 1);
		if (l === 1) {
			each(a[0], (v, i) => {
				this.add_event_listener(i, v);
			});
		}
		if (l === 2) {
			super.add_event_listener(a[0], a[1]);
		}
		if (l === 3) {
			super.add_event_listener(a[0], a[2]);
		}
		if (sig === '[s,f]' || sig === '[s,b,f]') {
			let event_name = a[0];
			let using_dom = true;
			if (l === 3 && a[1] === false) using_dom = false;
			let fn_handler;
			if (l === 2) fn_handler = a[1];
			if (l === 3) fn_handler = a[2];
			if (mapDomEventNames[a[0]] && using_dom) {
				this.add_dom_event_listener(event_name, fn_handler);
			}
		}
	}
	'once_active' (cb) {
		if (typeof document !== 'undefined') {
			return prom_or_cb((solve, jettison) => {
				if (this.__active) {
					solve();
				} else {
					let fn_activate = () => {
						solve();
						setTimeout(() => {
							this.off('activate', fn_activate);
						}, 0)
					}
					this.on('activate', fn_activate);
				}
			}, cb);
		}
	}

	// Some of this will be moved away from 'activate'.
	//   Within 'pre_activate', and may have a different name, not sure what though.
	//     coalesce? rebuild ctrl structures? setup ctrl tree? connect ctrls (within ctrl tree?)?

	// Connect / reconnect?

	// connect ctrl dom el

	// activate listeners?

	// The 'activate' function will often be its own custom functionality that defines what the Control does client-side.
	//   Some more standard things to do with having it represent the dom.attributes internally don't quite seem to be part of
	//     'activate'. 

	// It's kind of a view-model that gets assigned.
	// pre_activate can set up the standard things before activate so that activate has the references set up properly.

	'pre_activate'() {
		//  && !this.__active
		if (typeof document !== 'undefined') {
			//this.__active = true;
			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this) || this.context.map_els[this._id()] || document.querySelectorAll('[data-jsgui-id="' + this._id() + '"]')[0];
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			if (!this.dom.el) {} else {

				// This likely will be covered by pre_activate.
				//   That means it will be called on all controls before activate gets called on any of them.
				//   Activate will be more speicifically about app or programmer specified custom client-side control behaviour.

				// .connect_dom_attributes();

				// See how much of this can be done before the 'activate' function gets called.

				// Maybe all of it.

				this.load_dom_attributes_from_dom();

				// Could use more explicit names for these. 'activate' is taking on a more specific meaning.
				//   It's been decided that 'activate' will take place later in the process, with other things taking place first,
				//   so 'activate' will be higher level and more specific functionality.


				// Want to put these content controls in place in the relevant array / collection.
				
				//this.activate_content_controls();
				this.pre_activate_content_controls();
				this.add_content_change_event_listener();

				// .setup_content_(change_?)listen ???

				this.add_dom_attributes_changes_listener();


				//this.raise('activate');
			}
		} else {}
	}


	'activate' (el) {
		if (typeof document !== 'undefined' && !this.__active) {
			this.__active = true;
			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this) || this.context.map_els[this._id()] || document.querySelectorAll('[data-jsgui-id="' + this._id() + '"]')[0];
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			if (!this.dom.el) {} else {

				// This likely will be covered by pre_activate.
				//   That means it will be called on all controls before activate gets called on any of them.
				//   Activate will be more speicifically about app or programmer specified custom client-side control behaviour.

				//this.load_dom_attributes_from_dom();
				this.activate_content_controls();
				//

				//this.add_content_change_event_listener();
				//this.add_dom_attributes_changes_listener();


				this.raise('activate');
			}
		} else {}
	}
	'add_dom_attributes_changes_listener' () {
		var dom_attributes = this.dom.attributes;
		var el = this.dom.el;
		dom_attributes.on('change', (e_change) => {
			var property_name = e_change.name || e_change.key,
				val = e_change.value || e_change.new;
			if (el && el.nodeType === 1) {
				el.setAttribute(property_name, val);
			}
		});
	}
	'activate_this_and_subcontrols' () {
		//let context = this.context;
		this.iterate_this_and_subcontrols((ctrl) => {
			if (ctrl.dom.el) {

				ctrl.activate();
			}
		});
	}
	'add_content_change_event_listener' () {

		// Maybe not 'activate' exactly.

		// add_content_change_event_listener

		const {
			context
		} = this;
		var map_controls = context.map_controls;
		let el = this.dom.el;
		this.content.on('change', (e_change) => {
			let itemDomEl;
			var type = e_change.name;
			if (type === 'insert') {
				var item = e_change.value;
				var retrieved_item_dom_el = item.dom.el;
				var t_ret = tof(retrieved_item_dom_el);
				if (t_ret === 'string') {
					itemDomEl = retrieved_item_dom_el;
				} else {
					if (retrieved_item_dom_el) {
						itemDomEl = retrieved_item_dom_el;
					}
					if (!itemDomEl) {
						if (context.map_els[item._id()]) {
							itemDomEl = context.map_els[item._id()];
						}
					}
					if (!itemDomEl) {
						var item_tag_name = 'div';
						var dv_tag_name = item.dom.tagName;
						if (dv_tag_name) {
							item_tag_name = dv_tag_name;
						}
						var temp_el;
						if (item_tag_name === 'circle' || item_tag_name === 'line' || item_tag_name === 'polyline') {
							var temp_svg_container = e_change.item.context.document.createElement('div');
							temp_svg_container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + e_change.item.all_html_render() + '</svg>';
							itemDomEl = temp_svg_container.childNodes[0].childNodes[0];
						} else {
							temp_el = e_change.item.context.document.createElement('div');
							temp_el.innerHTML = e_change.item.all_html_render();
							itemDomEl = temp_el.childNodes[0];
						}
						item.dom.el = itemDomEl;
						context.map_els[item._id()] = itemDomEl;
					};
				}
				var t_item_dom_el = tof(itemDomEl);
				if (t_item_dom_el === 'string') {
					itemDomEl = document.createTextNode(itemDomEl);
				}
				if (!itemDomEl) {}
				if (itemDomEl) {
					el.appendChild(itemDomEl);
					e_change.item.register_this_and_subcontrols();
				}
			} else if (type === 'clear') {
				if (el) {
					el.innerHTML = '';
				}
			} else if (type === 'remove') {
				if (e_change.value.dom.el) {
					e_change.value.dom.el.parentNode.removeChild(e_change.value.dom.el);
				}
			} else {
				console.trace();
				throw 'NYI - Unexpected change type. e_change: ' + e_change;
			}
		});
	}
	'rec_desc_ensure_ctrl_el_refs' (el) {
		el = el || this.dom.el;
		var context = this.context;
		if (el) {
			var c, l, cns;
			var jsgui_id;
			var map_els = {};
			dom_desc(el, el => {
				if (el.getAttribute) {
					jsgui_id = el.getAttribute('data-jsgui-id');
					if (jsgui_id) {
						map_els[jsgui_id] = el;
						context.map_els[jsgui_id] = el;
					}
				}
			});
			desc(this, (ctrl) => {
				var t_ctrl = tof(ctrl);
				if (ctrl !== this && t_ctrl === 'control') {
					var id = ctrl._id();
					if (map_els[id]) {
						if (ctrl.dom.el !== map_els[id]) {
							ctrl.dom.el = map_els[id];
						} else {}
					}
					ctrl.activate();
				}
			});
		}
	}
	'rec_desc_activate' () {
		desc(this, ctrl => {
			const t_ctrl = tof(ctrl);
			if (t_ctrl === 'control') {
				ctrl.activate();
			}
		});
	}

	// Maybe they get activated anyway?
	//   Or this activates / loads the fact that these are content controls? And activates them too?
	'activate_content_controls' () {

		// Not so sure about this, as maybe pre_activate would cover it.

		const do_activation = () => {

			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this);
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			const el = this.dom.el;
			if (el) {
				const context = this.context;
				let ctrl_fields = {},
					c, l;
				if (el.getAttribute) {
					
					let cns = el.childNodes;

					// This should be pre-activate as well.

					let content = this.content;
					for (c = 0, l = cns.length; c < l; c++) {
						let cn = cns[c];
						if (cn) {
							let nt = cn.nodeType;
							if (nt === 1) {
								let cn_jsgui_id = cn.getAttribute('data-jsgui-id');
								let cctrl = context.map_controls[cn_jsgui_id];
								let found = false;
								if (cctrl) {
									

									// Maybe do the activate a bit later on...?
									cctrl.activate();
									
								}
							}
							
						}
					}
				}
			} else {
				//console.trace();
				//console.log('missing el');
			}
		}
		do_activation();
		
	}

	// Possibly this should have some of / reference to what is in jsgui3-client.



	'pre_activate_content_controls' () {

		// Reconstruction perhaps....

		// Not so sure about this, as maybe pre_activate would cover it.

		const do_pre_activation = () => {

			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this);
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			const el = this.dom.el;
			if (el) {
				const context = this.context;
				let ctrl_fields = {},
					c, l;
				if (el.getAttribute) {
					let str_ctrl_fields = el.getAttribute('data-jsgui-ctrl-fields');
					if (str_ctrl_fields) {
						ctrl_fields = JSON.parse(str_ctrl_fields.replace(/'/g, '"'));
					}
					let ctrl_fields_keys = Object.keys(ctrl_fields);
					let l_ctrl_fields_keys = ctrl_fields_keys.length;
					let key, value;
					for (c = 0; c < l_ctrl_fields_keys; c++) {
						key = ctrl_fields_keys[c];
						value = ctrl_fields[key];
						this[key] = context.map_controls[value];
					}
					let cns = el.childNodes;

					// This should be pre-activate as well.

					let content = this.content;
					for (c = 0, l = cns.length; c < l; c++) {
						let cn = cns[c];
						if (cn) {
							let nt = cn.nodeType;
							if (nt === 1) {
								let cn_jsgui_id = cn.getAttribute('data-jsgui-id');
								let cctrl = context.map_controls[cn_jsgui_id];
								let found = false;
								if (cctrl) {
									let ctrl_id = cctrl.__id;
									if (ctrl_id) {

										content.each((v, i) => {
											if (v.__id) {
												if (v.__id === ctrl_id) found = true;
											}
										});

									}
									if (!found) {
										//content.add(cctrl);
										content._arr.push(cctrl);
									}
									cctrl.parent = this;

									// Maybe do the activate a bit later on...?
									//cctrl.activate();
									
								}
							}
							if (nt === 3) {
								const i_sibling = c;
								const corresponding_ctrl = content._arr[i_sibling];
								if (corresponding_ctrl) {
									if (corresponding_ctrl.text === cn.nodeValue) {
										corresponding_ctrl.dom.el = cn;
									}
								} else {
									console.log('&&& no corresponding control');
								}
								const do_add = () => {
									let val = cn.nodeValue;
									console.log('adding Text_Node control', val);
									const tn = new Text_Node({
										context: this.context,
										text: val,
										el: cn
									})
									//console.log('content._arr.length', content._arr.length);
									content.add(tn);
								}
							}
						}
					}
				}
			} else {
				//console.trace();
				//console.log('missing el');
			}

		}

		do_pre_activation();

		
	}

	// Assign (most) dom attributes from the html document to the control.

	// load dom attributes (from dom) makes sense.
	// load non-special-case dom attributes from dom.



	'load_dom_attributes_from_dom' () {



		const el = this.dom.el;
		const dom_attributes = this.dom.attributes;
		let item, name, value, i;
		if (el) {
			const attrs = el.attributes;
			if (attrs) {
				const l = attrs.length
				//console.log('attrs l', l);
				for (i = 0; i < l; i++) {
					item = attrs.item(i);
					name = item.name;
					value = item.value;
					if (name === 'data-jsgui-id') {} else if (name === 'data-jsgui-type') {} else if (name === 'style') {
						dom_attributes[name] = value;
					} else if (name === 'class') {
						dom_attributes[name] = value;
					} else {
						dom_attributes[name] = value;
					}
				}
			}
		}
	}
	/*
	'attach_dom_events' () {
		console.trace();
		throw 'stop - look into this';
		each(this._bound_events, (handlers, name) => {
			each(handlers, handler => {
				this.add_dom_event_listener(name, handler);
			});
		});
	}
	*/
	'_search_descendents' (search) {
		const recursive_iterate = (ctrl, item_callback) => {
			const content = ctrl.content,
				t_content = tof(content);
			if (t_content === 'collection') {
				if (content.length() > 0) {
					content.each((item, i) => {
						item_callback(item);
						recursive_iterate(item, item_callback);
					})
				}
			}
		}
		const arr_matching = [];
		recursive_iterate(this, (item) => {
			const item_type = item.__type_name;
			if (item_type === search) {
				arr_matching.push(item);
			} else {}
		});
		return arr_matching;
	}
	'_search_ancestor' (search) {
		const parent = this.parent;
		if (parent) {
			if (parent === search) {
				return true;
			} else {
				if (typeof parent.ancestor === 'function') {
					return parent.ancestor(search);
				}
			}
		} else {
			return false;
		}
	}
	'add' (new_content) {
		const {
			context
		} = this;

		if (context) {

			const m = context.map_controls_being_added_in_frame = context.map_controls_being_added_in_frame || {};
			const tnc = tof(new_content);
			if (tnc === 'array') {
				each(new_content, (v) => {
					const candd = v.this_and_descendents;
					if (candd) {
						each(candd, ctrl => {
							if (ctrl._id) {
								m[ctrl._id()] = ctrl;
							}
						})
					}
				});
			} else {
				if (new_content) {
					const candd = new_content.this_and_descendents;
					if (candd) {
						each(candd, ctrl => {
							if (ctrl._id) {
								m[ctrl._id()] = ctrl;
							}
						})
					}
				}
			}

		}
		return super.add(new_content);
	}
	'clear' () {
		const {
			context
		} = this;
		context.map_controls_being_removed_in_frame = context.map_controls_being_removed_in_frame || {};
		each(this.descendents, ctrl => {
			if (ctrl._id) context.map_controls_being_removed_in_frame[ctrl._id()] = ctrl;
		});
		super.clear();
	}
};
let p = Control.prototype;
p.on = p.add_event_listener;
p.off = p.remove_event_listener;
module.exports = Control;