/**
 * Stat_Card — Dashboard metric card with value, label, trend indicator, and icon.
 *
 * A compact card for displaying key metrics in admin dashboards.
 *
 * Options:
 *   label        — Metric label (e.g. "Active Users")
 *   value        — Display value (e.g. "1,234" or 42)
 *   trend        — Trend direction: 'up', 'down', 'flat', or null
 *   trend_value  — Trend description (e.g. "+12%" or "-3 since yesterday")
 *   icon         — Icon text/emoji to show (e.g. "👤" or "📊")
 *   variant      — Style variant: 'default', 'success', 'warning', 'danger', 'info'
 *   theme        — Theme name: 'vs-default', 'vs-dark', 'terminal', 'warm'
 *
 * Usage:
 *   new Stat_Card({ label: 'Active Users', value: '1,234', trend: 'up', trend_value: '+12%' })
 */
const Control = require('../../../../html-core/control');
const { prop } = require('obext');

class Stat_Card extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'stat_card';
        const cfg_value = spec.value != null ? String(spec.value) : '—';
        const cfg_label = spec.label || '';
        super(spec);
        this.add_class('jsgui-stat-card');
        this.dom.tagName = 'div';

        prop(this, 'value', cfg_value, () => this.recompose());
        this.label = cfg_label;
        this.trend = spec.trend || null;
        this.trend_value = spec.trend_value || '';
        this.icon = spec.icon || '';
        this.variant = spec.variant || 'default';

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }
        if (this.variant !== 'default') {
            this.dom.attributes['data-variant'] = this.variant;
        }

        if (!spec.el) this.compose();
    }

    compose() {
        // Icon
        if (this.icon) {
            const icon_el = new Control({ context: this.context, tag_name: 'div' });
            icon_el.add_class('stat-card-icon');
            icon_el.add(this.icon);
            this.add(icon_el);
        }

        // Body
        const body = new Control({ context: this.context, tag_name: 'div' });
        body.add_class('stat-card-body');

        // Value
        const val_el = new Control({ context: this.context, tag_name: 'div' });
        val_el.add_class('stat-card-value');
        val_el.add(String(this.value));
        body.add(val_el);

        // Label
        if (this.label) {
            const lbl_el = new Control({ context: this.context, tag_name: 'div' });
            lbl_el.add_class('stat-card-label');
            lbl_el.add(this.label);
            body.add(lbl_el);
        }

        // Trend
        if (this.trend) {
            const trend_el = new Control({ context: this.context, tag_name: 'div' });
            trend_el.add_class('stat-card-trend');
            trend_el.dom.attributes['data-trend'] = this.trend;

            const arrow = this.trend === 'up' ? '↑' : this.trend === 'down' ? '↓' : '→';
            const arrow_el = new Control({ context: this.context, tag_name: 'span' });
            arrow_el.add_class('stat-card-trend-arrow');
            arrow_el.add(arrow);
            trend_el.add(arrow_el);

            if (this.trend_value) {
                const tv_el = new Control({ context: this.context, tag_name: 'span' });
                tv_el.add_class('stat-card-trend-value');
                tv_el.add(this.trend_value);
                trend_el.add(tv_el);
            }

            body.add(trend_el);
        }

        this.add(body);
    }
}

Stat_Card.css = `
/* ─── Stat_Card ─── */
.jsgui-stat-card {
    display: inline-flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    border-radius: var(--admin-radius-lg, 6px);
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e0e0e0);
    box-shadow: var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.08));
    min-width: 180px;
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.jsgui-stat-card:hover {
    box-shadow: var(--admin-shadow-lg, 0 4px 12px rgba(0,0,0,0.1));
    transform: translateY(-1px);
}
.stat-card-icon {
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--admin-radius, 4px);
    background: var(--admin-stripe-bg, #f8f8f8);
}
.stat-card-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.stat-card-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--admin-text, #1e1e1e);
    font-variant-numeric: tabular-nums;
}
.stat-card-label {
    font-size: 12px;
    color: var(--admin-text-muted, #9e9e9e);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.stat-card-trend {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
}
.stat-card-trend[data-trend="up"]   { color: var(--admin-success, #16825d); }
.stat-card-trend[data-trend="down"] { color: var(--admin-danger, #cd3131); }
.stat-card-trend[data-trend="flat"] { color: var(--admin-text-muted, #9e9e9e); }
.stat-card-trend-arrow { font-size: 14px; }

/* Variant accent bars */
.jsgui-stat-card[data-variant="success"] { border-left: 3px solid var(--admin-success, #16825d); }
.jsgui-stat-card[data-variant="warning"] { border-left: 3px solid var(--admin-warning, #c19c00); }
.jsgui-stat-card[data-variant="danger"]  { border-left: 3px solid var(--admin-danger, #cd3131); }
.jsgui-stat-card[data-variant="info"]    { border-left: 3px solid var(--admin-info, #3794ff); }
`;

module.exports = Stat_Card;
