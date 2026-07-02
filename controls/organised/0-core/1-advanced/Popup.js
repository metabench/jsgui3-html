const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;

/**
 * Popup — reusable anchored overlay primitive.
 *
 * Replaces the ad-hoc popup logic previously duplicated across
 * Date_Value_Editor, Date_Range_Picker, Combo_Box, etc.
 *
 * Isomorphic-safe: composes children server-side, restores config from
 * data-* attributes on activation, and only positions/wires in the browser.
 *
 * @param {Object}  spec
 * @param {string}  [spec.position='bottom']            'bottom'|'top'|'left'|'right'
 * @param {Object}  [spec.offset={x:0,y:4}]             Pixel offset from the anchor
 * @param {boolean} [spec.auto_reposition=true]         Flip/shift to stay inside the viewport
 * @param {boolean} [spec.close_on_escape=true]
 * @param {boolean} [spec.close_on_outside_click=true]
 *
 * Events: 'open' {anchor_el}, 'close' {}
 *
 * Usage:
 *   const popup = new Popup({ context, position: 'bottom' });
 *   popup.add(content_control);
 *   parent.add(popup);
 *   // in parent.activate():
 *   trigger_el.addEventListener('click', () => popup.toggle(trigger_el));
 */
class Popup extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'popup';
        super(spec);
        this.add_class('jsgui-popup');
        this.add_class('hidden');

        this._position = spec.position || 'bottom';
        this._offset = spec.offset || { x: 0, y: 4 };
        this._auto_reposition = spec.auto_reposition !== false;
        this._close_on_escape = spec.close_on_escape !== false;
        this._close_on_outside_click = spec.close_on_outside_click !== false;
        this._anchor_el = null;

        // Persist config so it survives SSR reattachment.
        if (!this.dom.attrs['data-position']) {
            this.dom.attrs['data-position'] = this._position;
        }

        // ARIA: popups are non-modal dialogs.
        const attrs = this.dom.attributes;
        if (!attrs.role) attrs.role = 'dialog';
        if (attrs['aria-modal'] === undefined) attrs['aria-modal'] = 'false';
        if (spec.aria_label && !attrs['aria-label']) attrs['aria-label'] = spec.aria_label;
    }

    get is_open() {
        return !this.has_class('hidden');
    }

    open(anchor_el) {
        if (anchor_el) this._anchor_el = anchor_el;
        if (this.is_open) return;
        this.remove_class('hidden');
        if (typeof document !== 'undefined') {
            this._reposition();
            this._wire_open_listeners();

            // Focus management: remember where focus was, then move it into
            // the popup so Escape and arrow keys land here immediately.
            const el = this.dom && this.dom.el;
            if (el) {
                this._prev_focus_el = document.activeElement || this._anchor_el || null;
                if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
                if (el.focus) el.focus();
            }
        }
        this.raise('open', { anchor_el: this._anchor_el });
    }

    close() {
        if (!this.is_open) return;
        this.add_class('hidden');
        if (typeof document !== 'undefined') {
            this._unwire_open_listeners();

            // Return focus to where it was (usually the anchor) — but only
            // if focus is still inside the popup, so we never steal focus
            // from something the user has since clicked.
            const el = this.dom && this.dom.el;
            const target = this._prev_focus_el && this._prev_focus_el.focus
                ? this._prev_focus_el
                : (this._anchor_el && this._anchor_el.focus ? this._anchor_el : null);
            if (target && el && (el.contains(document.activeElement) || document.activeElement === document.body)) {
                target.focus();
            }
            this._prev_focus_el = null;
        }
        this.raise('close', {});
    }

    toggle(anchor_el) {
        if (this.is_open) this.close();
        else this.open(anchor_el);
    }

    // ---- Positioning ----

    _reposition() {
        const el = this.dom && this.dom.el;
        const anchor = this._anchor_el;
        if (!el || !anchor || !anchor.getBoundingClientRect) return;

        const a = anchor.getBoundingClientRect();
        const off = this._offset;

        // Fixed positioning: viewport coordinates, no offsetParent math.
        el.style.position = 'fixed';
        el.style.zIndex = el.style.zIndex || '1000';

        const place = (position) => {
            // Measure after display; el must be visible here.
            const p = el.getBoundingClientRect();
            let top, left;
            switch (position) {
                case 'top':
                    top = a.top - p.height - off.y;
                    left = a.left + off.x;
                    break;
                case 'left':
                    top = a.top + off.y;
                    left = a.left - p.width - off.x;
                    break;
                case 'right':
                    top = a.top + off.y;
                    left = a.right + off.x;
                    break;
                case 'bottom':
                default:
                    top = a.bottom + off.y;
                    left = a.left + off.x;
                    break;
            }
            return { top, left, width: p.width, height: p.height };
        };

        let pos = this._position;
        let { top, left, width, height } = place(pos);

        if (this._auto_reposition && typeof window !== 'undefined') {
            const vw = window.innerWidth, vh = window.innerHeight;
            // Flip vertically if overflowing.
            if (pos === 'bottom' && top + height > vh && a.top - height - this._offset.y >= 0) {
                pos = 'top';
                ({ top, left } = place(pos));
            } else if (pos === 'top' && top < 0 && a.bottom + height + this._offset.y <= vh) {
                pos = 'bottom';
                ({ top, left } = place(pos));
            }
            // Shift horizontally into the viewport.
            if (left + width > vw) left = Math.max(4, vw - width - 4);
            if (left < 4) left = 4;
            if (top < 4) top = 4;
        }

        el.style.top = `${Math.round(top)}px`;
        el.style.left = `${Math.round(left)}px`;
        el.setAttribute('data-placed', pos);
    }

    // ---- Open-state listeners (escape / outside click / scroll / resize) ----

    _wire_open_listeners() {
        if (this._open_listeners_wired) return;
        this._open_listeners_wired = true;

        this._on_doc_keydown = (e) => {
            if (this._close_on_escape && e.key === 'Escape') this.close();
        };
        this._on_doc_mousedown = (e) => {
            if (!this._close_on_outside_click) return;
            const el = this.dom && this.dom.el;
            const anchor = this._anchor_el;
            if (el && !el.contains(e.target) && !(anchor && anchor.contains && anchor.contains(e.target))) {
                this.close();
            }
        };
        this._on_reposition = () => this._reposition();

        document.addEventListener('keydown', this._on_doc_keydown);
        document.addEventListener('mousedown', this._on_doc_mousedown);
        window.addEventListener('resize', this._on_reposition);
        window.addEventListener('scroll', this._on_reposition, true);
    }

    _unwire_open_listeners() {
        if (!this._open_listeners_wired) return;
        this._open_listeners_wired = false;
        document.removeEventListener('keydown', this._on_doc_keydown);
        document.removeEventListener('mousedown', this._on_doc_mousedown);
        window.removeEventListener('resize', this._on_reposition);
        window.removeEventListener('scroll', this._on_reposition, true);
    }

    // ---- Activation ----

    activate() {
        if (this.__active) return;
        super.activate();

        // Restore config from persisted attributes (SSR reattachment).
        const el = this.dom && this.dom.el;
        if (el && el.getAttribute) {
            const pos = el.getAttribute('data-position');
            if (pos) this._position = pos;
        }
    }
}

Popup.css = `
.jsgui-popup {
    background: var(--popup-bg, #fff);
    border: 1px solid var(--popup-border, #e2e8f0);
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -6px rgba(0, 0, 0, 0.1);
    padding: 8px;
}
.jsgui-popup.hidden {
    display: none;
}
:is(.jsgui-dark-mode, [data-theme="dark"]) .jsgui-popup {
    --popup-bg: #1f2937;
    --popup-border: #374151;
}
`;

module.exports = Popup;
