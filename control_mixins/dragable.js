/*

var a = arguments;
		a.l = arguments.length;
		var sig = get_a_sig(a, 1);
		var that = this;
		//console.log('dragable sig', sig);
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

*/

const {
	prop,
	field
} = require('obext');

let dragable = (ctrl, opts = {}) => {
	//let selection_action = 'mousedown';
	// select on mousedown?

	//console.log('dragable');


	// bounds, handle
	let {
		bounds,
		handle,
		mode
	} = opts;
	// bounds could be a control.

	//control

	// boundary control
	let bounds_pos;
	let bounds_is_parent = bounds === ctrl.parent;
	// if the bounding control is the parent, it doesn't require copying to the body.



	if (bounds === 'parent') {
		bounds = ctrl.parent;
		bounds_is_parent = true;
	}

	//console.log('bounds', bounds);


	if (bounds) {
		bounds_pos = bounds.pos || [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];
	}

	//console.log('ctrl.parent', ctrl.parent);
	//console.log('bounds_is_parent', bounds_is_parent);
	handle = handle || ctrl;
	let old_dragable = ctrl.dragable;

	// Also drag within bounds?
	//  Within bounds of parent?

	let drag_mode = opts.mode || 'body';
	if (bounds_is_parent) {
		drag_mode = 'within-parent';
		//bounds = 
	}

	//console.log('dragable drag_mode', drag_mode);

	// Changing position within another control - not putting it into the document root.
	// 
	/*
	let click_handler = (e) => {
	    //console.log('selectable click e', e);
	    //console.log('!!ctrl.selection_scope', !!ctrl.selection_scope);
	    //console.log('ctrl.selectable', ctrl.selectable);
	    if (ctrl.dragable && !ctrl.selection_scope) {
	        var ctrl_key = e.ctrlKey;
	        var meta_key = e.metaKey;
	        if ((ctrl_key || meta_key)) {
	                ctrl.action_select_toggle();
	        } else {
	            //console.log('pre select only');
	            //console.log('ctrl.action_select_only', ctrl.action_select_only);
	            ctrl.action_select_only();
	        }
	    }
	}
	*/

	// calculate a drag mode.
	//  'within-parent'
	//  'body'


	let pos_md, pos_mm, pos_mu, pos_md_within_ctrl;

	// pos_md_within_ctrl

	let ctrl_body = ctrl.context.body();
	let dragging = false;
	let drag_offset_distance = opts.start_distance || 6;
	let movement_offset;
	let item_start_pos;

	let bounds_size;
	let bounds_offset;
	let half_item_width, item_width;

	const begin_drag = (pos) => {
		//console.log('begin_drag', pos);

		if (drag_mode === 'within-parent') {
			dragging = true;
			// move the item
			// need to calculate move offsets.
			//  measure the item's initial position.
			//console.log('parent.size', parent.size);
			item_start_pos = ctrl.pos;

			//item_start_pos = ctrl.bcr()[0];
			//console.log('item_start_pos', item_start_pos);
			//console.log('movement_offset', movement_offset);
			//console.log('ctrl.position', ctrl.position);
			//console.log('1) ctrl.pos', ctrl.pos);
			//console.log('ctrl', ctrl);
			let new_pos = [item_start_pos[0] - movement_offset[0], item_start_pos[1] - movement_offset[1]];
			ctrl.pos = new_pos;
			//console.log('2) ctrl.pos', ctrl.pos);
			//let new_item_pos = 
		} else {
			if (drag_mode === 'x') {
				dragging = true;
				item_start_pos = ctrl.pos || [ctrl.dom.el.offsetLeft, ctrl.dom.el.offsetTop];
				//console.log('item_start_pos', item_start_pos);

				half_item_width = Math.round(ctrl.dom.el.offsetWidth / 2);
				item_width = (ctrl.dom.el.offsetWidth);
				bounds_offset = [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];

				//console.log('item_start_pos', item_start_pos);
				//console.log('movement_offset', movement_offset);
				//console.log('bounds_pos', bounds_pos);

				//let new_pos = [item_start_pos[0] + movement_offset[0] + bounds_offset[0] - pos_md_within_ctrl[0] - item_width, item_start_pos[1]];
				let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
				//console.log('item_start_pos[1]', item_start_pos[1]);

				ctrl.pos = new_pos;
			} else {
				console.log('drag_mode', drag_mode);
				throw 'NYI';
			}
		}

		ctrl.raise('dragstart');
	}
	const move_drag = (pos) => {
		//let ctrl_size = ctrl.bcr()[2];
		let ctrl_size = [ctrl.dom.el.offsetWidth, ctrl.dom.el.offsetHeight];

		//console.log('bounds_size', bounds_size);
		//console.log('ctrl_size', ctrl_size);

		//console.log('move_drag drag_mode', drag_mode);

		if (drag_mode === 'within-parent') {
			//console.log('bounds', bounds);
			bounds = bounds || ctrl.parent;
			bounds_size = bounds.bcr()[2];
			let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1] + movement_offset[1]];

			if (new_pos[0] < 0) new_pos[0] = 0;
			if (new_pos[1] < 0) new_pos[1] = 0;

			if (new_pos[0] > bounds_size[0] - ctrl_size[0]) new_pos[0] = bounds_size[0] - ctrl_size[0];
			if (new_pos[1] > bounds_size[1] - ctrl_size[1]) new_pos[1] = bounds_size[1] - ctrl_size[1];

			ctrl.pos = new_pos;
		}
		if (drag_mode === 'x') {
			//bounds_size = bounds.bcr()[2];
			bounds_size = [bounds.dom.el.offsetWidth, bounds.dom.el.offsetHeight];
			//console.log('bounds.dom.el', bounds.dom.el);
			//console.log('bounds_size', bounds_size);
			//console.log('bounds_pos', bounds_pos);
			// half_item_width
			//console.log('movement_offset', movement_offset);

			//let new_pos = [item_start_pos[0] + movement_offset[0] + bounds_pos[0] - pos_md_within_ctrl[0] - half_item_width, item_start_pos[1]];
			//console.log('item_start_pos', item_start_pos);
			let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
			//console.log('* new_pos', new_pos);

			if (new_pos[0] < bounds_pos[0] - half_item_width) new_pos[0] = bounds_pos[0] - half_item_width;
			//if (new_pos[1] < 0) new_pos[1] = 0;

			// bounds left

			if (new_pos[0] > bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width) new_pos[0] = bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width;
			//if (new_pos[1] > bounds_size[1] - ctrl_size[1]) new_pos[1] = bounds_size[1] - ctrl_size[1];
			//console.log('** new_pos', new_pos);

			ctrl.pos = new_pos;
		}
		// and need body drag mode too / back.
	}

	const body_mm = e_mm => {
		let touch_count = 1;
		if (e_mm.touches) touch_count = e_mm.touches.length;
		if (touch_count === 1) {
			let pos_mm = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
			movement_offset = [pos_mm[0] - pos_md[0], pos_mm[1] - pos_md[1]];
			if (!dragging) {
				//movement_offset = [(offset_mm[0]), Math.abs(offset_mm[1])];
				let abs_offset = [Math.abs(movement_offset[0]), Math.abs(movement_offset[1])];
				let abs_offset_dist = Math.sqrt(Math.pow(abs_offset[0], 2) + Math.pow(abs_offset[1], 2));

				//console.log('drag_offset_distance', drag_offset_distance);

				//console.log('abs_offset_dist', abs_offset_dist);
				if (abs_offset_dist >= drag_offset_distance) {
					begin_drag(pos_mm);
				}
			} else {
				move_drag(pos_mm);
			}
		}
		// Looks like they are passive now by default.
		//e_mm.preventDefault();
	}

	const end_drag = e_mu => {
		ctrl_body.off('mousemove', body_mm);
		ctrl_body.off('mouseup', body_mu);
		ctrl_body.off('touchmove', body_mm);
		ctrl_body.off('touchend', body_mu);

		if (dragging) {
			dragging = false;
			//console.log('end_drag', end_drag);
			//console.trace();
			// Also end drag attempt...
			//  Want it switched off on mouseup.
			//console.log('pre raise drag complete');
			//console.log('movement_offset', movement_offset);
			ctrl.raise('dragend', {
				movement_offset: movement_offset
			});
		}
	}

	const body_mu = e_mu => {
		// release
		//console.log('body_mu', e_mu);
		//console.trace();
		end_drag(e_mu);
	}

	const h_md = (e_md) => {
		//console.log('dragable e_md', e_md);
		// use offset
		// [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
		if (e_md.pageX) {
			pos_md_within_ctrl = [e_md.offsetX, e_md.offsetX];
		} else {
			pos_md_within_ctrl = [0, 0];
		}
		dragging = false;

		//pos_md_within_ctrl = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];

		//if (drag_mode === 'x') {
		//pos_md = [e_md.layerX, e_md.layerY];

		// Cancel move if there are multiple touches?
		//  Want to recognise pinch / 2 finger rotate events.

		pos_md = [e_md.pageX || e_md.touches[0].pageX, e_md.pageY || e_md.touches[0].pageY];
		//} else {
		//pos_md = [e_md.pageX || e_md.touches[0].pageX, e_md.pageY || e_md.touches[0].pageY];
		//}

		ctrl_body.on('mousemove', body_mm);
		ctrl_body.on('mouseup', body_mu);

		ctrl_body.on('touchmove', body_mm);
		ctrl_body.on('touchend', body_mu);


		// Does this break selectable / other mixins?
		//e_md.preventDefault();
	}

	ctrl.on('change', e_change => {
		let {
			name,
			value
		} = e_change;
		/*
		if (name === 'selected') {
		    //console.log('selected value', value);
		    if (value) {
		        ctrl.add_class('selected');
		    } else {
		        ctrl.remove_class('selected');
		    }
		}
		*/
		//return true;
	})

	//console.log('old_dragable', old_dragable);

	if (!old_dragable) {
		//field(ctrl, 'selected');
		field(ctrl, 'dragable');
		//field(ctrl, 'select_unique');
		//let id = ctrl._id();
		ctrl.on('change', e_change => {
			//console.log('e_change', e_change);
			let n = e_change.name,
				value = e_change.value;
			if (n === 'dragable') {
				if (value === true) {
					// ctrl.deselect();
					//console.trace();

					if (typeof document === 'undefined') {} else {
						// on activation of control.

						let apply_start_handlers = () => {
							//console.log('apply_start_handlers handle', handle);
							//console.trace();
							if (!handle.has_drag_md_handler) {
								handle.has_drag_md_handler = true;
								handle.on('touchstart', h_md);
								handle.on('mousedown', h_md);
							}

							
						}

						//console.log('handle.has_drag_md_handler', handle.has_drag_md_handler);

						ctrl.once_active(() => {
							//console.log('dragable once_active');
							apply_start_handlers();
						});

					}
				} else {
					if (typeof document === 'undefined') {} else {
						handle.off('touchstart', h_md);
						handle.off('mousedown', h_md);
						handle.has_drag_md_handler = false;
					}
				}
			}
		})
	}

	if (old_dragable !== undefined) {
		ctrl.dragable = old_dragable;
	}

}

module.exports = dragable;