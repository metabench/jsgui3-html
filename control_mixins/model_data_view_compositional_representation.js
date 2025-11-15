const {
    tof,
    each,
    Data_Model,
    Data_Value,
    Immutable_Data_Model,
    Immutable_Data_Value,
    Collection
} = require('lang-tools');
const Control_Data = require('../html-core/Control_Data');
const Control_View = require('../html-core/Control_View');
const Control_Validation = require('../html-core/Control_Validation');
const {ensure_control_models} = require('../html-core/control_model_factory');

// Want to handle server to client persistance here too. Maybe not in this function - possibly control.view.data.model
//   handle that.

// pfield function for a persistant field?
//  or a persistant field mixin?

// A 'pre-server-render' event would help with persisting some things.
//   Would persist them as ._fields or ._.






const model_data_view_compositional_representation = (ctrl, options = {}) => {
    const {data} = options;
    ctrl.using_model_data_view_compositional_representation = true;
    const verify_ctrl_conditions = (ctrl) => {
        if (ctrl.data !== undefined) return false;
        if (ctrl.view !== undefined) return false;
        if (ctrl.validation !== undefined) return false;
        return true;
    }
    const can_proceed = verify_ctrl_conditions(ctrl);
    if (can_proceed) {
        const {context} = ctrl;
        ensure_control_models(ctrl, {data});
        ctrl.validation = new Control_Validation();
        ctrl.view = ctrl.view || new Control_View({
            context
        });
        ctrl.view.data.model.mixins = ctrl.view.data.model.mixins || new Collection();
        ctrl.view.data.model.mixins.on('change', e_change => {
            const {name, value} = e_change;
            if (name === 'insert') {
                const o_mxs = {};
                ctrl.view.data.model.mixins.each(mx => {
                    o_mxs[mx.name] = mx;
                    if (ctrl.context.mixins) {
                        const my_mx = ctrl.context.mixins[mx.name];
                        my_mx(ctrl);
                    }
                });
            }
        });
    } else {
        console.trace();
        console.log('ctrl', ctrl);
        throw 'model_data_view_compositional_representation(ctrl) - ctrl must not have .data or .view properties';
    }
}
module.exports = model_data_view_compositional_representation;
