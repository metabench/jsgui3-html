/**
 * Toolbar — Horizontal (or vertical) container for tool buttons and controls.
 *
 * Features:
 * - Roving tabindex keyboard navigation (Left/Right or Up/Down arrows)
 * - Icon + text buttons with tooltips
 * - Toggle buttons (aria-pressed)
 * - Separators between groups
 * - Overflow menu for narrow viewports
 * - Adaptive layout modes (phone/tablet/desktop)
 * - Unified action event
 *
 * @param {Object} options
 * @param {'horizontal'|'vertical'} [options.orientation='horizontal']
 * @param {'auto'|'phone'|'tablet'|'desktop'} [options.layout_mode='auto']
 * @param {number} [options.overflow_breakpoint=600]
 * @param {boolean} [options.overflow_enabled=true]
 * @param {number|null} [options.max_visible_items=null]
 *
 * Events:
 *   'action' — { id, config, ctrl }
 */

const Control = require('../../../../html-core/control');
const Button = require('../../0-core/0-basic/0-native-compositional/Button');
const {
    apply_focus_ring,
    apply_label,
    ensure_sr_text
} = require('../../../../control_mixins/a11y');
const { is_defined } = require('../../../../html-core/html-core');

class Toolbar extends Control {
    constructor(options = {}) {
        super(options);

        this.add_class('toolbar');
        this.add_class('jsgui-toolbar');
        this.dom.attributes.role = 'toolbar';

        this._orientation = options.orientation === 'vertical' ? 'vertical' : 'horizontal';
        this.dom.attributes['aria-orientation'] = this._orientation;

        if (this._orientation === 'vertical') {
            this.add_class('toolbar-vertical');
        } else {
            this.add_class('toolbar-horizontal');
        }

        // ── Adaptive layout options ──
        this.layout_mode = options.layout_mode || 'auto';
        this.overflow_breakpoint = is_defined(options.overflow_breakpoint) ? Number(options.overflow_breakpoint) : 600;
        this.overflow_enabled = options.overflow_enabled !== false;
        this.max_visible_items = is_defined(options.max_visible_items) ? options.max_visible_items : null;

        this.items = [];
        this._item_configs = [];
        this._focused_index = 0;
    }

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode !== 'auto') return this.layout_mode;
        if (this.context && this.context.view_environment && this.context.view_environment.layout_mode) {
            return this.context.view_environment.layout_mode;
        }
        if (typeof window !== 'undefined') {
            if (window.innerWidth < this.overflow_breakpoint) return 'phone';
        }
        return 'desktop';
    }

    /**
     * Add a button to the toolbar.
     * @param {Object} config
     * @param {string} [config.id] — Unique identifier for the button.
     * @param {string} [config.icon] — Icon text/emoji.
     * @param {string} [config.label] — Button label text.
     * @param {string} [config.aria_label] — Override aria-label.
     * @param {string} [config.tooltip] — Tooltip text.
     * @param {boolean} [config.toggle] — If true, button is a toggle button.
     * @param {boolean} [config.pressed] — Initial pressed state for toggles.
     * @param {boolean} [config.disabled] — Initial disabled state.
     * @param {Function} [config.onClick] — Click handler.
     * @returns {Control} The created button control.
     */
    addButton(config) {
        const { context } = this;
        const button = new Button({ context });
        button.add_class('toolbar-button');
        apply_focus_ring(button);

        if (config.icon) {
            const icon = new Control({ context, tag_name: 'span' });
            icon.add_class('toolbar-button-icon');
            icon.dom.attributes['aria-hidden'] = 'true';
            icon.add(config.icon);
            button.add(icon);
        }

        if (config.label) {
            const label = new Control({ context, tag_name: 'span' });
            label.add_class('toolbar-button-label');
            label.add(config.label);
            button.add(label);
        }

        if (config.aria_label) {
            apply_label(button, config.aria_label, { force: true });
        }

        if (!config.label && config.icon) {
            const sr_text = config.aria_label || config.tooltip || 'Toolbar action';
            ensure_sr_text(button, sr_text);
        }

        if (config.tooltip) {
            button.dom.attributes.title = config.tooltip;
        }

        // Toggle button ARIA
        if (config.toggle) {
            button.dom.attributes['aria-pressed'] = config.pressed ? 'true' : 'false';
        }

        // Disabled state
        if (config.disabled) {
            button.dom.attributes.disabled = '';
            button.dom.attributes['aria-disabled'] = 'true';
        }

        // ID for action events
        if (config.id) {
            button.dom.attributes['data-toolbar-id'] = config.id;
        }

        if (config.onClick) {
            button.on('click', config.onClick);
        }

        // Roving tabindex: first focusable button gets tabindex=0, rest get -1
        const focusable_count = this._get_focusable_items().length;
        button.dom.attributes.tabindex = focusable_count === 0 ? '0' : '-1';

        this.add(button);
        this.items.push(button);
        this._item_configs.push({ type: 'button', config, ctrl: button });

        return button;
    }

    /**
     * Add a separator.
     */
    addSeparator() {
        const { context } = this;
        const separator = new Control({ context, tag_name: 'div' });
        separator.add_class('toolbar-separator');
        separator.dom.attributes.role = 'separator';
        separator.dom.attributes['aria-orientation'] =
            this._orientation === 'horizontal' ? 'vertical' : 'horizontal';
        this.add(separator);
        this.items.push(separator);
        this._item_configs.push({ type: 'separator', ctrl: separator });
        return separator;
    }

    /**
     * Add a spacer (flexible space).
     */
    addSpacer() {
        const { context } = this;
        const spacer = new Control({ context, tag_name: 'div' });
        spacer.add_class('toolbar-spacer');
        this.add(spacer);
        this.items.push(spacer);
        this._item_configs.push({ type: 'spacer', ctrl: spacer });
        return spacer;
    }

    /**
     * Add any custom control.
     */
    addControl(control) {
        control.add_class('toolbar-item');
        this.add(control);
        this.items.push(control);
        this._item_configs.push({ type: 'control', ctrl: control });
        return control;
    }

    /**
     * Clear all items.
     */
    clear() {
        this.content.clear();
        this.items = [];
        this._item_configs = [];
        this._focused_index = 0;
    }

    /**
     * Set a button's disabled state by id.
     * @param {string} id — The button id (from config.id).
     * @param {boolean} disabled
     */
    set_item_disabled(id, disabled) {
        const entry = this._item_configs.find(e => e.config && e.config.id === id);
        if (!entry) return;
        const ctrl = entry.ctrl;
        if (disabled) {
            ctrl.dom.attributes.disabled = '';
            ctrl.dom.attributes['aria-disabled'] = 'true';
        } else {
            delete ctrl.dom.attributes.disabled;
            delete ctrl.dom.attributes['aria-disabled'];
        }
        // Update live DOM if active
        if (ctrl.dom.el) {
            if (disabled) {
                ctrl.dom.el.setAttribute('disabled', '');
                ctrl.dom.el.setAttribute('aria-disabled', 'true');
            } else {
                ctrl.dom.el.removeAttribute('disabled');
                ctrl.dom.el.removeAttribute('aria-disabled');
            }
        }
    }

    /**
     * Set a toggle button's pressed state by id.
     * @param {string} id — The button id (from config.id).
     * @param {boolean} pressed
     */
    set_item_pressed(id, pressed) {
        const entry = this._item_configs.find(e => e.config && e.config.id === id);
        if (!entry) return;
        const ctrl = entry.ctrl;
        ctrl.dom.attributes['aria-pressed'] = pressed ? 'true' : 'false';
        if (ctrl.dom.el) {
            ctrl.dom.el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        }
    }

    /**
     * Get an array of focusable button items.
     * @returns {Array}
     */
    _get_focusable_items() {
        return this._item_configs.filter(e =>
            e.type === 'button' && !e.ctrl.dom.attributes.disabled
        );
    }

    /**
     * Move focus by delta steps in the focusable item list (roving tabindex).
     * @param {number} delta — +1 for next, -1 for previous
     */
    _move_focus(delta) {
        const focusable = this._get_focusable_items();
        if (focusable.length === 0) return;

        // Find currently focused element
        let current_idx = focusable.findIndex(e =>
            e.ctrl.dom.attributes.tabindex === '0'
        );
        if (current_idx < 0) current_idx = 0;

        // Update tabindex on old item
        focusable[current_idx].ctrl.dom.attributes.tabindex = '-1';
        if (focusable[current_idx].ctrl.dom.el) {
            focusable[current_idx].ctrl.dom.el.setAttribute('tabindex', '-1');
        }

        // Calculate new index (wrapping)
        let new_idx = (current_idx + delta + focusable.length) % focusable.length;

        // Update tabindex on new item and focus it
        focusable[new_idx].ctrl.dom.attributes.tabindex = '0';
        if (focusable[new_idx].ctrl.dom.el) {
            focusable[new_idx].ctrl.dom.el.setAttribute('tabindex', '0');
            focusable[new_idx].ctrl.dom.el.focus();
        }
    }

    /**
     * Apply adaptive layout mode to the DOM.
     */
    _apply_layout_mode() {
        if (!this.dom.el) return;
        const mode = this.resolve_layout_mode();
        this.dom.el.setAttribute('data-layout-mode', mode);
        this._update_overflow();
    }

    /**
     * Update overflow menu visibility based on available space.
     */
    _update_overflow() {
        if (!this.dom.el || !this.overflow_enabled) return;

        const mode = this.resolve_layout_mode();
        const max_items = this.max_visible_items;

        if (mode === 'phone' && max_items !== null) {
            const buttons = this.dom.el.querySelectorAll('.toolbar-button, .toolbar-item');
            buttons.forEach((btn, idx) => {
                if (idx >= max_items) {
                    btn.classList.add('toolbar-overflow-hidden');
                } else {
                    btn.classList.remove('toolbar-overflow-hidden');
                }
            });

            const trigger = this.dom.el.querySelector('.toolbar-overflow-trigger');
            const has_overflow = buttons.length > max_items;
            if (trigger) {
                trigger.style.display = has_overflow ? '' : 'none';
            }
        } else {
            const hidden = this.dom.el.querySelectorAll('.toolbar-overflow-hidden');
            hidden.forEach(el => el.classList.remove('toolbar-overflow-hidden'));
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Keyboard navigation (roving tabindex)
            this.add_dom_event_listener('keydown', e_key => {
                const is_horiz = this._orientation === 'horizontal';
                const key = e_key.key;

                if ((is_horiz && key === 'ArrowRight') || (!is_horiz && key === 'ArrowDown')) {
                    e_key.preventDefault();
                    this._move_focus(1);
                } else if ((is_horiz && key === 'ArrowLeft') || (!is_horiz && key === 'ArrowUp')) {
                    e_key.preventDefault();
                    this._move_focus(-1);
                } else if (key === 'Home') {
                    e_key.preventDefault();
                    // Focus first
                    const focusable = this._get_focusable_items();
                    if (focusable.length > 0) {
                        focusable.forEach(e => {
                            e.ctrl.dom.attributes.tabindex = '-1';
                            if (e.ctrl.dom.el) e.ctrl.dom.el.setAttribute('tabindex', '-1');
                        });
                        focusable[0].ctrl.dom.attributes.tabindex = '0';
                        if (focusable[0].ctrl.dom.el) {
                            focusable[0].ctrl.dom.el.setAttribute('tabindex', '0');
                            focusable[0].ctrl.dom.el.focus();
                        }
                    }
                } else if (key === 'End') {
                    e_key.preventDefault();
                    // Focus last
                    const focusable = this._get_focusable_items();
                    if (focusable.length > 0) {
                        focusable.forEach(e => {
                            e.ctrl.dom.attributes.tabindex = '-1';
                            if (e.ctrl.dom.el) e.ctrl.dom.el.setAttribute('tabindex', '-1');
                        });
                        const last = focusable[focusable.length - 1];
                        last.ctrl.dom.attributes.tabindex = '0';
                        if (last.ctrl.dom.el) {
                            last.ctrl.dom.el.setAttribute('tabindex', '0');
                            last.ctrl.dom.el.focus();
                        }
                    }
                }
            });

            // Unified action event + toggle support
            this.add_dom_event_listener('click', e_click => {
                const target = e_click.target;
                if (!target) return;

                // Find the toolbar button ancestor
                const btn_el = target.closest ? target.closest('.toolbar-button') : null;
                if (!btn_el) return;

                const id = btn_el.getAttribute('data-toolbar-id');
                const entry = this._item_configs.find(e =>
                    e.type === 'button' && e.ctrl.dom.el === btn_el
                );

                // Toggle pressed state
                if (entry && entry.config && entry.config.toggle) {
                    const was_pressed = btn_el.getAttribute('aria-pressed') === 'true';
                    btn_el.setAttribute('aria-pressed', was_pressed ? 'false' : 'true');
                    entry.ctrl.dom.attributes['aria-pressed'] = was_pressed ? 'false' : 'true';
                }

                if (id) {
                    this.raise('action', {
                        id,
                        config: entry ? entry.config : null,
                        ctrl: entry ? entry.ctrl : null
                    });
                }
            });

            // Apply initial layout mode
            this._apply_layout_mode();

            // Listen for resize in auto mode
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }
        }
    }
}

Toolbar.css = `
/* ─── Toolbar ─── */
.jsgui-toolbar {
    display: flex;
    align-items: center;
    gap: var(--toolbar-gap, var(--j-space-1, 4px));
    padding: var(--toolbar-padding, var(--j-space-1, 4px) var(--j-space-2, 8px));
    background: var(--j-bg-surface, var(--admin-card-bg, #1e1e2e));
    border: 1px solid var(--j-border, var(--admin-border, #333));
    border-radius: var(--j-radius-md, 6px);
    font-family: var(--j-font-sans, system-ui, sans-serif);
}
.toolbar-vertical {
    flex-direction: column;
    align-items: stretch;
}

/* ─── Button ─── */
.jsgui-toolbar .toolbar-button {
    display: inline-flex;
    align-items: center;
    gap: var(--j-space-1, 4px);
    padding: var(--j-space-1, 4px) var(--j-space-2, 8px);
    border: 1px solid transparent;
    border-radius: var(--j-radius-sm, 4px);
    background: transparent;
    color: var(--j-fg, #e0e0e0);
    cursor: pointer;
    min-width: var(--j-touch-target, 36px);
    min-height: var(--j-touch-target, 36px);
    justify-content: center;
    white-space: nowrap;
    font-size: var(--j-text-sm, 0.875rem);
    transition: background 120ms ease-out, border-color 120ms ease-out;
}
.jsgui-toolbar .toolbar-button:hover {
    background: var(--j-bg-hover, rgba(255,255,255,0.08));
    border-color: var(--j-border-hover, rgba(255,255,255,0.12));
}
.jsgui-toolbar .toolbar-button:active {
    background: var(--j-bg-active, rgba(255,255,255,0.12));
}
.jsgui-toolbar .toolbar-button:focus-visible {
    outline: 2px solid var(--j-primary, #5b9bd5);
    outline-offset: 2px;
}
.jsgui-toolbar .toolbar-button[disabled],
.jsgui-toolbar .toolbar-button[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
}
.jsgui-toolbar .toolbar-button[aria-pressed="true"] {
    background: var(--j-primary-muted, rgba(91,155,213,0.15));
    border-color: var(--j-primary, #5b9bd5);
    color: var(--j-primary, #5b9bd5);
}

/* ─── Separator ─── */
.toolbar-separator {
    width: 1px;
    height: 20px;
    background: var(--j-border, #444);
    flex-shrink: 0;
}
.toolbar-vertical .toolbar-separator {
    width: 100%;
    height: 1px;
}

/* ─── Spacer ─── */
.toolbar-spacer {
    flex: 1 1 auto;
}

/* ─── Overflow ─── */
.toolbar-overflow-hidden {
    display: none !important;
}

/* ── Phone layout: touch-sized buttons, hide labels ── */
.jsgui-toolbar[data-layout-mode="phone"] .toolbar-button {
    min-width: 44px;
    min-height: 44px;
    padding: var(--j-space-2, 8px);
}
.jsgui-toolbar[data-layout-mode="phone"] .toolbar-button-label {
    display: none;
}

/* ── Tablet layout: touch-sized buttons ── */
.jsgui-toolbar[data-layout-mode="tablet"] .toolbar-button {
    min-width: 44px;
    min-height: 44px;
}
`;
module.exports = Toolbar;
