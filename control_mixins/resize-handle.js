/*
    Makes it so a control is resize handle to a target.

    If that control is dragable, it uses that control's position, otherwise it uses its value.

*/

const {
    prop,
    field
} = require('obext');

let selectable = (ctrl, target) => {
    //let selection_action = 'mousedown';
    // select on mousedown?
    ctrl_handle = ctrl_handle || ctrl;
    let old_resizable = ctrl.resizable;
    let click_handler = (e) => {
        //console.log('selectable click e', e);
        //console.log('!!ctrl.selection_scope', !!ctrl.selection_scope);
        //console.log('ctrl.selectable', ctrl.selectable);
    }

    ctrl.on('change', e_change => {
        
    });

    if (!old_resizable) {
        //field(ctrl, 'selected');
        //field(ctrl, 'selectable');
        //field(ctrl, 'select_unique');
        let id = ctrl._id();
        ctrl.on('change', e_change => {
            //console.log('e_change', e_change);
            let n = e_change.name,
                value = e_change.value;
        })
    };

}

module.exports = selectable;