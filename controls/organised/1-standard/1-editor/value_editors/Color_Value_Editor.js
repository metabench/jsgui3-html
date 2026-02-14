'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

// Compact picker for popup
let Color_Picker_Tabbed;
try {
    Color_Picker_Tabbed = require('../../0-core/0-basic/1-compositional/color-picker-tabbed');
} catch (e) {
    Color_Picker_Tabbed = null;
}

// 36-color default palette
const DEFAULT_PALETTE = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
    '#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af',
    '#d1d5db', '#e5e7eb', '#f3f4f6', '#ffffff', '#fef3c7', '#fde68a',
    '#bfdbfe', '#c7d2fe', '#ddd6fe', '#fbcfe8', '#fecdd3', '#ccfbf1'
];

/**
 * Color_Value_Editor — popup color grid.
 *
 * Inline shows a color swatch + hex code.
 * Popup shows a clickable grid of colors.
 */
class Color_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'color_value_editor';
        super(spec);
        this.add_class('color-value-editor');

        this._palette = spec.palette || DEFAULT_PALETTE;

        const jsgui = require('../../../../../html-core/html-core');

        // Inline: color swatch + text
        this._swatch = new jsgui.Control({ context: this.context, tag_name: 'span' });
        this._swatch.add_class('ve-color-swatch');
        if (this._value) {
            this._swatch.dom.attributes.style = `background:${this._value}`;
        }
        this.add(this._swatch);

        this._label = new jsgui.Control({ context: this.context, tag_name: 'span' });
        this._label.add_class('ve-popup-summary');
        this._label.add(this.get_display_text());
        this.add(this._label);

        // Trigger
        this._trigger = new jsgui.Control({ context: this.context, tag_name: 'button' });
        this._trigger.add_class('ve-popup-trigger');
        this._trigger.dom.attributes.type = 'button';
        this._trigger.dom.attributes['aria-haspopup'] = 'dialog';
        this._trigger.dom.attributes['aria-expanded'] = 'false';
        this._trigger.add('▾');
        this.add(this._trigger);

        // Popup container
        this._popup_container = new jsgui.Control({ context: this.context, tag_name: 'div' });
        this._popup_container.add_class('ve-popup-dropdown');
        this._popup_container.add_class('ve-color-popup');
        this._popup_container.dom.attributes.style = 'display:none';

        // Use compact Color_Picker_Tabbed if available
        if (Color_Picker_Tabbed) {
            this._picker = new Color_Picker_Tabbed({
                context: this.context,
                variant: 'compact',
                value: this._value || '#3b82f6',
                show_preview: true,
                show_actions: false
            });
            this._popup_container.add(this._picker);
        } else {
            // Fallback: flat color grid
            this._grid = new jsgui.Control({ context: this.context, tag_name: 'div' });
            this._grid.add_class('ve-color-grid');
            this._palette.forEach(hex => {
                const cell = new jsgui.Control({ context: this.context, tag_name: 'div' });
                cell.add_class('ve-color-cell');
                cell.dom.attributes.style = `background:${hex}`;
                cell.dom.attributes['data-color'] = hex;
                cell.dom.attributes.title = hex;
                this._grid.add(cell);
            });
            this._popup_container.add(this._grid);
        }
        this.add(this._popup_container);

        this._open = false;
    }

    activate() {
        if (!this.__active) {
            super.activate();

            if (this._trigger.dom.el) {
                this._trigger.dom.el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle_popup();
                });
            }

            if (this._swatch.dom.el) {
                this._swatch.dom.el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle_popup();
                });
            }

            // Wire Color_Picker_Tabbed if present
            if (this._picker) {
                this._picker.on('change', (e) => {
                    if (e && e.hex) {
                        this.set_value(e.hex, { source: 'user' });
                    }
                });
            }

            // Color cell clicks (fallback grid)
            if (this._grid && this._grid.dom.el) {
                this._grid.dom.el.addEventListener('click', (e) => {
                    const cell = e.target.closest('.ve-color-cell');
                    if (cell) {
                        const hex = cell.getAttribute('data-color');
                        if (hex) {
                            this.set_value(hex, { source: 'user' });
                            this.close_popup();
                        }
                    }
                });
            }

            // Close on outside click
            this._outside_handler = (e) => {
                if (this._open && this.dom.el && !this.dom.el.contains(e.target)) {
                    this.close_popup();
                }
            };
            document.addEventListener('mousedown', this._outside_handler);
        }
    }

    toggle_popup() { this._open ? this.close_popup() : this.open_popup(); }

    open_popup() {
        if (this._popup_container.dom.el) this._popup_container.dom.el.style.display = 'block';
        if (this._trigger.dom.el) this._trigger.dom.el.setAttribute('aria-expanded', 'true');
        this._open = true;
    }

    close_popup() {
        if (this._popup_container.dom.el) this._popup_container.dom.el.style.display = 'none';
        if (this._trigger.dom.el) this._trigger.dom.el.setAttribute('aria-expanded', 'false');
        this._open = false;
    }

    set_value(value, opts = {}) {
        super.set_value(value, opts);
        this._update_display();
    }

    get_display_text() {
        if (this._varies) return '(varies)';
        return this._value || '(no color)';
    }

    _update_display() {
        if (this._swatch && this._swatch.dom.el) {
            this._swatch.dom.el.style.background = this._value || 'transparent';
        }
        if (this._label && this._label.dom.el) {
            this._label.dom.el.textContent = this.get_display_text();
        }
    }
}

Color_Value_Editor.type_name = 'color';
Color_Value_Editor.display_name = 'Color';
Color_Value_Editor.DEFAULT_PALETTE = DEFAULT_PALETTE;

register_value_editor('color', Color_Value_Editor, { inline: true, popup: true });

module.exports = Color_Value_Editor;
