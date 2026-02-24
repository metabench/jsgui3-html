/**
 * @module controls/organised/1-standard/5-ui/split_button
 * @description A composite button with a primary action and a dropdown menu
 *   of secondary actions. The primary button fires the default action on click,
 *   while the trigger button opens a popup menu with additional items.
 *
 * Features full keyboard navigation: ArrowDown opens the menu, ArrowUp/Down
 * navigate items, Escape closes, Enter/Space activates the focused item.
 *
 * @example
 *   // Basic split button
 *   const sb = new Split_Button({
 *       context,
 *       text: 'Save',
 *       items: [
 *           { id: 'save', text: 'Save' },
 *           { id: 'save_as', text: 'Save As...' }
 *       ]
 *   });
 *
 *   // Primary variant
 *   const deploy = new Split_Button({
 *       context,
 *       text: 'Deploy',
 *       variant: 'primary',
 *       items: [
 *           { id: 'deploy_staging', text: 'Deploy to Staging' },
 *           { id: 'deploy_prod', text: 'Deploy to Production' }
 *       ]
 *   });
 *
 *   // Danger variant with disabled item
 *   const del = new Split_Button({
 *       context,
 *       text: 'Delete',
 *       variant: 'danger',
 *       items: [
 *           { id: 'delete', text: 'Move to Trash' },
 *           { id: 'purge', text: 'Delete Permanently', disabled: true }
 *       ]
 *   });
 *
 * @tier T3
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Split_Button control — a primary button with an adjacent trigger
 * that opens a dropdown menu of secondary actions.
 *
 * Layout: `[primary_btn ▸ trigger_btn]` + `[menu (hidden by default)]`
 *
 * @extends Control
 *
 * @param {object}   spec
 * @param {string}   [spec.text='Action']        - Primary button text
 * @param {object[]} [spec.items=[]]             - Menu items: `{ id, text?, disabled? }`
 * @param {string}   [spec.default_action]       - Action ID for primary button (defaults to first item ID)
 * @param {boolean}  [spec.disabled=false]        - Disable the entire split button
 * @param {string}   [spec.variant='default']     - Visual variant: 'default', 'primary', 'danger'
 *
 * @fires action              Emitted on primary click or menu item click.
 *                             Payload: `{ id, source: 'primary'|'menu' }`.
 * @fires menu_open_change    Emitted when menu opens or closes.
 *                             Payload: `{ open: boolean }`.
 *
 * @css .jsgui-split-button                        — Root element
 * @css .split-button-primary                      — Primary action button
 * @css .split-button-trigger                      — Dropdown trigger button
 * @css .split-button-menu                         — Dropdown menu (<ul>)
 * @css .split-button-menu-item                    — Individual menu item (<li>)
 * @css .split-button-menu-item-disabled           — Disabled menu item
 * @css .jsgui-split-button.split-button-open      — Open state (menu visible)
 * @css .jsgui-split-button[data-variant="primary"]— Primary filled style
 * @css .jsgui-split-button[data-variant="danger"] — Danger/red style
 * @css .jsgui-split-button.split-button-disabled  — Disabled state
 *
 * @tokens --j-border, --j-bg-elevated, --j-fg, --j-bg-hover, --j-primary, --j-danger
 *
 * @keyboard ArrowDown   — Opens menu (if closed) and focuses first item
 * @keyboard ArrowUp     — Focuses last item (when menu is open)
 * @keyboard Escape      — Closes menu and returns focus to trigger
 * @keyboard Enter/Space — Activates focused menu item
 */
class Split_Button extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'split_button';
        super(spec);

        themeable(this, 'split_button', spec);

        this.add_class('split-button');
        this.add_class('jsgui-split-button');

        this.text = spec.text || 'Action';
        this.items = Array.isArray(spec.items) ? spec.items : [];
        this.default_action = spec.default_action || (this.items[0] && this.items[0].id) || 'default';
        this.disabled = !!spec.disabled;
        this.variant = spec.variant || 'default';
        this.open = false;

        this.dom.attributes['data-variant'] = this.variant;

        if (this.disabled) {
            this._apply_disabled(true);
        }

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM structure: primary button, trigger button, and menu.
     */
    compose() {
        const { context } = this;

        this.primary_btn = new Control({ context, tag_name: 'button' });
        this.primary_btn.add_class('split-button-primary');
        this.primary_btn.dom.attributes.type = 'button';
        this.primary_btn.add(this.text);

        this.trigger_btn = new Control({ context, tag_name: 'button' });
        this.trigger_btn.add_class('split-button-trigger');
        this.trigger_btn.dom.attributes.type = 'button';
        this.trigger_btn.dom.attributes['aria-haspopup'] = 'menu';
        this.trigger_btn.dom.attributes['aria-expanded'] = 'false';
        this.trigger_btn.dom.attributes['aria-label'] = 'More actions';
        this.trigger_btn.add('▾');

        this.menu = new Control({ context, tag_name: 'ul' });
        this.menu.add_class('split-button-menu');
        this.menu.dom.attributes.role = 'menu';

        this._render_menu_items();

        this.add(this.primary_btn);
        this.add(this.trigger_btn);
        this.add(this.menu);
    }

    /**
     * Re-renders all menu items into the menu `<ul>`.
     * @private
     */
    _render_menu_items() {
        if (!this.menu) return;
        this.menu.clear();
        const { context } = this;

        this.items.forEach(item => {
            const li = new Control({ context, tag_name: 'li' });
            li.add_class('split-button-menu-item');
            li.dom.attributes.role = 'menuitem';
            li.dom.attributes['data-action-id'] = item.id;
            li.dom.attributes.tabindex = '-1';
            if (item.disabled) {
                li.dom.attributes['aria-disabled'] = 'true';
                li.add_class('split-button-menu-item-disabled');
            }
            li.add(item.text || item.id);
            this.menu.add(li);
        });
    }

    /**
     * Bind all interactive event handlers: primary click, trigger click,
     * menu item click, keyboard navigation, and outside-click to close.
     */
    activate() {
        if (this.__active) return;
        super.activate();

        if (this.disabled) return;

        const el = this.dom && this.dom.el;
        if (!el) return;

        // Primary button click — fires default action
        if (this.primary_btn && this.primary_btn.dom && this.primary_btn.dom.el) {
            this.primary_btn.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                this.raise('action', { id: this.default_action, source: 'primary' });
            });
        }

        // Trigger button click — toggles menu
        if (this.trigger_btn && this.trigger_btn.dom && this.trigger_btn.dom.el) {
            this.trigger_btn.dom.el.addEventListener('click', () => {
                if (this.disabled) return;
                if (this.open) this.close_menu();
                else this.open_menu();
            });
        }

        // Menu item click — fires action with item ID
        if (this.menu && this.menu.dom && this.menu.dom.el) {
            this.menu.dom.el.addEventListener('click', (event) => {
                const target = event.target && event.target.closest
                    ? event.target.closest('[data-action-id]')
                    : null;
                if (!target) return;
                if (target.getAttribute('aria-disabled') === 'true') return;
                const id = target.getAttribute('data-action-id');
                this.raise('action', { id, source: 'menu' });
                this.close_menu();
            });
        }

        // Keyboard navigation
        el.addEventListener('keydown', (e) => {
            if (this.disabled) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (!this.open) {
                        this.open_menu();
                    }
                    this._focus_menu_item(0);
                    break;

                case 'ArrowUp':
                    if (this.open) {
                        e.preventDefault();
                        this._focus_menu_item(this.items.length - 1);
                    }
                    break;

                case 'Escape':
                    if (this.open) {
                        e.preventDefault();
                        this.close_menu();
                        if (this.trigger_btn && this.trigger_btn.dom && this.trigger_btn.dom.el) {
                            this.trigger_btn.dom.el.focus();
                        }
                    }
                    break;

                case 'Enter':
                case ' ':
                    if (this.open) {
                        const focused = el.querySelector('.split-button-menu-item:focus');
                        if (focused) {
                            e.preventDefault();
                            focused.click();
                        }
                    }
                    break;
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.open && !el.contains(e.target)) {
                this.close_menu();
            }
        });
    }

    /**
     * Focus a menu item by index, skipping disabled items.
     * @private
     * @param {number} index
     */
    _focus_menu_item(index) {
        if (!this.menu || !this.menu.dom || !this.menu.dom.el) return;
        const items = this.menu.dom.el.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])');
        if (items.length > 0) {
            const idx = Math.max(0, Math.min(index, items.length - 1));
            items[idx].focus();
        }
    }

    /**
     * Open the dropdown menu. Updates `aria-expanded` and raises `menu_open_change`.
     */
    open_menu() {
        this.open = true;
        this.add_class('split-button-open');
        if (this.trigger_btn) {
            this.trigger_btn.dom.attributes['aria-expanded'] = 'true';
        }
        this.raise('menu_open_change', { open: true });
    }

    /**
     * Close the dropdown menu. Updates `aria-expanded` and raises `menu_open_change`.
     */
    close_menu() {
        this.open = false;
        this.remove_class('split-button-open');
        if (this.trigger_btn) {
            this.trigger_btn.dom.attributes['aria-expanded'] = 'false';
        }
        this.raise('menu_open_change', { open: false });
    }

    /**
     * Enable or disable the entire split button.
     * @param {boolean} flag
     */
    set_disabled(flag) {
        this.disabled = !!flag;
        this._apply_disabled(this.disabled);
    }

    /** @private */
    _apply_disabled(on) {
        if (on) {
            this.dom.attributes['aria-disabled'] = 'true';
            this.add_class('split-button-disabled');
        } else {
            delete this.dom.attributes['aria-disabled'];
            this.remove_class('split-button-disabled');
        }
    }

    /**
     * Change the visual variant. Invalid values fall back to `'default'`.
     * @param {'default'|'primary'|'danger'} value
     */
    set_variant(value) {
        const allowed = ['default', 'primary', 'danger'];
        this.variant = allowed.includes(value) ? value : 'default';
        this.dom.attributes['data-variant'] = this.variant;
    }

    /**
     * Replace the items array and re-render the menu.
     * @param {object[]} items - Array of `{ id, text?, disabled? }` objects
     */
    set_items(items) {
        this.items = Array.isArray(items) ? items : [];
        this._render_menu_items();
    }
}

Split_Button.css = `
.jsgui-split-button {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    border-radius: 6px;
    overflow: visible;
    border: 1px solid var(--j-border, #d1d5db);
}

.jsgui-split-button .split-button-primary,
.jsgui-split-button .split-button-trigger {
    border: none;
    background: var(--j-bg-elevated, #fff);
    color: var(--j-fg, #111827);
    cursor: pointer;
    font: inherit;
    padding: 8px 10px;
    transition: background 120ms ease;
}

.jsgui-split-button .split-button-trigger {
    border-left: 1px solid var(--j-border, #d1d5db);
    min-width: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.jsgui-split-button .split-button-primary:hover,
.jsgui-split-button .split-button-trigger:hover {
    background: var(--j-bg-hover, #f3f4f6);
}

.jsgui-split-button .split-button-primary:focus-visible,
.jsgui-split-button .split-button-trigger:focus-visible {
    outline: 2px solid var(--j-primary, #2563eb);
    outline-offset: -2px;
    z-index: 1;
}

/* ── Menu ── */
.jsgui-split-button .split-button-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 180px;
    margin: 0;
    padding: 4px;
    list-style: none;
    background: var(--j-bg-elevated, #fff);
    border: 1px solid var(--j-border, #d1d5db);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    display: none;
    z-index: 10;
}

.jsgui-split-button.split-button-open .split-button-menu {
    display: block;
}

.jsgui-split-button .split-button-menu-item {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 80ms ease;
}

.jsgui-split-button .split-button-menu-item:hover,
.jsgui-split-button .split-button-menu-item:focus {
    background: var(--j-bg-hover, #f3f4f6);
    outline: none;
}

.jsgui-split-button .split-button-menu-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ── Variant: primary ── */
.jsgui-split-button[data-variant="primary"] {
    border-color: var(--j-primary, #2563eb);
}
.jsgui-split-button[data-variant="primary"] .split-button-primary,
.jsgui-split-button[data-variant="primary"] .split-button-trigger {
    background: var(--j-primary, #2563eb);
    color: #fff;
}
.jsgui-split-button[data-variant="primary"] .split-button-primary:hover,
.jsgui-split-button[data-variant="primary"] .split-button-trigger:hover {
    filter: brightness(1.1);
}
.jsgui-split-button[data-variant="primary"] .split-button-trigger {
    border-left-color: rgba(255,255,255,0.3);
}

/* ── Variant: danger ── */
.jsgui-split-button[data-variant="danger"] {
    border-color: var(--j-danger, #dc2626);
}
.jsgui-split-button[data-variant="danger"] .split-button-primary,
.jsgui-split-button[data-variant="danger"] .split-button-trigger {
    background: var(--j-danger, #dc2626);
    color: #fff;
}
.jsgui-split-button[data-variant="danger"] .split-button-primary:hover,
.jsgui-split-button[data-variant="danger"] .split-button-trigger:hover {
    filter: brightness(1.1);
}
.jsgui-split-button[data-variant="danger"] .split-button-trigger {
    border-left-color: rgba(255,255,255,0.3);
}

/* ── Disabled ── */
.jsgui-split-button.split-button-disabled {
    opacity: 0.55;
    pointer-events: none;
}
`;

module.exports = Split_Button;
