/**
 * Log_Viewer — Scrollable log display with severity levels and timestamps.
 *
 * Displays log entries in a monospaced, terminal-like view. Each entry has
 * a severity level (info, warn, error, debug) and optional timestamp.
 *
 * Options:
 *   entries        — Array of { message, level?, timestamp? }
 *   max_entries    — Maximum entries to keep (default 500)
 *   show_timestamps — Show timestamps (default true)
 *   auto_scroll    — Auto-scroll to newest entry (default true)
 *   title          — Optional title shown in the toolbar
 *   theme          — Theme name: 'vs-default', 'vs-dark', 'terminal', 'warm'
 *
 * Methods:
 *   log(message, level?)    — Add a single entry
 *   clear_logs()            — Clear all entries
 *
 * Events:
 *   log({ entry, count })
 *   clear()
 *   entry_click({ entry, index })
 */
const Control = require('../../../../html-core/control');

class Log_Viewer extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'log_viewer';
        super(spec);
        this.add_class('jsgui-log-viewer');
        this.dom.tagName = 'div';

        this.max_entries = spec.max_entries || 500;
        this.show_timestamps = spec.show_timestamps !== false;
        this.auto_scroll = spec.auto_scroll !== false;
        this.log_title = spec.title || '';
        this.entries = [];

        this._toolbar = null;
        this._log_body = null;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (spec.entries && Array.isArray(spec.entries)) {
            this.entries = spec.entries.map(e => this._normalize_entry(e));
        }

        if (!spec.el) this.compose();
    }

    _normalize_entry(entry) {
        if (typeof entry === 'string') {
            return { message: entry, level: 'info', timestamp: null };
        }
        return {
            message: String(entry.message || ''),
            level: entry.level || 'info',
            timestamp: entry.timestamp || null
        };
    }

    compose() {
        // Toolbar
        this._toolbar = new Control({ context: this.context, tag_name: 'div' });
        this._toolbar.add_class('log-viewer-toolbar');

        if (this.log_title) {
            const title_el = new Control({ context: this.context, tag_name: 'span' });
            title_el.add_class('log-viewer-title');
            title_el.add(this.log_title);
            this._toolbar.add(title_el);
        }

        const right_group = new Control({ context: this.context, tag_name: 'div' });
        right_group.add_class('log-viewer-toolbar-right');

        const count_el = new Control({ context: this.context, tag_name: 'span' });
        count_el.add_class('log-viewer-count');
        count_el.add(`${this.entries.length} entries`);
        right_group.add(count_el);

        const clear_btn = new Control({ context: this.context, tag_name: 'button' });
        clear_btn.dom.attributes.type = 'button';
        clear_btn.add_class('log-viewer-clear');
        clear_btn.add('Clear');
        right_group.add(clear_btn);

        this._toolbar.add(right_group);
        this.add(this._toolbar);

        // Log body
        this._log_body = new Control({ context: this.context, tag_name: 'div' });
        this._log_body.add_class('log-viewer-body');
        this._render_entries();
        this.add(this._log_body);
    }

    _render_entries() {
        if (!this._log_body) return;
        this._log_body.clear();

        if (this.entries.length === 0) {
            const empty = new Control({ context: this.context, tag_name: 'div' });
            empty.add_class('log-viewer-empty');
            empty.add('No log entries');
            this._log_body.add(empty);
            return;
        }

        this.entries.forEach((entry, i) => {
            const line = new Control({ context: this.context, tag_name: 'div' });
            line.add_class('log-entry');
            line.add_class(`log-entry-${entry.level}`);
            line.dom.attributes['data-index'] = String(i);

            // Line number
            const ln = new Control({ context: this.context, tag_name: 'span' });
            ln.add_class('log-entry-ln');
            ln.add(String(i + 1));
            line.add(ln);

            // Severity badge
            const badge = new Control({ context: this.context, tag_name: 'span' });
            badge.add_class('log-entry-level');
            badge.add(entry.level.toUpperCase().padEnd(5));
            line.add(badge);

            // Timestamp
            if (this.show_timestamps && entry.timestamp) {
                const ts = new Control({ context: this.context, tag_name: 'span' });
                ts.add_class('log-entry-timestamp');
                ts.add(entry.timestamp);
                line.add(ts);
            }

            // Message
            const msg = new Control({ context: this.context, tag_name: 'span' });
            msg.add_class('log-entry-message');
            msg.add(entry.message);
            line.add(msg);

            this._log_body.add(line);
        });
    }

    /**
     * Add a log entry.
     * @param {string} message — Log message
     * @param {string} [level='info'] — Severity level
     */
    log(message, level = 'info') {
        const entry = {
            message: String(message),
            level,
            timestamp: new Date().toISOString().substring(11, 23)
        };
        this.entries.push(entry);

        while (this.entries.length > this.max_entries) {
            this.entries.shift();
        }

        this.recompose();
        this.raise('log', { entry, count: this.entries.length });
    }

    /**
     * Clear all log entries.
     */
    clear_logs() {
        this.entries = [];
        this.recompose();
        this.raise('clear');
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            this.dom.el.addEventListener('click', e => {
                const clear_btn = e.target.closest('.log-viewer-clear');
                if (clear_btn) {
                    this.clear_logs();
                    return;
                }

                const entry_el = e.target.closest('.log-entry');
                if (entry_el) {
                    const index = parseInt(entry_el.getAttribute('data-index'), 10);
                    if (!isNaN(index) && this.entries[index]) {
                        this.raise('entry_click', { entry: this.entries[index], index });
                    }
                }
            });
        }
    }
}

Log_Viewer.css = `
/* ─── Log_Viewer ─── */
.jsgui-log-viewer {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--admin-border, #3c3c3c);
    border-radius: var(--admin-radius-lg, 6px);
    background: var(--admin-card-bg, #252526);
    color: var(--admin-text, #d4d4d4);
    font-family: var(--admin-font-mono, 'Consolas', monospace);
    font-size: 12px;
    overflow: hidden;
    box-shadow: var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.3));
}
.log-viewer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--admin-header-bg, #2d2d2d);
    border-bottom: 1px solid var(--admin-border, #3c3c3c);
    min-height: 32px;
}
.log-viewer-title {
    font-family: var(--admin-font, 'Segoe UI', sans-serif);
    font-size: 12px;
    font-weight: 600;
    color: var(--admin-text-secondary, #9d9d9d);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.log-viewer-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
}
.log-viewer-count {
    font-family: var(--admin-font, 'Segoe UI', sans-serif);
    font-size: 11px;
    color: var(--admin-text-muted, #6a6a6a);
}
.log-viewer-clear {
    border: 1px solid var(--admin-border, #3c3c3c);
    background: transparent;
    color: var(--admin-text-secondary, #9d9d9d);
    font-family: var(--admin-font, 'Segoe UI', sans-serif);
    font-size: 11px;
    padding: 2px 10px;
    border-radius: var(--admin-radius, 4px);
    cursor: pointer;
    transition: background-color 0.1s, color 0.1s;
}
.log-viewer-clear:hover {
    background: var(--admin-hover-bg, #2a2d2e);
    color: var(--admin-text, #d4d4d4);
}
.log-viewer-body {
    overflow-y: auto;
    max-height: 400px;
    padding: 2px 0;
}
.log-viewer-empty {
    padding: 24px 12px;
    text-align: center;
    color: var(--admin-text-muted, #6a6a6a);
    font-family: var(--admin-font, 'Segoe UI', sans-serif);
    font-style: italic;
}
.log-entry {
    display: flex;
    gap: 8px;
    padding: 1px 12px;
    line-height: 1.7;
    cursor: default;
    border-left: 2px solid transparent;
    transition: background-color 0.08s;
}
.log-entry:hover {
    background: var(--admin-hover-bg, #2a2d2e);
}
.log-entry-ln {
    flex-shrink: 0;
    min-width: 28px;
    text-align: right;
    color: var(--admin-text-muted, #6a6a6a);
    user-select: none;
    font-size: 11px;
}
.log-entry-level {
    flex-shrink: 0;
    font-weight: 600;
    min-width: 44px;
    font-size: 11px;
}
.log-entry-info .log-entry-level  { color: var(--admin-info, #3794ff); }
.log-entry-warn .log-entry-level  { color: var(--admin-warning, #cca700); }
.log-entry-error .log-entry-level { color: var(--admin-danger, #f14c4c); }
.log-entry-debug .log-entry-level { color: #b267e6; }

/* Error entries get a subtle left border */
.log-entry-error { border-left-color: var(--admin-danger, #f14c4c); }
.log-entry-warn  { border-left-color: var(--admin-warning, #cca700); }

.log-entry-timestamp {
    flex-shrink: 0;
    color: var(--admin-text-muted, #6a6a6a);
    min-width: 80px;
    font-size: 11px;
}
.log-entry-message {
    white-space: pre-wrap;
    word-break: break-all;
}
`;

module.exports = Log_Viewer;
