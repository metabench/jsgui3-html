/*
    Implements touch and mouse events together.
    Will also tell the differece between press, quick drag / swipe, longer hold

    // press-start
    // press-move
    // press-end

    // press-end
    //  has it moved?

    // press-swipe
    // press-drag

    // press-drag-start after the threshold.

    // press-move seems enough

    // press-drag after the threshold.

    //  if not moved (by threshold)
    // press-short-hold

    // press-grip
    
    // press-hold       (500 ms)
    // press-hold(n)

    // press-hold-end?

    // press-long-hold

    // press-hold-drag


*/
// And options

// Need to be able to detect press outside events.
//  Raising these means listening to the body events.
//   Seeing if it takes place within this or not.

// press-outside will incorporate press_events too.
//  so a mixin that requires / makes use of another mixin.

// one_press_outside seems important too.
//  set it up so it only listens for it once.

// Being able to remove / disable these events and handlers from the mixins.
//   options such a 'once' or 'one'.

// Using press-outside on a popup would help it to close.
//  Want it to be very easy and quick to use within the control itself.

const {get_truth_map_from_arr, each} = require('lang-mini');

let press_events = (ctrl, options = {}) => {

    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.press_events = true;
    
    // Need to listen for press events being added and removed.
    //  Need to be able to add and remove the press-events handling / support as needed.
    //  If there is .one for a press event, the inner handling of it needs to be removed once the event has been removed.

    const press_event_names = ['press-start', 'press-move', 'press-end', 'press-hold', 'press-drag-start'];
    const map_press_event_names = get_truth_map_from_arr(press_event_names);
    // tm(press_event_names)
    //  tm seems like a good lang-mini abbreviation. its there already.

    // Like with press-outside.
    //  This will have to respond to 'add-event-listener' and 'remove-event-listener' events.

    // Only do the listeneng etc if events can be raised.

    const body = ctrl.context.body();
    //console.log('body', body);
    // And do the press events styling too. Automating a 'pressed' class here would make it easy to use elsewhere.
    const {css} = options;

    let handling_is_setup = false;
    let pos_start;
    let movement_offsets;
    let pos_move;
    let movement_offset;
    let timeout_hold;
    let drag_started = false;

    let el;
    // The distance moved so far.

    // hold gesture will have a tiny movement threshold (4)
    const hold_movement_threshold = 4;
    let move_mag;
    const ms_short = 500;

    const ts = e => {
        if (e.touches.length === 1) {
            //e.pageX = e.touches[0].pageX;
            //e.pageY = e.touches[0].pageY;
            e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
            //e.preventDefault();
            //console.log('ctrl', ctrl);
            el = e.el = e.touches[0].target;
            return ps(e);
        }
    }
    const md = e => {
        // Top of the path...?
        //  Different to 'target'?
        //let top_el = e.targetTouches[0].target;
        el = e.el = e.path[0];
        console.log('md', e);

        return ps(e);
    }
    const mm = e => {
        e.pos = [e.pageX = e.pageX, e.pageY = e.pageY];
        //console.log('mm e', e);
        return pm(e);
    }
    const tm = e => {
        e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
        return pm(e);
    }

    // movement offset...
    //const ps = e => {
    //    ctrl.raise('pointer-move');
    //}

    // The target control based on which control was pressed?
    //  .ctrl_target? <- seems better .target_ctrl?
    //   based on the element (/node?) clicked

    const pm = e => {
        pos_move = e.pos;
        //console.log('e', e);
        
    // pos_move = [e.pageX, e.pageY];
        //console.log('pos_start', pos_start);
        e.movement_offset = movement_offset = [e.pos[0] - pos_start[0], e.pos[1] - pos_start[1]];
        //move_mag = 
        
        movement_offsets.push(movement_offset);
        e.movement_offsets = movement_offsets;
        e.move_mag = move_mag = Math.sqrt(Math.pow(movement_offset[0], 2) + Math.pow(movement_offset[1], 2));
        e.ctrl = ctrl;

        // find the ctrl_target
        //  could look it up in the context.map_controls.
        
        ctrl.raise('press-move', e);

        if (move_mag >= 4 && !drag_started) {
            ctrl.raise('press-drag-start', e);
            drag_started = true;
        }

        // press-drag-start
    }
    const pe = e => {
        //ctrl.raise('pointer-move');
        e.movement_offsets = movement_offsets;
        e.move_mag = move_mag;
        e.ctrl = ctrl;
        e.el = el;

        if (timeout_hold) clearTimeout(timeout_hold);

        // Body off a few things...
        body.off({
            touchend: te,
            touchmove: tm,
            mouseup: mu,
            mousemove: mm
        });

        ctrl.raise('press-end', e);
    }
    const mu = e => {

        // Not so sure why these are not working though.
        //  A problem somewhere to do with removing events, it seems.



        body.off({
            mouseup: mu,
            mousemove: mm
        });
        e.pos = [e.pageX, e.pageY];

        return pe(e);
    }
    const te = e => {
        body.off({
            touchend: te,
            touchmove: tm
        });
        e.pos = pos_move || pos_start;
        return pe(e);
    }
    const ps = e => {
        movement_offsets = [];
        move_mag = 0;
        drag_started = false;
        let is_touch_event = !!e.touches;
        e.is_touch_event = is_touch_event;
        //console.log('e', e);
        //console.log('is_touch_event', is_touch_event);
        //body.on('')

        pos_start = [e.pageX, e.pageY];

        if (is_touch_event) {
            // Will need to be switched off when the press ends.
            body.on({
                touchend: te,
                touchmove: tm
            });
        } else {
            body.on({
                mouseup: mu,
                mousemove: mm
            });
        }
        e.ctrl = ctrl;
        ctrl.raise('press-start', e);
        // timesout, until lower time threshold

        timeout_hold = setTimeout(() => {
            if (move_mag <= hold_movement_threshold) {
                ctrl.raise('press-hold', e);
            }
        }, ms_short);
    }

    const setup = () => {
        console.log('press-events setup (inner)');
        ctrl.on({
            'touchstart': ts,
            'mousedown': md
        });
        handling_is_setup = true;
    }

    // A lower level problem with removing dom events?
    //  Could be an issue now...
    const unsetup = () => {
        console.log('press-events unsetup');
        console.log('--------------------');
        //console.trace();
        //throw 'NYI';
        ctrl.off({
            'touchstart': ts,
            'mousedown': md
        });

        // Think these should be removed at the end of the press anyway.
        /*
        body.off({
            touchend: te,
            touchmove: tm,
            mouseup: mu,
            mousemove: mm
        })
        */
        
        //console.log('post ctrl off mousedown');
        handling_is_setup = false;
    }

    const outer_setup = () => {
        // Set up the responses to adding and removing a press-event.
        //  Or any press-events?
        //   That makes the most sense efficiency wise.
        ctrl.event_events = true;

        ctrl.on('add-event-listener', e => {
            const {name} = e;
            // See if handling is set up.
            //console.log('name', name);
            //console.log('map_press_event_names[name]', map_press_event_names[name]);

            if (map_press_event_names[name]) {
                // will need to set up press events
                //console.log('name', name);
                //console.log('map_press_event_names[name]', map_press_event_names[name]);

                if (!handling_is_setup) {
                    //console.log('need to set up press events handling');
                    setup();
                }
            }
        });

        // A simpler event listener example somehow...?

        ctrl.on('remove-event-listener', e => {
            const {name} = e;
            // See how many remaining events are bound.
            //  bound_event_counts?
            //   event_counts?
            //  bound_event_counts could make a clearer name.
            //  bound_named_event_counts?
            //   event_counts as an alias perhaps.
            // that way can easily get a summary of whether we still have bound press events.
            // Only if the removed name is a press event name...
            if (map_press_event_names[name]) {
                console.log('ctrl remove-event-listener', name);
                // will need to set up press events

                const bnec = ctrl.bound_named_event_counts;
                console.log('bound_named_event_counts bnec', bnec);
                console.log('name', name);

                // Then we can see if we have any press events remaining there.
                //  If we do, don't remove the handling.

                let count_bound_press_events = 0;
                each(bnec, (count, event_name) => {
                    if (map_press_event_names[event_name]) count_bound_press_events += count;
                })
                if (count_bound_press_events === 0) {
                    unsetup();
                }
                //console.trace();
                //throw 'NYI';
            }
        })
        // and when removing press events - want to see how many press events remain before removing the handling.
    }
    outer_setup();



    //  So can test if a control is using a required mixin or not.
    //   Could include options within this mixin info?

    // ctrl .__mixins = {mixin_name: true}

    const the_old_way = () => {

        const body = ctrl.context.body();
        //console.log('body', body);
        // And do the press events styling too. Automating a 'pressed' class here would make it easy to use elsewhere.
        const {css} = options;

        if (css) {
            ctrl.on({
                'press-start': () => ctrl.add_class('pressed'),
                'press-end': () => ctrl.remove_class('pressed')
            });
        }

        let pos_start;
        let movement_offsets;
        let pos_move;
        let movement_offset;
        let timeout_hold;
        let drag_started = false;

        let el;

        // The distance moved so far.

        // hold gesture will have a tiny movement threshold (4)
        const hold_movement_threshold = 4;
        let move_mag;
        const ms_short = 500;

        const ts = e => {
            if (e.touches.length === 1) {
                //e.pageX = e.touches[0].pageX;
                //e.pageY = e.touches[0].pageY;
                e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
                //e.preventDefault();
                //console.log('ctrl', ctrl);
                el = e.el = e.touches[0].target;
                return ps(e);
            }
        }
        const md = e => {

            // Top of the path...?
            //  Different to 'target'?
            //let top_el = e.targetTouches[0].target;
            el = e.el = e.path[0];

            return ps(e);
        }
        const mm = e => {
            e.pos = [e.pageX = e.pageX, e.pageY = e.pageY];
            //console.log('mm e', e);
            return pm(e);
        }
        const tm = e => {
            e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
            return pm(e);
        }

        // movement offset...
        //const ps = e => {
        //    ctrl.raise('pointer-move');
        //}

        // The target control based on which control was pressed?
        //  .ctrl_target? <- seems better .target_ctrl?
        //   based on the element (/node?) clicked

        const pm = e => {
            pos_move = e.pos;
            //console.log('e', e);
            
        // pos_move = [e.pageX, e.pageY];
            //console.log('pos_start', pos_start);
            e.movement_offset = movement_offset = [e.pos[0] - pos_start[0], e.pos[1] - pos_start[1]];
            //move_mag = 
            
            movement_offsets.push(movement_offset);
            e.movement_offsets = movement_offsets;
            e.move_mag = move_mag = Math.sqrt(Math.pow(movement_offset[0], 2) + Math.pow(movement_offset[1], 2));
            e.ctrl = ctrl;

            // find the ctrl_target
            //  could look it up in the context.map_controls.


            
            ctrl.raise('press-move', e);

            if (move_mag >= 4 && !drag_started) {
                ctrl.raise('press-drag-start', e);
                drag_started = true;
            }

            // press-drag-start
        }
        const pe = e => {
            //ctrl.raise('pointer-move');
            e.movement_offsets = movement_offsets;
            e.move_mag = move_mag;
            e.ctrl = ctrl;
            e.el = el;

            if (timeout_hold) clearTimeout(timeout_hold);

            ctrl.raise('press-end', e);
        }
        const mu = e => {
            body.remove_event_listener({
                mouseup: mu,
                mousemove: mm
            });
            e.pos = [e.pageX, e.pageY];

            return pe(e);
        }
        const te = e => {
            body.remove_event_listener({
                touchend: te,
                touchmove: tm
            });

            e.pos = pos_move || pos_start;
            return pe(e);
        }
        const ps = e => {
            movement_offsets = [];
            move_mag = 0;
            drag_started = false;
            let is_touch_event = !!e.touches;
            e.is_touch_event = is_touch_event;
            //console.log('e', e);
            //console.log('is_touch_event', is_touch_event);
            //body.on('')

            pos_start = [e.pageX, e.pageY];

            if (is_touch_event) {
                body.on({
                    touchend: te,
                    touchmove: tm
                });
            } else {
                body.on({
                    mouseup: mu,
                    mousemove: mm
                });
            }
            e.ctrl = ctrl;
            ctrl.raise('press-start', e);
            // timesout, until lower time threshold

            timeout_hold = setTimeout(() => {

                if (move_mag <= hold_movement_threshold) {
                    ctrl.raise('press-hold', e);
                }
            }, ms_short);
        }
        


    }
    
}

module.exports = press_events;