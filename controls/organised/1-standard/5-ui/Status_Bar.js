/**
 * @module controls/organised/1-standard/5-ui/status_bar
 * @description A bottom-docked information bar showing contextual status text,
 *   optional center items, and meta information. Supports dense mode, status
 *   levels (info/success/warning/error), and interactive items.
 *
 * @example
 *   // Simple status bar
 *   const bar = new Status_Bar({ context, text: 'Ready', meta_text: 'v1.0' });
 *
 *   // With interactive items
 *   const bar2 = new Status_Bar({
 *       context,
 *       text: 'Connected',
 *       status: 'success',
 *       items: [
 *           { id: 'cpu', label: 'CPU', value: '45%' },
 *           { id: 'mem', label: 'Mem', value: '2.1 GB' }
 *       ]
 *   });
 *
 *   // Dense mode
 *   const bar3 = new Status_Bar({ context, dense: true, text: 'Processing...' });
 *
 * @tier T3
 * @spec_version Control_Spec v1
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { themeable } = require('../../../../control_mixins/themeable');

/**
 * Status_Bar control — a horizontal bar for displaying status information.
 *
 * Layout: `[left: text] [center: items...] [right: meta_text]`
 *
 * Items are rendered as clickable spans separated by `·` in the center region.
 * Each item has an `id`, optional `label`, `value`, and optional `state`.
 *
 * @extends Control
 *
 * @param {object}   spec
 * @param {string}   [spec.text='Ready']       - Left-region text
 * @param {string}   [spec.meta_text='']       - Right-region text
 * @param {string}   [spec.status='info']      - Status level: 'info', 'success', 'warning', 'error'
 * @param {object[]} [spec.items=[]]           - Center items: `{ id, label?, value, state? }`
 * @param {boolean}  [spec.dense=false]        - Dense/compact mode (22px height)
 * @param {string}   [spec.aria_live='polite'] - aria-live value
 *
 * @fires item_click       Emitted when an item is clicked (in browser). Payload: `{ id, value }`.
 * @fires status_change    Emitted by set_item. Payload: `{ id, previous, next }`.
 *
 * @css .jsgui-status-bar                      — Root element
 * @css .jsgui-status-bar .status-bar-left     — Left region
 * @css .jsgui-status-bar .status-bar-center   — Center region (items)
 * @css .jsgui-status-bar .status-bar-right    — Right region
 * @css .jsgui-status-bar .status-bar-item     — Individual item
 * @css .jsgui-status-bar[data-status="error"] — Error-state styling
 * @css .jsgui-status-bar[data-dense="true"]   — Dense mode
 *
 * @tokens --j-border, --j-bg-muted, --j-fg, --j-primary, --j-fg-muted,
 *         --j-success, --j-warning, --j-danger, --j-font-sans
 */
class Status_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'status_bar';
        super(spec);

        themeable(this, 'status_bar', spec);

        this.add_class('status-bar');
        this.add_class('jsgui-status-bar');

        this.status = spec.status || 'info';
        this.text = spec.text || 'Ready';
        this.meta_text = spec.meta_text || '';
        this.items = spec.items || [];
        this.dense = !!spec.dense;

        this.dom.attributes.role = 'status';
        this.dom.attributes['aria-live'] = spec.aria_live || 'polite';
        this.dom.attributes['data-status'] = this.status;
        if (this.dense) this.dom.attributes['data-dense'] = 'true';

        if (!spec.el) {
            this.compose();
        }
    }

    /**
     * Build internal DOM structure with three regions: left, center, right.
     * Center region is only created when items are present.
     */
    compose() {
        const { context } = this;

        this.left_ctrl = new Control({ context, tag_name: 'span' });
        this.left_ctrl.add_class('status-bar-left');
        this.left_ctrl.add(this.text);
        this.add(this.left_ctrl);

        if (this.items.length > 0) {
            this.center_ctrl = new Control({ context, tag_name: 'span' });
            this.center_ctrl.add_class('status-bar-center');
            this._render_items();
            this.add(this.center_ctrl);
        }

        this.right_ctrl = new Control({ context, tag_name: 'span' });
        this.right_ctrl.add_class('status-bar-right');
        this.right_ctrl.add(this.meta_text);
        this.add(this.right_ctrl);
    }

    /** @private Re-renders all items in the center region. */
    _render_items() {
        if (!this.center_ctrl) return;
        this.center_ctrl.clear();
        const { context } = this;

        this.items.forEach((item, i) => {
            if (i > 0) {
                const sep = new Control({ context, tag_name: 'span' });
                sep.add_class('status-bar-separator');
                sep.add('·');
                this.center_ctrl.add(sep);
            }
            const el = new Control({ context, tag_name: 'span' });
            el.add_class('status-bar-item');
            el.dom.attributes['data-item-id'] = item.id;
            if (item.state) el.dom.attributes['data-state'] = item.state;
            el.add(item.label ? item.label + ': ' + item.value : String(item.value));
            this.center_ctrl.add(el);
        });
    }

    /**
     * Bind click handler for center items. Raises `item_click`
     * with the item's `id` and `value`.
     */
    activate() {
        if (this.__active) return;
        super.activate();

        if (this.dom && this.dom.el && this.center_ctrl) {
            this.center_ctrl.dom.el.addEventListener('click', (e) => {
                const itemEl = e.target.closest('[data-item-id]');
                if (!itemEl) return;
                const id = itemEl.getAttribute('data-item-id');
                const item = this.items.find(it => it.id === id);
                if (item) {
                    this.raise('item_click', { id, value: item.value });
                }
            });
        }
    }

    /**
     * Update the left-region text.
     * @param {string} text
     */
    set_text(text) {
        this.text = text || '';
        if (this.left_ctrl) {
            this.left_ctrl.clear();
            this.left_ctrl.add(this.text);
        }
    }

    /**
     * Update the right-region text.
     * @param {string} meta_text
     */
    set_meta_text(meta_text) {
        this.meta_text = meta_text || '';
        if (this.right_ctrl) {
            this.right_ctrl.clear();
            this.right_ctrl.add(this.meta_text);
        }
    }

    /**
     * Change the status level. Updates `data-status` attribute
     * which controls CSS colour via status-specific rules.
     * @param {'info'|'success'|'warning'|'error'} status
     */
    set_status(status) {
        this.status = status || 'info';
        this.dom.attributes['data-status'] = this.status;
    }

    /**
     * Update an existing item by ID. Merges `patch` into the item
     * and re-renders the center region. Raises `status_change`.
     *
     * @param {string} id    - The item ID to update
     * @param {object} patch - Properties to merge (e.g. `{ value: '60%' }`)
     */
    set_item(id, patch) {
        const item = this.items.find(it => it.id === id);
        if (!item) return;
        const previous = { ...item };
        Object.assign(item, patch);
        this._render_items();
        this.raise('status_change', { id, previous: previous.value, next: item.value });
    }

    /**
     * Remove an item by ID. Re-renders the center region.
     * @param {string} id
     */
    clear_item(id) {
        const idx = this.items.findIndex(it => it.id === id);
        if (idx === -1) return;
        this.items.splice(idx, 1);
        this._render_items();
    }
}

Status_Bar.css = `
.jsgui-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 30px;
    padding: 6px 10px;
    border-top: 1px solid var(--j-border, #d1d5db);
    background: var(--j-bg-muted, #f9fafb);
    color: var(--j-fg, #111827);
    font-size: 12px;
    font-family: var(--j-font-sans, system-ui, sans-serif);
}

/* ── Dense mode ── */
.jsgui-status-bar[data-dense="true"] {
    min-height: 22px;
    padding: 2px 8px;
    font-size: 11px;
    gap: 8px;
}

/* ── Regions ── */
.jsgui-status-bar .status-bar-left,
.jsgui-status-bar .status-bar-center,
.jsgui-status-bar .status-bar-right {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.jsgui-status-bar .status-bar-center {
    flex: 1;
    justify-content: center;
}

/* ── Items ── */
.jsgui-status-bar .status-bar-item {
    cursor: default;
    white-space: nowrap;
}

.jsgui-status-bar .status-bar-item:hover {
    color: var(--j-primary, #2563eb);
}

.jsgui-status-bar .status-bar-separator {
    color: var(--j-fg-muted, #6b7280);
    user-select: none;
}

/* ── Status colors ── */
.jsgui-status-bar[data-status="info"] {
    color: var(--j-fg, #111827);
}

.jsgui-status-bar[data-status="success"] {
    color: var(--j-success, #16a34a);
    font-weight: 500;
}

.jsgui-status-bar[data-status="warning"] {
    color: var(--j-warning, #d97706);
    font-weight: 500;
}

.jsgui-status-bar[data-status="error"] {
    color: var(--j-danger, #dc2626);
    font-weight: 600;
}
`;

module.exports = Status_Bar;
