
const jsgui = require('../../../../html-core/html-core');
const { each, tof } = jsgui;
const Control = jsgui.Control;
const { field, prop } = require('obext');
const { press_events, pressed_state, selectable } = require('../../../../control_mixins/mx');

class Tree_View extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'tree_view';
        super(spec);

        this.add_class('tree-view');

        // View model data
        field(this.view.data.model, 'data');
        field(this.view.data.model, 'selected_node');

        this.on('select', (node) => {
            this.view.data.model.selected_node = node;
            // Also update UI to show selection
            // This might best be handled by the Tree_Nodes themselves listening to the tree's selection change
            // or the tree updating the classes of the nodes.
        });

        if (spec.data) {
            this.view.data.model.data = spec.data;
        }

        if (spec.onSelect) {
            this.on('select', spec.onSelect);
        }
        if (spec.onExpand) {
            this.on('expand', spec.onExpand);
        }

        if (!spec.abstract && !spec.el) {
            this.compose();
        }
    }

    compose() {
        const { context } = this;
        const data = this.view.data.model.data;

        if (data) {
            each(data, item => {
                const node = new Tree_Node({
                    context,
                    data: item,
                    tree: this
                });
                this.add(node);
            });
        }
    }

    // Helper to handle selection from nodes
    handle_node_select(node_control) {
        // Deselect current
        const current = this.selected_node_control;
        if (current) {
            current.remove_class('selected');
            current.selected = false;
        }

        // Select new
        this.selected_node_control = node_control;
        node_control.add_class('selected');
        node_control.selected = true;

        this.raise('select', node_control.data_item);
    }
}

class Tree_Node extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'tree_node';
        super(spec);

        this.tree = spec.tree;
        this.data_item = spec.data;

        this.add_class('tree-node');

        // Structure:
        // [Indent] [Chevron] [Icon] [Label]
        // [Children Container]

        this.compose_node();
    }

    compose_node() {
        const { context, data_item } = this;

        // Header / Content row
        const ctrl_header = new Control({ context });
        ctrl_header.add_class('tree-node-header');
        // Make header selectable/clickable

        ctrl_header.on('click', (e) => {
            e.stopPropagation();
            if (this.tree) {
                this.tree.handle_node_select(this);
            }
        });

        this.add(ctrl_header);

        // Chevron (if children exist)
        if (data_item.children && data_item.children.length > 0) {
            const ctrl_chevron = new Control({ context });
            ctrl_chevron.add_class('tree-chevron');
            ctrl_chevron.add('▶'); // Using simple char for now, could be icon

            // Initial state from data
            if (data_item.expanded) {
                ctrl_chevron.add_class('expanded');
                this.expanded = true;
            } else {
                this.expanded = false;
            }

            ctrl_chevron.on('click', (e) => {
                e.stopPropagation();
                this.toggle_expand();
            });

            this.ctrl_chevron = ctrl_chevron;
            ctrl_header.add(ctrl_chevron);
        } else {
            // Spacer for alignment? Or just margin.
            // Let's add a spacer class if needed, or handle via CSS
            const ctrl_spacer = new Control({ context });
            ctrl_spacer.add_class('tree-chevron-spacer');
            ctrl_header.add(ctrl_spacer);
        }

        // Icon
        if (data_item.icon) {
            const ctrl_icon = new Control({ context });
            ctrl_icon.add_class('tree-icon');
            ctrl_icon.add(data_item.icon);
            ctrl_header.add(ctrl_icon);
        }

        // Label
        const ctrl_label = new Control({ context });
        ctrl_label.add_class('tree-label');
        ctrl_label.add(data_item.label || data_item.name || 'Node');
        ctrl_header.add(ctrl_label);

        // Children Container
        if (data_item.children && data_item.children.length > 0) {
            const ctrl_children = new Control({ context });
            ctrl_children.add_class('tree-children');
            if (!this.expanded) {
                ctrl_children.add_class('hidden');
            }

            each(data_item.children, child_item => {
                const child_node = new Tree_Node({
                    context,
                    data: child_item,
                    tree: this.tree
                });
                ctrl_children.add(child_node);
            });

            this.ctrl_children = ctrl_children;
            this.add(ctrl_children);
        }
    }

    toggle_expand() {
        if (!this.ctrl_children) return;

        this.expanded = !this.expanded;
        if (this.expanded) {
            this.ctrl_children.remove_class('hidden');
            this.ctrl_chevron.add_class('expanded');
            // Animated rotation handled by CSS on .expanded
        } else {
            this.ctrl_children.add_class('hidden');
            this.ctrl_chevron.remove_class('expanded');
        }

        if (this.tree) {
            this.tree.raise('expand', { node: this.data_item, expanded: this.expanded });
        }
    }
}

Tree_View.css = `
.tree-view {
    display: flex;
    flex-direction: column;
    user-select: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    color: #333;
}

.tree-node {
    display: flex;
    flex-direction: column;
}

.tree-node-header {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.1s;
}

.tree-node-header:hover {
    background-color: #f0f0f0;
}

.tree-node.selected > .tree-node-header {
    background-color: #e0eaff; /* Light blue selection */
    color: #0066cc;
}

.tree-chevron {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    color: #888;
    transition: transform 0.2s ease;
    cursor: pointer;
    font-size: 10px;
}

.tree-chevron.expanded {
    transform: rotate(90deg);
}

.tree-chevron-spacer {
    width: 24px; 
}

.tree-icon {
    margin-right: 8px;
    font-size: 16px;
}

.tree-label {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tree-children {
    display: flex;
    flex-direction: column;
    padding-left: 24px; /* Indent */
}

.tree-children.hidden {
    display: none;
}
`;

module.exports = Tree_View;
