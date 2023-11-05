//const {
//    prop,
//    field
//} = require('obext');

var jsgui = require('../html-core/html-core');
const { prop, field, Control } = jsgui;

// Want to make modal windows with this.

// Different to the virtual frame. That could be used to cover a control too.
//  suspended frame suspended_frame

// Will also have overlays available too.
//  coverable works differently.


let coverable = (ctrl, opts) => {
    let select_toggle = false;

    // select only...
    let select_multi = false;
    if (!opts) {

    }

    if (opts) {

    }
    let ctrl_cover;

    // Respond to the covered property changing by adding or removing a cover control.
    ctrl.cover = (content) => {
        /// cover control will need to be absolutely positioned on top of this...
        //   or within this...

        ctrl_cover = new Control({
            context: ctrl.context,
            class: 'cover'
        });
        // then the cover has a background

        let ctrl_cover_bg = new Control({
            context: ctrl.context,
            class: 'background'
        });

        let ctrl_cover_fg = new Control({
            context: ctrl.context,
            class: 'foreground'
        });
        
        content.remove();
        ctrl_cover.add(ctrl_cover_bg);
        ctrl_cover.add(ctrl_cover_fg);
        ctrl_cover_fg.add(content);
        ctrl.add(ctrl_cover);

        // and return an uncover function.
        //  a reference to the cover would be easier
        return ctrl_cover;

    }

    ctrl.uncover = () => {
        ctrl_cover.remove();
        ctrl_cover = null;
    }


    //if (!old_selectable) {
    field(ctrl, 'covered');
    //field(ctrl, 'coverable');
    //field(ctrl, 'select_unique');

    //};
    /*
    if (true) {
        // but it won't be defined.
        if (old_coveravle !== undefined) {
            ctrl.coverable = old_coveravle;
        }
    }
    */
}

module.exports = coverable;