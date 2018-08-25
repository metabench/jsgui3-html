let fast_touch_click = (ctrl) => {

    // Respond to touch events.

    // generally want a 'press' event too.
    //  Could be a click, or a touch press.

    // Could raise a press or click event.
    //  Press could cover click and touch.
    //  Click could specifically be a mouse event to make least confusion / ambiguity long term.

    // Could have an emulate_clicks option.

    let has_moved_away = false;

    ctrl.on('touchstart', ets => {
        //console.log('ets', ets);
        // Then cancel the event.

        //console.log('Object.keys(ets)', Object.keys(ets));

        // Returning false from such a DOM event should cancel the event propagation.

        ets.preventDefault();
        //return false;
    })
    ctrl.on('touchend', ete => {
        //console.log('ete', ete);

        if (!has_moved_away) {
            ctrl.raise('click', ete);
        }
        has_moved_away = false;
    })
    ctrl.on('touchmove', etm => {
        has_moved_away = true;
        //console.log('etm', etm);
    })



}

module.exports = fast_touch_click;