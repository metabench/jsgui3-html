/**
 * Created by James on 04/08/2014.
 */


var jsgui = require('./../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, def = jsgui.is_defined;
var Control = jsgui.Control;
const {resizable} = require('../../../../control_mixins/mx');

const parse_px = value => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

const get_parent_size = ctrl => {
    const parent = ctrl && ctrl.parent;
    if (!parent) return [0, 0];
    if (Array.isArray(parent.size) && parent.size.length === 2) {
        return parent.size;
    }
    const style = parent.dom && parent.dom.attributes && parent.dom.attributes.style;
    if (style) {
        const width = parse_px(style.width);
        const height = parse_px(style.height);
        if (width || height) return [width, height];
    }
    if (parent.dom && parent.dom.el && typeof parent.dom.el.getBoundingClientRect === 'function') {
        const rect = parent.dom.el.getBoundingClientRect();
        return [rect.width, rect.height];
    }
    return [0, 0];
};

// Titled_Panel would be useful.
//  Would extend the panel, and also show it's name or title.

// Want to keep panel simple. Could have Titled_Panel, maybe Resizable_Panel.
//  If we want a panel with a lot of functionality, it would be the Flexi_Panel.

// Panel_Grid possibly...
//  Can load panels etc...

// May make Showcase version.
//  Or SuperPanel?
//  Or ActivePanel?
//   SmartPanel

// A panel with something like 4 panels inside it...
//  Should be a way of doing application layout.

// Or just use a normal panel with a bunch of mixins?


// Panel could have a text label as part of it (by default, easy to set, easy to move, easy to delete or not use)
//   Though may want to get into making it really easy to add new controls in specific ways, such as binding it to the edge
//     (and also probably reducing the size of the panel itself so that label (or div / span element) fits)




class Panel extends Control {
    // panel name?

    // could have a title field.
    //'fields': {
    //    'name': String
    //}
    // maybe add before make would be better. add will probably be used more.
    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'panel';
        super(spec);
        //this.__type_name = 'panel';
        //this.add_class('panel');
        this.add_class('panel');
        this.resizable_enabled = !!spec.resizable;
        this.min_size = spec.min_size || null;
        this.max_size = spec.max_size || null;
        this.resize_bounds = spec.resize_bounds || spec.extent_bounds || null;
        this.pending_dock_edge = spec.dock || spec.docked || null;

        if (def(spec.name)) {
            this.name = spec.name;
        }

        if (def(spec.title)) {
            this.title = spec.title;
        }


        // With name as a field, that field should get sent to the client...
        if (!spec.abstract && !spec.el) {
            var l = 0;
            //var ctrl_fields = {
            //}

            let n = this.name;
            if (def(n)) {
                let f = this._fields = this._fields || {};
                f.name = n;
            }

            if (def(this.title)) {
                const title_ctrl = new Control({
                    context: this.context,
                    class: 'panel-title'
                });
                title_ctrl.add(this.title);
                this.add(title_ctrl);
                this._ctrl_fields = this._ctrl_fields || {};
                this._ctrl_fields.title = title_ctrl;
            }

            if (def(spec.content)) {
                this.add(spec.content);
            }


            //var name = this.name;
            //if (is_defined(name)) {
                //this._fields = this._fields || {};
                //this._fields['name'] = name;
            //    this.name = name;
            //}
        }
    }
    //'resizable': function() {
    //},

    /**
     * Dock the panel to a parent edge.
     * @param {string} edge - Dock edge.
     * @param {Object} [options] - Optional settings.
     */
    dock_to(edge, options = {}) {
        const parent_size = get_parent_size(this);
        const [parent_width, parent_height] = parent_size;
        if (!parent_width || !parent_height) return;
        const dock_edge = edge || 'left';
        if (!this._pre_dock_state) {
            this._pre_dock_state = {
                pos: this.pos,
                size: this.size
            };
        }
        let next_pos = [0, 0];
        let next_size = [parent_width, parent_height];
        if (dock_edge === 'left') {
            next_size = options.size || [Math.round(parent_width / 2), parent_height];
            next_pos = [0, 0];
        } else if (dock_edge === 'right') {
            next_size = options.size || [Math.round(parent_width / 2), parent_height];
            next_pos = [parent_width - next_size[0], 0];
        } else if (dock_edge === 'top') {
            next_size = options.size || [parent_width, Math.round(parent_height / 2)];
            next_pos = [0, 0];
        } else if (dock_edge === 'bottom') {
            next_size = options.size || [parent_width, Math.round(parent_height / 2)];
            next_pos = [0, parent_height - next_size[1]];
        }
        this.dom.attributes.style.position = 'absolute';
        this.pos = next_pos;
        this.size = next_size;
        this.docked_edge = dock_edge;
    }

    /**
     * Undock the panel and restore previous size/position.
     */
    undock() {
        if (!this._pre_dock_state) return;
        if (this._pre_dock_state.pos) this.pos = this._pre_dock_state.pos;
        if (this._pre_dock_state.size) this.size = this._pre_dock_state.size;
        this._pre_dock_state = null;
        this.docked_edge = null;
    }

    activate() {
        if (!this.__active) {
            super.activate();
            if (this.resizable_enabled) {
                resizable(this, {
                    resize_mode: 'br_handle',
                    bounds: [this.min_size, this.max_size],
                    extent_bounds: this.resize_bounds || this.parent
                });
            }
            if (this.pending_dock_edge) {
                this.dock_to(this.pending_dock_edge);
                this.pending_dock_edge = null;
            }
        }
    }
}
module.exports = Panel;
