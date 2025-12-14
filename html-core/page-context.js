const jsgui = require('lang-tools');
const {each, tof, is_defined, get_a_sig, Evented_Class, Data_Model} = jsgui;
const Selection_Scope = require('./selection-scope');
class Page_Context extends Evented_Class {
    constructor(spec) {
        spec = spec || {};
        super(spec);
        this.map_els = this.map_els || {};
        if (spec.document) {
            this.document = spec.document;
        } else if (typeof document !== 'undefined') {
            this.document = document;
        }
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
        this.selection_scopes = {};
        this.selection_scope_id_counter = 0;
        var map_new_ids = {};
        var map_objects = {};
        var _get_new_typed_object_id = (type_name) => {
            if (!is_defined(map_new_ids[type_name])) {
                map_new_ids[type_name] = 0;
            }
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
        var map_controls = this.map_controls = {};
        this.map_data_models = this.map_data_models || {};
        this.map_data_model_iids = this.map_data_model_iids || {};
        this.map_control_iids = {};
        this.next_iid = 1;
    }
    'get_ctrl_el'(ctrl) {
        if (!ctrl) return undefined;

        const ctrl_el = ctrl.dom && ctrl.dom.el;
        if (ctrl_el) return ctrl_el;

        let ctrl_id;
        if (typeof ctrl === 'string') {
            ctrl_id = ctrl;
        } else if (typeof ctrl._id === 'function') {
            ctrl_id = ctrl._id();
        } else if (ctrl.__id) {
            ctrl_id = ctrl.__id;
        }

        if (!ctrl_id) return undefined;

        const cached = this.map_els && this.map_els[ctrl_id];
        if (cached) return cached;

        const doc = this.document;
        if (doc && typeof doc.querySelector === 'function') {
            const found = doc.querySelector('[data-jsgui-id="' + ctrl_id + '"]');
            if (found) {
                this.map_els[ctrl_id] = found;
                return found;
            }
        }

        return undefined;
    }
    'body'() {
        if (this._body_control) return this._body_control;

        const doc = this.document;
        if (!doc || !doc.body) return undefined;

        const Control = require('./control');

        const body_control = new Control({
            context: this,
            __type_name: 'body',
            tag_name: 'body',
            el: doc.body
        });

        this._body_control = body_control;
        if (typeof body_control._id === 'function') {
            this.map_els[body_control._id()] = doc.body;
        }

        if (typeof body_control.add_content_change_event_listener === 'function') {
            body_control.add_content_change_event_listener();
        }
        if (typeof body_control.add_dom_attributes_changes_listener === 'function') {
            body_control.add_dom_attributes_changes_listener();
        }

        return body_control;
    }
    'new_selection_scope'(ctrl) {
        var res = new Selection_Scope({
            'context': this,
            'id': this.selection_scope_id_counter++,
            'ctrl': ctrl
        })
        this.selection_scopes[res.id] = res;
        if (ctrl) {
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
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig === '[o]') {
            var o = a[0];
            var map_Controls = this.map_Controls;
            each(o, (name, Constructor) => {
                name = name.toLowerCase();
                map_Controls[name] = Constructor;
            });
        }
        if (sig === '[s,f]') {
            var name = a[0];
            var Constructor = a[1];
            name = name.toLowerCase();
            this.map_Controls[name] = Constructor;
        }
    }
    'register_control' (control) {
        control.context = this;
        var id = control._id();
        this.map_controls[id] = control;
        control.iid = this.next_iid;
        this.map_control_iids[id] = this.next_iid++;
    }
    register_data_model(data_model) {
        if (data_model instanceof Data_Model) {
            const id = data_model._id();
            this.map_data_models[id] = data_model;
            data_model.iid = this.next_iid;
            this.map_data_model_iids[id] = this.next_iid++;
        } else {
            console.trace();
            throw 'Expected Data_Model instance';
        }
    }
    'first_ctrl_matching_type' (type_name) {
        var res;
        each(this.map_controls, (ctrl, ctrl_id, fn_stop) => {
            if (ctrl.__type_name === type_name) {
                fn_stop();
                res = ctrl;
            }
        });
        return res;
    }
}
module.exports = Page_Context;
