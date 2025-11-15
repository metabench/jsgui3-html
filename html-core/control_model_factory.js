const { Data_Object } = require('lang-tools');
const Control_Data = require('./Control_Data');
const Control_View = require('./Control_View');
const Control_View_Data = require('./Control_View_Data');
const Control_View_UI = require('./Control_View_UI');

/**
 * Ensure a control exposes fully initialized data/view/view.ui stacks.
 * @param {Control} ctrl - target control instance
 * @param {Object} spec - optional data/view overrides from constructor spec
 */
const ensure_control_models = (ctrl, spec = {}) => {
    const context = ctrl.context;

    // ---- Data ----
    if (!ctrl.data) {
        ctrl.data = new Control_Data({
            context,
            model: spec.data && spec.data.model ? spec.data.model : undefined,
            model_constructor: Data_Object
        });
    } else if (!ctrl.data.model) {
        ctrl.data.model = spec.data && spec.data.model ? spec.data.model : new Data_Object({context});
    }

    // ---- View ----
    if (!ctrl.view) {
        ctrl.view = new Control_View({
            context,
            data: spec.view && spec.view.data ? spec.view.data : undefined
        });
    } else {
        if (!ctrl.view.data) {
            ctrl.view.data = new Control_View_Data({
                context,
                model: spec.view && spec.view.data ? spec.view.data.model : undefined
            });
        } else if (!ctrl.view.data.model) {
            ctrl.view.data.model = spec.view && spec.view.data && spec.view.data.model
                ? spec.view.data.model
                : new Data_Object({context});
        }

        if (!ctrl.view.ui) {
            ctrl.view.ui = new Control_View_UI({context});
        }
    }

    return ctrl;
};

module.exports = {
    ensure_control_models
};
