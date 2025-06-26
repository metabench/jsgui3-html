/*
    For detecting press events outside of a control.
    Listens to the body, detects if the control is or is an ancestor of what was pressed.

    Adds press-outside capability.
    Probably only worth checking for it if there are any event listeners for it.


    So, can we listen for listeners being added anywhere?
      Could be a new feature of Evented_Class?
    //  self events to do with add_event_listener? listener-added?
    //   would add more flexibility for higher levels to provide higher performance / more fine-grained control.

*/

const {
    field,
    prop
} = require('obext');

const press_events = require('./press-events');

// a state / states mixin???

const pressed_state = (ctrl, options = {}) => {
    //let once = options.one || options.once || false;
    //console.log('press_outside');
    //console.log('running pressed-state mixin');

    ctrl.__mx = ctrl.__mx || {};

    if (!ctrl.__mx || !ctrl.__mx.press_events) {
        press_events(ctrl);
    }
    ctrl.__mx.pressed_state = true;

    const setup_isomorphic = () => {
        const old_silent = ctrl.view.data.model.mixins.silent;
        ctrl.view.data.model.mixins.silent = true;
        ctrl.view.data.model.mixins.push({
            name: 'pressed-state'
        });
        ctrl.view.data.model.mixins.silent = old_silent;
        //field(ctrl, 'dragable');
    }
    setup_isomorphic();

    // begin and end presses.
    //   have a 'pressed' state in the control as well.
    //     Want to get the specifics working well on a low level.
    //       Then make them easier to use on a high level.

    // define 'state' field for pressed-state
    field(ctrl.view.data.model, 'state');

    // handle press-start and press-end events
    ctrl.on('press-start', () => { ctrl.view.data.model.state = 'pressed'; });
    ctrl.on('press-end',   () => { ctrl.view.data.model.state = 'not-pressed'; });

    // toggle 'pressed' CSS class based on view state changes
    ctrl.view.data.model.on('change', e => {
        const { name, value } = e;
        if (name === 'state') {
            if (value === 'pressed') ctrl.add_class('pressed');
            else                        ctrl.remove_class('pressed');
        }
    });


    //const body = ctrl.context.body();
    //if (!body.__mx || !body.__mx.press_events) {
    //    press_events(body);
    //}
    //ctrl.event_events = true;

    

}

module.exports = pressed_state;