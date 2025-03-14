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

const pressed_state = (ctrl, options = {}) => {
    //let once = options.one || options.once || false;
    //console.log('press_outside');

    ctrl.__mx = ctrl.__mx || {};

    if (!ctrl.__mx || !ctrl.__mx.press_events) {
        press_events(ctrl);
    }
    ctrl.__mx.pressed_state = true;

    // begin and end presses.
    //   have a 'pressed' state in the control as well.
    //     Want to get the specifics working well on a low level.
    //       Then make them easier to use on a high level.

    field(ctrl.view.data.model, 'state');

    ctrl.on('press-start', e_ps => { 
        //console.log('press-start e_ps', e_ps);

        // set its view state to pressed. css change will follow automatically.

        ctrl.view.data.model.state = 'pressed';

        //ctrl_dropdown_icon.add_class('pressed');
    });
    ctrl.on('press-end', e_pe => { 
        //console.log('press-end e_pe', e_pe);

        ctrl.view.data.model.state = 'not-pressed';

        //ctrl_dropdown_icon.remove_class('pressed');
    });

    ctrl.view.data.model.on('change', e_change => {
        //console.log('ctrl_dropdown_icon view data model change', e_change);
        const {name, value} = e_change;
        if (name === 'state') {
            if (value === 'pressed') {
                ctrl.add_class('pressed');
            } else if (value === 'not-pressed') {
                ctrl.remove_class('pressed');
            }
        }
    });


    //const body = ctrl.context.body();
    //if (!body.__mx || !body.__mx.press_events) {
    //    press_events(body);
    //}
    //ctrl.event_events = true;

    

}

module.exports = pressed_state;