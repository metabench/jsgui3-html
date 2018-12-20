/*
    Dragging creates a selection box.
*/
const {
    prop,
    field
} = require('obext');

const jsgui = require('../html-core/html-core');
const stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
const Control = jsgui.Control;
const v_subtract = jsgui.util.v_subtract;
//let ofs = e => [e.offsetX, e.offsetY];
/*
const coords_to_lt_wh = (coords_pair) => {
    //if ()
    let l,t,r,b,w,h, min = Math.min, max = Math.max;
    l = min(coords_pair[0][0], coords_pair[0][0]);
    r = max(coords_pair[0][0], coords_pair[0][0]);
    t = min(coords_pair[0][1], coords_pair[0][1]);
    b = max(coords_pair[0][0], coords_pair[0][0]);

    w = r - l;
    h = b - t;

    return [[l,t],[w,h]];
}
*/
const coords_to_lt_wh = coords_pair => {
    //if ()
    let l, t, r, b, w, h, min = Math.min,
        max = Math.max;
    //let h_pair = 
    l = min(coords_pair[0][0], coords_pair[1][0]);
    r = max(coords_pair[0][0], coords_pair[1][0]);
    t = min(coords_pair[0][1], coords_pair[1][1]);
    b = max(coords_pair[0][1], coords_pair[1][1]);

    w = r - l;
    h = b - t;

    return [
        [l, t],
        [w, h]
    ];
}

// a selectable class / control?
let selection_box_host = (ctrl) => {
    //console.log('selection_box_host', ctrl._id());
    //console.log('ctrl.select_unique', ctrl.select_unique);
    //console.trace();
    let click_handler = (e) => {
        //console.log('selectable click e', e);
        if (ctrl.selectable && !ctrl.selection_scope) {
            var ctrl_key = e.ctrlKey;
            var meta_key = e.metaKey;
            //if (ctrl.select_unique && (ctrl_key || meta_key)) {
            if ((ctrl_key || meta_key)) {
                ctrl.action_select_toggle();
            } else {
                ctrl.action_select_only();
            }
        }
        //e.stopPropagation();
    }
    field(ctrl, 'selection_box_host');
    ctrl.selection_box_host = true;
    // ctrl drag events

    // .wrap_activate
    //  finds the old activate function.

    // wraps it with a new one.



    // Or better to respond to activate.




    // wrap the activation function?
    let old_activate = ctrl.activate;
    ctrl.activate = function (spec) {
        if (old_activate) {
            old_activate.call(this, spec);
        }
        // and a selection scope?
        // drag anywhere in the document?
        // create box
        // update box
        // remove box
        let selection_box;
        let md_pos, mm_pos, md_offset_within_ctrl, mm_offset_within_ctrl;
        // selection scope
        //  get control positions...

        let isf;
        // ctrl all subcontrols.
        //let that = this;
        let nsb = this.new_selection_box = (pos) => {
            //console.log('this._id()', this._id());
            //console.log('ctrl', ctrl);
            this.add(selection_box = new Control({
                context: this.context,
                css: {
                    position: 'absolute'
                },
                'class': 'selection-box',
                pos: pos
            }));
            selection_box.activate();
            // need to be able to set coords.
            //  give it the coords, it words out which is the top etc
            // box from coords
            // l,t,w,h box
            // ltwh_from_coords
            // coords_to_lt_wh
            prop(selection_box, 'coords', e_change => {
                //console.log('e_change', e_change);
                let lt_wh = coords_to_lt_wh(e_change[0]);
                //console.log('* lt_wh', lt_wh + '');
                [selection_box.pos, selection_box.size] = lt_wh;
            });
            return selection_box;
        }
        //throw 'stop';
        ctrl.drag_events(md => {
            // md within uncovered control
            // a way to cancel the event too...
            console.log('md', md);
            let main_boxes = ctrl.$('.main-box');
            //console.log('main_boxes', main_boxes);
            //console.log('main_boxes.length', main_boxes.length);
            let do_begin_selection_box = true;

            if (md.target.tagName.toLowerCase() === 'span') {
                do_begin_selection_box = false;
            }

            if (do_begin_selection_box) {
                md_pos = md.pos;
                //console.log('***ctrl', ctrl);
                ctrl.find_selection_scope().deselect_all();

                //console.log('md', md);
                //console.log('md.pos', md.pos);
                //console.log('md.offset', md.offset);
                // offset of ctrl...
                // ctrl pos
                //console.log('ctrl.pos', ctrl.pos);

                // need the scroll position...
                //console.log('ctrl.el.scrollTop', ctrl.dom.el.scrollTop);
                //console.log('ctrl.el.parentNode.scrollTop', ctrl.dom.el.parentNode.scrollTop);
                //console.log('window.scrollY', window.scrollY);
                //console.log('ctrl.bcr()', ctrl.bcr());
                let ctrl_pos = ctrl.bcr()[0];

                // bcr plus window scroll
                // mf pos within control
                //console.log('ctrl_pos', ctrl_pos);
                md_offset_within_ctrl = v_subtract(md.pos, ctrl_pos);
                md_offset_within_ctrl[1] -= window.scrollY;
                md_pos[1] -= window.scrollY;
                var el = ctrl.dom.el;
                var elpos2 = [el.offsetLeft, el.offsetTop];

                // Search for the 'main-box' controls
                // dot for the css class

                isf = new jsgui.Intersection_Finder({
                    controls: main_boxes
                });

                isf.on('change', e_change => {
                    //console.log('isf e_change', e_change);
                    if (e_change.name === 'intersections') {
                        let [intersecting, newly_intersecting, previously_intersecting] = e_change.value;
                        each(newly_intersecting, ctrl => {
                            let sel = ctrl.closest(cmatch => {
                                //console.log('cmatch', cmatch);
                                return cmatch.selectable === true;
                            });
                            //console.log('sel', sel);
                            if (sel) sel.selected = true;
                        });
                        each(previously_intersecting, ctrl => {
                            let sel = ctrl.closest(match => match.selectable === true);
                            //console.log('sel', sel);
                            if (sel) sel.selected = false;
                        });
                        //each(previously_intersecting, ctrl => ctrl.selected = false);
                    }
                });
                let selection_box = nsb(md.pos);
                //console.log('selection_box', selection_box);
                if (selection_box) {

                }
                //selection_box.pos()
                // ctrl offset...
            } else {
                return false;
            }

        }, mm => {
            if (selection_box) {
                mm_pos = mm.pos;
                mm_pos[1] -= window.scrollY;
                let ctrl_pos = ctrl.bcr()[0];
                // subtract the scroll position
                // console.log('window.scrollY', window.scrollY);
                //console.log('ctrl_pos', ctrl_pos);
                //ctrl_pos[1] += window.scrollY;
                //console.log('2) window.scrollY', window.scrollY);
                mm_offset_within_ctrl = v_subtract(mm.pos, ctrl_pos);

                //console.log('mm_offset_within_ctrl', mm_offset_within_ctrl);
                //mm_offset_within_ctrl[1] -= window.scrollY;
                //;
                //let intersecting = isf.find_intersections(selection_box.coords = [md_offset_within_ctrl, mm_offset_within_ctrl]);
                //console.log('intersecting', intersecting);
                // could set a scroll offset...
                selection_box.coords = [md_offset_within_ctrl, mm_offset_within_ctrl];
                isf.coords = [md_pos, mm_pos];
            }
        }, mu => {
            //console.log('mu', mu);
            selection_box.remove();
            isf = null;
            //console.log('ofs(mu)', ofs(mu));
        });
    }
}

module.exports = selection_box_host;