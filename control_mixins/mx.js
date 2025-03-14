// More directory features here?
//  Be able to mix in multiple at once?



const mx = {
    coverable: require('./coverable'),
    date: require('./typed_data/date'),
    display: require('./display'),
    display_modes: require('./display-modes'),
    fast_touch_click: require('./fast-touch-click'),
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
    pressed_state: require('./pressed-state')
}

module.exports = mx;