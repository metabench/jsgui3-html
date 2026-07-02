'use strict';

const Value_Editor_Base = require('./Value_Editor_Base');
const { register_value_editor } = require('./value_editor_registry');
const Popup = require('../../../0-core/1-advanced/Popup');

/**
 * Date_Value_Editor — popup date picker wrapping Month_View.
 *
 * Renders an inline summary (YYYY-MM-DD) and a dropdown trigger.
 * When triggered, a Month_View popup appears (via the Popup primitive).
 *
 * Isomorphic contract: children tagged with data-jsgui-ctrl, compose is
 * conditional on !spec.el, min/max persisted as data-* attributes.
 */
class Date_Value_Editor extends Value_Editor_Base {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'date_value_editor';
        super(spec);
        this.add_class('date-value-editor');

        this._min_date = spec.min_date;
        this._max_date = spec.max_date;

        // Persist constraints for SSR reattachment.
        const attrs = this.dom.attributes;
        if (this._min_date && !attrs['data-min-date']) attrs['data-min-date'] = this._min_date;
        if (this._max_date && !attrs['data-max-date']) attrs['data-max-date'] = this._max_date;

        if (!spec.el) {
            this.compose_date_value_editor();
        }
    }

    compose_date_value_editor() {
        const jsgui = require('../../../../../html-core/html-core');
        const { context } = this;

        // Inline summary span
        this._summary = new jsgui.Control({ context, tag_name: 'span' });
        this._summary.add_class('ve-popup-summary');
        this._summary.dom.attributes['data-jsgui-ctrl'] = '_summary';
        this._summary.add(this.get_display_text());
        this.add(this._summary);

        // Dropdown trigger button
        this._trigger = new jsgui.Control({ context, tag_name: 'button' });
        this._trigger.add_class('ve-popup-trigger');
        this._trigger.dom.attributes.type = 'button';
        this._trigger.dom.attributes['aria-haspopup'] = 'dialog';
        this._trigger.dom.attributes['aria-expanded'] = 'false';
        this._trigger.dom.attributes['data-jsgui-ctrl'] = '_trigger';
        this._trigger.add('▾');
        this.add(this._trigger);

        // Popup (reusable primitive) with Month_View inside
        this._popup = new Popup({ context, position: 'bottom' });
        this._popup.add_class('ve-popup-dropdown');
        this._popup.dom.attributes['data-jsgui-ctrl'] = '_popup';

        const Month_View = require('../../../../organised/0-core/0-basic/1-compositional/Month_View');
        this._month_view = new Month_View({
            context,
            selection_mode: 'single',
            size: [280, 200],
            min_date: this._min_date,
            max_date: this._max_date
        });
        this._month_view.dom.attributes['data-jsgui-ctrl'] = '_month_view';
        this._popup.add(this._month_view);
        this.add(this._popup);
    }

    activate() {
        if (!this.__active) {
            super.activate();

            // Restore refs and config after SSR reattachment.
            this._wire_jsgui_ctrls();
            const el = this.dom && this.dom.el;
            if (el && el.getAttribute) {
                this._min_date = this._min_date || el.getAttribute('data-min-date') || undefined;
                this._max_date = this._max_date || el.getAttribute('data-max-date') || undefined;
            }

            const ctrl_el = (ref) => ref && ref.dom && ref.dom.el;

            // Toggle popup from trigger and summary
            const toggle = (e) => {
                e.stopPropagation();
                this.toggle_popup();
            };
            if (ctrl_el(this._trigger)) ctrl_el(this._trigger).addEventListener('click', toggle);
            if (ctrl_el(this._summary)) ctrl_el(this._summary).addEventListener('click', toggle);

            // Keep aria-expanded in sync (Popup also closes itself on
            // escape/outside-click, so listen rather than assume).
            if (this._popup && this._popup.on) {
                this._popup.on('open', () => {
                    if (ctrl_el(this._trigger)) ctrl_el(this._trigger).setAttribute('aria-expanded', 'true');
                });
                this._popup.on('close', () => {
                    if (ctrl_el(this._trigger)) ctrl_el(this._trigger).setAttribute('aria-expanded', 'false');
                });
            }

            // Month_View day selection → editor value
            if (this._month_view && this._month_view.on) {
                const commit = (iso) => {
                    this.set_value(iso, { source: 'user' });
                    this.close_popup();
                };
                this._month_view.on('date-select', (e) => {
                    if (e && e.iso) commit(e.iso);
                });
                // Legacy path: day change events (kept for older Month_View wiring)
                this._month_view.on('change', (e) => {
                    if (e && e.name === 'day' && e.value) {
                        const day = e.value.value || e.value;
                        const month = this._month_view.month;
                        const year = this._month_view.year;
                        commit(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                    }
                });
            }
        }
    }

    toggle_popup() {
        if (this._popup) this._popup.toggle(this.dom && this.dom.el);
    }

    open_popup() {
        if (this._popup) this._popup.open(this.dom && this.dom.el);
    }

    close_popup() {
        if (this._popup) this._popup.close();
    }

    get _open() {
        return !!(this._popup && this._popup.is_open);
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
