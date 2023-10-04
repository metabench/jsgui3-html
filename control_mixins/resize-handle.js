/*
    Makes it so a control is resize handle to a target.
    If that control is dragable, it uses that control's position, otherwise it uses its value.
    Resize handles could use bind.

    Maybe should not be a mixin...?

*/

// Probably better to use the resizable mixin, and give it the setting of using a resize handle.
//   Resizable should have a variety of ways it can work.
//   Multiple resize handles.
//   Single resize handle (br only?)
//     Crtl-R while ctrl is selected?

// Windows having the focus as well?
// The active window?
// Title bar color changes?


// Want to be able to add floating (not css float) / bound resize handles.
//  Maybe absolutely positioned within the ctrl, or its sub control that itself is relatively positioned.
//  Relatively positioned (single, full size) internal div / control






const {
    prop,
    field
} = require('obext');

let resize_handle = (ctrl, target) => {
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

        ctrl.once_active(() => {
            ctrl.on('change', e_change => {
                //console.log('e_change', e_change);
                let n = e_change.name,
                    value = e_change.value;
            })
        })


    };

}

module.exports = resize_handle;