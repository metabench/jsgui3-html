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
const press_events = require('./press-events');

const press_outside = (ctrl, options = {}) => {
    let once = options.one || options.once || false;
    console.log('press_outside');

    ctrl.__mx = ctrl.__mx || {};

    if (!ctrl.__mx || !ctrl.__mx.press_events) {
        press_events(ctrl);
    }
    ctrl.__mx.press_outside = true;

    const body = ctrl.context.body();
    if (!body.__mx || !body.__mx.press_events) {
        press_events(body);
    }
    ctrl.event_events = true;

    const body_press = e => {
        console.log('press_outside body press e', e);
        //const {ctrl} = e;
        //const press_ctrl = e.ctrl;

        const {ctrl_target} = e;
        /*
            // is the 'search' amongst the ancestors?
	        'ancestor'(search) {
        */
        //const is_ancestor = ctrl.ancestor(ctrl_target);
        //const match = ctrl_target === ctrl || is_ancestor;
            
        // No, need to check if the ctrl is an ancestor of the target.
        //console.log('');
        //console.log('ctrl_target', ctrl_target);
        //console.log('ctrl', ctrl);
        const match = ctrl_target === ctrl || ctrl_target.ancestor(ctrl);
        //console.log('match', match);

        if (!match) {
            // was pressed outside.
            ctrl.raise('press-outside', e);
        }

        // is the target an ancestor of the ctrl in question?

        // target_ctrl???
        //  The event should have the corresponding control to the target element.

        // could look up that target control?
        //  .target_ctrl or .ctrl_target would make a lot of sense.

        // the target_ctrl would be a useful thing to have incorporated into the event - whether press ovent, click event, or other.

        // ctrl_target being more standard (Hungarian prefix style).
    }

    const setup_body_press = () => {
        //console.log('press_outside setup_body_press');
        body.on('press-end', body_press);
    }
    const remove_body_press = () => {
        //console.log('remove_body_press');
        //console.trace();
        body.off('press-end', body_press);
        // Then that should switch off a bunch of things.
    }

    // or 'on' event???
    //console.log('pre on add-event-listener');
    ctrl.on('add-event-listener', e => {
        //console.log('press_outside ctrl add-event-listener', e);
        // if it's the press-outside event...
        const {name} = e;
        if (name === 'press-outside') {
            //console.log('added press-outside event');
            // Need to now listen for it in the document body.
            //body_press();
            setup_body_press();
        }
    });

    // remove events listener not working???
    //  not for dom events?
    ctrl.on('remove-event-listener', e => {
        //console.log('press_outside ctrl remove-event-listener', e);
        //console.trace();

        const {name} = e;
        if (name === 'press-outside') {
            remove_body_press();
        }
        // remove the body press event listener.
    });

}

module.exports = press_outside;