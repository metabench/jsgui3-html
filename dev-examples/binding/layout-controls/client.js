const jsgui = require('../../../html');

const { Control, Active_HTML_Document } = jsgui;
const controls = jsgui.controls;

class Layout_Controls_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'layout_controls_demo';
        super(spec);

        const { context } = this;

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
            steps: [
                { title: 'Plan', content: 'Step 1: gather requirements' },
                { title: 'Build', content: 'Step 2: implement features' },
                { title: 'Review', content: 'Step 3: validate outputs' }
            ],
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

            if (this.drawer_button && this.drawer) {
                this.drawer_button.on('click', () => this.drawer.open());
            }

            if (this.stepper_next && this.stepper_prev && this.stepper) {
                this.stepper_next.on('click', () => this.stepper.next());
                this.stepper_prev.on('click', () => this.stepper.previous());
            }
        }
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

module.exports = jsgui;
