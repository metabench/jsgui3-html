var jsgui = require('./../../../../html-core/html-core');
var Horizontal_Menu = require('./../../../organised/1-standard/5-ui/Horizontal_Menu');
const Button = require('./../../../organised/0-core/0-basic/0-native-compositional/button');
const { def, each } = jsgui;
var Control = jsgui.Control;
var fields = {
	'title': String
};
const { dragable, resizable } = require('../../../../control_mixins/mx');
const { get_window_manager } = require('./Window_Manager');
const {
	apply_focus_ring,
	ensure_sr_text
} = require('../../../../control_mixins/a11y');
const { resolve_params, apply_hooks } = require('../../../../control_mixins/theme_params');

/**
 * Button style icons for different themes.
 */
const BUTTON_ICONS = {
	'traffic-light': { minimize: '●', maximize: '●', close: '●' },
	'icons': { minimize: '⊖', maximize: '⊕', close: '⊗' },
	'text': { minimize: '_', maximize: '□', close: '×' },
	'outlined': { minimize: '−', maximize: '□', close: '×' },
	'minimal': { minimize: '−', maximize: '+', close: '×' },
	'segoe': { minimize: '\uE921', maximize: '\uE922', close: '\uE8BB' }
};

/**
 * Traffic light button colors.
 */
const TRAFFIC_LIGHT_COLORS = {
	close: '#ff5f57',
	minimize: '#ffbd2e',
	maximize: '#28c840'
};

class Window extends Control {
	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'window';
		this.add_class('window');
		this.add_class('jsgui-window');

		// Resolve theme params
		const { params, hooks } = resolve_params('window', spec, this.context);
		this._theme_params = params;
		apply_hooks(this, hooks);

		const snap_enabled = spec.snap !== false;
		this.snap_enabled = snap_enabled;
		this.snap_threshold = def(spec.snap_threshold) ? spec.snap_threshold : undefined;
		this.dock_sizes = spec.dock_sizes;
		this.min_size = spec.min_size || [120, 80];
		this.max_size = spec.max_size;
		this.resize_bounds = spec.resize_bounds || spec.extent_bounds || null;
		this.manager = spec.window_manager || spec.manager || null;

		// ── Adaptive layout options (all overridable) ──
		// layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
		//   'auto' uses breakpoints; set explicitly to force a mode.
		this.layout_mode = spec.layout_mode || 'auto';
		// Breakpoints for auto mode
		this.phone_breakpoint = def(spec.phone_breakpoint) ? spec.phone_breakpoint : 600;
		this.tablet_breakpoint = def(spec.tablet_breakpoint) ? spec.tablet_breakpoint : 960;
		// Phone behavior: 'maximize' | 'float' | 'fullscreen'
		//   'maximize' — auto-maximize to fill parent on phone (default, good for most apps)
		//   'float'    — keep floating (useful for image editors, tool palettes)
		//   'fullscreen' — force 100vw × 100vh overlay
		this.phone_behavior = spec.phone_behavior || 'maximize';
		// Tablet behavior: 'float' | 'maximize'
		//   'float' — keep floating (default, tablets have enough space)
		//   'maximize' — auto-maximize
		this.tablet_behavior = spec.tablet_behavior || 'float';
		// Minimum window size on phone/tablet (prevents unusably tiny windows)
		this.touch_min_size = spec.touch_min_size || [200, 160];
		// Whether to enlarge title bar buttons for touch on phone/tablet
		this.touch_buttons = spec.touch_buttons !== false;
		const show_buttons = def(spec.show_buttons) ? spec.show_buttons : params.show_buttons !== false;
		if (!spec.abstract && !spec.el) {
			const { context } = this;
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
				const button_group = new Control({
					context
				});
				button_group.add_class('button-group');
				// Apply position class from params (left or right)
				button_group.add_class(params.button_position || 'right');

				const button_style = params.button_style || 'icons';
				const icons = BUTTON_ICONS[button_style] || BUTTON_ICONS.icons;
				const button_order = params.button_order || ['minimize', 'maximize', 'close'];

				const span = (text) => {
					const res = new jsgui.controls.span({ context });
					res.add(text);
					return res;
				};

				const sr_labels = {
					minimize: 'Minimize window',
					maximize: 'Maximize window',
					close: 'Close window'
				};

				// Create buttons in the specified order
				for (const btn_type of button_order) {
					// Check visibility params
					if (btn_type === 'minimize' && params.show_minimize === false) continue;
					if (btn_type === 'maximize' && params.show_maximize === false) continue;
					if (btn_type === 'close' && params.show_close === false) continue;

					const btn = new Button({ context });
					btn.add_class(btn_type);
					btn.add(span(icons[btn_type] || ''));
					apply_focus_ring(btn);
					ensure_sr_text(btn, sr_labels[btn_type], { add_sr_only: false });

					// Apply traffic light colors if using that style
					if (button_style === 'traffic-light' && TRAFFIC_LIGHT_COLORS[btn_type]) {
						btn.dom.attributes = btn.dom.attributes || {};
						btn.dom.attributes.style = btn.dom.attributes.style || {};
						btn.dom.attributes.style['--btn-color'] = TRAFFIC_LIGHT_COLORS[btn_type];
					}

					button_group.add(btn);

					// Store button references
					if (btn_type === 'minimize') btn_minimize = btn;
					if (btn_type === 'maximize') btn_maximize = btn;
					if (btn_type === 'close') btn_close = btn;
				}

				title_bar.add(button_group);
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
	/**
	 * Resolve the current layout mode from context, viewport, or explicit setting.
	 * @returns {'phone'|'tablet'|'desktop'}
	 */
	resolve_layout_mode() {
		if (this.layout_mode && this.layout_mode !== 'auto') return this.layout_mode;
		const env = this.context && this.context.view_environment;
		if (env && env.layout_mode) return env.layout_mode;
		if (typeof window !== 'undefined') {
			const w = window.innerWidth;
			if (w <= this.phone_breakpoint) return 'phone';
			if (w <= this.tablet_breakpoint) return 'tablet';
		}
		return 'desktop';
	}

	/**
	 * Apply adaptive layout mode: sets data-layout-mode attribute,
	 * enforces touch_min_size, applies phone_behavior / tablet_behavior,
	 * and toggles touch-buttons class.
	 */
	_apply_layout_mode() {
		const el = this.dom && this.dom.el;
		if (!el) return;
		const mode = this.resolve_layout_mode();
		el.setAttribute('data-layout-mode', mode);

		// Enforce minimum touch-friendly window size on phone/tablet
		if (mode === 'phone' || mode === 'tablet') {
			if (this.touch_buttons) {
				el.classList.add('window-touch-buttons');
			}
			const [min_w, min_h] = this.touch_min_size;
			if (this.min_size) {
				this.min_size = [
					Math.max(this.min_size[0], min_w),
					Math.max(this.min_size[1], min_h)
				];
			}
		} else {
			el.classList.remove('window-touch-buttons');
		}

		// Apply phone behavior
		if (mode === 'phone') {
			el.setAttribute('data-phone-behavior', this.phone_behavior);
			if (this.phone_behavior === 'maximize' && !this.has_class('maximized')) {
				this.maximize();
			} else if (this.phone_behavior === 'fullscreen') {
				el.classList.add('window-fullscreen');
			}
		} else {
			el.removeAttribute('data-phone-behavior');
			el.classList.remove('window-fullscreen');
		}

		// Apply tablet behavior
		if (mode === 'tablet') {
			el.setAttribute('data-tablet-behavior', this.tablet_behavior);
			if (this.tablet_behavior === 'maximize' && !this.has_class('maximized')) {
				this.maximize();
			}
		} else {
			el.removeAttribute('data-tablet-behavior');
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
			const { title_bar, btn_minimize, btn_maximize, btn_close } = this;
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

			// ── Adaptive layout ──
			this._apply_layout_mode();
			if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
				this._resize_handler = () => this._apply_layout_mode();
				window.addEventListener('resize', this._resize_handler);
			}
		}
	}
}
Window.css = `
.window {
    position: absolute;
    width: 360px;
    height: 360px;
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e2e8f0);
    border-radius: var(--j-radius, 8px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.window .relative {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.window .title.bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    min-height: 36px;
    background: var(--admin-header-bg, #f8fafc);
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
    cursor: default;
    user-select: none;
    flex-shrink: 0;
}
.window .title.bar h2 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--admin-header-text, #334155);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}
.window .button-group {
    display: flex;
    gap: 4px;
    align-items: center;
}
.window .button-group button {
    min-width: 28px;
    min-height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: var(--admin-muted, #64748b);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}
.window .button-group button:hover {
    background: var(--admin-hover, #f1f5f9);
    color: var(--admin-text, #1e293b);
}
.window .button-group button.close:hover {
    background: var(--j-error, #ef4444);
    color: #fff;
}
.window .inner {
    flex: 1;
    overflow: auto;
    padding: var(--j-gap, 8px);
}
.window.minimized {
    height: 36px;
    overflow: hidden;
}
.window.maximized {
    border-radius: 0;
}

/* ── Touch-sized buttons (phone & tablet) ── */
.window.window-touch-buttons .button-group button {
    min-width: var(--j-touch-target, 44px);
    min-height: var(--j-touch-target, 44px);
    font-size: 18px;
}
.window.window-touch-buttons .title.bar {
    min-height: var(--j-touch-target, 44px);
}

/* ── Phone: fullscreen overlay ── */
.window.window-fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0;
    z-index: 9999;
    transform: none !important;
}

/* ── Phone: float mode — keep floating but ensure minimum usability ── */
.window[data-layout-mode="phone"][data-phone-behavior="float"] {
    min-width: 200px;
    min-height: 160px;
}

/* ── Tablet: float with slightly larger chrome ── */
.window[data-layout-mode="tablet"] .title.bar {
    min-height: 40px;
}
`;
module.exports = Window;
