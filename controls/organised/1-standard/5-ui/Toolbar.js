/**
 * Toolbar - A horizontal container for tool buttons and controls
 * 
 * Features:
 * - Horizontal layout with flexible items
 * - Separators between groups
 * - Icon + text buttons
 * - Tooltips
 * - Overflow menu for narrow viewports
 * - Adaptive layout modes (phone/tablet/desktop)
 */

const Control = require('../../../../html-core/control');
const Button = require('../../0-core/0-basic/0-native-compositional/button');
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

        // ── Adaptive layout options (all overridable) ──
        // layout_mode: 'auto' | 'phone' | 'tablet' | 'desktop'
        this.layout_mode = options.layout_mode || 'auto';
        // Breakpoint for overflow menu behavior
        this.overflow_breakpoint = is_defined(options.overflow_breakpoint) ? Number(options.overflow_breakpoint) : 600;
        // Whether to enable overflow menu (default true, set false to disable)
        this.overflow_enabled = options.overflow_enabled !== false;
        // Maximum visible items before overflow (null = auto based on container)
        this.max_visible_items = is_defined(options.max_visible_items) ? options.max_visible_items : null;
        
        this.items = [];
        this._item_configs = [];
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
     * Add a button to the toolbar
     */
    addButton(config) {
        const { context } = this;
        const button = new Button({ context });
        button.add_class('toolbar-button');
        apply_focus_ring(button);
        
        if (config.icon) {
            const icon = new Control({ context, tag_name: 'span' });
            icon.add_class('toolbar-button-icon');
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
            apply_label(button, config.aria_label, {force: true});
        }

        if (!config.label && config.icon) {
            const sr_text = config.aria_label || config.tooltip || 'Toolbar action';
            ensure_sr_text(button, sr_text);
        }
        
        if (config.tooltip) {
            button.dom.attributes.title = config.tooltip;
        }
        
        if (config.onClick) {
            button.on('click', config.onClick);
        }
        
        this.add(button);
        this.items.push(button);
        this._item_configs.push({ type: 'button', config, ctrl: button });
        
        return button;
    }
    
    /**
     * Add a separator
     */
    addSeparator() {
        const { context } = this;
        const separator = new Control({ context, tag_name: 'div' });
        separator.add_class('toolbar-separator');
        this.add(separator);
        this.items.push(separator);
        this._item_configs.push({ type: 'separator', ctrl: separator });
        return separator;
    }
    
    /**
     * Add a spacer (flexible space)
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
     * Add any custom control
     */
    addControl(control) {
        control.add_class('toolbar-item');
        this.add(control);
        this.items.push(control);
        this._item_configs.push({ type: 'control', ctrl: control });
        return control;
    }
    
    /**
     * Clear all items
     */
    clear() {
        this.content.clear();
        this.items = [];
        this._item_configs = [];
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

        // On phone mode, use max_visible_items or auto-detect
        if (mode === 'phone' && max_items !== null) {
            const buttons = this.dom.el.querySelectorAll('.toolbar-button, .toolbar-item');
            buttons.forEach((btn, idx) => {
                if (idx >= max_items) {
                    btn.classList.add('toolbar-overflow-hidden');
                } else {
                    btn.classList.remove('toolbar-overflow-hidden');
                }
            });

            // Show/hide overflow trigger
            const trigger = this.dom.el.querySelector('.toolbar-overflow-trigger');
            const has_overflow = buttons.length > max_items;
            if (trigger) {
                trigger.style.display = has_overflow ? '' : 'none';
            }
        } else {
            // Show all items
            const hidden = this.dom.el.querySelectorAll('.toolbar-overflow-hidden');
            hidden.forEach(el => el.classList.remove('toolbar-overflow-hidden'));
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

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
    gap: var(--toolbar-gap, 4px);
    padding: var(--toolbar-padding, 4px 8px);
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--j-radius, 4px);
}
.toolbar-vertical {
    flex-direction: column;
    align-items: stretch;
}
.toolbar-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: var(--j-radius, 4px);
    background: transparent;
    color: var(--admin-text, #1e1e1e);
    cursor: pointer;
    min-width: var(--j-touch-target, 36px);
    min-height: var(--j-touch-target, 36px);
    justify-content: center;
    white-space: nowrap;
    transition: background 0.12s, border-color 0.12s;
}
.toolbar-button:hover {
    background: var(--admin-hover-bg, #f0f0f0);
    border-color: var(--admin-border, #e0e0e0);
}
.toolbar-button:active {
    background: var(--admin-active-bg, #e4e4e4);
}
.toolbar-separator {
    width: 1px;
    height: 20px;
    background: var(--admin-border, #e0e0e0);
    flex-shrink: 0;
}
.toolbar-vertical .toolbar-separator {
    width: 100%;
    height: 1px;
}
.toolbar-spacer {
    flex: 1 1 auto;
}
.toolbar-overflow-hidden {
    display: none !important;
}

/* ── Phone layout: touch-sized buttons ── */
.jsgui-toolbar[data-layout-mode="phone"] .toolbar-button {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
}
.jsgui-toolbar[data-layout-mode="phone"] .toolbar-button-label {
    display: none;
}

/* ── Tablet layout ── */
.jsgui-toolbar[data-layout-mode="tablet"] .toolbar-button {
    min-width: 44px;
    min-height: 44px;
}
`;
module.exports = Toolbar;
