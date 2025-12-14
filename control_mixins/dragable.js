const {
	prop,
	field
} = require('obext');
const {
	each,
	tof
} = require('lang-tools');
let dragable = (ctrl, opts = {}) => {
	let {
		bounds,
		handle,
		mode,
		start_action,
		condition
	} = opts;
	start_action = start_action || ['touchstart', 'mousedown'];
	if (tof(start_action) === 'string') start_action = [start_action];
	let bounds_pos;
	let bounds_is_parent = bounds && bounds === ctrl.parent;
	if (bounds === 'parent') {
		bounds = ctrl.parent;
		bounds_is_parent = true;
	}
	if (bounds) {
		bounds_pos = bounds.pos || [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];
	}
		handle = handle || ctrl;
		const old_dragable = ctrl.dragable;

		if (old_dragable) {
			return;
		}

	let drag_mode = opts.drag_mode || opts.mode || 'translate';
	if (bounds_is_parent) {
	}
	let pos_md, pos_mm, pos_mu, pos_md_within_ctrl;


	const setup_isomorphic = () => {
        const old_silent = ctrl.view.data.model.mixins.silent;
        ctrl.view.data.model.mixins.silent = true;
        ctrl.view.data.model.mixins.push({
            name: 'dragable'
        });
        ctrl.view.data.model.mixins.silent = old_silent;
        field(ctrl, 'dragable');
    }
    setup_isomorphic();

    if (typeof document === 'undefined') {
        ctrl.on('server-pre-render', e => {
            //console.log('selectable server-pre-render');

            if (ctrl.dragable === true) {
                ctrl._fields = ctrl._fields || {};
                //ctrl._fields.selected = ctrl.selected;

                ctrl._fields.dragable = true;

            }

        })
    }

	if (ctrl.dom.el) {
		let ctrl_body = ctrl.context.body();
		let dragging = false;
		let drag_offset_distance = opts.start_distance || 6;
		let movement_offset;
		let item_start_pos;
		let bounds_size;
		let bounds_offset;
		let half_item_width, item_width;
		let initial_bounds_bcr, initial_bcr;
		let initial_bcr_offset_from_bounds;
		const el = ctrl.dom.el;
		let ctrl_translation3d = new Float32Array(3);   
		let initial_ctrl_translation3d;
		let initial_ctrl_translate;
		const begin_drag = (pos) => {
			initial_bcr = ctrl.bcr();
			if (bounds) {
				if (typeof bounds.bcr === 'function') {
					initial_bounds_bcr = bounds.bcr();
					initial_bcr_offset_from_bounds = [
						[initial_bcr[0][0] - initial_bounds_bcr[0][0], initial_bcr[0][1] - initial_bounds_bcr[0][1]],
						[initial_bcr[1][0] - initial_bounds_bcr[1][0], initial_bcr[1][1] - initial_bounds_bcr[1][1]],
						[initial_bcr[2][0] - initial_bounds_bcr[2][0], initial_bcr[2][1] - initial_bounds_bcr[2][1]]
					]
				}
			}
				if (drag_mode === 'within-parent') {
					dragging = true;
					item_start_pos = ctrl.pos;
					const ctrl_pos_to_be = [item_start_pos[0] - movement_offset[0], item_start_pos[1] - movement_offset[1]];
					ctrl.pos = ctrl_pos_to_be;
				} else if (drag_mode === 'translate') {
					// Capture current translate position at drag start to avoid jumping after resize
					initial_ctrl_translate = ctrl.ta.slice(6, 8);
					dragging = true;
				} else {
					if (drag_mode === 'y') {
						dragging = true;
						item_start_pos = ctrl.pos || [ctrl.dom.el.offsetLeft, ctrl.dom.el.offsetTop];
						ctrl.pos = [item_start_pos[0], item_start_pos[1] + movement_offset[1]];
					} else if (drag_mode === 'x') {
						dragging = true;
						item_start_pos = ctrl.pos || [ctrl.dom.el.offsetLeft, ctrl.dom.el.offsetTop];
						half_item_width = Math.round(ctrl.dom.el.offsetWidth / 2);
						item_width = (ctrl.dom.el.offsetWidth);
						bounds_offset = [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];
						ctrl.pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
					} else {
						throw new Error('Unsupported drag_mode: ' + drag_mode);
					}
				}
				ctrl.raise('dragstart');
			}
			const move_drag = (pos) => {
			let ctrl_size = [ctrl.dom.el.offsetWidth, ctrl.dom.el.offsetHeight];
			if (drag_mode === 'translate') {
				let tr_x = movement_offset[0] + initial_ctrl_translate[0];
				let tr_y = movement_offset[1] + initial_ctrl_translate[1];
				if (bounds) {
					// Get current bounds BCR (allows for dynamic bounds updates if bounds move/resize)
					const current_bounds_bcr = bounds.bcr();
					// Calculate absolute containment bounds within parent
					const bounds_left = current_bounds_bcr[0][0];
					const bounds_top = current_bounds_bcr[0][1];
					const bounds_right = current_bounds_bcr[1][0] - ctrl_size[0];
					const bounds_bottom = current_bounds_bcr[1][1] - ctrl_size[1];
					// Convert absolute bounds to movement offsets relative to initial translate position
					const min_x_offset = bounds_left - initial_ctrl_translate[0];
					const max_x_offset = bounds_right - initial_ctrl_translate[0];
					const min_y_offset = bounds_top - initial_ctrl_translate[1];
					const max_y_offset = bounds_bottom - initial_ctrl_translate[1];
					// Apply containment constraints
					if (tr_x < min_x_offset) tr_x = min_x_offset;
					if (tr_x > max_x_offset) tr_x = max_x_offset;
					if (tr_y < min_y_offset) tr_y = min_y_offset;
					if (tr_y > max_y_offset) tr_y = max_y_offset;
				}
				ctrl.ta[6] = tr_x;
				ctrl.ta[7] = tr_y;
				} else if (drag_mode === 'within-parent') {
					bounds = bounds || ctrl.parent;
					bounds_size = bounds.bcr()[2];
					let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1] + movement_offset[1]];
					if (new_pos[0] < 0) new_pos[0] = 0;
					if (new_pos[1] < 0) new_pos[1] = 0;
					if (new_pos[0] > bounds_size[0] - ctrl_size[0]) new_pos[0] = bounds_size[0] - ctrl_size[0];
					if (new_pos[1] > bounds_size[1] - ctrl_size[1]) new_pos[1] = bounds_size[1] - ctrl_size[1];
					ctrl.pos = new_pos;
				} else if (drag_mode === 'y') {
					let new_pos = [item_start_pos[0], item_start_pos[1] + movement_offset[1]];
					ctrl.pos = new_pos;
				} else if (drag_mode === 'x') {
					bounds_size = [bounds.dom.el.offsetWidth, bounds.dom.el.offsetHeight];
					let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
					if (new_pos[0] < bounds_pos[0] - half_item_width) new_pos[0] = bounds_pos[0] - half_item_width;
					if (new_pos[0] > bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width) new_pos[0] = bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width;
					ctrl.pos = new_pos;
				}
			}
		const body_mm = e_mm => {
			let touch_count = 0;
			if (e_mm.touches) touch_count = e_mm.touches.length;
			if (e_mm.touches) {
				pos_mm = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
			} else {
				pos_mm = [e_mm.pageX, e_mm.pageY];
			}
			if (touch_count === 0 || touch_count === 1) {
				if (e_mm.buttons === 0) {
					body_mu();
				} else {
					if (e_mm.pageX || e_mm.touches) {
						let pos_mm;
						if (e_mm.touches) {
							pos_mm = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
						} else {
							pos_mm = [e_mm.pageX, e_mm.pageY];
						}
						if (pos_mm[0] !== undefined && pos_mm[1] !== undefined) {
							movement_offset = [pos_mm[0] - pos_md[0], pos_mm[1] - pos_md[1]];
							if (!dragging) {
								let abs_offset = [Math.abs(movement_offset[0]), Math.abs(movement_offset[1])];
								let abs_offset_dist = Math.sqrt(Math.pow(abs_offset[0], 2) + Math.pow(abs_offset[1], 2));
								if (abs_offset_dist >= drag_offset_distance) {
									begin_drag(pos_mm);
								}
							} else {
								move_drag(pos_mm);
							}
						}
					}
				}
			}
		}
		const end_drag = e_mu => {
			ctrl_body.off('mousemove', body_mm);
			ctrl_body.off('mouseup', body_mu);
			ctrl_body.off('touchmove', body_mm);
			ctrl_body.off('touchend', body_mu);
			if (dragging) {
				dragging = false;
				ctrl.raise('dragend', {
					movement_offset: movement_offset
				});
			}
		}
		const body_mu = e_mu => {
			end_drag(e_mu);
		}
		const h_md = (e_md) => {
			if (!condition || condition()) {
				if (e_md.pageX) {
					pos_md_within_ctrl = [e_md.offsetX, e_md.offsetX];
				} else {
					pos_md_within_ctrl = [0, 0];
				}
				dragging = false;
				pos_md = [e_md.pageX || e_md.touches[0].pageX, e_md.pageY || e_md.touches[0].pageY];
				ctrl_body.on('mousemove', body_mm);
				ctrl_body.on('mouseup', body_mu);
				ctrl_body.on('touchmove', body_mm);
				ctrl_body.on('touchend', body_mu);
			}
		}
		ctrl.on('change', e_change => {
			let n = e_change.name,
				value = e_change.value;
			if (n === 'dragable') {
				if (value === true) {
					if (typeof document === 'undefined') {} else {
						let apply_start_handlers = (start_action) => {
							if (!handle.has_drag_md_handler) {
								handle.has_drag_md_handler = true;
								each(start_action, sa => {
									handle.on(sa, h_md);
								});
							}
						}
						ctrl.once_active(() => {
							apply_start_handlers(start_action);
						});
					}
				} else {
					if (typeof document === 'undefined') {} else {
						(start_action => {
							each(start_action, sa => {
								handle.off(sa, h_md);
							});
						})(start_action);
						handle.has_drag_md_handler = false;
					}
				}
			}
		})
	}

	
	if (!old_dragable) {
		
		
	}
	//if (old_dragable !== undefined) {
	//	ctrl.dragable = old_dragable;
	//}
}
module.exports = dragable;
