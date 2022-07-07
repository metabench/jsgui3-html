/**
 * Created by James on 16/09/2016.
 */
// Functions to load a few of the most common functions as local variables
var jsgui = require('lang-tools');

const {
	get_a_sig,
	each,
	tof,
	def
} = jsgui;
//var is_ctrl = jsgui.is_ctrl;
const v_subtract = jsgui.util.v_subtract;

const {
	prom_or_cb
} = require('fnl');

const Text_Node = require('./text-node');

/*
var get_a_sig = jsgui.get_a_sig,
	fp = jsgui.fp,
	each = jsgui.each;
	*/
var Control_Core = require('./control-core');

// need Text_Node

//var Resize_Handle = require('../controls/resize-handle')
//var tof = jsgui.tof;
//const def = jsgui.is_defined;

//const mx_selectable = require('../control_mixins/selectable');
//const mx_fast_touch_click = require('../control_mixins/fast-touch-click');


// Need reference to text_node.

const has_window = typeof window !== 'undefined';

var desc = (ctrl, callback) => {
	if (ctrl.get) {
		var content = ctrl.get('content');
		if (content) {
			var t_content = typeof content;
			//console.log('t_content', t_content);

			if (t_content === 'string' || t_content === 'number') {

			} else {
				// it's a Collection

				var arr = content._arr;
				var c, l = arr.length;

				//console.log('l', l);
				var item, t_item;

				for (c = 0; c < l; c++) {
					item = arr[c];
					t_item = typeof item;
					if (t_item === 'string' || t_item === 'numbers') {

					} else {
						callback(arr[c]);
						desc(arr[c], callback);
					}
				}
			}
		}
		//console.log('content', content);
	}
}

var dom_desc = (el, callback) => {
	// Possibly need to look at the element's node type.
	callback(el);
	var cns = el.childNodes;
	var l = cns.length;
	for (var c = 0; c < l; c++) {
		dom_desc(cns[c], callback);
	}
}

const mapDomEventNames = {
	//'change': true,

	'change': true,
	'click': true,
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

// Maybe could have the view raise events (likely DOM events) for the controller.
//   A differentiation between view and non-view events could help.


class Control extends Control_Core {
	//'fields': {
	//	'selection_scope': Object,
	//	'is_selectable': Boolean,
	//	'scrollbars': String
	//},

	constructor(spec, fields) {
		// The enhanced control can look at the element for data-jsgui-fields
		//  Those fields will be fed back into the initialization.

		//console.log('* fields', fields);
		//throw 'stop';
		spec = spec || {};

		super(spec, fields);

		// Id as part of the view as well???
		//   Probably not.


		if (spec.id) {
			this.__id = spec.id;
		}
		if (spec.__id) {
			this.__id = spec.__id;
		}
		if (spec.__type_name) {
			this.__type_name = spec.__type_name;
		}
		//mx_selectable(this);


		// DOM events are part of the view.
		this.map_raises_dom_events = {};

		// Can we add functions to a post-construction queue?
		//  Or would settimeout be OK for this even?

		// No, prefer doing this after construction of other parts that can respond to values being set.
		//  setTimeout is too far into the future.
		// Once active may be enough?
		//  Really we want pre activation but right at the end of the construction.
		//   Would not always be activated anyway, don't want to assume activation always happens.

		// After the construction of the subcontrols? Control gets ceded to them normally.

		// Or loading the field values is a fairly early stage but needs more specific care?
		//  Really needs to be done after all of the subclasses' constructors.
		//   Hard right now to indicate when the subclass's constructor is complete.

		// Maybe read values back into the spec?



		//const do_after_construction = () => {
			if (spec.el) {

				// Control_HTML_Node_View ???

				// Create the .view object as a Control_HTML_Element_View

				var jgf = spec.el.getAttribute('data-jsgui-fields');
	
				if (jgf) {
					var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, '\'');
					s_pre_parse = s_pre_parse.replace(/\'/g, '"');
					var props = JSON.parse(s_pre_parse);
	
					let exempt_prop_names = {
						//'selection_scope': true
					}
					//let props_to_apply = {};
	
					// hmmm can this be done later on, once the getter / setters have been set up?
					//  as in, in after_constructor function.
	
	
	
					each(props, (v, i) => {
						if (exempt_prop_names[i]) {
	
						} else {
							//props_to_apply[i] = v;

							//this[i] = v;
							spec[i] = v;

							//console.log('field apply i', i);
							//console.log('field apply v', v);
							// Should have been applied...
						}
					});
				}
			}
		//}
		//setTimeout(do_after_construction, 0);

		if (spec.el) {

			/*
			var jgf = spec.el.getAttribute('data-jsgui-fields');

			if (jgf) {
				var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, '\'');
				s_pre_parse = s_pre_parse.replace(/\'/g, '"');
				var props = JSON.parse(s_pre_parse);

				let exempt_prop_names = {
					//'selection_scope': true
				}
				//let props_to_apply = {};

				// hmmm can this be done later on, once the getter / setters have been set up?
				//  as in, in after_constructor function.



				each(props, (v, i) => {
					if (exempt_prop_names[i]) {

					} else {
						//props_to_apply[i] = v;
						this[i] = v;
						console.log('field apply i', i);
						console.log('field apply v', v);
						// Should have been applied...
					}
				});
			}
			*/

			// view.context???
			//   or the view shares the context?

			// Probably the control will keep control.context.
			//   Not sure....
			//   Moving it to the view but keeping it as a property on control would make sense.

			// Selection scope is part of the view as well.

			if (def(this.selection_scope)) {
				this.selection_scope = this.context.new_selection_scope(this);
			}

			var tn = spec.el.getAttribute('data-jsgui-type');
			if (tn) this.__type_name = tn;

			var id = spec.el.getAttribute('data-jsgui-id');
			if (id) this.__id = id;
		}
	}
	'ctrls'(obj_ctrls) {

		// Registered internal controls.
		//   This is really about adding internal controls.
		//     Internal controls being part of the view???
		//       Practically everything seems part of the view.
		//       May have some kinds of events or hooks which are clearly part of .controller.
		//         The control itself seems like .controller.
		//           Not sure what kinds of upgrades could take place on .controller.
		//             Maybe it could make useful (short to call) functions available.
		//               Functions with power over both the .model and .view.





		// Another way of doing it.
		// It's not a control, it's a different type of object.
		// .is_control returning true for all controls.
		//nu(Constructor, spec)

		// Taking it as a name as well.
		//  Constructors are registered by name.
		//   Can add the context and create the spec from the attributes.

		//  and therefore can add .context itself
		// other objects - [Control_Constructor, spec]


		// ctrl_fields definitely seem like part of the view as they are for rendering there in HTML.
		this._ctrl_fields = this._ctrl_fields || {};
		let cf = this._ctrl_fields;
		each(obj_ctrls, (ctrl, name) => {
			//console.log('name', name);
			cf[name] = this[name] = ctrl;
			this.add(ctrl);
		});
		return this;
	}

	'bcr'() {


		// Clearly view or even DOM view.

		// ctrl.dom.bcr perhaps.



		//console.log('sig', sig);
		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);
		if (sig === '[]') {
			var el = this.dom.el;
			var bcr = el.getBoundingClientRect();
			var res = [
				[bcr.left, bcr.top],
				[bcr.right, bcr.bottom],
				[bcr.width, bcr.height]
			];
			return res;
		}
		if (sig === '[a]') {
			//console.log('bcr sig arr');
			/*
			var bcr_def = a[0];
			var pos = bcr_def[0];
			var br_pos = bcr_def[1];
			var size = bcr_def[2];
			*/

			let [pos, br_pos, size] = a[0];
			// then we actually want to set the css.
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

		// will be view.size
		//   programatically defined size property. Not sure about mixin(s). They could provide further / enhanced sizing functionality.
		//   want some basics as part of view.

		if (this._size) {
			return this._size;
		} else {
			// read it from the dom..
			//console.log('this.dom.el', this.dom.el);
			if (this.dom.el) {
				var bcr = this.dom.el.getBoundingClientRect();
				return [bcr.width, bcr.height];
			}
		}
	}



	// Clearly HTML DOM view.
	//   Possibly want a model, containing a string, then a control that's for displaying (or editing) text.
	'add_text'(value) {
		
		console.log('add_text', value);
		console.trace();
		var tn = new Text_Node({
			'context': this.context,
			'text': value + ''
		})
		this.add(tn);
		return tn;
	}

	// Clealy view, dom
	'computed_style'() {
		var a = arguments;
		a.l = a.length;
		var sig = get_a_sig(a, 1);
		var y;
		if (sig == '[s]') {
			// Should only work on the client.
			var property_name = a[0];
			var el = this.dom.el;
			if (el.currentStyle)
				y = el.currentStyle[styleProp];
			else if (window.getComputedStyle)
				y = document.defaultView.getComputedStyle(el, null).getPropertyValue(property_name);
			return y;
		}
	}
	// Likely to be within the core.
	//  Meaning it's not done with progressive enhancement.

	// Again looks like CSS convenience function. Likely remove from control-enh.
	//   view / display properties.   .view.padding may be better?
	//     though can make .padding appear directly on the control, defined property access.

	'padding'() {
		var a = arguments; a.l = a.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {

			var left, top, right, bottom;

			var c_padding = this.computed_style('padding');
			//console.log('c_padding', c_padding);

			var s_c_padding = c_padding.split(' ');
			//console.log('s_c_padding.length', s_c_padding.length);

			if (s_c_padding.length == 3) {
				// top, right, bottom
				top = parseInt(s_c_padding[0], 10);
				right = parseInt(s_c_padding[1], 10);
				bottom = parseInt(s_c_padding[2], 10);
				return [0, top, right, bottom];
			}
		}
	}

	// should be properties rather than functions. In core.
	'border'() {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {

			var left, top, right, bottom;

			var c_border = this.computed_style('border');
			console.log('c_border', c_border);

			throw 'stop';
		}
	}
	// Probably remove / do somehow else.
	'border_thickness'() {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var left, top, right, bottom;

			var c_border = this.computed_style('border');
			//console.log('c_border', c_border);
			//var s_c_border = c_border.split(' ');
			//console.log('s_c_border', s_c_border);
			// Can't really split it by space.
			//  some of the terms in the bracket include a space.
			//  could first do a regex to change ', ' to ','

			var b2 = c_border.split(', ').join('');
			var s_c_border = b2.split(' ');
			//console.log('s_c_border', s_c_border);
			// then can get the thickness from the first one.
			var thickness = parseInt(s_c_border[0], 10);
			// the 4 different thicknesses?
			return thickness;
		}
	}

	// Also more likely to return as a mixin.
	/*
	'ghost'() {

	}
	*/

	// one mousedown elsewhere.

	// Special case for when part of a control has been made into a popup?

	// Need to trace back through the DOM and control heirachy to see if the click has occurred in a part that was moved to the document body.
	//  Should be able to mark an inner control as belonging to a control. inner_to

	// One mousedown elsewhere... needs to respond to all body events, while checking to see if the event originates from within this control.
	//  Relies on tracing back through the DOM to see if a DOM node is connected to this control, or an inner part of it.

	/*

	'one_mousedown_elsewhere'(callback) {
		var body = this.context.body();
		var fn_mousedown = (e_mousedown) => {
			// Maybe see if it's internal or external to the control
			// Would be good to have that in the event.

			var el = this.dom.el;
			var e_el = e_mousedown.srcElement || e_mousedown.target;
			//console.log('one mousedown', e_mousedown);
			//console.log('e_el', e_el);
			// Want to see if the element clicked on is a descendant of this's el.
			// is_contained_by
			var iao = this.is_ancestor_of(e_el);
			//console.log('iao', iao);
			e_mousedown.within_this = iao;
			if (!iao) {
				// raise the callback, disconnect the event.
				//console.log('pre body off');
				body.off('mousedown', fn_mousedown);
				callback(e_mousedown);
			}
		}
		body.on('mousedown', fn_mousedown);
	}
	// one_click_anywhere
	*/


	// this may go into a mixin that detects touch events outside a control.
	//  for doing things such as closing popup lists when elsewhere is clicked.
	//  touch-outside mixin, and can set it up for 'once' or 'one'.

	// touch-outside mixin will allow for using 'one' to check for just a single event.
	//  likely a bit more customised adding and removing such functionality.

	// the mixin returns an object which enables to to be enabled / disabled or turned on and off?
	//  press outside mixin....

	// Yes, press outside mixin will be very useful for a variety of popups, eg dorp down lists and context menus.


	/*
	'one_mousedown_anywhere'(callback) {
		//var ctrl_html_root = this.context.ctrl_document;
		//console.log('this.context', this.context);
		var body = this.context.body();
		//var that = this;
		body.one('mousedown', (e_mousedown) => {
			var el = this.dom.el;
			var e_el = e_mousedown.srcElement || e_mousedown.target;
			var iao = this.is_ancestor_of(e_el);
			e_mousedown.within_this = iao;
			callback(e_mousedown);
		});
	}
	*/


	// Better with mixin I think.
	//  Still required by selection_box_host. investigate there.
	//  A mixin could likely be a better place / do the job better.

	// Maybe drag_events could be undernieth the draggable mixin.

	/*
	'drag_events'(hmd, hmm, hmu) {
		// screen x rather than page x
		//let md, mm, mu;
		let body = this.context.body();
		let md_pos, mm_pos, mu_pos, mm_offset, mu_offset;

		// may need to deal with scrolling differently somewhere.

		// bcr could become something that gets the absolute positions within documents, not the screen positions.

		let mm = emm => {
			// movement offset

			emm.pos = mm_pos = [emm.pageX, emm.pageY];
			emm.offset = mm_offset = v_subtract(mm_pos, md_pos);
			//console.log('mm_offset', mm_offset);
			hmm(emm);
		}
		let mu = emu => {
			emu.pos = mu_pos = [emu.pageX, emu.pageY];
			emu.offset = mu_offset = v_subtract(mu_pos, md_pos);
			body.off('mousemove', mm);
			body.off('mouseup', mu);
			hmu(emu);
		}
		this.on('mousedown', emd => {
			// page offset

			emd.offset = md_pos = [emd.offsetX, emd.offsetY];
			emd.pos = md_pos = [emd.pageX, emd.pageY];

			if (hmd(emd) === false) {

			} else {
				body.on('mousemove', mm);
				body.on('mouseup', mu);
			};
		});
		// mouse up anywhere
		// mouse move anywhere with the button not pressed.
		//return [md, mm, mu];
	}
	*/


	// Activation of dynamically added content

	//   Again looks like it should be within .view and specific to HTML DOM Element controls.

	'activate_recursive'() {
		//console.log('activate_recursive');
		var el = this.dom.el;
		var context = this.context;
		var map_controls = context.map_controls;
		var parent_control;
		// does the control have a DOM node?
		recursive_dom_iterate_depth(el, el2 => {
			//console.log('el ' + el);
			const nt = el2.nodeType;
			//console.log('nt ' + nt);
			if (nt == 1) {
				var jsgui_id = el2.getAttribute('data-jsgui-id');
				//console.log('jsgui_id ' + jsgui_id);
				if (jsgui_id) {
					// Not so sure the control will exist within a map of controls.
					//  If we have activated the whole page, then they will exist.
					//  However, we may just want to do activate on some controls.
					//throw 'stop';
					var ctrl = map_controls[jsgui_id];
					//console.log('jsgui_id', jsgui_id);
					//console.log('!!ctrl', !!ctrl);
					if (!ctrl.__active) ctrl.activate(el2);
				}
			}
		})
	}

	// Just does the DOM part.
	//  Perhaps could be made into a Mixin?
	//    Dom events mixin perhaps? For views.

	// Consider view mixins rather than control mixins.
	//   Or that the mixins will tarket the view(s).

	'add_dom_event_listener'(event_name, fn_handler) {
		if (has_window) {

			const {context} = this;
			const el = this.dom.el;

			// Mapping from the given function to its handler does indeed seem useful.
			//  Better by far than amending the fn_handler. 
			//  Need to be able to remove the same function that was added to the DOM.

			// see if we have the fn_handler mapped to its outer_handler.
			// map of handlers to outer handlers.

			const m = this.map_handlers_to_outer_handlers = this.map_handlers_to_outer_handlers || new Map();
			let outer_handler;

			//console.log('has_window', has_window);

			// Not sure why ctrl_target could / would be wrong on iOS...?

			if (m.has(fn_handler)) {
				outer_handler = m.get(fn_handler);
			} else {
				outer_handler = e => {
					// Can target be wrong within the event?
					const {target} = e;

					const jid = target.getAttribute('data-jsgui-id');
					if (jid) {
						e.ctrl_target = context.map_controls[jid];
					}
					fn_handler(e);
				};
				//console.log('map setting outer handler', event_name);
				m.set(fn_handler, outer_handler);
			}

			if (el) {

				// A map of the outer handlers to the inner handlers?
				//  

				// Return the outer handler?
				//  Need a way to remove it while referring to the original function.

				// A Map object? (actual one);

				// Can't remove a wrapped function so easily.
				//  Best to find a way to do it.

				//  ES6 map object probably does look like the best tool for this job.
				// an array of pairings could work as well.
				//  And the pairings are arranged in a map by name too.

				// A map of the outer / handler functions?


				// Handler function created for every add_dom_event_listener.
				
				// Maybe worth getting rid of the handler function (at this stage)
				//  and making the .ctrl_target feature appear elsewhere (prob on higher level).

				// Though this handler in here is very convenient because of the ctrl_target.

				// Easier construction of advanced handler functions?
				//  Or do get into function amendments. 

				/*
				const fn_outer_handler = e => {
					const {target} = e;
					const jid = target.getAttribute('data-jsgui-id');
					if (jid) {
						e.ctrl_target = context.map_controls[jid];
					}
					fn_handler(e);
				};
				*/
				//fn_outer_handler.event_inner = fn_handler;

				// fn_handler.outer?
				//  not so keen on changing / amending the function given.
				// Need to still be able tounbind the function.
				el.addEventListener(event_name, outer_handler, false);
			}
		}
			// ignore if not in the browser?
		
	}

	'remove_dom_event_listener'(event_name, fn_handler) {

		if (has_window) {
			//console.log('remove_dom_event_listener event_name', event_name);

			// other part deals with the bound events
			const m = this.map_handlers_to_outer_handlers;
			//console.log('m', m);
			let outer_handler;
			if (m) {
				//console.log('m.has(fn_handler)', m.has(fn_handler));
				if (m.has(fn_handler)) {
					//console.log('has outer handler.');
					outer_handler = m.get(fn_handler);
				}
			}
			outer_handler = outer_handler || fn_handler;
			const el = this.dom.el;
			if (el) {
				el.removeEventListener(event_name, outer_handler, false);
			}
		}

		// TODO: Best to remove this fairly soon.
		const old_way = () => {
			// Do we even need to access this listener?
			var listener = this._bound_events[event_name];
			// array of them... not sure this is the best way for dealing with the DOM side of things.
			//   could be a listener array....

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
				//console.log('control-enh remove_dom_event_listener');
				var t_listener = tof(listener);
				let tfnh;
				//console.log('fn_handler.event_inner', fn_handler.event_inner);
				//console.log('fn_handler', fn_handler);
				//console.log('t_listener', t_listener);

				//tfnh = fn_handler.event_inner || fn_handler;
				tfnh = fn_handler;

				// Just remove the function handler from the dom element?
				//  That's it here?

				if (t_listener === 'array') {
					//console.log('listener.length', listener.length);
					let c_removed = 0;
					each(listener, (listener) => {
						// Match the listener to the outer handler?
						//  As the element has been given an outer handler rather than the listener function itself.
						//   Best not to set any properties of the function itself. Could mess up using that function again.
						// only if its that specific handler?
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


	// The multi-layer event listerner system could work well.
	//   Control events.
	//     Possibly raise on .controller object?





	// Need to remove event listener from the DOM as well.

	'remove_event_listener'() {
		const a = arguments;
		//a.l = arguments.length;
		const sig = get_a_sig(a, 1);
		//console.log('');
		//console.log('control-enh remove_event_listener sig', sig);
		if (sig === '[s,f]') {
			let [event_name, fn_handler] = a;
			//console.log('event_name', event_name);
			//console.log('!!mapDomEventNames[event_name]', !!mapDomEventNames[event_name]);
			if (mapDomEventNames[event_name]) {
				//console.log('pre remove dom event listener');
				this.remove_dom_event_listener(event_name, fn_handler);
			}
			Control_Core.prototype.remove_event_listener.apply(this, a);
		} else if (sig === '[o]') {
			each(a[0], (v, i) => {
				//console.log('vk_pair', vk_pair);
				this.remove_event_listener(i, v);
			});
		}
	}

	'add_event_listener'() {
		const a = arguments;
		const l = a.length;
		const sig = get_a_sig(a, 1);
		if (l === 1) {
			each(a[0], (v, i) => {
				//console.log('vk_pair', vk_pair);
				this.add_event_listener(i, v);
			});
		}
		if (l === 2) {
			//this._super.apply(this, a);
			super.add_event_listener(a[0], a[1]);
		}
		if (l === 3) {
			//this._super.apply(this, [a[0], a[2]]);
			super.add_event_listener(a[0], a[2]);
		}
		// then if it appears in the dom events, attach it.
		if (sig === '[s,f]' || sig === '[s,b,f]') {
			let event_name = a[0];
			let using_dom = true;
			if (l === 3 && a[1] === false) using_dom = false;
			//console.log('using_dom', using_dom);
			let fn_handler;
			if (l === 2) fn_handler = a[1];
			if (l === 3) fn_handler = a[2];
			if (mapDomEventNames[a[0]] && using_dom) {
				this.add_dom_event_listener(event_name, fn_handler);
				//super.add_event_listener.apply(that, arguments);
			}
		}
	}

	// likely will be within a mixin ie popup / overlay
	//  functionality elsewhere that will get added to controls, not within the control prototype.

	/*
	'pop_into_body'() {
		// Changed to using overlay layer. Maybe a mixin too.... Removing 30/07/2019
		this.show();
		var bcr = this.bcr();
		// Maybe need to make it visible first.

		var pos = bcr[0];
		var left = pos[0];
		var top = pos[1];
		//console.log('bcr', JSON.stringify(bcr));

		this.style({
			'position': 'absolute',
			'left': left + 'px',
			'top': top + 'px',
			'z-index': 10000
		});
		document.body.appendChild(this.dom.el);
	}
	*/
	// not recursive
	//  maybe call activate_individual?
	//
	// Looks like reviewing / simplifying the activation code (again) will be necessary.

	// maybe will use on activate instead.

	// An activation mixin perhaps even?
	//   And it actually looks like it activates the HTML views.


	'once_active'(cb) {
		// maintain a list of once active callbacks...
		if (typeof document !== 'undefined') {
			return prom_or_cb((solve, jettison) => {
				//console.log('once_active this.__active', this.__active);
				if (this.__active) {
					solve();
				} else {
					let fn_activate = () => {
						//console.log('been activated');
						solve();
						setTimeout(() => {
							this.off('activate', fn_activate);
						}, 0)
					}
					//fn_activate.key = Math.random();
					// 'one' deactivates the key
					this.on('activate', fn_activate);
				}
			}, cb);
		}
	}

	'activate'(el) {

		//console.log('ctrl-enh activate', this);

		//if (document) {

		//}
		// Should really activate with a dom element.
		if (typeof document !== 'undefined' && !this.__active) {
			//console.log('proceeding');
			this.__active = true;	

			//console.log('!!this.dom.el', !!this.dom.el);

			if (!this.dom.el) {
				let found_el = this.context.get_ctrl_el(this) || this.context.map_els[this._id()] || document.querySelectorAll('[data-jsgui-id="' + this._id() + '"]')[0];
				//console.log('found_el', found_el);
				if (found_el) {
					this.dom.el = found_el;
				}
			}
			//var el = this.dom.el;

			//console.log('!!this.dom.el', !!this.dom.el);

			if (!this.dom.el) {
				//console.log('no el, this', this);
				//console.trace();
				//throw 'expected el'

				// timeout and retry? max retries too?

			} else {
				//requestAnimationFrame(() => {

				// Seems like it should run for the body?

				//console.log('pre running the 4 sub-activate fns', this);

				this.activate_dom_attributes();
				this.activate_content_controls();
				this.activate_content_listen();
				this.activate_other_changes_listen();

				//console.log('post running the 4 sub-activate fns', this);

				/*
				// This disables mobile UI events eg scroll, set focus. 
				if ('ontouchstart' in document.documentElement) {
					mx_fast_touch_click(this);
				}
				*/
				//console.log('this.selectable', this.selectable);
				/*
				if (def(this.selectable)) {
					//console.log('activating mx_selectable');
					//mx_selectable(this);
				}
				*/
				//console.log('pre raise activate');
				this.raise('activate');

				// context body function not working?

				//})

			}
		} else {
			//console.log('not proceeding');
			//console.log('this.__active', this.__active);
		}
	}
	//'attach_unattached_dom_event_listeners'() {
	//}
	'activate_other_changes_listen'() {
		//var el;
		var dom_attributes = this.dom.attributes;
		var el = this.dom.el;
		dom_attributes.on('change', (e_change) => {
			//console.log('dom_attributes e_change', e_change);
			var property_name = e_change.name || e_change.key, val = e_change.value || e_change.new;
			//var t_dval = tof(dval);
			/*
			if (t_dval === 'string' || t_dval === 'number' || t_dval === 'boolean') {
				//el.setAttribute('style', dval);
			} else {
				//el.setAttribute('style', dval.value());
				dval = dval.value();
			}
			*/
			//console.log('property_name, dval', [property_name, dval]);
			if (el && el.nodeType === 1) {
				//requestAnimationFrame(() => {
				el.setAttribute(property_name, val);
				//})
			}
		});
	}
	'activate_this_and_subcontrols'() {
		let context = this.context;
		this.iterate_this_and_subcontrols((ctrl) => {
			//context.register_control(ctrl);
			if (ctrl.dom.el) {
				ctrl.activate();
			}
		});
	}
	'activate_content_listen'() {
		//const context = this.context;
		const {context} = this;
		var map_controls = context.map_controls;
		let el = this.dom.el;
		this.content.on('change', (e_change) => {
			let itemDomEl;
			var type = e_change.name;


			// .changes

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
						//console.log('item._id()', item._id());
						if (context.map_els[item._id()]) {
							itemDomEl = context.map_els[item._id()];
						}
					}
					//console.log('2) itemDomEl', itemDomEl);
					if (!itemDomEl) {
						var item_tag_name = 'div';
						var dv_tag_name = item.dom.tagName;
						// no, it's dom.tag_name
						if (dv_tag_name) {
							item_tag_name = dv_tag_name;
						}
						var temp_el;
						//console.log('item_tag_name', item_tag_name);

						// Use a map of SVG tags instead.

						if (item_tag_name === 'circle' || item_tag_name === 'line' || item_tag_name === 'polyline') {
							// Can make SVG inside an element, with the right namespace.

							// TODO Maybe we can have a global temporary SVG container.
							var temp_svg_container = e_change.item.context.document.createElement('div');
							//var temp_svg_container = e_change.item.context.document.createDocumentFragment('div');
							temp_svg_container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + e_change.item.all_html_render() + '</svg>';


							itemDomEl = temp_svg_container.childNodes[0].childNodes[0];
							//
							//itemDomEl = e_change.item.context.document.createElementNS("http://www.w3.org/2000/svg", item_tag_name);
							//console.log('itemDomEl', itemDomEl);
							//throw 'stop';
						} else {
							temp_el = e_change.item.context.document.createElement('div');

							temp_el.innerHTML = e_change.item.all_html_render();
							itemDomEl = temp_el.childNodes[0];
						}
						item.dom.el = itemDomEl;
						// map controls by el.
						context.map_els[item._id()] = itemDomEl;
					};
				}
				var t_item_dom_el = tof(itemDomEl);
				if (t_item_dom_el === 'string') {
					itemDomEl = document.createTextNode(itemDomEl);
				}
				if (!itemDomEl) {
					//console.log('*** !itemDomEl this._id()', this._id());
					/*
					//
					var grandparent = that.parent().parent();
					//console.log('grandparent', grandparent);
					grandparent.rec_desc_ensure_ctrl_el_refs();
					el = context.map_els[that._id()];
					//console.log('el', el);
					that.dom.el = el;
					*/
				}
				//console.log('!!itemDomEl', !!itemDomEl);
				if (itemDomEl) {
					//e_change.item.active();


					//requestAnimationFrame(() => {
					el.appendChild(itemDomEl);
					e_change.item.register_this_and_subcontrols();
					//});



					//e_change.item.activate_this_and_subcontrols();
					//e_change.item.activate();
				}
			}
			if (type === 'clear') {
				// Remove all? Raise remove events on all?
				if (el) {
					el.innerHTML = '';
				}
			}
			if (type === 'remove') {

				//console.log('remove', e_change);

				if (e_change.value.dom.el) {
					// Best to do it immediately?
					//  controls_being_added_in_frame
					// these will both help with reassignment of item indexes..
					//  or there are ctrl maps generated as needed, and kept and returned alongside the indexed arrays or tas.

					// or not here? do it on the remove function itself? would make more sense.
					//context.controls_being_removed_in_frame.push(e_change.value);
					//  Or add to controls_being_removed_in_frame, then have it done within the next animation frame.

					// Best with no delay?
					//  And then in the next animation frame we verify that it was removed?

					e_change.value.dom.el.parentNode.removeChild(e_change.value.dom.el);

					////el.innerHTML = '';  // older code commented out, dont use this

					// was this
					//requestAnimationFrame(() => {
					//	e_change.value.dom.el.parentNode.removeChild(e_change.value.dom.el);
					//});

				}
				//if (el) el.innerHTML = '';
			}
		});
	}

	// Defining X11 colors in a compressed way would be cool. Compressed data, goes to tensor / manifold nexus structure.
	//  Enabling that manifold nexus structure to have string labels would help too.
	//   Though could have an index of strings at numeric keys.

	/*
	'rec_desc_reattach_dom_events'() {
		var el = this.dom.el;
		if (!el) {
			throw 'missing this.dom.el';
		} else {

		}

	}
	*/

	// All looks HTML DOM specific.
	'rec_desc_ensure_ctrl_el_refs'(el) {
		el = el || this.dom.el;
		var context = this.context;
		//var that = this;
		if (el) {
			var c, l, cns;
			var jsgui_id;
			var map_els = {};
			dom_desc(el, el => {
				//console.log('dom_desc el', el);
				if (el.getAttribute) {
					jsgui_id = el.getAttribute('data-jsgui-id');
					//console.log('rec_desc_ensure_ctrl_el_refs found jsgui_id', jsgui_id);
					if (jsgui_id) {
						//map_controls[jsgui_id] = el;
						// Make a map of elements...?
						map_els[jsgui_id] = el;
						context.map_els[jsgui_id] = el;
					}
				}
			});
			desc(this, (ctrl) => {
				// ensure the control is registered with the context.
				//console.log('desc ctrl', ctrl);
				var t_ctrl = tof(ctrl);
				//console.log('t_ctrl', t_ctrl);
				if (ctrl !== this && t_ctrl === 'control') {
					var id = ctrl._id();
					//console.log('id', id);
					// Seems like it's not in the map.
					//console.log('map_els[id]', !!map_els[id]);
					if (map_els[id]) {
						if (ctrl.dom.el !== map_els[id]) {
							ctrl.dom.el = map_els[id];
							// attach the DOM events.
							//console.log('ctrl.bound_event_handlers', ctrl.bound_event_handlers);
						} else {
							//console.log('Already in the map');
							// Could rebind the events here?
						}
					}
					ctrl.activate();
				}
			});
		}
	}

	// rec desc register
	//  look at the DOM node...

	// also need to register the controls with a map of controls
	// register elements with a map of elements.

	// page_context.register_node
	// page_context.register_control

	'rec_desc_activate'() {
		desc(this, ctrl => {
			// ensure the control is registered with the context.
			//console.log('desc ctrl', ctrl);
			const t_ctrl = tof(ctrl);
			//console.log('t_ctrl', t_ctrl);
			if (t_ctrl === 'control') {
				ctrl.activate();
			}
		});
	}

	// Activation may need more testing and attention.
	//  Auto activation.
	//  Making sure parse_mount works fine.

	// Again looks HTML DOM specific.
	//   May be best within an HTML DOM view class.
	'activate_content_controls'() {

		// Need to deal with text nodes as well.
		//  Maybe just need to activate the content, not create the controls.

		if (!this.dom.el) {
			let found_el = this.context.get_ctrl_el(this);
			//console.log('found_el', found_el);
			if (found_el) {
				this.dom.el = found_el;
			}
		}
		const el = this.dom.el;

		if (el) {
			const context = this.context;
			let ctrl_fields = {}, c, l;
			//var my_content = this.content;

			if (el.getAttribute) {
				let str_ctrl_fields = el.getAttribute('data-jsgui-ctrl-fields');
				if (str_ctrl_fields) {
					ctrl_fields = JSON.parse(str_ctrl_fields.replace(/'/g, '"'));
				}
				let ctrl_fields_keys = Object.keys(ctrl_fields);
				//console.log('ctrl_fields_keys', ctrl_fields_keys);

				let l_ctrl_fields_keys = ctrl_fields_keys.length;
				let key, value;
				for (c = 0; c < l_ctrl_fields_keys; c++) {
					key = ctrl_fields_keys[c];
					value = ctrl_fields[key];
					//var referred_to_control = context.map_controls[value];
					this[key] = context.map_controls[value];
					//console.log('referred_to_control', referred_to_control);

				}
				let cns = el.childNodes;
				let content = this.content;
				// Adding the content again?
				//console.log('cns', cns);
				//console.log('cns.length', cns.length);
				for (c = 0, l = cns.length; c < l; c++) {
					let cn = cns[c];

					if (cn) {
						let nt = cn.nodeType;
						//console.log('* nt ' + nt);
						if (nt === 1) {

							// Only adds them if not already found.

							let cn_jsgui_id = cn.getAttribute('data-jsgui-id');
							//console.log('cn_jsgui_id ' + cn_jsgui_id);
							let cctrl = context.map_controls[cn_jsgui_id];
							// quick check to see if the control is not already there.
							let found = false;
							if (cctrl) {
								let ctrl_id = cctrl.__id;
								//console.log('* ctrl_id', ctrl_id);
								if (ctrl_id) {
									content.each((v, i) => {
										if (v.__id) {
											if (v.__id == ctrl_id) found = true;
										}
									});
								}
								if (!found) {
									content.add(cctrl);
								}
								cctrl.activate();
								cctrl.parent = this;
							}
						}
						if (nt === 3) {

							//console.log('node type 3 (text)');

							// Go through the controls we have...
							//  See if there is the corresponding text node.

							const i_sibling = c;
							//console.log('i_sibling', i_sibling);

							// See if we can look up the control in the content....

							const corresponding_ctrl = content._arr[i_sibling];
							//console.log('corresponding_ctrl', corresponding_ctrl);
							//console.log('cn', cn);
							//console.log('Object.keys(cn)', Object.keys(cn));
							//console.log('cn.nodeValue', cn.nodeValue);

							if (corresponding_ctrl) {
								if (corresponding_ctrl.text === cn.nodeValue) {
									//console.log('*** have match');

									// has no 'dom' yet.

									corresponding_ctrl.dom.el = cn; // though its a node, not an el.
								}
							} else {
								console.log('&&& no corresponding control');
								// Maybe now is the right time to create it.

							}

							// Compare the nodeValue to the ._text or .text property of the corresponding ctrl.




							// Checking whether the textNode controls have been created already...?





							// Possibly do the work on activating child controls, reconsiliating text nodes with their jsgui control.

							// Could reconnect the text node here?
							//  Yes, seems like reconnecting text nodes is important.
							//  Do it just after adding it into the DOM.
							//   Maybe that would be activation.
							//   Have text node activate code....

							// text

							// create a new jsgui text node.
							//  don't want to push / add the data value

							// Have we already got the text node control?
							//  Different when activating from the sent HTML?

							const do_add = () => {
								let val = cn.nodeValue;
								//console.log('val', val);
								console.log('adding Text_Node control', val);
								const tn = new Text_Node({
									context: this.context,
									text: val,
									el: cn
								})
								//console.log('val ' + val);
								//content.push(val);
								//content.push(tn);

								// Is it already there???
								//  Seems to already have something....
								console.log('content._arr.length', content._arr.length);
								content.add(tn);
							}

							// content .add or .push ???
						}
					}
				}
			}
		} else {
			console.trace();
			console.log('missing el');
		}
	}


	// Some data relevant to the model? To knowing what class of Control this is?
	'activate_dom_attributes'() {
		// .el direct reference?
		// ctrl.e
		// a .e function for the el
		// .d for dom
		// .da for dom attributes
		// .a? that makes sense for dom attributes too.
		const el = this.dom.el;
		// .node?
		// .dom.node?
		//console.log('** el', el);
		// may not have el....?
		//var that = this;
		const dom_attributes = this.dom.attributes;
		let item, name, value, i;
		if (el) {
			const attrs = el.attributes;
			if (attrs) {
				// Can look for the data-jsgui-fields.
				//  Values that need to be taken as property values.
				//   this[field_name] = field_value;




				const l = attrs.length
				for (i = 0; i < l; i++) {
					item = attrs.item(i);
					name = item.name;
					value = item.value;
					if (name === 'data-jsgui-id') {
						// Handled elsewhere - not so sure it should be but won't change that right now.
					} else if (name === 'data-jsgui-type') {} else if (name === 'style') {
						dom_attributes[name] = value;
					} else if (name === 'class') {
						dom_attributes[name] = value;
					//} else if (name === 'data-jsgui-fields') {
					//	dom_attributes[name] = value;
					} else {
						dom_attributes[name] = value;
					}
				}
			}
		}
		/*
		dom_attributes.style.on('change', e_style_change => {
			console.log('e_style_change', e_style_change);
		})
		*/

		//dom_attributes.on('change', d_change => {
		//	console.log('*& d_change', d_change);
		//});
	}

	// Where does this happen?
	'attach_dom_events'() {

		console.trace();
		throw 'stop - look into this';

		// .be?
		// ._b_e?
		each(this._bound_events, (handlers, name) => {
			each(handlers, handler => {
				this.add_dom_event_listener(name, handler);
			});
		});
	}

	// change to search_descendents or _search_descentents

	'_search_descendents'(search) {
		const recursive_iterate = (ctrl, item_callback) => {
			// callback on all of the child controls, and then iterate those.
			//console.log('recursive_iterate');
			const content = ctrl.content, t_content = tof(content);
			if (t_content === 'collection') {
				if (content.length() > 0) {
					content.each((item, i) => {
						//console.log('item', item);
						item_callback(item);
						recursive_iterate(item, item_callback);
					})
				}
			}
		}
		const arr_matching = [];
		recursive_iterate(this, (item) => {
			const item_type = item.__type_name;
			//console.log('item_type', item_type);
			if (item_type === search) {
				arr_matching.push(item);
			} else {
				//return ctrl_parent.ancestor(search);
			}
		});
		//console.log('arr_matching', arr_matching);
		return arr_matching;
	}

	// is the 'search' amongst the ancestors?
	'_search_ancestor'(search) {
		// could maybe work when not activated too...
		// need to get the ancestor control matching the search (in type).
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

	
	// All added to the view.

	'add'(new_content) {
		const {context} = this;
		const m = context.map_controls_being_added_in_frame = context.map_controls_being_added_in_frame || {};
		// maybe don't add it as a text node, add it as string content in some cases.
		const tnc = tof(new_content);
		// Need to also add the descendents of all new content.
		//console.log('control add content tnc', tnc);
		if (tnc === 'array') {
			//let res = [];
			each(new_content, (v) => {
				//res.push(this.add(v));
				// And go through the content and descendents too.
				const candd = v.this_and_descendents;
				if (candd) {
					each(candd, ctrl => {
						if (ctrl._id) {
							m[ctrl._id()] = ctrl;
						}
					})
				}
			});
			//res = new_content;
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
		return super.add(new_content);
	}

	// A new 'add' function here will help.
	//  Though it's handled well on a lower level, combined with DOM things that are activated, it would be nice to have a version that uses map_controls_being_added_in_frame
	//   This is browser-client specific functionality.


	// Clears the view.
	//   Remove the event handlers?
	'clear'() {
		// clear all the contents.
		// ui should react to the change.
		//return this.content.clear();
		// will raise a 'remove' event on all controls removed?
		//  seems like the lower level tracking of controls added and removed between frames (or checks) should be written to here.

		//  only if it's in the context...
		//   so put it in the enh ctrl.

		// will need to get this and all descendent controls in an array.
		//  family, with ctrl as the head.
		//  family_down...
		//  family() gets family line, ancestors and descendent tree.
		//const arr_tad = this.this_and_descendents;
		// $search?
		//console.log('ctrl-enh clear arr_tad', arr_tad);
		//console.log('arr_tad.length', arr_tad.length);
		const {context} = this;
		context.map_controls_being_removed_in_frame = context.map_controls_being_removed_in_frame || {};
		//context.map_controls_being_removed_in_frame[this._id()] = this;
		//console.log('this.descendents', this.descendents);
		each(this.descendents, ctrl => {
			if (ctrl._id) context.map_controls_being_removed_in_frame[ctrl._id()] = ctrl;
		});
		super.clear();
		//this.content.clear();
		// ui seems not to react to this.
		// remove all dom nodes?
		// Or have a different part that responds to content events?
		// content event handlers seem important.
	}

};

let p = Control.prototype;
p.on = p.add_event_listener;
p.off = p.remove_event_listener;

module.exports = Control;


// Models will (almost?) always have events. model.value.on('change', e => {}); ?????
//   or not???
//     would have value.value in some cases.

// model.value should be the value itself.
//   but model .value.on ???
// may have model.value = 5
//   seems like simple syntax that should be allowed.
// model.on('change', e => {name, value})
//   so the name would be 'value'.
// model.ovc(v => {}) on value change???
//   or just vc(model, ...)
// can make / try other conventions.

// Flexi_Type?
//   Complex_Type?

// Multi_Representations_Type?
// PostModern??

// A standard or default object model?
//   Where it (.value) could be set as any JS object, no type restrictions.
//     Then it's up the the Control to render it for user interaction as needed.
//       Default system (or easily available through mixin) that enables a ctrl to render strings, numbers etc into a DIV as text...?
//         Make the HTML view part (as it gets made) much more concerned with composing and rendering. Then making more types of rendering for data
//           would be more focused on the UI rendering (and composition).







// model.type
//   seems enough really.
//   could have object with {signifier: ..., representations: [...]}
// model.value






// Maybe it would be better to more gradually transfer functionality to a .view object and to mixins.
//   With mixins working on a live .view object, that object could be upgraded. Could be slower than making from prototype???

// Separation of .model and .view does seem important.
//   Much of the work in this framework so far concerns the view.
//   Making a control support multiple views would be nice.

// Declaring what a view contains...
//   May be using parse-mount system.
//     May use functional composition that makes adding items quick, or at least on the same line of JS and compressable.
//       A goal is to make the script relatively compact in JS when pretty. So not like JSON.
//        So basically equivalent of a Control as it is right now defined on a single line, or short paragraph.
//          But that would be a View.

// Some views would have preset models? As in it is made as a view to a specific model, so that model type must be used.
//   Will be able to have simple programmatic derivation of views from models.
//     However, the initial controls for dealing with specific data types seem important, such as text editor, date editor.
//       Make the framework and the standard.

// Have kind of begin (implicitly) work on the 'view model' with some properties, but can and should be clearer about
//   how those types of appearance / display properties are distinguished.

// ctrl.value => ctrl.data.model.value (perhaps)
//   ctrl.data.model could make it clearer still that there is a separate part concerning data for the control.
//   ctrl.view.model.value or ctrl.view.value
//     The view (model) properties would be great to separate into their own set (object).

// Multiple models and multiple viewa
// Each view must correspond to one or more models
// Models can exist separately from views

// May 2022 - Seems a lot like starting with 'model' and getting further into data representations will help this along.
//   The model could include what could be taken as 'hints' for the view, or what would form part of a lower-level blueprint for the view,
//   if some intelligence was used in assembling the view from the representation in the model.

// The models have a lot to do with representation of multi-representational types.
//   A type could have multiple signifiers? Maybe when it comes to subtypes. Eg color type could have specific signifiers.
//   With the code for the model being separate, and the model types, it may also be possible to generate / autogenerate react componens.
// Want it so that (to begin with in theory a least) a Control could have a View using React, or as a React Component.

// A new Model module even?
//   Not so sure on the npm package name. Could make it lang-model? jsgui3-model? jsgui3-lang-model perhaps?
//     Could make a more obscure name before it's 'ready'
//   Not so sure about incorporating it into lang-mini though. May be a sensible option, but right now not sure how mini it would turn out to be.

// Seems a lot like a more advanced Data_Object and Data_Value now.

// Sig_Reps_Type perhaps
// Model class - 1 signifier type
//               n representation types




















// add_div(view)???










// Plugin mechansim...
//  For things like span
//   Want to add extra functionality in some places.

// A text property where span text can be changed.


// Adds to jsgui itself...
//  It adds a whole number of default controls.
//  Could that be anywhere else?