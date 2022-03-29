const {
    prop,
    field
} = require('obext');

const deletable = require('./deletable');
let selected_deletable = (ctrl) => {
    //let selection_action = 'mousedown';
    // select on mousedown?
    deletable(ctrl);

    let old_selected_deletable = ctrl.selected_deletable;
    let click_handler = (e) => {

    }

    let press_handler = (event) => {
        const keyName = event.key;
        //console.log('event', event);
        // 46

        if (keyName === 'Delete') {
            //return;
            ctrl.delete();
            // 
        }
    }


    // once it's active.

    //ctrl.once_active...



    ctrl.on('change', e_change => {
        let {
            name,
            value
        } = e_change;
        if (name === 'selected') {

            // once it's activated.

            //console.log('selected_deletable selected value', value);

            ctrl.once_active(() => {
                if (value) {
                    //ctrl.add_class('selected');
                    document.addEventListener('keydown', press_handler, false);
                } else {
                    //ctrl.remove_class('selected');
                    document.removeEventListener('keydown', press_handler, false);
                }
            });

        };
        return true;

    });
    //});



    if (true) {
        // but it won't be defined.
        if (old_selected_deletable !== undefined) {
            ctrl.selected_deletable = old_selected_deletable;
        }
    }
}

module.exports = selected_deletable;