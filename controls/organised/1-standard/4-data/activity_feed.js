/**
 * Activity_Feed — Real-time event timeline for admin dashboards.
 *
 * Displays a chronological list of events with timestamps, icons, severity levels,
 * and optional detail text. Useful for deploy logs, user activity, system events.
 *
 * Options:
 *   entries       — Array of { timestamp, message, type, icon, detail, actor }
 *   max_entries   — Maximum entries before auto-pruning oldest (default: 100)
 *   show_time     — Show timestamp column (default: true)
 *   title         — Optional feed title
 *   theme         — Admin theme name
 *
 * Entry types: 'info' (default), 'success', 'warning', 'error', 'deploy', 'system'
 *
 * API:
 *   add_entry(entry)     — Append an entry (prunes oldest if over max)
 *   clear()              — Remove all entries
 *   set_entries(entries)  — Replace all entries
 *
 * Events:
 *   'entry-click' { entry, index } — Fired when an entry row is clicked
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

const TYPE_ICONS = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕',
    deploy: '🚀',
    system: '⚙'
};

const TYPE_CLASSES = {
    info: 'af-type-info',
    success: 'af-type-success',
    warning: 'af-type-warning',
    error: 'af-type-error',
    deploy: 'af-type-deploy',
    system: 'af-type-system'
};

const format_time = (ts) => {
    if (!ts) return '';
    if (typeof ts === 'string') return ts;
    if (ts instanceof Date) {
        const h = String(ts.getHours()).padStart(2, '0');
        const m = String(ts.getMinutes()).padStart(2, '0');
        const s = String(ts.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }
    return String(ts);
};

class Activity_Feed extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'activity_feed';
        super(spec);
        this.add_class('jsgui-activity-feed');
        this.dom.tagName = 'div';

        this._max_entries = spec.max_entries || 100;
        this._show_time = spec.show_time !== false;
        this._title = spec.title || '';
        this._entries = [];

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        // Normalize initial entries
        if (Array.isArray(spec.entries)) {
            this._entries = spec.entries.map(e => this._normalize_entry(e));
        }

        if (!spec.el) this.compose();
    }

    _normalize_entry(entry) {
        const type = entry.type || 'info';
        return {
            timestamp: entry.timestamp || null,
            message: is_defined(entry.message) ? String(entry.message) : '',
            type,
            icon: entry.icon || TYPE_ICONS[type] || 'ℹ',
            detail: entry.detail || '',
            actor: entry.actor || ''
        };
    }

    /**
     * Add a single entry to the feed.
     * @param {Object} entry
     */
    add_entry(entry) {
        const normalized = this._normalize_entry(entry);
        this._entries.push(normalized);
        // Prune oldest if over max
        while (this._entries.length > this._max_entries) {
            this._entries.shift();
        }
        this._render_entries();
    }

    /**
     * Replace all entries.
     * @param {Array} entries
     */
    set_entries(entries) {
        this._entries = Array.isArray(entries) ? entries.map(e => this._normalize_entry(e)) : [];
        this._render_entries();
    }

    /**
     * Remove all entries.
     */
    clear_entries() {
        this._entries = [];
        this._render_entries();
    }

    compose() {
        // Title bar (optional)
        if (this._title) {
            const title_bar = new Control({ context: this.context, tag_name: 'div' });
            title_bar.add_class('af-title');
            title_bar.add(this._title);
            this.add(title_bar);
        }

        // Entries container
        this._list_ctrl = new Control({ context: this.context, tag_name: 'div' });
        this._list_ctrl.add_class('af-list');
        this.add(this._list_ctrl);

        this._render_entries();
    }

    _render_entries() {
        if (!this._list_ctrl) return;
        this._list_ctrl.clear();

        if (this._entries.length === 0) {
            const empty = new Control({ context: this.context, tag_name: 'div' });
            empty.add_class('af-empty');
            empty.add('No activity yet');
            this._list_ctrl.add(empty);
            return;
        }

        this._entries.forEach((entry, idx) => {
            const row = new Control({ context: this.context, tag_name: 'div' });
            row.add_class('af-entry');
            row.add_class(TYPE_CLASSES[entry.type] || 'af-type-info');
            row.dom.attributes['data-index'] = String(idx);

            // Timeline dot
            const dot = new Control({ context: this.context, tag_name: 'span' });
            dot.add_class('af-dot');
            row.add(dot);

            // Icon
            const icon = new Control({ context: this.context, tag_name: 'span' });
            icon.add_class('af-icon');
            icon.add(entry.icon);
            row.add(icon);

            // Timestamp
            if (this._show_time && entry.timestamp) {
                const time = new Control({ context: this.context, tag_name: 'span' });
                time.add_class('af-time');
                time.add(format_time(entry.timestamp));
                row.add(time);
            }

            // Message body
            const body = new Control({ context: this.context, tag_name: 'span' });
            body.add_class('af-message');
            // Actor prefix
            if (entry.actor) {
                const actor = new Control({ context: this.context, tag_name: 'strong' });
                actor.add_class('af-actor');
                actor.add(entry.actor);
                body.add(actor);
                body.add(' ');
            }
            body.add(entry.message);
            row.add(body);

            // Detail (optional)
            if (entry.detail) {
                const detail = new Control({ context: this.context, tag_name: 'span' });
                detail.add_class('af-detail');
                detail.add(entry.detail);
                row.add(detail);
            }

            this._list_ctrl.add(row);
        });
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;
            this.add_dom_event_listener('click', e => {
                let target = e.target;
                while (target && target !== this.dom.el) {
                    if (target.classList && target.classList.contains('af-entry')) {
                        const idx = parseInt(target.getAttribute('data-index'), 10);
                        if (!isNaN(idx) && this._entries[idx]) {
                            this.raise('entry-click', { entry: this._entries[idx], index: idx });
                        }
                        return;
                    }
                    target = target.parentNode;
                }
            });
        }
    }
}

Activity_Feed.css = `
.jsgui-activity-feed {
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e2e8f0);
    border-radius: 8px;
    overflow: hidden;
    font-family: var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 13px;
    color: var(--admin-text, #1e293b);
}
.af-title {
    padding: 10px 14px;
    font-weight: 600;
    font-size: 13px;
    background: var(--admin-header-bg, #f8fafc);
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
    color: var(--admin-header-text, #334155);
}
.af-list {
    padding: 0;
    max-height: 400px;
    overflow-y: auto;
}
.af-entry {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
    position: relative;
    cursor: pointer;
    transition: background 0.12s;
}
.af-entry:last-child { border-bottom: none; }
.af-entry:hover { background: var(--admin-hover, rgba(0,0,0,0.03)); }
/* Timeline connector */
.af-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 4px;
    background: var(--admin-muted, #94a3b8);
}
.af-type-success .af-dot { background: #22c55e; }
.af-type-warning .af-dot { background: #f59e0b; }
.af-type-error   .af-dot { background: #ef4444; }
.af-type-deploy  .af-dot { background: #8b5cf6; }
.af-type-system  .af-dot { background: #3b82f6; }
.af-icon {
    flex-shrink: 0;
    width: 18px;
    text-align: center;
    font-size: 13px;
    line-height: 1.4;
    opacity: 0.8;
}
.af-time {
    flex-shrink: 0;
    font-family: var(--admin-mono, 'Consolas', 'Monaco', monospace);
    font-size: 11px;
    color: var(--admin-muted, #94a3b8);
    min-width: 56px;
    line-height: 1.6;
}
.af-message {
    flex: 1;
    line-height: 1.4;
}
.af-actor {
    font-weight: 600;
}
.af-detail {
    font-size: 11px;
    color: var(--admin-muted, #94a3b8);
    margin-left: auto;
    flex-shrink: 0;
}
.af-empty {
    padding: 24px;
    text-align: center;
    color: var(--admin-muted, #94a3b8);
    font-style: italic;
}
`;

module.exports = Activity_Feed;
