/*
    Implements touch and mouse events together.
    Will also tell the differece between press, quick drag / swipe, longer hold

    // press-start
    // press-move
    // press-end


    // press-swipe
    // press-drag
    // press-move seems enough

    //  if not moved (by threshold)
    // press-short-hold

    // press-grip

    // press-hold       (500 ms)
    // press-hold(n)

    // press-long-hold

    // press-hold-drag


*/

let press_events = (ctrl) => {
    const body = ctrl.context.body();
    //console.log('body', body);

    let pos_start;
    let movement_offsets;
    let pos_move;
    let movement_offset;

    const ts = e => {
        if (e.touches.length === 1) {
            //e.pageX = e.touches[0].pageX;
            //e.pageY = e.touches[0].pageY;
            e.pos = [e.pageX = e.touches[0].pageX, e.pageY = e.touches[0].pageY];
            //e.preventDefault();
            //console.log('ctrl', ctrl);
            return ps(e);
        }
    }
    const md = e => {
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
        pos_move = [e.pageX, e.pageY];

        e.movement_offset = movement_offset = [pos_move[0] - pos_start[0], pos_move[1] - pos_start[1]];
        movement_offsets.push(movement_offset);
        e.movement_offsets = movement_offsets;
        
        ctrl.raise('press-move', e);
    }
    const pe = e => {
        //ctrl.raise('pointer-move');
        e.movement_offsets = movement_offsets;

        ctrl.raise('press-end', e);
    }
    const mu = e => {
        body.remove_event_listener({
            mouseup: mu,
            mousemove: mm
        });

        return pe(e);
    }
    const te = e => {
        body.remove_event_listener({
            touchend: te,
            touchmove: tm
        });
        e.pos = pos_move;
        return pe(e);
    }
    const ps = e => {
        movement_offsets = [];
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
        ctrl.raise('press-start', e);
    }
    ctrl.on({
        'touchstart': ts,
        'mousedown': md
    });
}

module.exports = press_events;