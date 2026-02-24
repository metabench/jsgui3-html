/**
 * Command_Palette — Quick-action keyboard command overlay for admin dashboards.
 *
 * A Ctrl+K / Cmd+K style command palette for power-user navigation and actions.
 * Renders as a modal overlay with a search input and filterable command list.
 *
 * Options:
 *   commands    — Array of { id, label, shortcut?, icon?, group?, action? }
 *   placeholder — Search input placeholder (default: 'Type a command…')
 *   theme       — Admin theme name
 *
 * API:
 *   register_command(cmd)  — Add a command dynamically
 *   open()                — Show the palette
 *   close()               — Hide the palette
 *   toggle()              — Toggle visibility
 *
 * Events:
 *   'execute' { command } — Fired when a command is selected
 *   'open'                — Fired when palette opens
 *   'close'               — Fired when palette closes
 */
const jsgui = require('../../../../html-core/html-core');
const { Control } = jsgui;
const { is_defined } = jsgui;

const fuzzy_match = (query, text) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return true;
    // Simple fuzzy: all query chars appear in order
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
        if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
};

class Command_Palette extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'command_palette';
        super(spec);
        this.add_class('jsgui-command-palette');
        this.dom.tagName = 'div';
        this.dom.attributes.role = 'dialog';
        this.dom.attributes['aria-label'] = 'Command palette';

        this._commands = [];
        this._placeholder = spec.placeholder || 'Type a command\u2026';
        this._is_open = false;
        this._selected_index = 0;

        if (spec.theme) {
            this.dom.attributes['data-admin-theme'] = spec.theme;
        }

        if (Array.isArray(spec.commands)) {
            spec.commands.forEach(cmd => this._commands.push(this._normalize(cmd)));
        }

        if (!spec.el) this.compose();
    }

    _normalize(cmd) {
        return {
            id: cmd.id || `cmd_${this._commands.length}`,
            label: is_defined(cmd.label) ? String(cmd.label) : '',
            shortcut: cmd.shortcut || '',
            icon: cmd.icon || '',
            group: cmd.group || '',
            action: typeof cmd.action === 'function' ? cmd.action : null
        };
    }

    /**
     * Register a command.
     * @param {Object} cmd
     */
    register_command(cmd) {
        this._commands.push(this._normalize(cmd));
    }

    open() {
        this._is_open = true;
        this.add_class('cp-visible');
        this.raise('open');
    }

    close() {
        this._is_open = false;
        this.remove_class('cp-visible');
        this._selected_index = 0;
        this.raise('close');
    }

    toggle() {
        if (this._is_open) this.close();
        else this.open();
    }

    compose() {
        // Backdrop
        this._backdrop = new Control({ context: this.context, tag_name: 'div' });
        this._backdrop.add_class('cp-backdrop');
        this.add(this._backdrop);

        // Modal container
        const modal = new Control({ context: this.context, tag_name: 'div' });
        modal.add_class('cp-modal');

        // Search input
        const input_wrap = new Control({ context: this.context, tag_name: 'div' });
        input_wrap.add_class('cp-search-wrap');

        const search_icon = new Control({ context: this.context, tag_name: 'span' });
        search_icon.add_class('cp-search-icon');
        search_icon.add('⌘');
        input_wrap.add(search_icon);

        this._input = new Control({ context: this.context, tag_name: 'input' });
        this._input.add_class('cp-input');
        this._input.dom.attributes.type = 'text';
        this._input.dom.attributes.placeholder = this._placeholder;
        this._input.dom.attributes.autocomplete = 'off';
        this._input.dom.attributes.spellcheck = 'false';
        input_wrap.add(this._input);

        const esc_hint = new Control({ context: this.context, tag_name: 'kbd' });
        esc_hint.add_class('cp-esc');
        esc_hint.add('esc');
        input_wrap.add(esc_hint);

        modal.add(input_wrap);

        // Results list
        this._results = new Control({ context: this.context, tag_name: 'div' });
        this._results.add_class('cp-results');
        this.compose_results('');
        modal.add(this._results);

        // Footer hint
        const footer = new Control({ context: this.context, tag_name: 'div' });
        footer.add_class('cp-footer');
        footer.add('↑↓ navigate  ⏎ select  esc close');
        modal.add(footer);

        this.add(modal);
    }

    compose_results(query) {
        if (!this._results) return;
        this._results.clear();

        const filtered = this._commands.filter(cmd => fuzzy_match(query, cmd.label + ' ' + cmd.group));
        this._filtered = filtered;
        this._selected_index = Math.min(this._selected_index, Math.max(0, filtered.length - 1));

        let current_group = '';
        filtered.forEach((cmd, idx) => {
            // Group header
            if (cmd.group && cmd.group !== current_group) {
                current_group = cmd.group;
                const gh = new Control({ context: this.context, tag_name: 'div' });
                gh.add_class('cp-group');
                gh.add(current_group);
                this._results.add(gh);
            }

            const row = new Control({ context: this.context, tag_name: 'div' });
            row.add_class('cp-item');
            row.dom.attributes['data-cmd-index'] = String(idx);
            if (idx === this._selected_index) row.add_class('cp-selected');

            if (cmd.icon) {
                const icon = new Control({ context: this.context, tag_name: 'span' });
                icon.add_class('cp-item-icon');
                icon.add(cmd.icon);
                row.add(icon);
            }

            const label = new Control({ context: this.context, tag_name: 'span' });
            label.add_class('cp-item-label');
            label.add(cmd.label);
            row.add(label);

            if (cmd.shortcut) {
                const sc = new Control({ context: this.context, tag_name: 'kbd' });
                sc.add_class('cp-item-shortcut');
                sc.add(cmd.shortcut);
                row.add(sc);
            }

            this._results.add(row);
        });

        if (filtered.length === 0) {
            const none = new Control({ context: this.context, tag_name: 'div' });
            none.add_class('cp-empty');
            none.add('No matching commands');
            this._results.add(none);
        }
    }

    _execute_selected() {
        if (!this._filtered || this._filtered.length === 0) return;
        const cmd = this._filtered[this._selected_index];
        if (!cmd) return;
        this.raise('execute', { command: cmd });
        if (cmd.action) cmd.action(cmd);
        this.close();
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (!this.dom.el) return;

            // Backdrop click closes
            if (this._backdrop && this._backdrop.dom.el) {
                this._backdrop.dom.el.addEventListener('click', () => this.close());
            }

            // Input events
            const input_el = this._input && this._input.dom.el;
            if (input_el) {
                input_el.addEventListener('input', () => {
                    this._selected_index = 0;
                    this.compose_results(input_el.value);
                    // Re-render to DOM
                    if (this._results && this._results.dom.el) {
                        this._results.dom.el.innerHTML = this._results.all_html_process();
                    }
                });

                input_el.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this._selected_index = Math.min(this._selected_index + 1, (this._filtered || []).length - 1);
                        this._update_selection();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        this._selected_index = Math.max(this._selected_index - 1, 0);
                        this._update_selection();
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        this._execute_selected();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        this.close();
                    }
                });
            }

            // Click on result item
            if (this._results && this._results.dom.el) {
                this._results.dom.el.addEventListener('click', (e) => {
                    let target = e.target;
                    while (target && target !== this._results.dom.el) {
                        if (target.classList && target.classList.contains('cp-item')) {
                            const idx = parseInt(target.getAttribute('data-cmd-index'), 10);
                            if (!isNaN(idx)) {
                                this._selected_index = idx;
                                this._execute_selected();
                            }
                            return;
                        }
                        target = target.parentNode;
                    }
                });
            }

            // Global Ctrl+K / Cmd+K handler
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggle();
                    if (this._is_open && input_el) {
                        input_el.value = '';
                        this.compose_results('');
                        if (this._results && this._results.dom.el) {
                            this._results.dom.el.innerHTML = this._results.all_html_process();
                        }
                        setTimeout(() => input_el.focus(), 50);
                    }
                }
            });
        }
    }

    _update_selection() {
        if (!this._results || !this._results.dom.el) return;
        const items = this._results.dom.el.querySelectorAll('.cp-item');
        items.forEach((el, i) => {
            el.classList.toggle('cp-selected', i === this._selected_index);
        });
    }
}

Command_Palette.css = `
.jsgui-command-palette {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    font-family: var(--admin-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
}
.jsgui-command-palette.cp-visible {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 15vh;
}
.cp-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 0;
}
.cp-modal {
    position: relative;
    z-index: 1;
    width: 520px;
    max-width: 90vw;
    background: var(--admin-card-bg, #fff);
    border: 1px solid var(--admin-border, #e2e8f0);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    overflow: hidden;
}
.cp-search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--admin-border, #e2e8f0);
}
.cp-search-icon {
    font-size: 16px;
    color: var(--admin-muted, #94a3b8);
    flex-shrink: 0;
}
.cp-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    background: transparent;
    color: var(--admin-text, #1e293b);
    font-family: inherit;
}
.cp-input::placeholder {
    color: var(--admin-muted, #94a3b8);
}
.cp-esc {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    background: var(--admin-hover, #f1f5f9);
    border: 1px solid var(--admin-border, #e2e8f0);
    color: var(--admin-muted, #94a3b8);
    font-family: inherit;
}
.cp-results {
    max-height: 320px;
    overflow-y: auto;
    padding: 4px 0;
}
.cp-group {
    padding: 8px 16px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--admin-muted, #94a3b8);
}
.cp-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.08s;
    color: var(--admin-text, #1e293b);
}
.cp-item:hover,
.cp-item.cp-selected {
    background: var(--admin-accent, #3b82f6);
    color: #fff;
}
.cp-item.cp-selected .cp-item-shortcut {
    border-color: rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.8);
}
.cp-item-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
    font-size: 14px;
}
.cp-item-label {
    flex: 1;
    font-size: 13px;
}
.cp-item-shortcut {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    border: 1px solid var(--admin-border, #e2e8f0);
    color: var(--admin-muted, #94a3b8);
    font-family: var(--admin-mono, monospace);
}
.cp-footer {
    padding: 8px 16px;
    border-top: 1px solid var(--admin-border, #e2e8f0);
    font-size: 11px;
    color: var(--admin-muted, #94a3b8);
    text-align: center;
}
.cp-empty {
    padding: 24px;
    text-align: center;
    color: var(--admin-muted, #94a3b8);
    font-style: italic;
}
`;

module.exports = Command_Palette;
