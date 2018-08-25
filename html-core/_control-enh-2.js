/**
 * Created by James on 16/09/2016.
 */
var jsgui = require('../lang/lang');
var is_ctrl = jsgui.is_ctrl;
var get_a_sig = jsgui.get_a_sig,
	fp = jsgui.fp,
	each = jsgui.each;
var Control_Enh = require('./control-enh');
var Resize_Handle = require('../controls/resize-handle')
var tof = jsgui.tof;
// get_a_sig


//var v_subtract = jsgui.util.v_subtract;
//var v_add = jsgui.util.v_add;


/*
	16/08/2018 - Have not been using this code for a while. Have got other code working on the lower platform.
		Seems worth splitting this code up more into behaviours. Want to apply selectable code to wherever it is necessary.


	Clone
	Resize
	Select
	Drag
	Anchor
	Fade

	These seem a lot like methods and methodologies
	Drag would work with an observable.

	// apply selectable mixins

	control-enh - apply mixins on start

	// /control-mixins



	//.selectable = true

*/


// Could add, make functions in the params?

class Control_Enh_2 extends Control_Enh {
	//'fields': {
	//	'selection_scope': Object,
	//	'is_selectable': Boolean,
	//	'scrollbars': String
	//},

	constructor(spec, fields) {
		// The enhanced control can look at the element for data-jsgui-fields
		//  Those fields will be fed back into the initialization.
		//console.log('e2 fields', fields);
		super(spec, fields);


	}



	// absolute_ghost_clone
	'absolute_ghost_clone' () {

		var type_name = this.__type_name;
		var id = this._id();
		var context = this.context;

		// spin up a new control, using they type of controls.

		console.log('context', context);

		var ctrl_document = context.ctrl_document;

		console.log('ctrl_document', ctrl_document);
		console.log('type_name', type_name);

		var Cstr = context.map_Controls[type_name];
		console.log('Cstr', Cstr);

		// We can create a new one, with a new ID.

		var new_id = id + '_clone';
		var map_controls = context.map_controls;

		// Want the body control as well.



		if (!map_controls[new_id]) {
			// create it.

			var new_ctrl = new Cstr({
				'context': context,
				'id': new_id
			})

			console.log('new_ctrl', new_ctrl);

			//var body = ctrl_document.body();

			var body = ctrl_document.content().get(1);

			var css_class = this.get('dom.attributes.class');
			new_ctrl.set('dom.attributes.class', css_class);

			// Should copy the controls inside the one being cloned.
			var my_contents = this.content;

			// should be able to clone a Data_Value too.



			each(my_contents, function (v, i) {
				//console.log('i', i);
				//console.log('v', v);

				// Adding a Data_Value not working?

				var v_clone = v.clone();
				//console.log('v_clone', v_clone);

				// could get the value if it's a Data_Value for the moment...
				//  Adding a Data_Value to a

				//if (v_clone.value) {
				if (v_clone instanceof jsgui.Data_Value) {
					new_ctrl.add(v_clone.value());
				} else {
					new_ctrl.add(v_clone);
				}



			})

			//console.log('this', this);
			// could get the computed width?

			// computed padding too?

			var my_bcr = this.bcr();

			//console.log('my_bcr', my_bcr);

			var my_padding = this.padding();
			//console.log('my_padding', my_padding);

			my_bcr[2][0] = my_bcr[2][0] - my_padding[0];
			my_bcr[2][1] = my_bcr[2][1] - my_padding[1];
			my_bcr[2][0] = my_bcr[2][0] - my_padding[2];
			my_bcr[2][1] = my_bcr[2][1] - my_padding[3];

			var my_border_thickness = this.border_thickness();

			//console.log('my_border_thickness', my_border_thickness);

			var t_my_border_thickness = tof(my_border_thickness);

			if (t_my_border_thickness == 'number') {
				my_bcr[2][0] = my_bcr[2][0] - 2 * my_border_thickness;
				my_bcr[2][1] = my_bcr[2][1] - 2 * my_border_thickness;
			}
			new_ctrl.bcr(my_bcr);

			//console.log('new_ctrl', new_ctrl);
			body.add(new_ctrl);

			var new_el = new_ctrl.dom.el;
			//console.log('new_el', new_el);

		}

	}



	'pop_into_body' () {

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

	// not recursive
	//  maybe call activate_individual?

	//

	/*
	'activate'(el) {
		if (!this.__active) {
            this._super(el);
			this.__active = true;
			//console.log('el', el);
			if (el) {
				//this.set('dom.el', el);
				this.dom.el = el;
			}

			//

			// Could ensure all element references to start with.
			//


			this.activate_dom_attributes();
			this.activate_content_controls();
			this.activate_content_listen();
			this.activate_other_changes_listen();


			// No point doing this any longer. These references are OK.
			//this.rec_desc_ensure_ctrl_el_refs();

			// Attach DOM event listeners
			//  Attach the unattached ones.
			//  Go through the events for the control, and see which of them are to be attached to the DOM, but have not been attached already.
			//   This needs to be used when the content is created client-side, and put into the DOM.

			// Check to see that we are attaching unattached event listeners?



			//console.log('5) ' + this._.content._arr.length);
		}
    }
    */

	//'attach_unattached_dom_event_listeners'() {

	//}


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

	/*

	'hide' () {
		//console.log('hide');
		this.add_class('hidden');
	}
	'show' () {
		//console.log('show');
		this.remove_class('hidden');
	}
	*/

	/*
	'context_menu'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		var menu_def;
		if (sig == '[o]' || sig == '[a]') {
			menu_def = a[0];
		}
		//var Context_Menu = Context_Menu || require('./controls/advanced/context-menu');


		var context_menu;
		var that = this;
		// Need it so that the context menu gets removed when it should.
		//  Any mouseup event causes it to vanish.
		var body = this.context.body;
		//var ctrl_html_root = this.context.ctrl_document;
		//console.log('ctrl_html_root', ctrl_html_root);
		//var body = ctrl_html_root.body();
		var show_context_menu = fp(function(a, sig) {
			var pos;
			if (sig == '[a]') {
				// A position?
				pos = a[0];
			}
			if (!context_menu) {
				//console.log('creating new context menu');

				//console.log('menu_def', menu_def);

				context_menu = new Context_Menu({
					'context': that.context,
					'value': menu_def
				});

				if (pos) {
					context_menu.style({
						'left': (pos[0] - 1) + 'px',
						'top': (pos[1] - 1) + 'px'
					});

				} else {
					context_menu.style({
						'left': '100px',
						'top': '100px'
					});

				}
				var context = that.context;
			} else {

				if (pos) {
					context_menu.style({
						'left': (pos[0] - 1) + 'px',
						'top': (pos[1] - 1) + 'px'
					});
				} else {
					context_menu.style({
						'left': '100px',
						'top': '100px'
					});
				}
			}
			setTimeout(function() {
				body.add(context_menu);
				//console.log('pre activate context_menu._.content._arr.length ' + context_menu._.content._arr.length);
				context_menu.activate();
				context_menu.one_mousedown_anywhere(function(e_mousedown) {
					//console.log('e_mousedown.within_this ' + e_mousedown.within_this);

					if (!e_mousedown.within_this) {
						context_menu.remove();
					} else {
						// maybe open a new level.

						// And need to call the relevant context menu function.

						console.log('e_mousedown', e_mousedown);

						var el_target = e_mousedown.target;
						// the target control will have a jsgui id now.
						//  we should be able to then go to its parent and get its menu node.
						var context = that.context;
						console.log('context', context);
						var target_id = el_target.getAttribute('data-jsgui-id');
						console.log('target_id', target_id);
						var ctrl_target = context.map_controls[target_id];
						console.log('ctrl_target', ctrl_target);
						// want to be able to get an ancestor of type menu-node
						var menu_node = ctrl_target.ancestor('menu_node');
						console.log('menu_node', menu_node);
						// and raise the menu_node select event.
						menu_node.raise('select');
						context_menu.remove();
					}
				});
			}, 0);
		});

		this.on('contextmenu', function(e_contextmenu) {
			//console.log('e_contextmenu', e_contextmenu);
			return false;
			//console.log('e_click', e_click);
		})

		this.on('mousedown', function(e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			var int_button = e_mousedown.which;
			if (int_button == 3) {
				e_mousedown.preventDefault();
				window.event.returnValue = false;
				return false;
			}
		});

		this.on('mouseup', function(e_mouseup) {
			//console.log('e_mouseup', e_mouseup);
			var int_button = e_mouseup.which;

			if (int_button == 3) {
				console.log('right button');
				e_mouseup.preventDefault();
				window.event.returnValue = false;
				// Need to work out the position of the click.
				// pageX, pageY
				var pos = [e_mouseup.pageX, e_mouseup.pageY];
				show_context_menu(pos);
				return false;
			}
		})
	}

	

	*/
	// make full height.
	//  makes the control take the rest of the height of the window.
	// Drag function as well...
	//  Could make this accept the same params as the drag function,
	//   but this version will be more flexible with more modes.
	// Drag and drop could also be set up with simpler parameters and acts in the default way that .drag would do.


	// internal relative div?
	//  could have different kinds of internal structures.

	// could have an internal grid 9.

	// Could even include internal relative within the core, so they get rendered without (ever) being a control.
	//  Adding and removing it and the contents could be easier if it's a rendering feature rather than a control.
	//   The internal relative div would be a special case.






	get resizable() {
		return this._resizable || false;
	}
	set resizable(value) {
		this._resizable = value;
		if (value === true) {
			// Could actually render it with resize handles.
			//  Then activate those handles on the client.
			this._internal_relative_div = true;

			// Worth rendering the resize handles too.
			//  May need a few px values to position them, like padding and border.

			// May be worth using a resize_handle control.

			// add the resize handles to the control.

			var br_only = true;

			if (!br_only) {
				if (!this.resize_tl) {
					this.resize_tl = new Resize_Handle({
						context: this.context,
						target: this,
						position: 'tl'
					});
					this.resize_tl.add_class('top-left');
					this.add(this.resize_tl);
					//throw 'stop';
				}

				if (!this.resize_tr) {
					this.resize_tr = new Resize_Handle({
						context: this.context,
						target: this,
						position: 'tr'
					});
					this.resize_tr.add_class('top-right');
					this.add(this.resize_tr);
				}

				if (!this.resize_bl) {
					this.resize_bl = new Resize_Handle({
						context: this.context,
						target: this,
						position: 'bl'
					});
					this.resize_bl.add_class('bottom-left');
					this.add(this.resize_bl);
				}
			} else {

			}

			if (!this.resize_br) {
				this.resize_br = new Resize_Handle({
					context: this.context,
					target: this,
					position: 'br'
				});
				this.resize_br.add_class('bottom-right');
				this.add(this.resize_br);
			}




			/*
			this.resize_tl.style({
				'position': 'absolute',
				'top': 0
			});
			*/








		}
	}

	'begin_resize' () {
		this._resizing = {
			'orig_size': this.size
		}
	}
	'mid_resize' (offset) {
		if (this._resizing) {
			//console.log('this._resizing.orig_size', this._resizing.orig_size);
			//console.log('offset', offset);
			var new_size = v_add(this._resizing.orig_size, offset);
			//console.log('new_size', new_size);
			this.size = (new_size);
		}
	}
	'end_resize' (offset) {

	}

	'draggable' () {
		var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		var that = this;
		//console.log('draggable sig', sig);
		//console.trace();
		var options = {},
			mode, drag_start_distance = 4;
		// options could contain event handlers.
		//  Not sure about the publish / subscribe model.
		//   Maybe it would work well.
		// But allowing event handlers as specified in the options would be good as well.
		var fn_mousedown, fn_dragstart, fn_dragmove, fn_dragend;
		var handle_mousedown, handle_dragstart, handle_dragmove, handle_dragend;

		if (sig == '[o]') {
			options = a[0];
		}

		// fn_mousedown, fn_begin, fn_move, fn_end
		if (sig == '[f,f,f,f]') {
			handle_mousedown = a[0];
			handle_dragstart = a[1];
			handle_dragmove = a[2];
			handle_dragend = a[3];
		}


		if (options.mode) mode = options.mode;
		//if (options.fn_dragmove) fn_dragmove = options.fn_dragmove;
		if (options.move) handle_dragmove = options.move;
		//if (options.fn_dragstart) fn_dragstart = options.fn_dragstart;
		if (options.start) handle_dragstart = options.start;

		// could have a 'none' mode that does not implement drag behaviour itself, but just shows the events?
		//  or I think 'events' mode would be a better name because it's saying what it is.
		//  would be useful for moving objects around according to more specific rules.

		if (mode == 'ghost-copy') {
			console.log('ghost-copy drag');
		}

		var body = that.context.body();
		// raise the events externally.
		var is_dragging;
		var pos_mousedown;

		var ghost_clone;
		var fn_mousemove = function (e_mousemove) {
			//console.log('e_mousemove', e_mousemove);
			var pos = [e_mousemove.pageX, e_mousemove.pageY];
			var pos_offset = [pos[0] - pos_mousedown[0], pos[1] - pos_mousedown[1]];

			//console.log('dist', dist);
			//console.log('is_dragging ' + is_dragging);

			if (!is_dragging) {
				var dist = Math.round(Math.sqrt(pos_offset[0] * pos_offset[0] + pos_offset[1] * pos_offset[1]));
				if (dist >= drag_start_distance) {
					//console.log('starting drag');
					is_dragging = true;
					// in ghost copy mode create the ghost copy
					if (mode == 'ghost-copy') {
						ghost_clone = that.absolute_ghost_clone();
					}
					if (handle_dragstart) {
						e_mousemove.control = that;
						// set the body's css cursor to 'default'
						//body.style('cursor', 'default');
						body.add_class('no-text-select')
						body.add_class('default-cursor');
						//body.add_class('dragging');
						handle_dragstart(e_mousemove);
					}
				}
			}
			if (is_dragging) {
				// raise the drag event.
				// could do some of the drag-drop activity depending on the drag mode.
				//  also want to provide other hooks for functionality.
				// console.log('fn_dragmove', fn_dragmove);
				if (handle_dragmove) {
					e_mousemove.control = that;
					//console.log('e_mousemove', e_mousemove);
					handle_dragmove(e_mousemove);
				}
			}
			// Want the offset from the mousedown position.
		}
		var fn_mouseup = function (e_mouseup) {
			//console.log('e_mouseup', e_mouseup);
			//console.log('pre switch off mousemove, mouseup');
			// Seems the events are being added too many times.
			body.off('mousemove', fn_mousemove);
			body.off('mouseup', fn_mouseup);
			body.remove_class('no-text-select');
			body.remove_class('default-cursor');
			//body.remove_class('dragging');
		}
		this.on('mousedown', function (e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			pos_mousedown = [e_mousedown.pageX, e_mousedown.pageY];
			// position within Control
			// position within window
			body.on('mousemove', fn_mousemove);
			body.on('mouseup', fn_mouseup);
			body.add_class('no-text-select');
			is_dragging = false;
			if (handle_mousedown) {
				handle_mousedown(e_mousedown);
			}
		})
	}

	'drag_handle_to' (ctrl) {
		var mousedown_offset_from_ctrl_lt;
		var ctrl_el = ctrl.dom.el;
		// could go in enhanced....
		//this.drag(function(e_mousedown) {
		this.draggable(function (e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			// This will need to be revised - making adjustment for when dragging from an anchored position.
			//  Should maintain some info about the drag so it knows if it starts/ends anchored anywhere.
			var target = e_mousedown.target;
			var targetPos = findPos(target);
			//console.log('targetPos ' + stringify(targetPos));
			var el_ctrl = ctrl.value('dom.el');
			var ctrl_el_pos = findPos(el_ctrl);
			var e_pos_on_page = [e_mousedown.pageX, e_mousedown.pageY];
			mousedown_offset_from_ctrl_lt = jsgui.v_subtract(e_pos_on_page, ctrl_el_pos);

		}, function (e_begin) {
			var ctrlSize = ctrl.size();
			//console.log('ctrlSize', ctrlSize);
			var anchored_to = ctrl.anchored_to;
			//console.log('anchored_to', anchored_to);
			if (!anchored_to) {
				//ctrl.set('unanchored_size', ctrlSize);
			} else {
				// need to unanchor it.
				ctrl.unanchor();
			}
		}, function (e_move) {
			var clientX = e_move.clientX;
			var clientY = e_move.clientY;
			var window_size = get_window_size();
			//console.log('mousedown_offset_from_ctrl_lt', mousedown_offset_from_ctrl_lt);
			var ctrl_pos = jsgui.v_subtract([clientX, clientY], mousedown_offset_from_ctrl_lt);

			// But then act differently if we are dragging from an anchored position.
			//  The mousedown offset within the control won't be so relevant -
			//   or won't be the only factor.
			// Take account of position_adjustment
			//  or offset_adjustment

			var offset_adjustment = ctrl.offset_adjustment;
			if (offset_adjustment) {
				// want to find out what zone it is anchored in.

				ctrl_pos = jsgui.v_add(ctrl_pos, offset_adjustment);

				//
			}
			if (ctrl_pos[0] < 0) ctrl_pos[0] = 0;
			if (ctrl_pos[1] < 0) ctrl_pos[1] = 0;
			var ow = ctrl_el.offsetWidth;
			var oh = ctrl_el.offsetHeight;


			if (ctrl_pos[0] > window_size[0] - ow) ctrl_pos[0] = window_size[0] - ow;
			if (ctrl_pos[1] > window_size[1] - oh) ctrl_pos[1] = window_size[1] - oh;

			var style_vals = {
				'left': ctrl_pos[0] + 'px',
				'top': ctrl_pos[1] + 'px'
			};
			//console.log('style_vals', style_vals);
			ctrl.style(style_vals);
			ctrl.context.move_drag_ctrl(e_move, ctrl);
		}, function (e_end) {
			// tell the context that the drag has ended.
			var uo1 = ctrl.unanchored_offset;
			//console.log('uo1', uo1);
			ctrl.context.end_drag_ctrl(e_end, ctrl);
			var uo2 = ctrl.unanchored_offset;
			//console.log('uo2', uo2);
			if (uo1 && uo2) {
				ctrl.unanchored_offset = null;
			}
			ctrl.offset_adjustment = null;
			// and if it already has an unanchored_offset
		});
	}

	// maybe remove this.
	//  
	'resize_handle_to' (ctrl, handle_position) {
		// The control needs to be draggable normally?
		//  And then from the positions of where it is adjust the size of what it's a resize handle to?
		//console.log('resize_handle_to');
		if (handle_position == 'right-bottom') {
			/*
			var fn_move = function(e_move) {
				console.log('e_move', e_move);
			}
			var fn_up = function(e_up) {
				console.log(e_up);
			}
			*/
			var doc = ctrl.context.ctrl_document;
			//console.log('ctrl.context', ctrl.context);
			var fn_move = function (e_move) {
				//console.log('e_move', e_move);
			}
			var fn_up = function (e_up) {
				//console.log('e_up', e_up);

				doc.off('mousemove', fn_move);
				doc.off('mouseup', fn_up);
			}
			ctrl.on('mousedown', function (e_mousedown) {
				//console.log('e_mousedown', e_mousedown);
				doc.on('mousemove', fn_move);
				doc.on('mouseup', fn_up);
			})
		}
	}


	// changing this to a selectable property would make sense.
	// .selection_mode

	// 0 - not selectable
	// 1 - selectable (including as group)
	// 2 - only selectable as unique

	// Want to make cells unselectable too.
	//  A property would greatly help here.

	'selectable' (ctrl) {

		// Do this before activation?


		//var that = this;
		ctrl = ctrl || this;

		if (typeof document === 'undefined') {
			ctrl._fields = ctrl._fields || {};
			ctrl._fields['selectable'] = true;
			ctrl.is_selectable = true;

			// send this over to the client as a property.
			//  a field to send to the client.


		} else {

			this.click(function (e) {

				console.log('selectable click e', e);

				var ctrl_key = e.ctrlKey;
				var meta_key = e.metaKey;
				if (ctrl_key || meta_key) {
					ctrl.action_select_toggle();
				} else {
					ctrl.action_select_only();
				}

				e.stopPropagation();
			});
		}
	}

	'action_select_only' () {
		//console.log('action_select_only');
		var ss = this.find_selection_scope();
		//console.log('!!ss', !!ss);
		ss.select_only(this);
		//this.find_selection_scope().select_only(this);
	}

	'action_select_toggle' () {
		this.find_selection_scope().select_toggle(this);
	}

	// So I think the resource-pool will have a selection scope.

	/*

	'find_selection_scope' () {
		//console.log('find_selection_scope');
		var res = this.selection_scope;
		if (res) return res;

		//console.log('this.parent', this.parent);

		//console.log('!!this.parent', !!this.parent);
		//console.log('this.parent.find_selection_scope', this.parent.find_selection_scope);

		if (this.parent && this.parent.find_selection_scope) return this.parent.find_selection_scope();
	}
	*/

	// Nice, this works. Not that efficiently yet.

	'make_full_height' () {
		var el = this.dom.el;
		var viewportHeight = document.documentElement.clientHeight;
		var rect = el.getBoundingClientRect();
		//console.log(rect.top, rect.right, rect.bottom, rect.left);
		var h = viewportHeight - rect.top;
		this.style('height', h + 'px', true);
	}
	'unanchor' () {
		var anchored_to = this.get('anchored_to');
		anchored_to[0].unanchor_ctrl(this);
	}
};

module.exports = Control_Enh_2;

// Adds to jsgui itself...
//  It adds a whole number of default controls.
//  Could that be anywhere else?