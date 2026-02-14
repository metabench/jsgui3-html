/*
    Pressed-state mixin.
    
    Adds a 'pressed' CSS class while the control is being pressed.
    Depends on press-events mixin for press-start/press-end events.

    Now returns a cleanup handle for disposable mixin support.
    Existing code that ignores the return value continues to work unchanged.
*/

const {
    field,
    prop
} = require('obext');

const press_events = require('./press-events');
const { create_mixin_cleanup } = require('./mixin_cleanup');

const pressed_state = (ctrl, options = {}) => {
    ctrl.__mx = ctrl.__mx || {};

    // Guard: don't apply twice
    if (ctrl.__mx.pressed_state) return ctrl.__mx.pressed_state;

    if (!ctrl.__mx.press_events) {
        press_events(ctrl);
    }

    const cleanup = create_mixin_cleanup(ctrl, 'pressed_state');
    ctrl.__mx.pressed_state = cleanup;

    const setup_isomorphic = () => {
        const model_mixins = ctrl.view && ctrl.view.data && ctrl.view.data.model && ctrl.view.data.model.mixins;
        if (model_mixins) {
            const old_silent = model_mixins.silent;
            model_mixins.silent = true;
            model_mixins.push({
                name: 'pressed-state'
            });
            model_mixins.silent = old_silent;
        }
    }
    setup_isomorphic();

    // define 'state' field for pressed-state
    field(ctrl.view.data.model, 'state');

    // handle press-start and press-end events
    const h_press_start = () => { ctrl.view.data.model.state = 'pressed'; };
    const h_press_end = () => { ctrl.view.data.model.state = 'not-pressed'; };

    ctrl.on('press-start', h_press_start);
    ctrl.on('press-end', h_press_end);

    cleanup.track_listener(ctrl, 'press-start', h_press_start);
    cleanup.track_listener(ctrl, 'press-end', h_press_end);

    // toggle 'pressed' CSS class based on view state changes
    const h_change = e => {
        const { name, value } = e;
        if (name === 'state') {
            if (value === 'pressed') ctrl.add_class('pressed');
            else ctrl.remove_class('pressed');
        }
    };
    ctrl.view.data.model.on('change', h_change);
    cleanup.track_listener(ctrl.view.data.model, 'change', h_change);

    return cleanup;
}

module.exports = pressed_state;