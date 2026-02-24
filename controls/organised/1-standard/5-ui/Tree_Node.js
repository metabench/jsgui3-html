const jsgui = require('./../../../../html-core/html-core');
const Plus_Minus_Toggle_Button = require('./../../0-core/0-basic/1-compositional/Plus_Minus_Toggle_Button');
const Vertical_Expander = require('./../6-layout/Vertical_Expander');
const mx_selectable = require('./../../../../control_mixins/selectable');
const { apply_label } = require('../../../../control_mixins/a11y');
const {field} = require('obext');
const {each, def, Control} = jsgui;

class Tree_Node extends Control {
    constructor(spec = {}) {
        spec.__type_name = spec.__type_name || 'tree_node';
        if (!def(spec.expandable)) spec.expandable = true;
        super(spec);

        this.node_class = spec.node_class || Tree_Node;
        this.expandable = spec.expandable;
        this.load_children = typeof spec.load_children === 'function'
            ? spec.load_children
            : (typeof spec.children_loader === 'function' ? spec.children_loader : null);
        this.has_loaded_children = Array.isArray(spec.nodes) && spec.nodes.length > 0;
        this.loading = false;
        this.multi_select = !!spec.multi_select;
        this.drag_reparent = !!spec.drag_reparent;
        this.selectable = spec.selectable !== false;

        mx_selectable(this, null, {
            multi: this.multi_select,
            toggle: !!spec.select_toggle
        });
        if (this.selectable) {
            this.selectable = true;
        }

        field(this, 'depth');
        field(this, 'state', 'open');
        this.state = spec.state === 'closed' ? 'closed' : 'open';
        if (def(spec.depth)) this.depth = spec.depth;
        if (spec.text) {
            this.text = spec.text;
        } else if (spec.name) {
            this.text = spec.name;
        }

        if (!spec.el) {
            this.compose_tree_node(spec);
        }

        if (this.inner_control) {
            this.inner_control.content.on('change', () => {
                this.update_toggle_visibility();
            });
        }
    }

    compose_tree_node(spec) {
        const my = (p) => {
            p.context = this.context;
            return p;
        };

        const top_line = this.add(new Control(my({
            'class': 'top-line'
        })));
        this.top_line = top_line;

        if (def(this.depth)) {
            for (let c = 0; c < this.depth; c++) {
                const depth_block = new Control(my({
                    'class': 'depth-block'
                }));
                top_line.add(depth_block);
            }
        }

        let plus_minus;
        const spec_state = this.state === 'closed' ? '+' : '-';
        top_line.add(plus_minus = new Plus_Minus_Toggle_Button(my({
            state: spec_state
        })));
        this.toggle_button = plus_minus;
        this.update_toggle_aria();

        const main_box = top_line.add(new Control(my({
            'class': 'main-box'
        })));

        main_box.add(new jsgui.span(my({
            text: this.text,
            'class': 'text'
        })));

        let expander;
        if (this.expandable) {
            expander = this.add(new Vertical_Expander(my({})));
            expander.add(this.inner_control = new Control(my({
                'class': 'inner'
            })));
            this.expander = expander;

            if (spec.nodes) {
                for (let node of spec.nodes) {
                    const node_spec = Object.assign({}, node, {
                        context: this.context,
                        depth: (this.depth || 0) + 1,
                        multi_select: this.multi_select,
                        selectable: this.selectable,
                        drag_reparent: this.drag_reparent,
                        node_class: this.node_class
                    });
                    const Node_Class = this.node_class;
                    const tn = node instanceof Control ? node : new Node_Class(node_spec);
                    this.inner_control.add(tn);
                }
                expander.state = this.state = 'open';
            } else {
                expander.state = this.state = 'closed';
            }
        }

        this._ctrl_fields = Object.assign(this._ctrl_fields || {}, {
            toggle_button: plus_minus,
            top_line: top_line,
            main_box: main_box
        });
        if (expander) {
            this._ctrl_fields.inner_control = this.inner_control;
            this._ctrl_fields.expander = expander;
        }

        this.dom.attributes.id = this._id();
        this.dom.attributes.role = 'treeitem';
        this.update_aria_state();
        this.update_toggle_visibility();
    }

    update_toggle_visibility() {
        if (!this.toggle_button) return;
        const has_children = this.has_children() || this.load_children;
        if (has_children) {
            this.toggle_button.show();
        } else {
            this.toggle_button.hide();
        }
    }

    update_aria_state() {
        const aria_level = (this.depth || 0) + 1;
        this.dom.attributes['aria-level'] = String(aria_level);
        if (this.expandable) {
            this.dom.attributes['aria-expanded'] = this.state === 'open' ? 'true' : 'false';
        }
        if (this.selected !== undefined) {
            this.dom.attributes['aria-selected'] = this.selected ? 'true' : 'false';
        }
        this.update_toggle_aria();
    }

    update_toggle_aria() {
        if (!this.toggle_button || !this.toggle_button.dom) return;
        const label_text = this.state === 'open' ? 'Collapse' : 'Expand';
        apply_label(this.toggle_button, label_text, {force: true});
    }

    /**
     * Check if the node has child nodes.
     * @returns {boolean}
     */
    has_children() {
        return !!(this.inner_control && this.inner_control.content && this.inner_control.content._arr.length);
    }

    /**
     * Get child tree nodes.
     * @returns {Array}
     */
    get_child_nodes() {
        if (!this.inner_control || !this.inner_control.content) return [];
        const res = [];
        this.inner_control.content.each(ctrl => {
            if (ctrl instanceof Tree_Node) res.push(ctrl);
        });
        return res;
    }

    /**
     * Get the parent tree node.
     * @returns {Tree_Node|null}
     */
    get_parent_node() {
        return this.closest(ctrl => ctrl instanceof Tree_Node);
    }

    is_open() {
        return this.state === 'open';
    }

    /**
     * Open the node and load children if needed.
     */
    open() {
        if (!this.expandable || !this.expander) return;
        this.expander.open();
        this.state = 'open';
        if (this.toggle_button) this.toggle_button.state = '-';
        this.update_aria_state();
        this.ensure_children_loaded();
    }

    /**
     * Close the node.
     */
    close() {
        if (!this.expandable || !this.expander) return;
        this.expander.close();
        this.state = 'closed';
        if (this.toggle_button) this.toggle_button.state = '+';
        this.update_aria_state();
    }

    /**
     * Toggle open/closed state.
     */
    toggle() {
        if (this.is_open()) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Update the node depth and refresh indentation.
     * @param {number} next_depth - New depth.
     */
    update_depth(next_depth) {
        this.depth = next_depth;
        if (this.top_line) {
            const to_remove = [];
            this.top_line.content.each(ctrl => {
                if (ctrl.has_class && ctrl.has_class('depth-block')) {
                    to_remove.push(ctrl);
                }
            });
            to_remove.forEach(ctrl => ctrl.remove());
            for (let c = 0; c < next_depth; c++) {
                const depth_block = new Control({
                    context: this.context,
                    class: 'depth-block'
                });
                this.top_line.content.insert(depth_block, c);
                depth_block.parent = this.top_line;
            }
        }
        const children = this.get_child_nodes();
        children.forEach(child => child.update_depth(next_depth + 1));
        this.update_aria_state();
    }

    /**
     * Load children asynchronously when configured.
     * @returns {Promise<void>}
     */
    async ensure_children_loaded() {
        if (this.has_loaded_children || !this.load_children || !this.inner_control) return;
        this.set_loading_state(true);
        try {
            const result = await this.load_children(this);
            const nodes = Array.isArray(result) ? result : [];
            nodes.forEach(node => {
                const node_spec = Object.assign({}, node, {
                    context: this.context,
                    depth: (this.depth || 0) + 1,
                    multi_select: this.multi_select,
                    selectable: this.selectable,
                    drag_reparent: this.drag_reparent,
                    node_class: this.node_class
                });
                const Node_Class = this.node_class;
                const tn = node instanceof Control ? node : new Node_Class(node_spec);
                this.inner_control.add(tn);
            });
            this.has_loaded_children = true;
            this.update_toggle_visibility();
        } catch (error) {
            this.raise('load-error', {error});
        } finally {
            this.set_loading_state(false);
        }
    }

    set_loading_state(is_loading) {
        this.loading = !!is_loading;
        if (this.loading) {
            this.add_class('loading');
            this.dom.attributes['aria-busy'] = 'true';
        } else {
            this.remove_class('loading');
            this.dom.attributes['aria-busy'] = 'false';
        }
    }

    attach_drag_reparent_events() {
        if (!this.drag_reparent || !this.dom.el) return;
        this.dom.attributes.draggable = 'true';
        this.add_dom_event_listener('dragstart', e_drag => {
            if (e_drag && e_drag.dataTransfer) {
                e_drag.dataTransfer.setData('text/plain', this._id());
            }
            const tree = this.get_tree();
            if (tree) {
                tree.drag_node = this;
            }
        });
        this.add_dom_event_listener('dragover', e_drag => {
            e_drag.preventDefault();
            this.add_class('drag-over');
        });
        this.add_dom_event_listener('dragleave', () => {
            this.remove_class('drag-over');
        });
        this.add_dom_event_listener('drop', e_drop => {
            e_drop.preventDefault();
            this.remove_class('drag-over');
            const tree = this.get_tree();
            if (tree && tree.drag_node) {
                tree.reparent_node(tree.drag_node, this);
            }
        });
    }

    get_tree() {
        return this.closest(ctrl => ctrl && (ctrl.__type_name === 'tree' || ctrl.__type_name === 'file_tree'));
    }

    activate() {
        if (!this.__active) {
            super.activate();
            this.rec_desc_ensure_ctrl_el_refs();

            if (this.toggle_button) {
                this.toggle_button.on('toggle', e_toggle => {
                    const state = e_toggle.state;
                    if (state === '-') {
                        this.open();
                        this.raise('expand');
                        this.raise('open');
                    } else {
                        this.close();
                        this.raise('contract');
                        this.raise('close');
                    }
                });
            }

            this.on('change', e_change => {
                if (e_change.name === 'selected') {
                    this.dom.attributes['aria-selected'] = e_change.value ? 'true' : 'false';
                }
            });

            this.update_aria_state();
            this.attach_drag_reparent_events();
        }
    }
}

module.exports = Tree_Node;
