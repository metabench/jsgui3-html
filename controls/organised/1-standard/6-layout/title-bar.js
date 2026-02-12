/**
 * Title_Bar — Header bar with icon, title, subtitle, and action buttons.
 *
 * Used as the top bar for panels, windows, and dialog-like controls.
 * Supports optional window-chrome actions (close, minimize, maximize).
 *
 * Options:
 *   text       — Title text (string)
 *   subtitle   — Optional subtitle text
 *   icon       — Optional icon emoji or text
 *   actions    — Array of { id, label, icon?, action? } button descriptors
 *   closable   — Shorthand: add a close button (default false)
 *   draggable  — Whether the bar acts as a drag handle (default false)
 *   theme      — Admin theme name
 *
 * API:
 *   set_title(text)       — Update title text
 *   set_subtitle(text)    — Update subtitle text
 *   add_action(spec)      — Add an action button
 *
 * Events:
 *   'action'   { id }     — Fired when an action button is clicked
 *   'close'               — Shorthand for close button click
 */
const Control = require('../../../../html-core/control');

class Title_Bar extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'title_bar';
        const cfg_text = spec.text || '';
        const cfg_subtitle = spec.subtitle || '';
        const cfg_icon = spec.icon || '';
        const cfg_actions = spec.actions || [];
        super(spec);
        this.add_class('jsgui-title-bar');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'banner';

        this._title_text = cfg_text;
        this._subtitle_text = cfg_subtitle;
        this._icon_text = cfg_icon;
        this._draggable = !!spec.draggable;
        this._actions = [];

        // Internal control refs
        this._title_el = null;
        this._subtitle_el = null;
        this._icon_el = null;
        this._actions_el = null;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }
        if (this._draggable) {
            this.dom.attributes.style['-webkit-app-region'] = 'drag';
            this.dom.attributes.style['app-region'] = 'drag';
        }

        if (!spec.el) {
            this.compose();

            // Add configured actions
            cfg_actions.forEach(a => this.add_action(a));

            // Close button shorthand
            if (spec.closable) {
                this.add_action({ id: 'close', label: 'Close', icon: '×' });
            }
        }
    }

    compose() {
        this.compose_leading();
        this.compose_center();
        this.compose_actions();
    }

    compose_leading() {
        if (!this._icon_text) return;
        const icon = new Control({ context: this.context, tag_name: 'span' });
        icon.add_class('title-bar-icon');
        icon.add(this._icon_text);
        this._icon_el = icon;
        this.add(icon);
    }

    compose_center() {
        const center = new Control({ context: this.context, tag_name: 'div' });
        center.add_class('title-bar-center');

        // Title
        const title = new Control({ context: this.context, tag_name: 'span' });
        title.add_class('title-bar-title');
        title.add(this._title_text);
        this._title_el = title;
        center.add(title);

        // Subtitle
        if (this._subtitle_text) {
            const sub = new Control({ context: this.context, tag_name: 'span' });
            sub.add_class('title-bar-subtitle');
            sub.add(this._subtitle_text);
            this._subtitle_el = sub;
            center.add(sub);
        }

        this.add(center);
    }

    compose_actions() {
        const actions = new Control({ context: this.context, tag_name: 'div' });
        actions.add_class('title-bar-actions');
        if (this._draggable) {
            actions.dom.attributes.style['-webkit-app-region'] = 'no-drag';
            actions.dom.attributes.style['app-region'] = 'no-drag';
        }
        this._actions_el = actions;
        this.add(actions);
    }

    // ── Public API ──

    set_title(text) {
        this._title_text = text;
        if (this._title_el && this._title_el.dom.el) {
            this._title_el.dom.el.textContent = text;
        }
    }

    set_subtitle(text) {
        this._subtitle_text = text;
        if (this._subtitle_el && this._subtitle_el.dom.el) {
            this._subtitle_el.dom.el.textContent = text;
        }
    }

    add_action(spec) {
        const id = spec.id || `action_${this._actions.length}`;
        const icon = spec.icon || '';
        const label = spec.label || id;

        const btn = new Control({ context: this.context, tag_name: 'button' });
        btn.add_class('title-bar-action');
        btn.dom.attributes.type = 'button';
        btn.dom.attributes['aria-label'] = label;
        btn.dom.attributes['data-action-id'] = id;
        btn.dom.attributes.title = label;
        btn.add(icon || label);

        const action_data = { id, label, icon, el: btn, action: spec.action || null };
        this._actions.push(action_data);

        if (this._actions_el) {
            this._actions_el.add(btn);
        }

        return id;
    }

    // ── Activation ──

    activate() {
        super.activate();
        const that = this;

        this._actions.forEach(action_data => {
            if (action_data.el) {
                action_data.el.on('click', () => {
                    if (typeof action_data.action === 'function') {
                        action_data.action();
                    }
                    that.raise('action', { id: action_data.id });
                    if (action_data.id === 'close') {
                        that.raise('close');
                    }
                });
            }
        });
    }
}

Title_Bar.css = `
/* ─── Title_Bar ─── */
.jsgui-title-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--admin-header-bg, #f5f5f5);
    border-bottom: 1px solid var(--admin-border, #e0e0e0);
    font-family: var(--admin-font, 'Segoe UI', -apple-system, sans-serif);
    min-height: 36px;
    user-select: none;
}
.title-bar-icon {
    font-size: 18px;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
    line-height: 1;
}
.title-bar-center {
    flex: 1 1 auto;
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
}
.title-bar-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--admin-text, #1e1e1e);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    letter-spacing: 0.02em;
}
.title-bar-subtitle {
    font-size: 11px;
    color: var(--admin-muted, #888);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.title-bar-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}
.title-bar-action {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--admin-muted, #888);
    background: none;
    border: none;
    border-radius: var(--admin-radius, 4px);
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease;
    font-family: inherit;
    line-height: 1;
}
.title-bar-action:hover {
    background: var(--admin-hover, rgba(128,128,128,0.12));
    color: var(--admin-text, #1e1e1e);
}
.title-bar-action[data-action-id="close"]:hover {
    background: var(--admin-danger, #cd3131);
    color: #fff;
}
.title-bar-action:focus-visible {
    outline: 2px solid var(--admin-accent, #007acc);
    outline-offset: -1px;
}
`;

module.exports = Title_Bar;