'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');

/**
 * Date_Value_Editor — popup date picker wrapping Month_View.
 *
 * Renders an inline summary (YYYY-MM-DD) and a dropdown trigger.
 * When triggered, a Month_View popup appears.
 */
class Date_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_value_editor';
        super(spec);
        this.add_class('date-value-editor');

        this._min_date = spec.min_date;
        this._max_date = spec.max_date;

        const jsgui = require('../../../../../html-core/html-core');

        // Inline summary span
        this._summary = new jsgui.Control({ context: this.context, tag_name: 'span' });
        this._summary.add_class('ve-popup-summary');
        this._summary.add(this.get_display_text());
        this.add(this._summary);

        // Dropdown trigger button
        this._trigger = new jsgui.Control({ context: this.context, tag_name: 'button' });
        this._trigger.add_class('ve-popup-trigger');
        this._trigger.dom.attributes.type = 'button';
        this._trigger.dom.attributes['aria-haspopup'] = 'dialog';
        this._trigger.dom.attributes['aria-expanded'] = 'false';
        this._trigger.add('▾');
        this.add(this._trigger);

        // Popup container (hidden)
        this._popup_container = new jsgui.Control({ context: this.context, tag_name: 'div' });
        this._popup_container.add_class('ve-popup-dropdown');
        this._popup_container.dom.attributes.style = 'display:none';

        // Month_View inside popup
        const Month_View = require('../../../../organised/0-core/0-basic/1-compositional/Month_View');
        this._month_view = new Month_View({
            context: this.context,
            selection_mode: 'single',
            size: [280, 200],
            min_date: this._min_date,
            max_date: this._max_date
        });
        this._popup_container.add(this._month_view);
        this.add(this._popup_container);

        this._open = false;
    }

    activate() {
        if (!this.__active) {
            super.activate();

            // Toggle popup on button click
            if (this._trigger.dom.el) {
                this._trigger.dom.el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle_popup();
                });
            }

            // Click on summary also opens
            if (this._summary.dom.el) {
                this._summary.dom.el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle_popup();
                });
            }

            // Month_View day selection
            this._month_view.on('change', (e) => {
                if (e && e.name === 'day' && e.value) {
                    const day = e.value.value || e.value;
                    const month = this._month_view.month;
                    const year = this._month_view.year;
                    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    this.set_value(iso, { source: 'user' });
                    this.close_popup();
                }
            });

            // Close on outside click
            this._outside_handler = (e) => {
                if (this._open && this.dom.el && !this.dom.el.contains(e.target)) {
                    this.close_popup();
                }
            };
            document.addEventListener('mousedown', this._outside_handler);
        }
    }

    toggle_popup() {
        this._open ? this.close_popup() : this.open_popup();
    }

    open_popup() {
        if (this._popup_container.dom.el) {
            this._popup_container.dom.el.style.display = 'block';
        }
        if (this._trigger.dom.el) {
            this._trigger.dom.el.setAttribute('aria-expanded', 'true');
        }
        this._open = true;
    }

    close_popup() {
        if (this._popup_container.dom.el) {
            this._popup_container.dom.el.style.display = 'none';
        }
        if (this._trigger.dom.el) {
            this._trigger.dom.el.setAttribute('aria-expanded', 'false');
        }
        this._open = false;
    }

    set_value(value, opts = {}) {
        super.set_value(value, opts);
        this._update_summary();
    }

    get_display_text() {
        if (this._varies) return '(varies)';
        return this._value || '(no date)';
    }

    _update_summary() {
        if (this._summary && this._summary.dom.el) {
            this._summary.dom.el.textContent = this.get_display_text();
        }
    }
}

Date_Value_Editor.type_name = 'date';
Date_Value_Editor.display_name = 'Date';

register_value_editor('date', Date_Value_Editor, { inline: true, popup: true });

module.exports = Date_Value_Editor;
