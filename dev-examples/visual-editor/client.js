const jsgui = require('../../html');

const { Control, Active_HTML_Document } = jsgui;
const Selection_Handles = require('../../controls/organised/2-editor/selection_handles');
const Property_Grid = require('../../controls/organised/2-editor/property_grid');
const { Data_Object } = require('lang-tools');

class Visual_Editor_Demo extends Active_HTML_Document {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'visual_editor_demo';
        super(spec);

        const { context } = this;

        if (this.body && typeof this.body.add_class === 'function') {
            this.body.add_class('visual-editor-demo-body');
        }

        if (!spec.el) {
            if (this.head) {
                const title = new Control({ context, tag_name: 'title' });
                title.add('Visual Editor Controls Demo');
                this.head.add(title);

                const link = new Control({ context, tag_name: 'link' });
                link.dom.attributes.rel = 'stylesheet';
                link.dom.attributes.href = '/css/editor-controls.css';
                this.head.add(link);
            }

            const page = new Control({ context, tag_name: 'div' });
            page.add_class('visual-editor-demo');

            const header = new Control({ context, tag_name: 'header' });
            header.add_class('demo-header');

            const heading = new Control({ context, tag_name: 'h1' });
            heading.add('Visual Editor Controls Demo');
            header.add(heading);

            const subtitle = new Control({ context, tag_name: 'p' });
            subtitle.add('Selection handles, property grid, and visual editing tools.');
            header.add(subtitle);

            page.add(header);

            // Section 1: Selection Handles
            const section1 = new Control({ context, tag_name: 'section' });
            section1.add_class('demo-section');

            const h2_1 = new Control({ context, tag_name: 'h2' });
            h2_1.add('Selection Handles');
            section1.add(h2_1);

            const p1 = new Control({ context, tag_name: 'p' });
            p1.add('Resize handles for visual editing. Drag handles to resize.');
            section1.add(p1);

            const output1 = new Control({ context, tag_name: 'p' });
            output1.add_class('output');
            output1.add('Position: x=100, y=80, Width: 200px, Height: 150px');
            section1.add(output1);

            page.add(section1);

            // Section 2: Property Grid
            const section2 = new Control({ context, tag_name: 'section' });
            section2.add_class('demo-section');

            const h2_2 = new Control({ context, tag_name: 'h2' });
            h2_2.add('Property Grid');
            section2.add(h2_2);

            const p2 = new Control({ context, tag_name: 'p' });
            p2.add('Property editor for visual components.');
            section2.add(p2);

            const model = new Data_Object({
                name: 'Button1',
                x: 100,
                y: 80,
                width: 200
            });

            const schema = [
                { name: 'name', label: 'Name', type: 'text' },
                { name: 'x', label: 'X', type: 'number' },
                { name: 'y', label: 'Y', type: 'number' },
                { name: 'width', label: 'Width', type: 'number' }
            ];

            const property_grid = new Property_Grid({
                context,
                target: model,
                schema: schema
            });
            section2.add(property_grid);

            page.add(section2);

            if (this.body) {
                this.body.add(page);
            } else {
                this.add(page);
            }

            this._property_grid = property_grid;
            this._model = model;
            this._output1 = output1;
        }
    }

    activate() {
        if (!this.__active) {
            super.activate();
        }
    }
}

Visual_Editor_Demo.css = \`
.visual-editor-demo-body {
    margin: 0;
    background: #f7f7f7;
    font-family: 'Segoe UI', system-ui, sans-serif;
}

.visual-editor-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
}

.demo-header h1 {
    margin: 0 0 12px;
    font-size: 32px;
}

.demo-section {
    background: #ffffff;
    border: 1px solid #e1e1e1;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
}

.output {
    margin-top: 16px;
    padding: 12px 16px;
    background: #f0f4f8;
    border-left: 4px solid #3b82f6;
    font-family: monospace;
}
\`;

jsgui.controls = jsgui.controls || {};
jsgui.controls.Visual_Editor_Demo = Visual_Editor_Demo;

module.exports = jsgui;
