// A box that contains a tree.
//  While a tree can be put in a normal Control, will have some more functions / tools / controls for dealing with a tree, such as collapse_all etc.
var jsgui = require('./../../../../html-core/html-core');
/*
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;
*/
const {stringify, each, tof, def, Control} = jsgui;

// Registration of controls within jsgui.
//  where it adds it to the map of controls.

// jsgui.controls is now the / a map of controls.

// Again, a 'platform' control.
//  Ways to merge in different controls / control sets?
//   That will come. It needs to be convenient.

// Could download the bare minimum.
//  Bare minimum / core controls.

// Could separate out the core controls ie document, div, span, svg, many others.
//  Pay them more attention. Could have plugins.
//   Styling shortcuts.
// Really advanced and flexible core that deals mostly with single controls, but sets the groundwork for 'platform' controls.

// Platform controls - separate from the core controls.
//  eos-live-www just seems to need to show some very basic controls ie have control over some span contents.
//   it has its own controls. then module-view as well.
//    so does not need much in terms of jsgui controls at all at this stage.





//  Then download a control set all at once in another file.








const Panel = require('./../6-layout/panel');
const Title_Bar = require('./../6-layout/title-bar');
const Tree_Node = require('./tree-node');
const keyboard_navigation = require('../../../../control_mixins/keyboard_navigation');
const {
    apply_focus_ring,
    apply_label,
    apply_role
} = require('../../../../control_mixins/a11y');
// Extending, with field values being set?
//  Setting field values in definitions may be a useful thing.
const {prop, field} = require('obext');
//var fields = [
//    ['text', String]
//];
// Could do with a File_Tree that can integrate with an FS_Resource
// text alias being title?
class Tree extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.
    // single field?
    //  and can have other fields possibly.
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'tree';
        super(spec);
        this.add_class('tree');
        this.multi_select = !!spec.multi_select;
        this.selectable = spec.selectable !== false;
        this.drag_reparent = !!spec.drag_reparent;
        this.node_class = spec.node_class || Tree_Node;
        this.active_node = null;
        this.aria_label = spec.aria_label || spec.title;
        //this.__type_name = 'tree';
        // Add the title bar and the main container space.
        /*
        this.title_bar = new Title_Bar({
        });
        */
        //if (spec.title) this.title = spec.title;

        field(this, 'title');
        this.title = spec.title;

        //add(Title_Bar({
        //    'text': 'tree'
        //}));

        // don't do this composition on the client.
        //  don't do it when connecting to an existing DOM.

        if (!spec.el) {
        //if (!window) {
            this.compose_tree(spec);
        }

        // one way data binding.
        // this.bind('title', this.title_bar.text);
        // bind(this, 'title', this.title_bar.text)

        this.on('change', e_change => {
            if (e_change.name === 'title') {
                this.title_bar.text = e_change.value;
            };
        })
        if (this.aria_label !== undefined) {
            apply_label(this, this.aria_label);
        }
    }
    compose_tree(spec) {
        //console.log('this.title', this.title);

        // Can try the new parse_mount with controls.




        if (this.title !== undefined) {
            this.add(this.title_bar = new Title_Bar({
                context: this.context,
                text: this.title
            }));
        }
        this.add(this.main = new Panel({
            context: this.context
        }));
        //var ctrl_fields = ;
        if (spec.nodes) {
            for (let node of spec.nodes) {
                const node_spec = Object.assign({}, node, {
                    context: this.context,
                    depth: 0,
                    multi_select: this.multi_select,
                    selectable: this.selectable,
                    drag_reparent: this.drag_reparent,
                    node_class: this.node_class
                });
                const Node_Class = this.node_class;
                const tn = node instanceof Control ? node : new Node_Class(node_spec);
                this.main.add(tn);
            }
        }
        this._ctrl_fields = Object.assign(this._ctrl_fields || {}, {
            //'title_bar': this.title_bar,
            'main': this.main
        });
        if (this.title_bar) {
            this._ctrl_fields.title_bar = this.title_bar;
        }
        //this.dom.attributes['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
    }
    clear() {
        //console.log('this.main', this.main);
        this.main.clear();
    }
    activate() {
        super.activate();
        if (!this.selection_scope) {
            this.selection_scope = this.context.new_selection_scope(this);
        }
        apply_role(this, 'tree', {force: true});
        this.dom.attributes.tabindex = '0';
        if (this.multi_select) {
            this.dom.attributes['aria-multiselectable'] = 'true';
        }
        apply_focus_ring(this);
        this.ensure_active_node();
        keyboard_navigation(this, {
            orientation: 'vertical',
            get_items: () => this.get_visible_nodes(),
            get_active_index: () => this.get_visible_nodes().indexOf(this.active_node),
            set_active_index: (index) => {
                const nodes = this.get_visible_nodes();
                if (nodes[index]) {
                    this.set_active_node(nodes[index]);
                }
            },
            on_left: () => {
                const active_node = this.active_node;
                if (!active_node) return;
                if (active_node.is_open && active_node.is_open()) {
                    active_node.close();
                } else {
                    const parent_node = active_node.get_parent_node();
                    if (parent_node) {
                        this.set_active_node(parent_node);
                    }
                }
            },
            on_right: () => {
                const active_node = this.active_node;
                if (active_node && active_node.expandable) {
                    if (!active_node.is_open()) {
                        active_node.open();
                    } else {
                        const children = active_node.get_child_nodes();
                        if (children.length) {
                            this.set_active_node(children[0]);
                        }
                    }
                }
            },
            on_home: () => {
                const nodes = this.get_visible_nodes();
                if (nodes.length) this.set_active_node(nodes[0], {select: false});
            },
            on_end: () => {
                const nodes = this.get_visible_nodes();
                if (nodes.length) this.set_active_node(nodes[nodes.length - 1], {select: false});
            },
            on_activate: () => {
                const active_node = this.active_node;
                if (!active_node) return;
                if (active_node.action_select_only) {
                    active_node.action_select_only();
                } else {
                    active_node.selected = true;
                }
            }
        });
    }

    ensure_active_node() {
        if (this.active_node) return;
        const nodes = this.get_visible_nodes();
        if (nodes.length) {
            this.set_active_node(nodes[0], {select: false});
        }
    }

    /**
     * Get visible tree nodes in depth-first order.
     * @returns {Array}
     */
    get_visible_nodes() {
        const res = [];
        const traverse = node => {
            res.push(node);
            if (node.is_open && node.is_open()) {
                const children = node.get_child_nodes ? node.get_child_nodes() : [];
                children.forEach(child => traverse(child));
            }
        };
        if (this.main && this.main.content) {
            this.main.content.each(ctrl => {
                if (ctrl instanceof Tree_Node) {
                    traverse(ctrl);
                }
            });
        }
        return res;
    }

    /**
     * Set the active node and update ARIA state.
     * @param {Control} node - Node to activate.
     * @param {Object} [options] - Optional settings.
     */
    set_active_node(node, options = {}) {
        if (!node) return;
        this.active_node = node;
        const node_id = node.dom && node.dom.attributes && node.dom.attributes.id;
        if (node_id) {
            this.dom.attributes['aria-activedescendant'] = node_id;
        }
        if (options.select !== false) {
            if (this.selection_scope && typeof this.selection_scope.select_only === 'function') {
                this.selection_scope.select_only(node);
            } else {
                node.selected = true;
            }
        }
    }

    move_active_node(direction) {
        const nodes = this.get_visible_nodes();
        if (!nodes.length) return;
        let current_index = nodes.indexOf(this.active_node);
        if (current_index === -1) current_index = 0;
        let next_index = current_index + direction;
        if (next_index < 0) next_index = 0;
        if (next_index >= nodes.length) next_index = nodes.length - 1;
        this.set_active_node(nodes[next_index]);
    }

    handle_keydown(e_keydown) {
        if (!this._keyboard_nav_state || !this._keyboard_nav_state.handle_keydown) return;
        this._keyboard_nav_state.handle_keydown(e_keydown);
    }

    /**
     * Reparent a node to a new parent.
     * @param {Control} node - Node to move.
     * @param {Control} target_node - New parent node.
     * @returns {boolean}
     */
    reparent_node(node, target_node) {
        if (!node || !target_node) return false;
        if (node === target_node) return false;
        if (!target_node.expandable || !target_node.inner_control) return false;
        if (node.is_ancestor_of && node.is_ancestor_of(target_node.dom && target_node.dom.el)) return false;

        const old_parent = node.get_parent_node ? node.get_parent_node() : null;
        node.remove();
        target_node.inner_control.add(node);
        target_node.open();
        if (node.update_depth) {
            node.update_depth(target_node.depth + 1);
        }
        this.raise('reparent', {
            node,
            old_parent,
            new_parent: target_node
        });
        return true;
    }
};
module.exports = Tree;
