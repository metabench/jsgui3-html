const jsgui = require('lang-tools');
const {each, tof, is_defined, get_a_sig, Evented_Class} = jsgui;

/*
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

*/
// this is the enhanced HTML module.

// Selection scope could be made optional.
//  With some apps, selecting won't matter.

const Selection_Scope = require('./selection-scope');

class Page_Context extends Evented_Class {
    constructor(spec) {
        spec = spec || {};
        super(spec);

        // // merge or assign from spec.
        //  use is_def / def

        // .rp .r_p
        //  shorthands would be useful and save bandwidth too.
        ///  especially where the code does not naturally compress.
        //    then load it into a local variable with its full name.

        // jsgui3-wide shorthands will be of use.
        //  The tutorials will show the longhand version first / by default.


        // Maybe simplify the stuff to do with IDs.
        //  Maybe go further with full guids.


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

        // map_control_iids
        //  mapping from the jgsui name to the int ids.
        //  iid  = int id.
        this.map_control_iids = {};
        this.next_iid = 1;

        // iids will be used to store the dimensions of controls within a single typed array.

        //map_Controls['control'] = Control;
    }

    'new_selection_scope'(ctrl) {
        //
        // create the selection scope, with an assigned id
        var res = new Selection_Scope({
            'context': this,
            'id': this.selection_scope_id_counter++,
            'ctrl': ctrl
        })
        // .s_s / .ss
        this.selection_scopes[res.id] = res;
        if (ctrl) {
            //console.log('core new_selection_scope ctrl._id()', ctrl._id());
            ctrl.selection_scope = res;
            if (typeof document === 'undefined') {
                ctrl._fields = ctrl._fields || {};
                ctrl._fields.selection_scope = res.id;
            }
        }
        
        return res;
    }

    'make' (source) {
        let t_source = tof(source);
        if (t_source === 'string') {
            let parsed = jsgui.parse_and_mount(source, this);
        }
    }
    'update_Controls' () {
        // Multisig functions.
        // Try them. mfp({})

        //console.log('update_Controls sig ' + sig);
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig === '[o]') {
            // a map of keys and constructors values.
            var o = a[0];
            var map_Controls = this.map_Controls;
            each(o, (name, Constructor) => {
                name = name.toLowerCase();
                //console.log('name ' + name);
                map_Controls[name] = Constructor;
            });
        }
        if (sig === '[s,f]') {
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
        control.iid = this.next_iid;
        this.map_control_iids[id] = this.next_iid++;

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
}

module.exports = Page_Context;