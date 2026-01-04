var jsgui = require('./../../../../html-core/html-core');
var Horizontal_Menu = require('./../../../organised/1-standard/5-ui/horizontal-menu');
const Button = require('./../../../organised/0-core/0-basic/0-native-compositional/button');
const {def, each} = jsgui;
var Control = jsgui.Control;
var fields = {
	'title': String
};
const {dragable, resizable} = require('../../../../control_mixins/mx');
const {get_window_manager} = require('./window_manager');
const {
	apply_focus_ring,
	ensure_sr_text
} = require('../../../../control_mixins/a11y');
class Window extends Control {
	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'window';
		this.add_class('window');
        const snap_enabled = spec.snap !== false;
        this.snap_enabled = snap_enabled;
        this.snap_threshold = def(spec.snap_threshold) ? spec.snap_threshold : undefined;
        this.dock_sizes = spec.dock_sizes;
        this.min_size = spec.min_size || [120, 80];
        this.max_size = spec.max_size;
        this.resize_bounds = spec.resize_bounds || spec.extent_bounds || null;
        this.manager = spec.window_manager || spec.manager || null;
		const show_buttons = def(spec.show_buttons) ? spec.show_buttons : true;
		if (!spec.abstract && !spec.el) {
			const {context} = this;
			const div_relative = new Control({
				context
			});
			div_relative.add_class('relative');
			const title_bar = new Control({
				context
			});
			title_bar.add_class('title');
			title_bar.add_class('bar');
			const title_h2 = new jsgui.controls.h2({
				context
			})
			title_bar.add(title_h2);
			if (typeof spec.title === 'string') {
				title_h2.add(spec.title);
			}
			div_relative.add(title_bar);
			let btn_minimize, btn_maximize, btn_close;
			if (show_buttons) {
				const right_button_group = new Control({
					context
				});
				right_button_group.add_class('button-group');
				right_button_group.add_class('right');
				btn_minimize = new Button({
					context
				});
				const span = (text) => {
					const res = new jsgui.controls.span({context});
					res.add(text);
					return res;
				}
				btn_minimize.add(span('⊖'));
				apply_focus_ring(btn_minimize);
				ensure_sr_text(btn_minimize, 'Minimize window', { add_sr_only: false });
				right_button_group.add(btn_minimize);
				btn_maximize = new Button({
					context
				});
				btn_maximize.add(span('⊕'))
				apply_focus_ring(btn_maximize);
				ensure_sr_text(btn_maximize, 'Maximize window', { add_sr_only: false });
				right_button_group.add(btn_maximize);
				btn_close = new Button({
					context
				});
				btn_close.add(span('⊗'))
				apply_focus_ring(btn_close);
				ensure_sr_text(btn_close, 'Close window', { add_sr_only: false });
				right_button_group.add(btn_close);
				title_bar.add(right_button_group);
			}
			const ctrl_inner = new Control({
				context
			})
			ctrl_inner.add_class('inner');
			div_relative.add(ctrl_inner);
			this.add(div_relative);
			this.ctrl_inner = ctrl_inner;
			this.inner = ctrl_inner;
			this.title_bar = title_bar;
			this.ctrl_relative = div_relative;
			this._ctrl_fields = this._ctrl_fields || {};
			this._ctrl_fields.ctrl_inner = ctrl_inner;
			this._ctrl_fields.inner = ctrl_inner;
			this._ctrl_fields.title_bar = title_bar;
			this._ctrl_fields.ctrl_relative = div_relative;
			if (show_buttons) {
				this._ctrl_fields.btn_minimize = btn_minimize;
				this._ctrl_fields.btn_maximize = btn_maximize;
				this._ctrl_fields.btn_close = btn_close;
			}
		}
	}
	bring_to_front_z() {
        if (this.manager && typeof this.manager.bring_to_front === 'function') {
            this.manager.bring_to_front(this);
            return;
        }
        let max_z = 0;
        if (this.parent && this.parent.content) {
            each(this.parent.content, (ctrl) => {
                if (ctrl !== this) {
                    const z = parseInt(ctrl.dom.attributes.style['z-index']);
                    if (!isNaN(z) && z > max_z) max_z = z;
                }
            });
        }
        this.dom.attributes.style['z-index'] = parseInt(max_z) + 1;
	}
    /**
     * Snap the window to nearby edges.
     * @param {Object} [options] - Optional settings.
     * @returns {boolean}
     */
    snap_to_bounds(options = {}) {
        if (!this.manager) return false;
        const snap_options = Object.assign({}, options);
        if (this.snap_threshold !== undefined) {
            snap_options.threshold = this.snap_threshold;
        }
        if (this.dock_sizes) {
            snap_options.size = this.dock_sizes;
        }
        return this.manager.snap(this, snap_options);
    }
    /**
     * Dock the window to a specific edge.
     * @param {string} edge - Dock edge.
     * @param {Object} [options] - Optional settings.
     */
    dock_to(edge, options = {}) {
        if (this.manager && typeof this.manager.dock === 'function') {
            const dock_options = Object.assign({}, options);
            if (this.dock_sizes) dock_options.size = this.dock_sizes;
            return this.manager.dock(this, edge, dock_options);
        }
    }
    /**
     * Undock the window and restore size/position.
     */
    undock() {
        if (this.manager && typeof this.manager.undock === 'function') {
            this.manager.undock(this);
        }
    }
	glide_to_pos(pos) {
		return new Promise((s, j) => {
			const [my_new_left, my_new_top] = pos;
			const x_diff = my_new_left - this.ta[6];
			const y_diff = my_new_top - this.ta[7];
			const ms_total_animation_time = 140;
			let animation_start;
			const start_tx = this.ta[6];
			const start_ty = this.ta[7];
			let i_frame = 0;
			const skip_zeroth_frame = false;
			const process_frame = () => {
				if (skip_zeroth_frame && i_frame === 0) {
					requestAnimationFrame(timestamp => {
						i_frame++;
						process_frame();
					});
				} else {
					requestAnimationFrame(timestamp => {
						if (!animation_start) {
							animation_start = timestamp;
							process_frame();
						} else {
							const time_since = timestamp - animation_start;
							if (time_since < ms_total_animation_time) {
								const proportion_through = time_since / ms_total_animation_time;
								const proportional_x_diff = x_diff * proportion_through;
								const proportional_y_diff = y_diff * proportion_through;
								this.ta[6] = start_tx + proportional_x_diff;
								this.ta[7] = start_ty + proportional_y_diff;
								i_frame++;
								process_frame();
							} else {
								this.ta[6] = start_tx + x_diff;
								this.ta[7] = start_ty + y_diff;
								s();
							}
						}
					})
				}
			}
			process_frame();
		})
	}
	async minimize() {
		if (this.manager && typeof this.manager.minimize === 'function') {
			this.manager.minimize(this);
		} else {
			const has_parent_bounds = this.parent && typeof this.parent.bcr === 'function';
			if (!has_parent_bounds) {
				if (this.has_class('minimized')) {
					this.remove_class('minimized');
				} else {
					this.add_class('minimized');
				}
				return;
			}
			const my_bcr = this.bcr();
			if (!this.has_class('minimized')) {
				const width_to_minimize_to = 280;
				const minimized_height = 31;
				if (this.has_class('maximized')) {
					this.was_maximized_just_before_minimizing = true;
					this.pre_minimized_pos = this.pre_maximized_pos;
					this.pre_minimized_size = this.pre_maximized_size;
					this.remove_class('maximized');
				} else {
					this.was_maximized_just_before_minimizing = false;
					this.pre_minimized_pos = my_bcr[0];
					this.pre_minimized_size = my_bcr[2];
				}
				this.dragable = false;
				const parent_bcr = this.parent.bcr();
				const parent_size = parent_bcr[2];
				setTimeout(() => {
					this.size = [width_to_minimize_to, minimized_height];
				}, 17)
				const determine_pos_to_minimize_to = () => {
					let minimized_sibling_window_bcrs = [];
					each(this.parent.content, (ctrl) => {
						if (ctrl !== this) {
							if (ctrl.has_class('window') && ctrl.has_class('minimized')) {
								const ctrl_bcr = ctrl.bcr();
								minimized_sibling_window_bcrs.push(ctrl_bcr);
							}
						}
					});
					if (minimized_sibling_window_bcrs.length > 0) {
						minimized_sibling_window_bcrs.sort((a, b) => {
							if (a[0][1] === b[0][1]) {
								return a[1][0] - b[1][0];
							} else {
								return b[0][1] - a[0][1];
							}
						});
						const last_bcr = minimized_sibling_window_bcrs.at(-1);
						const last_r = last_bcr[1][0];
						const extra_margin = 2;
						if (parent_size[0] >= last_r + width_to_minimize_to + extra_margin) {
							return [last_bcr[1][0] + extra_margin, last_bcr[0][1]];
						} else {
							return [0, last_bcr[0][1] - extra_margin - minimized_height];
						}
					} else {
						return [0, parent_size[1] - minimized_height];
					}
				}
				const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));
				const dest_pos = determine_pos_to_minimize_to();
				dest_pos[0] -= ltpos[0];
				dest_pos[1] -= ltpos[1];
				await this.glide_to_pos(dest_pos);
				this.add_class('minimized');
			} else {
				if (this.was_maximized_just_before_minimizing) {
					await this.maximize();
				} else {
					setTimeout(() => {
						this.size = this.pre_minimized_size;
					}, 17)
					const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));
					const dest_pos = [this.pre_minimized_pos[0] - ltpos[0], this.pre_minimized_pos[1] - ltpos[1]];
					await this.glide_to_pos(dest_pos);
					this.remove_class('minimized');
					this.dragable = true;
				}
			}
		}
	}
	async maximize() {
		if (this.manager && typeof this.manager.maximize === 'function') {
			this.manager.maximize(this);
		} else {
			if (this.has_class('maximized')) {
				this.remove_class('maximized');
				setTimeout(() => {
					this.size = [this.pre_maximized_size[0] - 2, this.pre_maximized_size[1] - 2];
				}, 17)
				this.dragable = true;
				const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));
				const dest_pos = [this.pre_maximized_pos[0] - ltpos[0], this.pre_maximized_pos[1] - ltpos[1]];
				await this.glide_to_pos(dest_pos);
			} else {
				const my_bcr = this.bcr();
				const ltpos = [this.dom.attributes.style.left, this.dom.attributes.style.top].map(x => parseInt(x));
				if (this.has_class('minimized')) {
					this.remove_class('minimized');
					this.pre_maximized_pos = this.pre_minimized_pos;
					this.pre_maximized_size = this.pre_minimized_size;
				} else {
					this.pre_maximized_pos = my_bcr[0];
					this.pre_maximized_size = my_bcr[2];
				}
				this.add_class('maximized');
				this.dragable = false;
				const parent_bcr = this.parent.bcr();
				const parent_size = parent_bcr[2];
				setTimeout(() => {
					this.size = [parent_size[0] - 4, parent_size[1] - 4];
				}, 17)
				const [tx, ty] = [this.ta[6], this.ta[7]];
				const dest_pos = [0 - ltpos[0], 0 - ltpos[1]];
				await this.glide_to_pos(dest_pos);
			}
		}
	}
	close() {
		if (this.manager && typeof this.manager.close === 'function') {
			this.manager.close(this);
		} else {
			this.remove();
		}
	}
	'activate'() {
		if (!this.__active) {
            super.activate();
            if (!this.manager) {
                this.manager = get_window_manager(this.context);
            }
            if (this.manager && typeof this.manager.register === 'function') {
                this.manager.register(this);
            }
			const {title_bar, btn_minimize, btn_maximize, btn_close} = this;
			if (btn_close) {
				btn_close.on('click', () => {
					this.close();
				})
				btn_close.on('press', () => {
					this.close();
				})
			}
			if (btn_maximize) {
				btn_maximize.on('click', () => {
					this.maximize();
				})
				btn_maximize.on('press', () => {
					this.maximize();
				})
			}
			if (btn_minimize) {
				btn_minimize.on('click', () => {
					this.minimize();
				})
				btn_minimize.on('press', () => {
					this.minimize();
				})
			}
			const dom_el = this.dom && this.dom.el;
			const dom_title_bar = dom_el ? dom_el.querySelector('.title.bar') : null;
			const dom_buttons = dom_el ? dom_el.querySelectorAll('.title.bar button.button') : null;
			const dom_minimize_button = dom_buttons && dom_buttons[0] ? dom_buttons[0] : null;
			const dom_maximize_button = dom_buttons && dom_buttons[1] ? dom_buttons[1] : null;
			const dom_close_button = dom_buttons && dom_buttons[2] ? dom_buttons[2] : null;

			if (!btn_minimize && dom_minimize_button) {
				dom_minimize_button.addEventListener('click', () => {
					this.minimize();
				});
			}
			if (!btn_maximize && dom_maximize_button) {
				dom_maximize_button.addEventListener('click', () => {
					this.maximize();
				});
			}
			if (!btn_close && dom_close_button) {
				dom_close_button.addEventListener('click', () => {
					this.close();
				});
			}

			if (title_bar) {
				title_bar.on('dblclick', () => {
					this.maximize();
				})
			} else if (dom_title_bar) {
				dom_title_bar.addEventListener('dblclick', () => {
					this.maximize();
				});
			}
			this.on('mousedown', () => {
				this.bring_to_front_z();
			});
			dragable(this, {
                drag_mode: 'translate',
				handle: this.title_bar,
				bounds: this.parent
            });
            this.dragable = true;
			resizable(this, {
				resize_mode: 'br_handle',
				bounds: [this.min_size, this.max_size],
				extent_bounds: this.resize_bounds || this.parent
			});
            if (this.snap_enabled) {
                this.on('dragend', () => {
                    this.snap_to_bounds();
                });
            }
			setInterval(() => {
				if (this.has_class('minimized')) {
					const extended_bcr = this.bcr().extend('left', 80);
					const minimized_siblings = this.siblings.filter(x => x.has_class('minimized'));
					const overlaps = extended_bcr.overlaps(minimized_siblings);
					if (overlaps && overlaps.length > 0) {
						const max_overlap_width = Math.max(...overlaps.map(x => x.w))
						if (max_overlap_width <= 78) {
							const parent_bcr = this.parent.bcr();
							const parent_left = parent_bcr[0][0];
							const my_bcr = this.bcr();
							const my_left = my_bcr[0][0];
							const dist_from_parent_left = my_left - parent_left;
							if (dist_from_parent_left > 2) {
								this.ta[6] = this.ta[6] - 1;
							}
						}
					} else {
						const parent_bcr = this.parent.bcr();
						const parent_left = parent_bcr[0][0];
						const my_bcr = this.bcr();
						const my_left = my_bcr[0][0];
						const dist_from_parent_left = my_left - parent_left;
						if (dist_from_parent_left > 2) {
							if (dist_from_parent_left > 8) {
								this.ta[6] = this.ta[6] - 8;
							} else {
								this.ta[6] = this.ta[6] - dist_from_parent_left;
							}
						}
					}
				}
			}, 18);
		}
	}
}
Window.css = `
.relative {
	position: relative;
}
.window.no-transitions {
	transition: none !important; 
}
:root {
	--rhsqsize: 16px;
}
.resize-handle {
	width: var(--rhsqsize);
	height: var(--rhsqsize);
	color: #CCCCCC;
	opacity: 0.45;
	position: absolute;
	line-height: var(--rhsqsize);
	font-size: var(--rhsqsize);
	user-select: none;
	transition: color 0.14s ease-in-out, opacity 0.14s ease-in-out;
}
.resize-handle:hover {
	color: #EFCF00;
	opacity: 0.5;
}
.resize-handle.resizing {
	color: #FFDF00;
	opacity: 1;
}
.bottom-right.resize-handle {
	right: 0;
	bottom: 0;
	cursor: nwse-resize;
	z-index: 10000001;
}
.window {
    position: absolute;
    border: 1px solid #CCCCCC;
	background-color: #F4F4F4;
	width: 360px;
	height: 360px;
	border-radius: 5px;
	transition: width 0.14s linear, height 0.14s linear; 
	overflow: hidden;
	-webkit-user-select: none;
	user-select: none;
}
.window .relative {
	height: inherit;
	overflow: hidden;
}
.window.minimized {
	height: 31px;
}
.window.minimized .bottom-right.resize-handle {
	display: none;
}
.window.maximized .bottom-right.resize-handle {
	display: none;
}
.window.docked-left,
.window.docked-right,
.window.docked-top,
.window.docked-bottom,
.window.docked-fill {
	border-radius: 0;
}
.window .title.bar {
    height: 31px;
	background-color: #0D4F8B;
	background-image: linear-gradient(to right, #0D4F8B , #3fb0d9);
    color: #FFFFFF;
    font-size: 12px;
    line-height: 32px;
    text-indent: 4px;
    -webkit-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
	border-radius: 4px;
	-webkit-user-select: none;
	user-select: none;
	overflow: hidden;
	cursor: default;
}
.window .title.bar h2 {
	font-weight: 400;
	margin-left: 42px;
	float: left;
}
.window .title.bar > span {
    vertical-align: middle;
    line-height: 31px;
}
.window .title.bar .button > span {
	transform: scale(2);
    display: inline-block;
	line-height: 13px;
    height: 14px;
}
.window .title.bar .right {
    margin-right: 2px;
    margin-top: 2px;
    position: absolute;
    right: 0;
    top: 0;
	height: 29px;
}
.window .title.bar .button {
    width: 26px;
	height: 26px;
	line-height: 24px;
	font-size: 14px;
}
.window .title.bar .button + .button {
    margin-left: 3px;
}
.window .relative .inner {
	width: 100%;
	height: calc(100% - 31px);
}
`
module.exports = Window;
