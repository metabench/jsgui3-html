// Mixin directory and feature detection helpers.

const mx = {
    coverable: require('./coverable'),
    collapsible: require('./collapsible'),
    date: require('./typed_data/date'),
    display: require('./display'),
    display_modes: require('./display-modes'),
    fast_touch_click: require('./fast-touch-click'),
    input_api: require('./input_api'),
    input_base: require('./input_base'),
    input_validation: require('./input_validation'),
    model_data_view_compositional_representation: require('./model_data_view_compositional_representation'),
    popup: require('./popup'),
    resizable: require('./resizable'),
    selectable: require('./selectable'),
    selected_deletable: require('./selected-deletable'),
    selected_resizable: require('./selected-resizable'),
    selection_box_host: require('./selection-box-host'),
    dragable: require('./dragable'),
    drag_like_events: require('./drag_like_events'),
    press_events: require('./press-events'),
    press_outside: require('./press-outside'),
    pressed_state: require('./pressed-state'),
    theme: require('./theme'),
    theme_params: require('./theme_params'),
    themeable: require('./themeable'),

    // Infrastructure
    cleanup: require('./mixin_cleanup'),
    registry: require('./mixin_registry')
};

/**
 * Check if a control has a specific mixin/feature applied.
 * Cleaner alternative to `ctrl.__mx && ctrl.__mx.name`.
 * @param {Object} ctrl - Control instance.
 * @param {string} name - Mixin/feature name.
 * @returns {boolean}
 */
function has_feature(ctrl, name) {
    return !!(ctrl && ctrl.__mx && ctrl.__mx[name]);
}

/**
 * List all mixin/feature names applied to a control.
 * @param {Object} ctrl - Control instance.
 * @returns {string[]}
 */
function list_features(ctrl) {
    return (ctrl && ctrl.__mx) ? Object.keys(ctrl.__mx) : [];
}

/**
 * Apply has_feature and list_features as methods on a control.
 * Called once per control to attach the convenience API.
 * @param {Object} ctrl - Control instance.
 */
function apply_feature_detection(ctrl) {
    if (ctrl._has_feature_api) return;
    ctrl._has_feature_api = true;
    ctrl.has_feature = (name) => has_feature(ctrl, name);
    ctrl.list_features = () => list_features(ctrl);
}

mx.has_feature = has_feature;
mx.list_features = list_features;
mx.apply_feature_detection = apply_feature_detection;

module.exports = mx;
