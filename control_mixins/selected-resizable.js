const {
    prop,
    field
} = require('obext');

let selected_resizable = (ctrl, ctrl_handle) => {
    //let selection_action = 'mousedown';
    // select on mousedown?

    let old_selected_resizable = ctrl.old_selected_resizable;
    let click_handler = (e) => {

    }

    let press_handler = (event) => {
        const keyName = event.key;
        console.log('event', event);

        // 46

        if (keyName === 'Control') {
            // do not alert when only Control key is pressed.
            return;
        }

        if (event.ctrlKey) {
            // Even though event.key is not 'Control' (e.g., 'a' is pressed),
            // event.ctrlKey may be true if Ctrl key is pressed at the same time.
            //alert(`Combination of ctrlKey + ${keyName}`);
        } else {
            //alert(`Key pressed ${keyName}`);
        }
    }

    ctrl.on('change', e_change => {
        let {
            name,
            value
        } = e_change;
        if (name === 'selected') {
            //console.log('selected value', value);


            ctrl.once_active(() => {
                if (value) {
                    //ctrl.add_class('selected');
                    document.addEventListener('keypress', press_handler, false);
                } else {
                    //ctrl.remove_class('selected');
                    document.removeEventListener('keypress', press_handler, false);
                }
            });


        };
        return true;
    });

    if (true) {
        // but it won't be defined.
        if (old_selectable !== undefined) {
            ctrl.selected_deletable = old_sselected_deletableelectable;
        }
    }
}

module.exports = selected_resizable;