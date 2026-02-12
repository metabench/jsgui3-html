/**
 * Key_Value_Table — Clean key-value display for configuration, status, and environment info.
 *
 * Renders a two-column table with keys on the left and values on the right.
 * Useful for displaying server config, process info, environment variables, etc.
 *
 * Options:
 *   data         — Array of { key, value, badge?, badge_variant? } or Object (keys become labels)
 *   striped      — Alternate row backgrounds (default true)
 *   show_header  — Show column headers (default false)
 *   key_label    — Header for key column (default "Property")
 *   value_label  — Header for value column (default "Value")
 *   copyable     — Show copy button on values (default false)
 *   title        — Optional card title displayed above the table
 *   subtitle     — Optional subtitle below the title
 *   bordered     — Show outer border (default true)
 *   compact      — Reduce padding for dense layouts (default false)
 *   theme        — Theme name: 'vs-default', 'vs-dark', 'terminal', 'warm'
 *
 * Row data shape:
 *   { key: 'Host', value: 'localhost', badge: 'LIVE', badge_variant: 'success' }
 *   badge_variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
 *
 * Usage:
 *   new Key_Value_Table({ data: { host: 'localhost', port: 3000, env: 'production' } })
 *   new Key_Value_Table({ data: [{ key: 'Host', value: 'localhost' }], theme: 'vs-dark' })
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

class Key_Value_Table extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'key_value_table';
        const cfg_data = spec.data || {};
        super(spec);
        this.add_class('jsgui-kv-table');
        this.dom.tagName = 'div'; // wrapper div for title support; table is nested

        prop(this, 'data', cfg_data, () => this.recompose());
        this.striped = spec.striped !== false;
        this.show_header = !!spec.show_header;
        this.key_label = spec.key_label || 'Property';
        this.value_label = spec.value_label || 'Value';
        this.copyable = !!spec.copyable;
        this.title = spec.title || '';
        this.subtitle = spec.subtitle || '';
        this.bordered = spec.bordered !== false;
        this.compact = !!spec.compact;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }
        if (this.compact) this.add_class('kv-compact');
        if (!this.bordered) this.add_class('kv-borderless');

        if (!spec.el) this.compose();
    }

    _normalize_data() {
        const raw = this.data;
        if (Array.isArray(raw)) {
            return raw.map(item => ({
                key: String(item.key || item.label || item.name || ''),
                value: item.value != null ? String(item.value) : '',
                badge: item.badge || null,
                badge_variant: item.badge_variant || 'default'
            }));
        }
        if (raw && typeof raw === 'object') {
            return Object.entries(raw).map(([k, v]) => ({
                key: k,
                value: v != null ? String(v) : '',
                badge: null,
                badge_variant: 'default'
            }));
        }
        return [];
    }

    compose() {
        const rows = this._normalize_data();

        // Title bar
        if (this.title) {
            const title_bar = new Control({ context: this.context, tag_name: 'div' });
            title_bar.add_class('kv-title-bar');

            const title_text = new Control({ context: this.context, tag_name: 'div' });
            title_text.add_class('kv-title');
            title_text.add(this.title);
            title_bar.add(title_text);

            if (this.subtitle) {
                const sub = new Control({ context: this.context, tag_name: 'div' });
                sub.add_class('kv-subtitle');
                sub.add(this.subtitle);
                title_bar.add(sub);
            }

            this.add(title_bar);
        }

        // Table element
        const table = new Control({ context: this.context, tag_name: 'table' });
        table.add_class('kv-table-inner');

        // Header
        if (this.show_header) {
            const thead = new Control({ context: this.context, tag_name: 'thead' });
            const hrow = new Control({ context: this.context, tag_name: 'tr' });
            hrow.add_class('kv-header-row');

            const kh = new Control({ context: this.context, tag_name: 'th' });
            kh.add_class('kv-header');
            kh.add_class('kv-key-header');
            kh.add(this.key_label);
            hrow.add(kh);

            const vh = new Control({ context: this.context, tag_name: 'th' });
            vh.add_class('kv-header');
            vh.add_class('kv-value-header');
            vh.add(this.value_label);
            hrow.add(vh);

            thead.add(hrow);
            table.add(thead);
        }

        // Body
        const tbody = new Control({ context: this.context, tag_name: 'tbody' });

        rows.forEach((item, i) => {
            const tr = new Control({ context: this.context, tag_name: 'tr' });
            tr.add_class('kv-row');
            if (this.striped && i % 2 === 1) {
                tr.add_class('kv-row-striped');
            }

            // Key cell
            const key_td = new Control({ context: this.context, tag_name: 'td' });
            key_td.add_class('kv-key');
            key_td.add(item.key);
            tr.add(key_td);

            // Value cell
            const val_td = new Control({ context: this.context, tag_name: 'td' });
            val_td.add_class('kv-value');

            const val_span = new Control({ context: this.context, tag_name: 'span' });
            val_span.add_class('kv-value-text');
            val_span.add(item.value);
            val_td.add(val_span);

            // Badge
            if (item.badge) {
                const badge = new Control({ context: this.context, tag_name: 'span' });
                badge.add_class('kv-badge');
                badge.add_class(`kv-badge-${item.badge_variant}`);
                badge.add(item.badge);
                val_td.add(badge);
            }

            // Copy button
            if (this.copyable) {
                const copy_btn = new Control({ context: this.context, tag_name: 'button' });
                copy_btn.dom.attributes.type = 'button';
                copy_btn.add_class('kv-copy-btn');
                copy_btn.dom.attributes['data-copy-value'] = item.value;
                copy_btn.add('⧉');
                val_td.add(copy_btn);
            }

            tr.add(val_td);
            tbody.add(tr);
        });

        table.add(tbody);
        this.add(table);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.dom.el.addEventListener('click', e => {
                const btn = e.target.closest('.kv-copy-btn');
                if (!btn) return;
                const val = btn.getAttribute('data-copy-value') || '';
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(val);
                    // Brief visual feedback
                    btn.textContent = '✓';
                    setTimeout(() => { btn.textContent = '⧉'; }, 1200);
                }
                this.raise('copy', { value: val });
            });
        }
    }
}

Key_Value_Table.css = `
/* ─── Key_Value_Table ─── */
.jsgui-kv-table {
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    font-size: var(--admin-font-size, 13px);
    color: var(--admin-text, #1e1e1e);
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    border-radius: var(--admin-radius-lg, 6px);
    box-shadow: var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.08));
    overflow: hidden;
}
.jsgui-kv-table.kv-borderless {
    border: none;
    box-shadow: none;
    border-radius: 0;
}

/* Title bar */
.kv-title-bar {
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    background: var(--admin-header-bg, #f8f8f8);
}
.kv-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--admin-text, #1e1e1e);
    line-height: 1.3;
}
.kv-subtitle {
    font-size: 11px;
    color: var(--admin-text-muted, #9e9e9e);
    margin-top: 2px;
}

/* Inner table */
.kv-table-inner {
    width: 100%;
    border-collapse: collapse;
}

/* Header */
.kv-header {
    text-align: left;
    font-weight: 600;
    padding: var(--admin-cell-padding, 8px 12px);
    border-bottom: 2px solid var(--admin-border, #e0e0e0);
    color: var(--admin-header-text, #616161);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: var(--admin-header-bg, #f8f8f8);
}

/* Rows */
.kv-row {
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    transition: background-color 0.1s ease;
    height: var(--admin-row-height, 36px);
}
.kv-row:last-child {
    border-bottom: none;
}
.kv-row:hover {
    background: var(--admin-hover-bg, #e8e8e8);
}
.kv-row-striped {
    background: var(--admin-stripe-bg, #f8f8f8);
}
.kv-row-striped:hover {
    background: var(--admin-hover-bg, #e8e8e8);
}

/* Key cell */
.kv-key {
    padding: var(--admin-cell-padding, 8px 12px);
    font-weight: 600;
    color: var(--admin-text-secondary, #616161);
    white-space: nowrap;
    width: 1%;
    vertical-align: middle;
    user-select: none;
}

/* Value cell */
.kv-value {
    padding: var(--admin-cell-padding, 8px 12px);
    color: var(--admin-text, #1e1e1e);
    vertical-align: middle;
}
.kv-value-text {
    font-family: var(--admin-font-mono, 'Consolas', monospace);
    font-size: 12px;
}

/* Badges */
.kv-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 7px;
    border-radius: 10px;
    margin-left: 8px;
    letter-spacing: 0.02em;
    vertical-align: middle;
    line-height: 1.6;
    text-transform: uppercase;
}
.kv-badge-default {
    background: var(--admin-hover-bg, #e8e8e8);
    color: var(--admin-text-secondary, #616161);
}
.kv-badge-success {
    background: var(--admin-success-bg, #dff6dd);
    color: var(--admin-success, #16825d);
}
.kv-badge-warning {
    background: var(--admin-warning-bg, #fff4ce);
    color: var(--admin-warning, #c19c00);
}
.kv-badge-danger {
    background: var(--admin-danger-bg, #fdd);
    color: var(--admin-danger, #cd3131);
}
.kv-badge-info {
    background: var(--admin-info-bg, #d6ecff);
    color: var(--admin-info, #3794ff);
}

/* Copy button */
.kv-copy-btn {
    border: 1px solid var(--admin-border, #e0e0e0);
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    padding: 1px 5px;
    border-radius: var(--admin-radius, 4px);
    opacity: 0;
    transition: opacity 0.15s, background-color 0.1s;
    color: var(--admin-text-muted, #9e9e9e);
    margin-left: 8px;
    vertical-align: middle;
    line-height: 1;
}
.kv-row:hover .kv-copy-btn {
    opacity: 0.6;
}
.kv-copy-btn:hover {
    opacity: 1 !important;
    background: var(--admin-hover-bg, #e8e8e8);
    color: var(--admin-text, #1e1e1e);
}

/* Compact variant */
.kv-compact .kv-key,
.kv-compact .kv-value,
.kv-compact .kv-header {
    padding: 4px 10px;
}
.kv-compact .kv-row {
    height: 28px;
}
`;

module.exports = Key_Value_Table;
