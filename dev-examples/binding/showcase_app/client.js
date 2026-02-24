const jsgui = require('../../../html');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

class Showcase_App extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'showcase_app';
        super(spec);

        const { context } = this;

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('showcase-app-body');
        }

        if (!spec.el) {
            this.compose_ui(context);
        }
    }

    compose_ui(context) {
        const shell = new Control({ context, tag_name: 'div' });
        shell.add_class('showcase-shell');
        this.body.add(shell);

        const header = new Control({ context, tag_name: 'header' });
        header.add_class('showcase-header');

        const title = new Control({ context, tag_name: 'h1' });
        title.add_class('showcase-title');
        title.add('jsgui3 Control Showcase');

        const subtitle = new Control({ context, tag_name: 'p' });
        subtitle.add_class('showcase-subtitle');
        subtitle.add('A themed playground for layout, action, feedback, and editor controls.');

        header.add(title);
        header.add(subtitle);
        shell.add(header);

        const app_grid = new Control({ context, tag_name: 'div' });
        app_grid.add_class('showcase-grid');
        shell.add(app_grid);

        const nav_panel = this.compose_navigation_panel(context);
        app_grid.add(nav_panel);

        const theme_panel = this.compose_theme_panel(context);
        app_grid.add(theme_panel);

        const content_panel = new Control({ context, tag_name: 'main' });
        content_panel.add_class('showcase-content');
        app_grid.add(content_panel);

        content_panel.add(this.compose_status_section(context));
        content_panel.add(this.compose_actions_section(context));
        content_panel.add(this.compose_layout_section(context));
        content_panel.add(this.compose_editor_section(context));
    }

    compose_navigation_panel(context) {
        const panel = new Control({ context, tag_name: 'aside' });
        panel.add_class('showcase-nav');

        const heading = new Control({ context, tag_name: 'h2' });
        heading.add_class('panel-title');
        heading.add('Showcase Nav');

        const nav_list = new Control({ context, tag_name: 'div' });
        nav_list.add_class('showcase-nav-list');

        const items = [
            { id: 'showcase-feedback', text: 'Feedback + Status' },
            { id: 'showcase-actions', text: 'Action Controls' },
            { id: 'showcase-layout', text: 'Layout + Navigation' },
            { id: 'showcase-editor', text: 'Editor + Console' }
        ];

        items.forEach((item, index) => {
            const button = new Control({ context, tag_name: 'button' });
            button.add_class('showcase-nav-link');
            if (index === 0) {
                button.add_class('is-active');
            }
            button.dom.attrs.type = 'button';
            button.dom.attrs['data-target'] = item.id;
            button.add(item.text);
            nav_list.add(button);
        });

        panel.add(heading);
        panel.add(nav_list);
        return panel;
    }

    compose_theme_panel(context) {
        const panel = new Control({ context, tag_name: 'aside' });
        panel.add_class('theme-studio');

        const heading = new Control({ context, tag_name: 'h2' });
        heading.add_class('panel-title');
        heading.add('Theme Studio');

        const helper = new Control({ context, tag_name: 'p' });
        helper.add_class('panel-helper');
        helper.add('Switch preset themes and tune core tokens live.');

        panel.add(heading);
        panel.add(helper);

        const preset_group = this.compose_control_group(context, 'Preset');
        const preset_select = new Control({ context, tag_name: 'select' });
        preset_select.add_class('theme-input');
        preset_select.dom.attrs.id = 'theme-preset-select';

        controls.Admin_Theme.themes.forEach(theme_name => {
            const option = new Control({ context, tag_name: 'option' });
            option.dom.attrs.value = theme_name;
            if (theme_name === 'vs-default') {
                option.dom.attrs.selected = 'selected';
            }
            option.add(theme_name);
            preset_select.add(option);
        });

        preset_group.body.add(preset_select);
        panel.add(preset_group.group);

        const accent_group = this.compose_control_group(context, 'Accent color');
        accent_group.body.add(this.compose_theme_input(context, {
            id: 'theme-accent',
            type: 'color',
            var_name: '--admin-accent',
            value: '#0078d4'
        }));
        panel.add(accent_group.group);

        const card_group = this.compose_control_group(context, 'Card background');
        card_group.body.add(this.compose_theme_input(context, {
            id: 'theme-card-bg',
            type: 'color',
            var_name: '--admin-card-bg',
            value: '#ffffff'
        }));
        panel.add(card_group.group);

        const text_group = this.compose_control_group(context, 'Text color');
        text_group.body.add(this.compose_theme_input(context, {
            id: 'theme-text',
            type: 'color',
            var_name: '--admin-text',
            value: '#1e1e1e'
        }));
        panel.add(text_group.group);

        const radius_group = this.compose_control_group(context, 'Radius');
        radius_group.body.add(this.compose_theme_input(context, {
            id: 'theme-radius',
            type: 'range',
            min: '0',
            max: '14',
            step: '1',
            var_name: '--admin-radius',
            value: '4',
            unit: 'px'
        }));
        panel.add(radius_group.group);

        const font_group = this.compose_control_group(context, 'Font size');
        font_group.body.add(this.compose_theme_input(context, {
            id: 'theme-font-size',
            type: 'range',
            min: '11',
            max: '18',
            step: '1',
            var_name: '--admin-font-size',
            value: '13',
            unit: 'px'
        }));
        panel.add(font_group.group);

        const actions = new Control({ context, tag_name: 'div' });
        actions.add_class('theme-actions');

        const reset_button = new Control({ context, tag_name: 'button' });
        reset_button.add_class('theme-reset-button');
        reset_button.dom.attrs.id = 'theme-reset';
        reset_button.dom.attrs.type = 'button';
        reset_button.add('Reset to preset');

        const preview_chip = new Control({ context, tag_name: 'div' });
        preview_chip.add_class('theme-preview-chip');
        preview_chip.dom.attrs.id = 'theme-preview-chip';
        preview_chip.add('Preview');

        actions.add(reset_button);
        actions.add(preview_chip);

        panel.add(actions);

        const persist_group = new Control({ context, tag_name: 'div' });
        persist_group.add_class('theme-persist-group');

        const persist_actions = new Control({ context, tag_name: 'div' });
        persist_actions.add_class('theme-actions');

        const save_local_button = new Control({ context, tag_name: 'button' });
        save_local_button.add_class('theme-reset-button');
        save_local_button.dom.attrs.id = 'theme-save-local';
        save_local_button.dom.attrs.type = 'button';
        save_local_button.add('Save local');

        const clear_local_button = new Control({ context, tag_name: 'button' });
        clear_local_button.add_class('theme-reset-button');
        clear_local_button.dom.attrs.id = 'theme-clear-local';
        clear_local_button.dom.attrs.type = 'button';
        clear_local_button.add('Clear saved');

        persist_actions.add(save_local_button);
        persist_actions.add(clear_local_button);

        const theme_json = new Control({ context, tag_name: 'textarea' });
        theme_json.add_class('theme-json');
        theme_json.dom.attrs.id = 'theme-json';
        theme_json.dom.attrs.rows = '5';
        theme_json.dom.attrs.placeholder = '{"preset":"vs-default","overrides":{"--admin-accent":"#0078d4"}}';

        const transfer_actions = new Control({ context, tag_name: 'div' });
        transfer_actions.add_class('theme-actions');

        const export_button = new Control({ context, tag_name: 'button' });
        export_button.add_class('theme-reset-button');
        export_button.dom.attrs.id = 'theme-export';
        export_button.dom.attrs.type = 'button';
        export_button.add('Export JSON');

        const import_button = new Control({ context, tag_name: 'button' });
        import_button.add_class('theme-reset-button');
        import_button.dom.attrs.id = 'theme-import';
        import_button.dom.attrs.type = 'button';
        import_button.add('Import JSON');

        transfer_actions.add(export_button);
        transfer_actions.add(import_button);

        persist_group.add(persist_actions);
        persist_group.add(theme_json);
        persist_group.add(transfer_actions);
        panel.add(persist_group);

        return panel;
    }

    compose_control_group(context, label_text) {
        const group = new Control({ context, tag_name: 'div' });
        group.add_class('theme-control-group');

        const label = new Control({ context, tag_name: 'label' });
        label.add_class('theme-control-label');
        label.add(label_text);

        const body = new Control({ context, tag_name: 'div' });
        body.add_class('theme-control-body');

        group.add(label);
        group.add(body);

        return { group, body };
    }

    compose_theme_input(context, spec) {
        const input = new Control({ context, tag_name: 'input' });
        input.add_class('theme-input');
        input.dom.attrs.id = spec.id;
        input.dom.attrs.type = spec.type;
        input.dom.attrs.value = spec.value;
        input.dom.attrs['data-theme-var'] = spec.var_name;
        if (spec.unit) {
            input.dom.attrs['data-theme-unit'] = spec.unit;
        }
        if (spec.min !== undefined) input.dom.attrs.min = spec.min;
        if (spec.max !== undefined) input.dom.attrs.max = spec.max;
        if (spec.step !== undefined) input.dom.attrs.step = spec.step;
        return input;
    }

    compose_status_section(context) {
        const section = new Control({ context, tag_name: 'section' });
        section.add_class('showcase-section');
        section.dom.attrs.id = 'showcase-feedback';

        const title = new Control({ context, tag_name: 'h3' });
        title.add_class('section-title');
        title.add('Feedback + Status');
        section.add(title);

        const status_wrap = new Control({ context, tag_name: 'div' });
        status_wrap.add_class('status-wrap');
        status_wrap.dom.attrs.id = 'showcase-status-wrap';

        const status_bar = new controls.Status_Bar({
            context,
            status: 'info',
            text: 'System ready',
            meta_text: 'Idle'
        });
        status_wrap.add(status_bar);

        const status_button = new Control({ context, tag_name: 'button' });
        status_button.add_class('mini-action');
        status_button.dom.attrs.type = 'button';
        status_button.dom.attrs.id = 'status-cycle';
        status_button.add('Cycle status');

        const chips = new controls.Filter_Chips({
            context,
            chips: [
                { id: 'all', label: 'All', selected: true },
                { id: 'active', label: 'Active' },
                { id: 'errors', label: 'Errors' },
                { id: 'archived', label: 'Archived', disabled: true }
            ],
            multi_select: true,
            aria_label: 'Filter showcase'
        });

        section.add(status_wrap);
        section.add(status_button);
        section.add(chips);
        return section;
    }

    compose_actions_section(context) {
        const section = new Control({ context, tag_name: 'section' });
        section.add_class('showcase-section');
        section.dom.attrs.id = 'showcase-actions';

        const title = new Control({ context, tag_name: 'h3' });
        title.add_class('section-title');
        title.add('Action Controls');
        section.add(title);

        const row = new Control({ context, tag_name: 'div' });
        row.add_class('action-row');

        const icon_button = new controls.Icon_Button({
            context,
            text: 'Save',
            icon: '💾',
            aria_label: 'Save changes'
        });

        const link_button = new controls.Link_Button({
            context,
            text: 'Read docs',
            href: '#',
            underline_mode: 'hover'
        });

        const split_button = new controls.Split_Button({
            context,
            text: 'Deploy',
            primary_action: { id: 'deploy' },
            menu_items: [
                { id: 'preview', text: 'Preview deploy' },
                { id: 'staging', text: 'Deploy to staging' },
                { id: 'production', text: 'Deploy to production' }
            ]
        });

        row.add(icon_button);
        row.add(link_button);
        row.add(split_button);
        section.add(row);

        return section;
    }

    compose_layout_section(context) {
        const section = new Control({ context, tag_name: 'section' });
        section.add_class('showcase-section');
        section.dom.attrs.id = 'showcase-layout';

        const title = new Control({ context, tag_name: 'h3' });
        title.add_class('section-title');
        title.add('Layout + Navigation');
        section.add(title);

        const grid = new Control({ context, tag_name: 'div' });
        grid.add_class('layout-grid');

        const tabs = new controls.Tabbed_Panel({
            context,
            tabs: [
                { title: 'Overview', content: 'Overview content', icon: '🏠' },
                { title: 'Usage', content: 'Usage content', badge: 2 },
                { title: 'Logs', content: 'Logs content', closable: true },
                { title: 'Disabled', content: 'Disabled content', disabled: true }
            ],
            tab_bar: { position: 'top', variant: 'compact' },
            aria_label: 'Showcase tabs'
        });

        const accordion = new controls.Accordion({
            context,
            allow_multiple: true,
            sections: [
                { id: 'theme', title: 'Theme editor', content: 'Tune colors, radius, and typography.', open: true },
                { id: 'controls', title: 'Controls', content: 'Mix action, layout, and data controls.' },
                { id: 'testing', title: 'Testing', content: 'Playwright validates interactions.' }
            ]
        });

        const drawer_wrap = new Control({ context, tag_name: 'div' });
        drawer_wrap.add_class('drawer-showcase');

        const drawer_open = new Control({ context, tag_name: 'button' });
        drawer_open.add_class('mini-action');
        drawer_open.dom.attrs.type = 'button';
        drawer_open.dom.attrs.id = 'showcase-open-drawer';
        drawer_open.add('Open nav drawer');

        const drawer = new controls.Drawer({
            context,
            position: 'right',
            open: false,
            content: 'Dashboard\nReports\nSettings'
        });
        drawer.dom.attrs.id = 'showcase-drawer';

        drawer_wrap.add(drawer_open);
        drawer_wrap.add(drawer);

        grid.add(tabs);
        grid.add(accordion);
        grid.add(drawer_wrap);

        section.add(grid);
        return section;
    }

    compose_editor_section(context) {
        const section = new Control({ context, tag_name: 'section' });
        section.add_class('showcase-section');
        section.dom.attrs.id = 'showcase-editor';

        const title = new Control({ context, tag_name: 'h3' });
        title.add_class('section-title');
        title.add('Editor + Console');
        section.add(title);

        const editor_grid = new Control({ context, tag_name: 'div' });
        editor_grid.add_class('editor-grid');

        const code_editor = new controls.Code_Editor({
            context,
            value: 'const theme = "vs-default";\nconsole.log(theme);',
            language: 'javascript',
            line_numbers: true
        });

        const console_panel_wrap = new Control({ context, tag_name: 'div' });
        console_panel_wrap.add_class('console-panel-wrap');

        const console_panel = new controls.Console_Panel({
            context,
            title: 'Showcase Console',
            max_lines: 5,
            lines: ['[info] Showcase booted', '[info] Theme loaded: vs-default']
        });

        const actions = new Control({ context, tag_name: 'div' });
        actions.add_class('console-actions');

        const append_button = new Control({ context, tag_name: 'button' });
        append_button.add_class('mini-action');
        append_button.dom.attrs.type = 'button';
        append_button.dom.attrs.id = 'console-append';
        append_button.add('Append log');

        const clear_button = new Control({ context, tag_name: 'button' });
        clear_button.add_class('mini-action');
        clear_button.dom.attrs.type = 'button';
        clear_button.dom.attrs.id = 'console-clear';
        clear_button.add('Clear log');

        actions.add(append_button);
        actions.add(clear_button);

        console_panel_wrap.add(console_panel);
        console_panel_wrap.add(actions);

        editor_grid.add(code_editor);
        editor_grid.add(console_panel_wrap);

        section.add(editor_grid);
        return section;
    }

    activate() {
        if (!this.__active) {
            super.activate();

            const root_el = typeof document !== 'undefined' ? document : null;
            if (!root_el) return;

            const theme_select = root_el.getElementById('theme-preset-select');
            const reset_button = root_el.getElementById('theme-reset');
            const var_inputs = Array.from(root_el.querySelectorAll('[data-theme-var]'));
            const save_local_button = root_el.getElementById('theme-save-local');
            const clear_local_button = root_el.getElementById('theme-clear-local');
            const export_button = root_el.getElementById('theme-export');
            const import_button = root_el.getElementById('theme-import');
            const theme_json = root_el.getElementById('theme-json');
            const nav_buttons = Array.from(root_el.querySelectorAll('.showcase-nav-link'));

            const status_cycle = root_el.getElementById('status-cycle');
            const status_root = root_el.querySelector('#showcase-status-wrap .jsgui-status-bar');
            const status_left = root_el.querySelector('#showcase-status-wrap .status-bar-left');
            const status_right = root_el.querySelector('#showcase-status-wrap .status-bar-right');

            const drawer_root = root_el.querySelector('#showcase-drawer');
            const drawer_open = root_el.getElementById('showcase-open-drawer');

            const console_output = root_el.querySelector('.console-panel-output');
            const append_button = root_el.getElementById('console-append');
            const clear_button = root_el.getElementById('console-clear');

            const status_states = [
                { status: 'info', text: 'System ready', meta: 'Idle' },
                { status: 'success', text: 'Theme applied', meta: 'No errors' },
                { status: 'warning', text: 'High contrast recommended', meta: 'A11y hint' },
                { status: 'error', text: 'Token conflict detected', meta: 'Review theme vars' }
            ];
            let status_index = 0;
            const storage_key = 'showcase_theme_state_v1';

            const has_storage = (() => {
                try {
                    if (typeof localStorage === 'undefined') return false;
                    const probe = '__showcase_storage_probe__';
                    localStorage.setItem(probe, '1');
                    localStorage.removeItem(probe);
                    return true;
                } catch (err) {
                    return false;
                }
            })();

            const set_status = state => {
                if (!status_root || !status_left || !status_right) return;
                status_root.setAttribute('data-status', state.status);
                status_left.textContent = state.text;
                status_right.textContent = state.meta;
            };

            if (status_cycle) {
                status_cycle.addEventListener('click', () => {
                    status_index = (status_index + 1) % status_states.length;
                    set_status(status_states[status_index]);
                });
            }

            const apply_theme_vars = vars => {
                if (!vars) return;
                Object.entries(vars).forEach(([name, value]) => {
                    document.documentElement.style.setProperty(name, value);
                });
            };

            const read_state = () => {
                if (!has_storage) return null;
                try {
                    const raw = localStorage.getItem(storage_key);
                    if (!raw) return null;
                    return JSON.parse(raw);
                } catch (err) {
                    return null;
                }
            };

            const write_state = state => {
                if (!has_storage) return;
                try {
                    localStorage.setItem(storage_key, JSON.stringify(state));
                } catch (err) {
                }
            };

            const clear_state = () => {
                if (!has_storage) return;
                try {
                    localStorage.removeItem(storage_key);
                } catch (err) {
                }
            };

            const sync_inputs_from_theme = theme_name => {
                const vars = controls.Admin_Theme.get_vars(theme_name) || {};
                var_inputs.forEach(input => {
                    const var_name = input.getAttribute('data-theme-var');
                    if (!var_name || vars[var_name] === undefined) return;
                    const raw_value = vars[var_name];
                    const unit = input.getAttribute('data-theme-unit') || '';
                    if (input.type === 'range' && unit && String(raw_value).endsWith(unit)) {
                        input.value = String(raw_value).slice(0, -unit.length);
                    } else {
                        input.value = String(raw_value);
                    }
                });
                apply_theme_vars(vars);
            };

            const apply_input_change = input => {
                const var_name = input.getAttribute('data-theme-var');
                if (!var_name) return;
                const unit = input.getAttribute('data-theme-unit') || '';
                const value = unit ? `${input.value}${unit}` : input.value;
                document.documentElement.style.setProperty(var_name, value);
            };

            const collect_overrides = () => {
                const overrides = {};
                var_inputs.forEach(input => {
                    const var_name = input.getAttribute('data-theme-var');
                    const unit = input.getAttribute('data-theme-unit') || '';
                    if (!var_name) return;
                    overrides[var_name] = unit ? `${input.value}${unit}` : input.value;
                });
                return overrides;
            };

            const apply_overrides = overrides => {
                if (!overrides) return;
                Object.entries(overrides).forEach(([var_name, value]) => {
                    document.documentElement.style.setProperty(var_name, value);
                });

                var_inputs.forEach(input => {
                    const var_name = input.getAttribute('data-theme-var');
                    const unit = input.getAttribute('data-theme-unit') || '';
                    if (!var_name || overrides[var_name] === undefined) return;
                    const raw = String(overrides[var_name]);
                    if (input.type === 'range' && unit && raw.endsWith(unit)) {
                        input.value = raw.slice(0, -unit.length);
                    } else {
                        input.value = raw;
                    }
                });
            };

            const serialize_current_state = () => ({
                preset: theme_select ? theme_select.value : 'vs-default',
                overrides: collect_overrides()
            });

            const apply_state = state => {
                if (!state || !theme_select) return;
                if (state.preset && controls.Admin_Theme.themes.includes(state.preset)) {
                    theme_select.value = state.preset;
                }
                controls.Admin_Theme.apply(theme_select.value);
                sync_inputs_from_theme(theme_select.value);
                if (state.overrides) {
                    apply_overrides(state.overrides);
                }
            };

            if (theme_select) {
                controls.Admin_Theme.apply(theme_select.value);
                sync_inputs_from_theme(theme_select.value);

                theme_select.addEventListener('change', () => {
                    controls.Admin_Theme.apply(theme_select.value);
                    sync_inputs_from_theme(theme_select.value);
                });
            }

            var_inputs.forEach(input => {
                input.addEventListener('input', () => apply_input_change(input));
                input.addEventListener('change', () => apply_input_change(input));
            });

            if (reset_button && theme_select) {
                reset_button.addEventListener('click', () => {
                    controls.Admin_Theme.apply(theme_select.value);
                    sync_inputs_from_theme(theme_select.value);
                });
            }

            if (save_local_button) {
                save_local_button.addEventListener('click', () => {
                    const state = serialize_current_state();
                    write_state(state);
                    if (theme_json) {
                        theme_json.value = JSON.stringify(state, null, 2);
                    }
                });
            }

            if (clear_local_button && theme_select) {
                clear_local_button.addEventListener('click', () => {
                    clear_state();
                    controls.Admin_Theme.apply(theme_select.value);
                    sync_inputs_from_theme(theme_select.value);
                    if (theme_json) {
                        theme_json.value = '';
                    }
                });
            }

            if (export_button && theme_json) {
                export_button.addEventListener('click', () => {
                    theme_json.value = JSON.stringify(serialize_current_state(), null, 2);
                });
            }

            if (import_button && theme_json) {
                import_button.addEventListener('click', () => {
                    try {
                        const parsed = JSON.parse(theme_json.value || '{}');
                        apply_state(parsed);
                        write_state(parsed);
                    } catch (err) {
                    }
                });
            }

            if (nav_buttons.length) {
                const set_active_nav = target_id => {
                    nav_buttons.forEach(btn => {
                        const is_match = btn.getAttribute('data-target') === target_id;
                        btn.classList.toggle('is-active', is_match);
                    });
                };

                nav_buttons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const target_id = btn.getAttribute('data-target');
                        const section = target_id ? root_el.getElementById(target_id) : null;
                        if (section && typeof section.scrollIntoView === 'function') {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            set_active_nav(target_id);
                        }
                    });
                });
            }

            if (drawer_root && drawer_open) {
                const close_drawer = () => drawer_root.classList.remove('is-open');
                drawer_open.addEventListener('click', () => drawer_root.classList.add('is-open'));

                const overlay = drawer_root.querySelector('.drawer-overlay');
                const close_button = drawer_root.querySelector('.drawer-close');
                if (overlay) overlay.addEventListener('click', close_drawer);
                if (close_button) close_button.addEventListener('click', close_drawer);
                document.addEventListener('keydown', evt => {
                    if (evt.key === 'Escape') close_drawer();
                });
            }

            if (console_output) {
                let lines = ['[info] Showcase booted', '[info] Theme loaded: vs-default'];
                const max_lines = 5;

                const sync_console = () => {
                    console_output.textContent = lines.join('\n');
                };

                if (append_button) {
                    append_button.addEventListener('click', () => {
                        lines.push('[info] Theme token update at ' + new Date().toLocaleTimeString());
                        if (lines.length > max_lines) {
                            lines = lines.slice(lines.length - max_lines);
                        }
                        sync_console();
                    });
                }

                if (clear_button) {
                    clear_button.addEventListener('click', () => {
                        lines = [];
                        sync_console();
                    });
                }
            }

            const saved_state = read_state();
            if (saved_state) {
                apply_state(saved_state);
            }
        }
    }
}

Showcase_App.css = `
${controls.Admin_Theme.css || ''}
${controls.Status_Bar.css || ''}
${controls.Filter_Chips.css || ''}
${controls.Icon_Button.css || ''}
${controls.Link_Button.css || ''}
${controls.Split_Button.css || ''}
${controls.Tabbed_Panel.css || ''}
${controls.Accordion.css || ''}
${controls.Drawer.css || ''}
${controls.Code_Editor.css || ''}
${controls.Console_Panel.css || ''}

* {
    box-sizing: border-box;
}

body.showcase-app-body {
    margin: 0;
    min-height: 100vh;
    background: var(--admin-bg);
    color: var(--admin-text);
    font-family: var(--admin-font);
    font-size: var(--admin-font-size);
}

.showcase-shell {
    max-width: 1360px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.showcase-header {
    background: var(--admin-card-bg);
    border: 1px solid var(--admin-border);
    border-radius: calc(var(--admin-radius-lg) + 4px);
    box-shadow: var(--admin-shadow-lg);
    padding: 22px;
}

.showcase-title {
    margin: 0;
    font-size: 2rem;
    line-height: 1.2;
}

.showcase-subtitle {
    margin: 8px 0 0;
    color: var(--admin-text-secondary);
}

.showcase-grid {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(260px, 320px) 1fr;
    gap: 18px;
}

.showcase-nav,
.theme-studio,
.showcase-section {
    background: var(--admin-card-bg);
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius-lg);
    box-shadow: var(--admin-shadow);
}

.theme-studio {
    position: sticky;
    top: 18px;
    align-self: start;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.showcase-nav {
    position: sticky;
    top: 18px;
    align-self: start;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.showcase-nav-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.showcase-nav-link {
    text-align: left;
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
    background: var(--admin-header-bg);
    color: var(--admin-text);
    min-height: 34px;
    padding: 0 10px;
    cursor: pointer;
}

.showcase-nav-link.is-active {
    border-color: var(--admin-accent);
    box-shadow: inset 0 0 0 1px var(--admin-accent);
}

.panel-title {
    margin: 0;
    font-size: 1.1rem;
}

.panel-helper {
    margin: 0;
    color: var(--admin-text-secondary);
}

.theme-control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.theme-control-label {
    font-weight: 600;
}

.theme-input {
    width: 100%;
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
    background: var(--admin-card-bg);
    color: var(--admin-text);
    min-height: 34px;
    padding: 0 8px;
}

.theme-input[type="color"] {
    padding: 2px;
}

.theme-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.theme-persist-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
}

.theme-json {
    width: 100%;
    resize: vertical;
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
    background: var(--admin-card-bg);
    color: var(--admin-text);
    padding: 8px;
    font-family: var(--admin-font-mono);
    font-size: 12px;
}

.theme-reset-button,
.mini-action {
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
    background: var(--admin-header-bg);
    color: var(--admin-text);
    min-height: 32px;
    padding: 0 12px;
    cursor: pointer;
}

.theme-preview-chip {
    border: 1px solid var(--admin-border);
    border-radius: var(--admin-radius);
    background: var(--admin-accent);
    color: #fff;
    min-height: 32px;
    padding: 6px 12px;
}

.showcase-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.showcase-section {
    padding: 14px;
}

.section-title {
    margin: 0 0 10px;
    font-size: 1rem;
}

.action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.layout-grid,
.editor-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.drawer-showcase {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 160px;
}

.console-panel-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.console-actions {
    display: flex;
    gap: 8px;
}

@media (max-width: 980px) {
    .showcase-grid {
        grid-template-columns: 1fr;
    }

    .showcase-nav,
    .theme-studio {
        position: static;
    }
}
`;

jsgui.controls.Showcase_App = Showcase_App;

module.exports = jsgui;
