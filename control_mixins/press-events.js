const {get_truth_map_from_arr, each} = require('lang-tools');
let press_events = (ctrl, options = {}) => {


    //console.log('running press-events mixin');

    ctrl.__mx = ctrl.__mx || {};
    ctrl.__mx.press_events = true;
    const press_event_names = ['press-start', 'press-move', 'press-end', 'press-hold', 'press-drag-start'];
    const map_press_event_names = get_truth_map_from_arr(press_event_names);



    const setup_isomorphic = () => {
        const old_silent = ctrl.view.data.model.mixins.silent;
        ctrl.view.data.model.mixins.silent = true;
        ctrl.view.data.model.mixins.push({
            name: 'press-events'
        });
        ctrl.view.data.model.mixins.silent = old_silent;
        //field(ctrl, 'dragable');
    }
    setup_isomorphic();

    if (ctrl.dom.el) {

        ctrl.once_active(() => {


            //console.log('once-active press-events');

            //apply_start_handlers(start_action);
            const body = ctrl.context.body();

            //console.log('body', body);
            const {css} = options;
            let handling_is_setup = false;
            let pos_start;
            let movement_offsets;
            let pos_move;
            let movement_offset;
            let timeout_hold;
            let drag_started = false;
            let el;
            const hold_movement_threshold = 4;
            let move_mag;
            const ms_short = 500;
            const ts = e => {
                if (e.touches.length === 1) {
                    e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
                    el = e.el = e.touches[0].target;
                    return ps(e);
                }
            }
            const md = e => {
                let path = e.path || e.composedPath();
                el = e.el = path[0];
                return ps(e);
            }
            const mm = e => {
                e.pos = [e.pageX = e.pageX, e.pageY = e.pageY];
                return pm(e);
            }
            const tm = e => {
                e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
                return pm(e);
            }
            const pm = e => {
                pos_move = e.pos;
                e.movement_offset = movement_offset = [e.pos[0] - pos_start[0], e.pos[1] - pos_start[1]];
                movement_offsets.push(movement_offset);
                e.movement_offsets = movement_offsets;
                e.move_mag = move_mag = Math.sqrt(Math.pow(movement_offset[0], 2) + Math.pow(movement_offset[1], 2));
                e.ctrl = ctrl;
                ctrl.raise('press-move', e);
                if (move_mag >= 4 && !drag_started) {
                    ctrl.raise('press-drag-start', e);
                    drag_started = true;
                }
            }
            const pe = e => {
                e.movement_offsets = movement_offsets;
                e.move_mag = move_mag;
                e.ctrl = ctrl;
                e.el = el;
                if (timeout_hold) clearTimeout(timeout_hold);
                body.off({
                    touchend: te,
                    touchmove: tm,
                    mouseup: mu,
                    mousemove: mm
                });
                ctrl.raise('press-end', e);
            }
            const mu = e => {
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
                timeout_hold = setTimeout(() => {
                    if (move_mag <= hold_movement_threshold) {
                        ctrl.raise('press-hold', e);
                    }
                }, ms_short);
            }
            const setup = () => {
                //console.log('press-events setup (inner)');
                ctrl.on({
                    'touchstart': ts,
                    'mousedown': md
                });
                handling_is_setup = true;
            }
            const unsetup = () => {
                //console.log('press-events unsetup');
                //console.log('--------------------');
                ctrl.off({
                    'touchstart': ts,
                    'mousedown': md
                });
                handling_is_setup = false;
            }
            const outer_setup = () => {
                //console.log('press-events outer_setup');

                // Seems a bit strange - having to listen here for the adding of an event listener.
                //   What if the event listener is added before this mixin is added?

                ctrl.event_events = true;

                const relying_on_recognising_adding_of_event_listeners = () => {
                    ctrl.on('add-event-listener', e => {
                        const {name} = e;
                        if (map_press_event_names[name]) {
                            if (!handling_is_setup) {
                                setup();
                            }
                        }
                    });
                    ctrl.on('remove-event-listener', e => {
                        const {name} = e;
                        if (map_press_event_names[name]) {
                            console.log('ctrl remove-event-listener', name);
                            const bnec = ctrl.bound_named_event_counts;
                            console.log('bound_named_event_counts bnec', bnec);
                            console.log('name', name);
                            let count_bound_press_events = 0;
                            each(bnec, (count, event_name) => {
                                if (map_press_event_names[event_name]) count_bound_press_events += count;
                            })
                            if (count_bound_press_events === 0) {
                                unsetup();
                            }
                        }
                    })
                }

                const just_do_it = () => {
                    if (!handling_is_setup) {
                        setup();
                    }
                }
                just_do_it();


                


            }
            outer_setup();
        });


        
    }

    // emit 'press-outside' when press ends outside the control
    if (typeof window !== 'undefined' && ctrl.dom && ctrl.dom.el) {
        ctrl.on('press-start', e_ps => {
            const outsideHandler = e_pe => {
                if (!ctrl.dom.el.contains(e_pe.target)) {
                    ctrl.raise('press-outside', e_pe);
                }
                window.removeEventListener('mouseup', outsideHandler);
                window.removeEventListener('touchend', outsideHandler);
            };
            window.addEventListener('mouseup', outsideHandler);
            window.addEventListener('touchend', outsideHandler);
        });
    }
    
}
module.exports = press_events;