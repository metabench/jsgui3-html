const jsgui = require('../../../html');
const bootstrap_client_controls = require('../../client_bootstrap');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

class Layout_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'layout_controls_demo';
        super(spec);

        const { context } = this;
        this.step_definitions = [
            { title: 'Plan', content: 'Step 1: gather requirements' },
            { title: 'Build', content: 'Step 2: implement features' },
            { title: 'Review', content: 'Step 3: validate outputs' }
        ];

        if (typeof this.body.add_class === 'function') {
            this.body.add_class('layout-controls-body');
        }

        if (!spec.el) {
            this.compose_ui(context);
        }
    }

    compose_ui(context) {
        const container = new Control({ context, tag_name: 'div' });
        container.add_class('layout-controls-container');
        this.body.add(container);

        const create_section = title_text => {
            const section = new Control({ context, tag_name: 'section' });
            section.add_class('controls-section');
            const title = new Control({ context, tag_name: 'h2' });
            title.add_class('section-title');
            title.add(title_text);
            const body = new Control({ context, tag_name: 'div' });
            body.add_class('section-body');
            section.add(title);
            section.add(body);
            container.add(section);
            return body;
        };

        const split_section = create_section('Split Pane');
        const left_content = new Control({ context, tag_name: 'div' });
        left_content.add_class('split-pane-content');
        left_content.add('Primary panel');
        const right_content = new Control({ context, tag_name: 'div' });
        right_content.add_class('split-pane-content');
        right_content.add('Secondary panel');

        this.split_pane = new controls.Split_Pane({
            context,
            orientation: 'horizontal',
            size: 220,
            min_size: 160,
            max_size: 360,
            panes: [left_content, right_content]
        });
        this.split_pane.add_class('demo-split-pane');
        split_section.add(this.split_pane);

        const accordion_section = create_section('Accordion');
        this.accordion = new controls.Accordion({
            context,
            allow_multiple: false,
            sections: [
                { id: 'a', title: 'First section', content: 'Accordion details for first section', open: true },
                { id: 'b', title: 'Second section', content: 'More details for the second section' },
                { id: 'c', title: 'Third section', content: 'Third section content' }
            ]
        });
        this.accordion.add_class('demo-accordion');
        accordion_section.add(this.accordion);

        const drawer_section = create_section('Drawer');
        const drawer_action_row = new Control({ context, tag_name: 'div' });
        drawer_action_row.add_class('drawer-actions');
        this.drawer_button = new Control({ context, tag_name: 'button' });
        this.drawer_button.add_class('drawer-open-button');
        this.drawer_button.add('Open drawer');
        drawer_action_row.add(this.drawer_button);
        drawer_section.add(drawer_action_row);

        const drawer_content = new Control({ context, tag_name: 'div' });
        drawer_content.add_class('drawer-content');
        drawer_content.add('Drawer links: Home, Reports, Settings');
        this.drawer = new controls.Drawer({
            context,
            open: false,
            position: 'left',
            breakpoint: 800,
            content: drawer_content
        });
        this.drawer.add_class('demo-drawer');
        drawer_section.add(this.drawer);

        const tabs_section = create_section('Tabbed Panel Variants');
        this.tabbed_panel = new controls.Tabbed_Panel({
            context,
            tabs: [
                { title: 'Summary', content: 'Summary content', icon: 'S' },
                { title: 'Details', content: 'Details content', icon: 'D' },
                { title: 'Metrics', content: 'Metrics content', icon: 'M' },
                { title: 'Notes', content: 'Notes content', icon: 'N' }
            ],
            tab_bar: {
                position: 'left',
                variant: 'icon',
                overflow: true,
                max_tabs: 2
            }
        });
        this.tabbed_panel.add_class('demo-tabbed-panel');
        tabs_section.add(this.tabbed_panel);

        const stepper_section = create_section('Stepper');
        this.stepper = new controls.Stepper({
            context,
            steps: this.step_definitions,
            current_step: 0
        });
        this.stepper.add_class('demo-stepper');
        stepper_section.add(this.stepper);

        const stepper_controls = new Control({ context, tag_name: 'div' });
        stepper_controls.add_class('stepper-controls');
        this.stepper_prev = new Control({ context, tag_name: 'button' });
        this.stepper_prev.add_class('stepper-prev');
        this.stepper_prev.add('Previous');
        this.stepper_next = new Control({ context, tag_name: 'button' });
        this.stepper_next.add_class('stepper-next');
        this.stepper_next.add('Next');
        stepper_controls.add(this.stepper_prev);
        stepper_controls.add(this.stepper_next);
        stepper_section.add(stepper_controls);

        const primitives_section = create_section('Layout Primitives');
        const primitives_grid = new Control({ context, tag_name: 'div' });
        primitives_grid.add_class('primitives-grid');

        const stack = new controls.Stack({ context, direction: 'column', gap: 8 });
        stack.add_class('primitive-block');
        stack.add(new Control({ context, tag_name: 'div', content: 'Stack A' }));
        stack.add(new Control({ context, tag_name: 'div', content: 'Stack B' }));

        const cluster = new controls.Cluster({ context, gap: 6, justify: 'space-between' });
        cluster.add_class('primitive-block');
        cluster.add(new Control({ context, tag_name: 'div', content: 'Cluster 1' }));
        cluster.add(new Control({ context, tag_name: 'div', content: 'Cluster 2' }));
        cluster.add(new Control({ context, tag_name: 'div', content: 'Cluster 3' }));

        const center = new controls.Center({ context, min_height: 120 });
        center.add_class('primitive-block');
        center.add(new Control({ context, tag_name: 'div', content: 'Centered' }));

        const grid_gap = new controls.Grid_Gap({ context, gap: 8, columns: 'repeat(2, minmax(0, 1fr))' });
        grid_gap.add_class('primitive-block');
        grid_gap.add(new Control({ context, tag_name: 'div', content: 'Grid 1' }));
        grid_gap.add(new Control({ context, tag_name: 'div', content: 'Grid 2' }));

        primitives_grid.add(stack);
        primitives_grid.add(cluster);
        primitives_grid.add(center);
        primitives_grid.add(grid_gap);
        primitives_section.add(primitives_grid);
    }

    activate() {
        if (!this.__active) {
            super.activate();
            const root_el = this.dom && this.dom.el;
            if (!root_el) return;

            this.activate_split_pane(root_el);
            this.activate_accordion(root_el);
            this.activate_drawer(root_el);
            this.activate_stepper(root_el);
            this.activate_tabs(root_el);
        }
    }

    activate_split_pane(root_el) {
        const split_el = root_el.querySelector('.demo-split-pane');
        const handle_el = split_el && split_el.querySelector('.split-pane-handle');
        const primary_el = split_el && split_el.querySelector('.split-pane-pane-primary');
        if (!split_el || !handle_el || !primary_el) return;

        let dragging = false;
        let start_x = 0;
        let start_width = 0;

        const on_move = event => {
            if (!dragging) return;
            const next_width = Math.max(160, Math.min(360, start_width + (event.clientX - start_x)));
            primary_el.style.flex = `0 0 ${next_width}px`;
        };

        const on_up = () => {
            dragging = false;
            document.removeEventListener('mousemove', on_move);
            document.removeEventListener('mouseup', on_up);
        };

        handle_el.addEventListener('mousedown', event => {
            event.preventDefault();
            dragging = true;
            start_x = event.clientX;
            start_width = primary_el.getBoundingClientRect().width;
            document.addEventListener('mousemove', on_move);
            document.addEventListener('mouseup', on_up);
        });
    }

    activate_accordion(root_el) {
        const accordion_el = root_el.querySelector('.demo-accordion');
        if (!accordion_el) return;

        accordion_el.querySelectorAll('button[data-section-id]').forEach(header_el => {
            header_el.classList.add('accordion-header');
            const section_el = header_el.parentElement;
            if (section_el) {
                section_el.classList.add('accordion-section');
                section_el.classList.toggle('is-open', header_el.classList.contains('is-open'));
            }
        });

        accordion_el.addEventListener('click', event => {
            const header_el = event.target.closest('.accordion-header[data-section-id]');
            if (!header_el) return;

            const target_id = header_el.getAttribute('data-section-id');
            accordion_el.querySelectorAll('.accordion-header').forEach(el => {
                el.classList.toggle('is-open', el.getAttribute('data-section-id') === target_id);
            });
            accordion_el.querySelectorAll('.accordion-section').forEach(el => {
                el.classList.toggle('is-open', !!el.querySelector(`.accordion-header[data-section-id="${target_id}"]`));
            });
        });
    }

    activate_drawer(root_el) {
        const drawer_el = root_el.querySelector('.demo-drawer');
        const open_button_el = root_el.querySelector('.drawer-open-button');
        const overlay_el = drawer_el && drawer_el.querySelector('.drawer-overlay');
        const close_button_el = drawer_el && drawer_el.querySelector('.drawer-close');
        if (!drawer_el || !open_button_el) return;

        const set_open = open => {
            drawer_el.classList.toggle('is-open', !!open);
        };

        open_button_el.addEventListener('click', () => set_open(true));
        if (overlay_el) {
            overlay_el.addEventListener('click', () => set_open(false));
        }
        if (close_button_el) {
            close_button_el.addEventListener('click', () => set_open(false));
        }
    }

    activate_stepper(root_el) {
        const stepper_el = root_el.querySelector('.demo-stepper');
        const prev_button_el = root_el.querySelector('.stepper-prev');
        const next_button_el = root_el.querySelector('.stepper-next');
        if (!stepper_el || !prev_button_el || !next_button_el) return;

        const step_els = Array.from(stepper_el.querySelectorAll('.stepper-step'));
        const body_el = stepper_el.querySelector('.stepper-body');
        let current_index = Math.max(0, step_els.findIndex(step_el => step_el.classList.contains('is-current')));
        if (current_index < 0) current_index = 0;

        const set_current_step = index => {
            current_index = Math.max(0, Math.min(index, step_els.length - 1));
            step_els.forEach((step_el, step_index) => {
                const button_el = step_el.querySelector('.stepper-step-button');
                const is_current = step_index === current_index;
                step_el.classList.toggle('is-current', is_current);
                if (button_el) {
                    button_el.setAttribute('aria-current', is_current ? 'step' : 'false');
                }
            });
            if (body_el && this.step_definitions[current_index]) {
                body_el.textContent = this.step_definitions[current_index].content;
            }
        };

        prev_button_el.addEventListener('click', () => set_current_step(current_index - 1));
        next_button_el.addEventListener('click', () => set_current_step(current_index + 1));
    }

    activate_tabs(root_el) {
        const panel_el = root_el.querySelector('.demo-tabbed-panel');
        if (!panel_el) return;

        const input_els = Array.from(panel_el.querySelectorAll('.tab-input'));
        const label_els = Array.from(panel_el.querySelectorAll('.tab-label'));
        const page_els = Array.from(panel_el.querySelectorAll('.tab-page'));
        if (!input_els.length || !label_els.length) return;

        const get_visible_labels = () => label_els.filter(label_el => !label_el.classList.contains('tab-label-hidden'));

        const set_active = (index, focus = false) => {
            const clamped_index = Math.max(0, Math.min(index, input_els.length - 1));
            input_els.forEach((input_el, tab_index) => {
                const is_active = tab_index === clamped_index;
                input_el.checked = is_active;
                label_els[tab_index].setAttribute('aria-selected', is_active ? 'true' : 'false');
                label_els[tab_index].setAttribute('tabindex', is_active ? '0' : '-1');
                if (page_els[tab_index]) {
                    page_els[tab_index].setAttribute('aria-hidden', is_active ? 'false' : 'true');
                }
            });
            if (focus && label_els[clamped_index]) {
                label_els[clamped_index].focus();
            }
        };

        label_els.forEach((label_el, index) => {
            label_el.addEventListener('click', () => set_active(index));
            label_el.addEventListener('keydown', event => {
                const visible_labels = get_visible_labels();
                const visible_index = visible_labels.indexOf(label_el);
                if (visible_index < 0) return;

                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    const next_label = visible_labels[(visible_index + 1) % visible_labels.length];
                    set_active(Number(next_label.getAttribute('data-tab-index')), true);
                }
                if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const next_label = visible_labels[(visible_index - 1 + visible_labels.length) % visible_labels.length];
                    set_active(Number(next_label.getAttribute('data-tab-index')), true);
                }
            });
        });

        const active_index = input_els.findIndex(input_el => input_el.checked);
        set_active(active_index >= 0 ? active_index : 0);
    }
}

Layout_Controls_Demo.css = `
* {
    box-sizing: border-box;
}
body {
    font-family: "Source Sans Pro", Arial, sans-serif;
    margin: 0;
    padding: 24px;
    background: #f3f4f7;
    color: #1f1f1f;
}
.layout-controls-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
}
.controls-section {
    background: #fff;
    padding: 18px;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.section-title {
    margin: 0 0 12px;
    font-size: 1.2em;
}
.section-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.demo-split-pane {
    height: 180px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}
.split-pane-content {
    padding: 12px;
}
.demo-accordion {
    max-width: 480px;
}
.drawer-actions {
    display: flex;
    gap: 8px;
}
.drawer-open-button {
    border: 1px solid #ccc;
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
}
.demo-tabbed-panel {
    width: 100%;
    max-width: 480px;
}
.demo-stepper {
    max-width: 520px;
}
.stepper-controls {
    display: flex;
    gap: 8px;
}
.stepper-controls button {
    border: 1px solid #ccc;
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
}
.primitives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}
.primitive-block {
    border: 1px solid #eee;
    padding: 10px;
    border-radius: 8px;
    background: #fafafa;
}
`;

jsgui.controls.Layout_Controls_Demo = Layout_Controls_Demo;

bootstrap_client_controls(jsgui, {
    layout_controls_demo: Layout_Controls_Demo
}, {
    bootstrap_key: '__jsgui_layout_controls_demo_context__'
});

module.exports = jsgui;
