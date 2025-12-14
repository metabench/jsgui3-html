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
const gfx = require('jsgui3-gfx-core');
const {Rect} = gfx;


// Or can't load them at the very start?

//const mixins = require('../control_mixins/mx');
//const {model_data_view_compositional_representation} = mixins;

const model_data_view_compositional_representation = require('../control_mixins/model_data_view_compositional_representation');

// Need to be able to load / access the mixins here.
//   Need to avoid circular references. Therefore mixins can't use this module.
//     Or not directly?
//       Mixins do seem to need to be able to do things such as create controls.


//console.trace();
//throw 'stop';

// Maybe have a 'mixins available' event somewhere.





const desc = (ctrl, callback) => {
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
class Control extends Control_Core {
	constructor(spec, fields) {
		spec = spec || {};
		super(spec, fields);
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

			// Not so sure about putting it in the spec rather than applying it to the control.
			//   Or keeping these persisted properties to apply later?

			// ctrl._persisted_fields perhaps?
			//   then can assign those persisted fields once the mixins have been initialised.




			var jgf = spec.el.getAttribute('data-jsgui-fields');
			if (jgf) {
				//console.log('jgf', jgf);
				this._persisted_fields = this._persisted_fields || {};
				var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, '\'');
				s_pre_parse = s_pre_parse.replace(/\'/g, '"');
				var props = JSON.parse(s_pre_parse);
				//console.log('props', props);
				let exempt_prop_names = {}
				each(props, (v, i) => {
					if (exempt_prop_names[i]) {} else {
						//spec[i] = v;
						this._persisted_fields[i] = v;

						// maybe apply those fields after the mixins have been set up.
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
		}
		this.view.ui.compositional.on('change', e => {
			const {name} = e;
			if (name === 'model') {
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
		this.content.clear();
		this.compose_using_compositional_model();
	}
		compose_using_compositional_model() {
			let cm;
			const {context} = this;
			if (this.view.ui.compositional.model) {
				cm = this.view.ui.compositional.model;
			}
			const tcm = tof(cm);
			const compose_from_compositional_model_array = (arr_cm) => {
				const l = arr_cm.length;
				if (l > 0) {
					for (let c = 0; c < l; c++) {
						const composition_item = arr_cm[c];
						const tci = tof(composition_item);
						if (tci === 'function') {
							const ctrl = new composition_item({context});
							this.add(ctrl);
						} else if (tci === 'control') {
							if (!composition_item.context) composition_item.context = context;
							this.add(composition_item);
						} else if (tci === 'string' || tci === 'number' || tci === 'boolean') {
							this.add('' + composition_item);
						} else if (tci === 'array') { 
							if (composition_item.length === 2) {
								const [t0, t1] = [tof(composition_item[0]), tof(composition_item[1])];
								if (t0 === 'function' && t1 === 'object') {
									const ctrl_spec = composition_item[1];
									ctrl_spec.context = ctrl_spec.context || context;
									const ctrl = new composition_item[0](ctrl_spec);
									this.add(ctrl);
								} else if (t0 === 'string' && t1 === 'function') {
									const ctrl = new composition_item[1]({context});
									this.add(ctrl);
									this._ctrl_fields = this._ctrl_fields || {};
									this._ctrl_fields[composition_item[0]] = ctrl;
									this[composition_item[0]] = ctrl;
								} else if (t0 === 'string' && t1 === 'control') {
									const ctrl = composition_item[1];
									if (!ctrl.context) ctrl.context = context;
									this.add(ctrl);
									this._ctrl_fields = this._ctrl_fields || {};
									this._ctrl_fields[composition_item[0]] = ctrl;
									this[composition_item[0]] = ctrl;
								} else {
									throw new Error('compose_using_compositional_model: Unsupported composition item (length 2)');
								}
							} else if (composition_item.length === 3) {
								const [t0, t1, t2] = [tof(composition_item[0]), tof(composition_item[1]), tof(composition_item[2])];
								if ((t0 === 'string') && (t1 === 'function') && t2 === 'object') {
									const ctrl_spec = composition_item[2];
									ctrl_spec.context = ctrl_spec.context || context;
									const ctrl = new composition_item[1](ctrl_spec);
									this.add(ctrl);
									this._ctrl_fields = this._ctrl_fields || {};
									this._ctrl_fields[composition_item[0]] = ctrl;
									this[composition_item[0]] = ctrl;
								} else if ((t0 === 'string') && (t1 === 'control') && t2 === 'object') {
									const ctrl = composition_item[1];
									if (!ctrl.context) ctrl.context = context;
									this.add(ctrl);
									this._ctrl_fields = this._ctrl_fields || {};
									this._ctrl_fields[composition_item[0]] = ctrl;
									this[composition_item[0]] = ctrl;
								} else {
									throw new Error('compose_using_compositional_model: Unsupported composition item (length 3)');
								}
							} else {
								throw new Error('compose_using_compositional_model: Unsupported composition item length: ' + composition_item.length);
							}
						}
					}
				}
			}
			if (tcm === 'array') {
			compose_from_compositional_model_array(cm);
		}
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
	'bcr' () {
		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);
		if (sig === '[]') {
			var el = this.dom.el;
			var bcr = el.getBoundingClientRect();
			const res_rect = new Rect([bcr.width, bcr.height], [bcr.left, bcr.top]);
			return res_rect;
		} else if (sig === '[a]') {
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
				if (!has_window) return;
				if (!this.dom.el) return;
				const parse_px = (value) => {
					const parsed = parseFloat(value);
					return Number.isFinite(parsed) ? parsed : 0;
				};
				const left = parse_px(this.computed_style('border-left-width') || 0);
				const top = parse_px(this.computed_style('border-top-width') || 0);
				const right = parse_px(this.computed_style('border-right-width') || 0);
				const bottom = parse_px(this.computed_style('border-bottom-width') || 0);
				return [left, top, right, bottom];
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
	}
	'remove_event_listener' () {
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
	'pre_activate'() {
		if (typeof document !== 'undefined') {
			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this) || this.context.map_els[this._id()] || document.querySelectorAll('[data-jsgui-id="' + this._id() + '"]')[0];
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			if (!this.dom.el) {} else {
				this.load_dom_attributes_from_dom();

				//  reconstruct a special .view.data.model.mixins collection from the dom attributes.
				//    collection seems logically best - though collection may be redone soon.

				if (this.dom.attributes["data-jsgui-mixins"] !== undefined) {
					const str_mixins = this.dom.attributes["data-jsgui-mixins"]?.replace(/'/g, '"');
					if(str_mixins) {
						const o_mixins = JSON.parse(str_mixins);
						//this.view.data.model.mixins.clear();
						//each(mixins, mixin => {
						//	this.view.data.model.mixins.push(mixin);

						//console.log('o_mixins', o_mixins);

						const old_silent = this.view.data.model.mixins.silent;

						// .silently(cb) function could be one way to do these things.

						this.view.data.model.mixins.silent = true;
						//});
						//console.log('o_mixins', o_mixins);

						each(o_mixins, (mixin) => {
							const {name, options} = mixin;

							const converted_name = name.replace(/-/g, '_');

							//console.log('mixin', mixin);

							//console.log('mixin converted_name', converted_name);

							// and run the mixin here???

							this.view.data.model.mixins.push(mixin);

							const the_mixin = this.context.mixins[converted_name];

							//console.log('!!the_mixin', !!the_mixin);

							if (the_mixin) {
								the_mixin(this);
							}

							// And add this back to the view data model??



						});

						this.view.data.model.mixins.silent = old_silent;

						// Set it back up in the view.data.model.mixins collection.


					}
				}

				if (this._persisted_fields) {
					each(this._persisted_fields, (v, i) => {
						this[i] = v;
					});
				}

				if (this.dom.attributes["data-jsgui-data-model-id"] !== undefined) {
					const context_referenced_data_model = this.context.map_data_models[this.dom.attributes["data-jsgui-data-model-id"]];
					if (context_referenced_data_model) {
						this.data.model = context_referenced_data_model;
						console.log('have used data.model referenced from context: ' + context_referenced_data_model.__id);
					}
				}
				this.pre_activate_content_controls();
				this.add_content_change_event_listener();
				this.add_dom_attributes_changes_listener();
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
				this.activate_content_controls();

				// activate / load the mixins from the view model of them...???

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
		this.iterate_this_and_subcontrols((ctrl) => {
			if (ctrl.dom.el) {
				ctrl.activate();
			}
		});
	}
	'add_content_change_event_listener' () {
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
					if (el) {
						el.innerHTML = '';
						this.content.each(item => {
							let item_dom_el;
							if (item instanceof Text_Node) {
								item_dom_el = document.createTextNode(item.text || '');
								item.dom.el = item_dom_el;
							} else {
								const retrieved_item_dom_el = item.dom && item.dom.el;
								if (retrieved_item_dom_el) {
									item_dom_el = retrieved_item_dom_el;
								} else if (item && typeof item.all_html_render === 'function') {
									let item_tag_name = 'div';
									const dv_tag_name = item.dom && item.dom.tagName;
									if (dv_tag_name) item_tag_name = dv_tag_name;
									let temp_el;
									if (item_tag_name === 'circle' || item_tag_name === 'line' || item_tag_name === 'polyline') {
										const temp_svg_container = context.document.createElement('div');
										temp_svg_container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + item.all_html_render() + '</svg>';
										item_dom_el = temp_svg_container.childNodes[0].childNodes[0];
									} else {
										temp_el = context.document.createElement('div');
										temp_el.innerHTML = item.all_html_render();
										item_dom_el = temp_el.childNodes[0];
									}
									item.dom.el = item_dom_el;
									if (item._id && typeof item._id === 'function') {
										context.map_els[item._id()] = item_dom_el;
									}
								}
							}
							const t_item_dom_el = tof(item_dom_el);
							if (t_item_dom_el === 'string') {
								item_dom_el = document.createTextNode(item_dom_el);
							}
							if (item_dom_el) {
								el.appendChild(item_dom_el);
								if (item && typeof item.register_this_and_subcontrols === 'function') {
									item.register_this_and_subcontrols();
								}
							}
						});
					}
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
	'activate_content_controls' () {
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
									cctrl.activate();
								}
							}
						}
					}
				}
			} else {
			}
		}
		do_activation();
	}
	'pre_activate_content_controls' () {
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
										content._arr.push(cctrl);
									}
									cctrl.parent = this;
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
									content.add(tn);
								}
							}
						}
					}
				}
			} else {
			}
		}
		do_pre_activation();
	}
	'load_dom_attributes_from_dom' () {
		const el = this.dom.el;
		const dom_attributes = this.dom.attributes;
		let item, name, value, i;
		if (el) {
			const attrs = el.attributes;
			if (attrs) {
				const l = attrs.length
				for (i = 0; i < l; i++) {
					item = attrs.item(i);
					name = item.name;
					value = item.value;

					/*
					if (name === 'data-jsgui-id') {} else if (name === 'data-jsgui-type') {} else if (name === 'style') {
						dom_attributes[name] = value;
					} else if (name === 'class') {
						dom_attributes[name] = value;
					} else {
						dom_attributes[name] = value;
					}
						*/

					dom_attributes[name] = value;
				}
			}
		}
	}
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
