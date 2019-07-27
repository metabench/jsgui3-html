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


let press_events = (ctrl, options = {}) => {
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
    ctrl.on({
        'touchstart': ts,
        'mousedown': md
    });
}

module.exports = press_events;