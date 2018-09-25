var jsgui = require('../lang/lang');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;
var Control = jsgui.Control,
    Class = jsgui.Class;
var fp = jsgui.fp;
var group = jsgui.group;
var get_a_sig = jsgui.get_a_sig;

var get_window_size = jsgui.get_window_size;

const Selection_Scope = require('./selection-scope');
// this is the enhanced HTML module.

class Page_Context extends jsgui.Evented_Class {
    constructor(spec) {
        spec = spec || {};
        super(spec);
        if (spec.browser_info) {
            this.browser_info = spec.browser_info;
        };
        if (spec.resource_pool) {
            this.resource_pool = spec.resource_pool;
        }
        this.get_vector_methodology = function () {
            if (this.browser_info.ie) {
                return 'vml';
            } else {
                return 'svg';
            }
        };
        // Copied from Server.Page_Context

        this.selection_scopes = {};
        this.selection_scope_id_counter = 0;

        var map_new_ids = {};
        // and have the objects registered within the context too.
        var map_objects = {};
        var _get_new_typed_object_id = (type_name) => {
            //console.log('map_new_ids', map_new_ids);

            if (!is_defined(map_new_ids[type_name])) {
                map_new_ids[type_name] = 0;
            }
            //if (!is_defined(map_new_ids[type_name]) {
            //  map_new_ids[type_name] = 0;
            //}
            var res = type_name + '_' + map_new_ids[type_name];
            map_new_ids[type_name]++;
            return res;
        }

        this.new_id = _get_new_typed_object_id;
        this.set_max_ids = (map_max_ids) => {
            each(map_max_ids, (v, i) => {
                map_new_ids[i] = v + 1;
            })
        }

        var map_Controls = this.map_Controls = {};
        //  they are constructors
        var map_controls = this.map_controls = {};
        map_Controls['control'] = Control;
    }

    'new_selection_scope'(ctrl) {
        //
        // create the selection scope, with an assigned id
        var res = new Selection_Scope({
            'context': this,
            'id': this.selection_scope_id_counter++
        })
        this.selection_scopes[res.id] = res;
        
        if (ctrl) {
            //console.log('core new_selection_scope ctrl._id()', ctrl._id());
            ctrl.selection_scope = res;
            if (!document) {
                // 
                ctrl._fields.selection_scope = res.id;
            }
        }
        
        return res;
    }

    /*
    'get_selection_scope_by_id'(id) {
        if (!this.selection_scopes[id]) {
            this.selection_scopes[id] = new Selection_Scope({
                'context': this,
                'id': id
            });
        }
        return this.selection_scopes[id];
    }
    */

    'make' (source) {

        // make is similar to parse and mount.
        //  

        let t_source = tof(source);
        if (t_source === 'string') {
            let parsed = jsgui.parse_and_mount(source, this);
        }


        /*
        if (abstract_object._abstract) {
            //var res = new
            // we need the constructor function.
            var constructor = abstract_object.constructor;
            //console.log('constructor ' + constructor);
            //throw 'stop';
            var aos = abstract_object._spec;

            // could use 'delete?'
            aos.abstract = null;
            aos.context = this;
            //console.log('abstract_object._spec ' + stringify(abstract_object._spec));
            // Not sure it is creating the right constructor.
            var res = new constructor(abstract_object._spec);
            return res;
        } else {
            throw 'Object must be abstract, having ._abstract == true'
        }
        */
    }
    'update_Controls' () {
        //console.log('update_Controls sig ' + sig);
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig == '[o]') {
            // a map of keys and constructors values.
            var o = a[0];
            var map_Controls = this.map_Controls;
            each(o, (name, Constructor) => {
                name = name.toLowerCase();
                //console.log('name ' + name);
                map_Controls[name] = Constructor;
            });
        }
        if (sig == '[s,f]') {
            var name = a[0];
            var Constructor = a[1];
            name = name.toLowerCase();
            //console.log('name ' + name);
            this.map_Controls[name] = Constructor;
        }
    }
    'register_control' (control) {
        // Put it into the map of IDs
        //console.log('register_control');
        // Not sure how useful registration of all controls will be.
        //  Probably would not be a problem, just it will take memory and CPU cycles.
        control.context = this;
        //console.log('register_control control.__id', control.__id);
        //console.log('register_control control.__type_name', control.__type_name);
        //console.trace();

        var id = control._id();

        // Seems a control (not basic control) did not get its ID.
        //console.log('registering control id', id);
        this.map_controls[id] = control;
    }
    
    'first_ctrl_matching_type' (type_name) {
        // Want to iterate through the controls.
        var res;
        each(this.map_controls, (ctrl, ctrl_id, fn_stop) => {
            //console.log('fn_stop', fn_stop);
            //console.log('ctrl', ctrl);
            //console.log('ctrl.__type_name', ctrl.__type_name);

            if (ctrl.__type_name === type_name) {
                //console.log('have match');
                fn_stop();
                res = ctrl;
            }
        });
        return res;
    }
    'begin_drag_ctrl' (e_begin, ctrl) {
        // Though the ctrl should probably go in the event object - maybe need to formalise an API.
        // Different types of drag could be made modular to make builds smaller.
        //  For the moment need to add functionality then work on build size later.
        this.raise('drag-ctrl-begin', e_end, ctrl);
    }
    'move_drag_ctrl' (e_move, ctrl) {
        var window_size = get_window_size();
        var from_left, from_top, from_right, from_bottom;
        var clientX = e_move.clientX;
        var clientY = e_move.clientY;
        // see if it's at the top or bottom...
        //  would be nice to have different distances, so halfway to the margin anchors it in a way that it hides itself.

        var margin = 64;
        var is_left = clientX <= margin;
        var is_top = clientY <= margin;
        var is_right = clientX >= window_size[0] - margin;
        var is_bottom = clientY >= window_size[1] - margin;

        // need more generic event binding for objects.
        // listen
        // raise
        // then for the combinations...
        //console.log('is_top ' + is_top);
        if (is_top) {
            // raise the event...
            // then some things will listen for it.
            this.raise('drag-ctrl-top');
        } else if (is_bottom) {
            // raise the event...
            // then some things will listen for it.
            this.raise('drag-ctrl-bottom');
        } else if (is_left) {
            // raise the event...
            // then some things will listen for it.
            this.raise('drag-ctrl-left');
        } else if (is_right) {
            // raise the event...
            // then some things will listen for it.
            this.raise('drag-ctrl-right');
        } else {
            this.raise('drag-ctrl-no-zone');
        }
    }
    'end_drag_ctrl' (e_end, ctrl) {
        // raise the event...
        this.raise('drag-ctrl-end', e_end, ctrl);
    }
    'drop_ctrl' (ctrl, zone) {
        //console.log('page context drop control ctrl ' + ctrl);
        //console.log('zone ' + zone);
        if (this.full_window) {
            // anchor the control in that zone.
            this.anchor(ctrl, zone);
            // Basically we need to anchor one control inside another.
            //  The anchor zone will be a part of the grid_9 (or other mechanism)
        }
    }
    'anchor' (ctrl, zone) {
        console.log('page context anchor ');
        if (this.full_window) {
            var fw = this.full_window;
            // and then does the full window control have a grid_9?
            var g9 = fw.get('grid_9');
            //console.log('g9 ' + g9);
            if (g9) {
                g9.anchor_ctrl(ctrl, zone);
            }
            var fwtn = fw.__type_name;
            //console.log('fwtn ' + fwtn);
        }
    }
    // Ending a control drag.
    //  If we are to dock the control somewhere, we have some docking code that does this that can be called separately from the
    //  event.
    // more than notify, this does some UI too.
    'begin_drag_selection_scope' (e_begin, selection_scope) {
        //console.log('page context drag selection_scope ' + selection_scope);
        var map_selected_controls = selection_scope.map_selected_controls;
        //console.log('map_selected_controls ' + stringify(map_selected_controls));
        // true keys...
        var arr_selected = jsgui.true_vals(map_selected_controls);
        //console.log('arr_selected.length ' + arr_selected.length);
        // make shallow copies of these selected controls.
        var shallow_copies_selected = jsgui.shallow_copy(arr_selected);
        this.drag_selected = arr_selected;
        var ctrl_abs = this.make(Control({

        }));
        ctrl_abs.add(shallow_copies_selected);
        var screenX = e_begin.screenX;
        //console.log('screenX ' + screenX);
        var screenY = e_begin.screenY;
        var clientX = e_begin.clientX;
        var clientY = e_begin.clientY;
        ctrl_abs.set('dom.attributes.style', 'position: absolute; left: ' + clientX + 'px; top:' + clientY + 'px; height: 200px; width: 320px; background-color: #EEEEEE');
        var html = ctrl_abs.all_html_render();

        var el_ctr = document.createElement('div');
        el_ctr.innerHTML = html;
        var el_abs = el_ctr.childNodes[0];

        document.body.appendChild(el_abs);
        //ctrl_abs.set('el', el_abs);
        // within the context, we can make new controls and put them in the document.
        // an absolutely positioned div.
        this.ctrl_abs = ctrl_abs;
        //throw 'stop';
    }
    'move_drag_selection_scope' (e_move) {
        console.log('page context move_drag_selection_scope');
        var clientX = e_move.clientX;
        var clientY = e_move.clientY;

        // definitely would be useful to have the abstraction that covers individual style properties.
        var style = 'position: absolute; left: ' + clientX + 'px; top:' + clientY + 'px; height: 200px; width: 320px; background-color: #EEEEEE'
        //console.log('style ' + style);
        var el = this.ctrl_abs.dom.el;
        //console.log('el ' + el);
        el.style.cssText = style;
    }
    'end_drag_selection_scope' (e_end) {
        if (this.ctrl_abs) {
            this.ctrl_abs.remove();
            this.ctrl_abs = null;
        }
    }
    /*
    'ensure_dock_placeholder': function(pos) {
        //console.log('Page Context ensure_dock_placeholder ' + pos);
        var fw = this.full_window;
        if (fw) {
            fw.ensure_dock_placeholder(pos);
        }
    }
    */
}

module.exports = Page_Context;