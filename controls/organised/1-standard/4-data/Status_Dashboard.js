/**
 * Status_Dashboard — Composite dashboard layout for admin metrics.
 *
 * Auto-arranges Stat_Cards and status indicators in a responsive CSS grid.
 * Designed as a one-shot "dashboard builder" — pass metric definitions and get
 * a fully laid-out admin dashboard panel.
 *
 * Options:
 *   title      — Dashboard title
 *   metrics    — Array of metric definitions:
 *                { label, value, trend?, trend_value?, icon?, variant?, sparkline_data? }
 *   groups     — Optional grouped layout:
 *                [{ title: 'Server', metrics: [...] }, ...]
 *   columns    — Grid columns (default: auto-fit, min 200px)
 *   theme      — Admin theme name
 *   on_refresh — Callback function to re-fetch metric data
 *
 * API:
 *   set_metrics(metrics)  — Update all metrics
 *   set_metric(id, data)  — Update a single metric by index or label
 *   refresh()             — Trigger on_refresh callback
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;
const Stat_Card = require('./Stat_Card');
const Sparkline = require('./Sparkline');

class Status_Dashboard extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'status_dashboard';
        super(spec);
        this.add_class('jsgui-status-dashboard');
        this.dom.tagName = 'div';

        this._title = spec.title || '';
        this._metrics = spec.metrics || [];
        this._groups = spec.groups || null;
        this._columns = spec.columns || null;
        this._on_refresh = typeof spec.on_refresh === 'function' ? spec.on_refresh : null;

        // ── Adaptive layout options (all overridable) ──
        this.layout_mode = spec.layout_mode || 'auto';
        this.phone_breakpoint = is_defined(spec.phone_breakpoint) ? spec.phone_breakpoint : 600;
        // Minimum card width — smaller on phone for 2-column fit
        this.min_card_width = spec.min_card_width || 200;
        this.phone_min_card_width = spec.phone_min_card_width || 140;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (!spec.el) this.compose();
    }

    /**
     * Resolve the current layout mode.
     * @returns {'phone'|'tablet'|'desktop'}
     */
    resolve_layout_mode() {
        if (this.layout_mode && this.layout_mode !== 'auto') return this.layout_mode;
        const env = this.context && this.context.view_environment;
        if (env && env.layout_mode) return env.layout_mode;
        if (typeof window !== 'undefined') {
            if (window.innerWidth <= this.phone_breakpoint) return 'phone';
        }
        return 'desktop';
    }

    /**
     * Apply adaptive layout mode attribute.
     */
    _apply_layout_mode() {
        const el = this.dom && this.dom.el;
        if (!el) return;
        el.setAttribute('data-layout-mode', this.resolve_layout_mode());
    }

    /**
     * Update all metrics and re-render.
     * @param {Array} metrics
     */
    set_metrics(metrics) {
        this._metrics = metrics || [];
        this._render_dashboard();
    }

    /**
     * Update a single metric by index.
     * @param {number} index
     * @param {Object} data — Partial metric update
     */
    set_metric(index, data) {
        if (index >= 0 && index < this._metrics.length) {
            Object.assign(this._metrics[index], data);
            this._render_dashboard();
        }
    }

    /**
     * Trigger the refresh callback.
     */
    refresh() {
        if (this._on_refresh) this._on_refresh(this);
    }

    compose() {
        this._render_dashboard();
    }

    _render_dashboard() {
        this.clear();

        // Title bar
        if (this._title || this._on_refresh) {
            const header = new Control({ context: this.context, tag_name: 'div' });
            header.add_class('sd-header');

            if (this._title) {
                const title = new Control({ context: this.context, tag_name: 'div' });
                title.add_class('sd-title');
                title.add(this._title);
                header.add(title);
            }

            if (this._on_refresh) {
                const refresh_btn = new Control({ context: this.context, tag_name: 'button' });
                refresh_btn.add_class('sd-refresh');
                refresh_btn.dom.attributes.type = 'button';
                refresh_btn.dom.attributes.title = 'Refresh metrics';
                refresh_btn.add('↻');
                header.add(refresh_btn);
            }

            this.add(header);
        }

        // Grouped layout
        if (this._groups && Array.isArray(this._groups)) {
            this._groups.forEach(group => {
                const section = new Control({ context: this.context, tag_name: 'div' });
                section.add_class('sd-group');

                if (group.title) {
                    const group_title = new Control({ context: this.context, tag_name: 'div' });
                    group_title.add_class('sd-group-title');
                    group_title.add(group.title);
                    section.add(group_title);
                }

                const grid = this._create_grid(group.metrics || []);
                section.add(grid);
                this.add(section);
            });
        } else {
            // Flat layout
            const grid = this._create_grid(this._metrics);
            this.add(grid);
        }
    }

    _create_grid(metrics) {
        const grid = new Control({ context: this.context, tag_name: 'div' });
        grid.add_class('sd-grid');

        if (this._columns) {
            grid.dom.attributes.style = `grid-template-columns: repeat(${this._columns}, 1fr);`;
        }

        (metrics || []).forEach(metric => {
            const card_wrap = new Control({ context: this.context, tag_name: 'div' });
            card_wrap.add_class('sd-card-wrap');

            const card = new Stat_Card({
                context: this.context,
                label: metric.label || '',
                value: is_defined(metric.value) ? metric.value : '—',
                trend: metric.trend || null,
                trend_value: metric.trend_value || '',
                icon: metric.icon || '',
                variant: metric.variant || 'default'
            });
            card_wrap.add(card);

            // Sparkline under the card (optional)
            if (Array.isArray(metric.sparkline_data) && metric.sparkline_data.length > 0) {
                const spark = new Sparkline({
                    context: this.context,
                    data: metric.sparkline_data,
                    color: metric.sparkline_color || undefined,
                    height: 32,
                    width: 180
                });
                spark.add_class('sd-sparkline');
                card_wrap.add(spark);
            }

            grid.add(card_wrap);
        });

        return grid;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // ── Adaptive layout ──
            this._apply_layout_mode();
            if (this.layout_mode === 'auto' && typeof window !== 'undefined') {
                this._resize_handler = () => this._apply_layout_mode();
                window.addEventListener('resize', this._resize_handler);
            }

            // Refresh button click
            this.add_dom_event_listener('click', e => {
                let target = e.target;
                while (target && target !== this.dom.el) {
                    if (target.classList && target.classList.contains('sd-refresh')) {
                        this.refresh();
                        return;
                    }
                    target = target.parentNode;
                }
            });
        }
    }
}

Status_Dashboard.css = `
.jsgui-status-dashboard {
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e2e8f0);
    border-radius: 8px;
    overflow: hidden;
    font-family: var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    color: var(--admin-text, #1e293b);
}
.sd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--admin-header-bg, #f8fafc);
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
}
.sd-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--admin-header-text, #334155);
}
.sd-refresh {
    width: 28px;
    height: 28px;
    border: 1px solid var(--admin-border, #e2e8f0);
    border-radius: 6px;
    background: var(--admin-card-bg, #fff);
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--admin-muted, #94a3b8);
    transition: background 0.15s, color 0.15s;
}
.sd-refresh:hover {
    background: var(--admin-hover, #f1f5f9);
    color: var(--admin-text, #1e293b);
}
.sd-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    padding: 14px;
}
.sd-card-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.sd-card-wrap .jsgui-stat-card {
    border: none;
    border-radius: 6px;
    background: var(--admin-hover, #f8fafc);
}
.sd-sparkline {
    margin: 0 auto;
}
.sd-group {
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
}
.sd-group:last-child { border-bottom: none; }
.sd-group-title {
    padding: 8px 14px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--admin-muted, #94a3b8);
}

/* ── Phone: smaller card minimum for 2-column fit, compact padding ── */
.jsgui-status-dashboard[data-layout-mode="phone"] .sd-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
    padding: 10px;
}
.jsgui-status-dashboard[data-layout-mode="phone"] .sd-header {
    padding: 8px 10px;
}
.jsgui-status-dashboard[data-layout-mode="phone"] .sd-refresh {
    min-width: var(--j-touch-target, 44px);
    min-height: var(--j-touch-target, 44px);
}

/* ── Tablet: touch-sized refresh button ── */
.jsgui-status-dashboard[data-layout-mode="tablet"] .sd-refresh {
    min-width: 36px;
    min-height: 36px;
}
`;

module.exports = Status_Dashboard;
