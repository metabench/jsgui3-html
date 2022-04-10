/*
    Interchangable with a span (in many cases), allows editing of a single string.

    // (no styling)


    // Text property / field.

*/

// tag name span


// highlight on mouseover.
// edit on click

// no support for sub-spans.

const jsgui = require('./../../../../html-core/html-core');

// could inherit span control?

const {controls, parse, each, are_equal} = jsgui;
const {Control, Text_Node} = controls;

const Button = require('../0-basic/button');

const {field, prop} = require('obext');
const press_events = require('./../../../../control_mixins/press-events');



// Should extend span control?

// Editable
// Editing

// Click-to-edit mixin?

// or make the mixin / plugin-like functionality outside the class for easier movement elsewhere.

// More functional programming using controls would be useful. Maybe move (back) away from ES6 classes.


// And respond to presses, not just clicks.

// press-events

// Automatic activation would make a lot of sense when it's put into an active document / active part of the document.
//  Or always...

// The context could maybe respond to a control being added into the DOM.


// a 'frame' mixin piece of functionality would help too.
//  Be able to add controls to the frame of a control...

// suspended_frame
//  the virtual frame made up by the position of the object in the DOM.

// Maybe could use 'before' and 'after' css?

// Really would be best to be able to add items to the virtual frame around the control.

// suspended_virtual_frame
//  suspended in the body.

// will be able to position and place (new) controls within that frame.
//  access the controls (as collection?) within the frame?

// will be useful for positioning popups / adjustment buttons.
//  an abstraction to handle it where it occurrs.

// Definitely seems useful for the various buttons (popup menu? too) that will show in some cases.
//  Will help with doing this around a span control.


// virtual_suspended_frame...
//  won't itself have / be a control to display its stuff.

// Putting things into a background layer behind everything else?
//  Don't want to cover on top of the frame we actually want.
//  Do want to provide easy access through an abstraction to a space / spaces around a ctrl.
//   Want to provide bindings to it.

// Want an abstraction that makes it very simple to access and use the space (suspended) around a ctrl.

// Will want to add a variety of controls / objects to the suspended_frame.

// or use this right now to get the positions?
//  will want centering of controls around suspended_frame points.



// will create controls.
//  add them to positions in a suspended_frame.


// watch_redimension to avoid ambiguity?
const watch_resize = (ctrl) => {

    // watch reposition?
    // and moving too.
    // will use request animation frame.

    // also bcr.

    // A typed array bcr system would be nicer.

    let last_size = ctrl.bcr();


    const inner = () => {
        requestAnimationFrame(timestamp => {


            const current_size = ctrl.bcr();
            const same_size = are_equal(last_size, current_size);
            //console.log('same_size', same_size);

            if (same_size) {

            } else {
                ctrl.raise('resize');
                last_size = current_size;
            }

            inner();

        })
    }
    inner();


}

// Likely to move this elswhere, ie mixins.

const suspended_frame = (ctrl, opts = {
    offset: 0
}) => {


    const {context} = ctrl;
    const body = context.body();
    //console.log('body', body);

    let arr_ctrls = [];
    let arr_ctrls_with_poss = [];


    // controls by position map...
    //  only one control in each position?

    // or make an adjust control position function?
    //  sync control position.




    const {offset} = opts;



    // Will do resize watching on the ctrl.
    //  Then will accordingly adjust positions.










    // Suspended frame for the control...

    // Want to get a suspended frame object back.
    // Place ctrl.
    //  Place ctrl into the body in a position specified by the frame.

    // Listen out for the control resizing / moving too...
    //  The suspended frame will have to move.

    // add to position...
    // be able to get the positions...
    // tl, br etc

    // The suspended controls will be put into the document body.
    //  Maybe a suspended layer div within the body?

    // Get the variety of positions...

    // tl, tm, tr
    // ml, mm, mr
    // bl, mm, br

    // and then adjustments in pixels to make.

    // Needs to have its own layout engine using absolute positioning.

    // Or could relative positioned inline divs be included before and after a span?
    // Jsgui ctrl way doing before and after, not just with CSS...?

    // For the moment, will make this suspended_frame.

    // Need to be able to add a ctrl (to a position)
    //  Bind it to that position relative to the ctrl as well.

    const measure_ctrl = () => {

        // Measurements in the DOM for the ctrl.

        // Bounding client rect? Anything faster?
        //  getBoundingClientRect()
        //   its relative to viewport so need to account for scroll position.

        // bcr function but adjusted for scroll positions?
        //  would be worth planning for the future.

        const bcr = ctrl.bcr();
        console.log('bcr', bcr);


        // Calculate positions where various things can go.
        //  Can't put some controls inside the a span or some other controls.
        //  The virtual suspended frame makes a lot of sense for framing an object with other controls.
        //   Can also style it with a border.
        //    It would be outside of the boundaries of the ctrl.

        // return the bcr?


        return bcr;









    }

    const clear = () => {
        
        each(arr_ctrls, ctrl => {
            ctrl.remove();
        });
        arr_ctrls = [];
        arr_ctrls_with_poss = [];

    }

    // Best not to have to remeasure self when getting ctrl position?



    // self-measurement position...
    const get_suspended_ctrl_doc_pos = (suspended_ctrl, pos) => {

        const m = measure_ctrl();


        //console.log('m', m);

        const [tl, br, size] = m;

        // And the size of the control to add...
        //  Sizes could do with work on types and grammar.

        //console.log('[tl, br, size]', [tl, br, size]);
        // get the size of the ctrl_to_add
        //console.log('ctrl_to_add.size', ctrl_to_add.size);
        // work out / have various corner positions...
        //  we basically have them already.


        // And the size of the control to add.
        //  That should be centered.

        // work out offset positions from points.

        // get the doc position from the pos given.

        //console.log('pos', pos);

        // tl = top left.
        //  could have a lookup function for them

        // take account of the offset too.
        //  could make offset edges / positions objects?

        const map_pos_fns = {
            'tl': () => [tl[0] - offset, tl[1] - offset],
            'tm': () => [t1[0] + (1/2 * size[0]), t1[1] - offset],
            'tr': () => [br[0] + offset, tl[1] - offset]
        }

        if (map_pos_fns[pos]) {

            const retrieved_pos = map_pos_fns[pos]();
            //console.log('retrieved_pos', retrieved_pos);

            if (retrieved_pos) {
                if (suspended_ctrl.size) {
                    const half_size = [suspended_ctrl.size[0] / 2, suspended_ctrl.size[1] / 2];
                    //console.log('half_size', half_size);
                    // set the control to add to be absolute.
                    const docpos = [retrieved_pos[0] - half_size[0], retrieved_pos[1] - half_size[1]];
                    return docpos;
                } else {
                    return retrieved_pos;
                }
            }
        }


    }


    const add = (ctrl_to_add, pos) => {
        // and poly with the pos with mfp? eventually maybe. grammar and interpretation. at least that part of the system exists and functions somewhat.

        // Then offsets based on the control to add's size.

        // Sync / set the control's position...
        /// Some / all of this can be used to sync / reset the pos.

        const docpos = get_suspended_ctrl_doc_pos(ctrl_to_add, pos);
        console.log('docpos', docpos);

        ctrl_to_add.style({
            'position': 'absolute',
            'left': docpos[0] + 'px',
            'top': docpos[1] + 'px'
        });

        // rendering the 'off' property in 'style'?
        //  seems like a problem there.
        //   not so sure why its being set either.

        //console.log('body', body);
        //console.log('body.__active', body.__active);
        //console.log('pre add to body');

        body.add(ctrl_to_add);
        arr_ctrls.push(ctrl_to_add);
        arr_ctrls_with_poss.push([ctrl_to_add, pos]);


        // Consistent and reliable auto-activate would help a lot.
        ctrl_to_add.activate();

    }

    const sync_dimensions = () => {
        // go through all items by layout position...

        //const docpos = get_suspended_ctrl_doc_pos(ctrl_to_add, pos);
        //console.log('docpos', docpos);

        // sync the dimensions within the suspended frame.

        each(arr_ctrls_with_poss, cwp => {
            const [ctrl, pos] = cwp;
            const docpos = get_suspended_ctrl_doc_pos(ctrl, pos);
            //console.log('docpos', docpos);

            // Not sure why its not setting the style....

            //console.log('ctrl.__active', ctrl.__active);

            ctrl.style({
                'left': docpos[0] + 'px',
                'top': docpos[1] + 'px'
            });

        });

    }
    watch_resize(ctrl);

    ctrl.on('resize', e_resize => {
        //console.log('suspended_frame e_resize', e_resize);
        sync_dimensions();
    });


    const res = {
        add: add,
        clear: clear
    };

    return res;

}




// Edit mode mixin?


const editable = (ctrl) => {
    field(ctrl, 'editable', true);
    field(ctrl, 'editing', false);

    const {context} = ctrl;
    // then when the control is clicked, if it's not editing, set it to editing mode.

    ctrl.on('activate', e => {
        console.log('new mini mixin editable ctrl on activate');

        let initial_text = ctrl.dom.el.textContent;

        press_events(ctrl);

        // suspended_frame

        // Maybe do this as async, so the parsing works?
        //  Parsing only works with a callback for the moment.

        // And an offset distance from the ctrl...
        //  Extra spacing around the contorol would stop buttons getting in the way.

        const sframe = suspended_frame(ctrl, {
            offset: 8
        });

        // Create the utility buttons that get hidden around the suspended frame.
        //  Or they only get created when needed?

        // And include buttons in the suspended frame.

        // Create two button controls.
        //  A parse but dont mount function would be of use too.
        //   Would be easier to define and create a button.
        
        // create a cancel and ok button for the suspended frame.

        // can use parse, not parse_mount.

        // size and color
        //  or that's in the CSS?
        //   then would need to measure its size?
        //   put it in as transparent, then measure its size???


        // cancel button, cancel logo
        //  put the size in at 16,16?
        //  reading of size properties could be better. Using grammar?

        // just putting in a fairly simple button here would help.
        //  Not so sure about size property, especially through parse.


        //  size property here should be easy enough.
        //  also sizes from themes / size calculation system would help.

        // parse is now async :(
        //  maybe a sync parse could be made.
        //  parsing doesnt have to be async, technically.


        //const btn_cancel = 

        //console.log('btn_cancel', btn_cancel);

        // add that button to the suspended frame.

        // parse(`<Button name="cancel" class="cancel" size="[16,16]"></Button>`, context, controls);

        // Worth creating the button the old-fashioned way for the moment.

        // and set its size here?
        //  maybe not the most flexible way.
        //console.log('!!Button', !!Button);

        // Size function not working right?
        //  style function?

        // Want to easily set up the icons.
        //  Later will support sprites.
        //  For the moment, want to easily serve images.

        // Or unicode?

        // &#x2BA8
        //  makes sense for the moment.

        // ⮌
        // ✓

        // set the line-height too?
        //  set (inline) style properties too?

        const btn_cancel = new Button({
            context: context,
            class: 'cancel button',
            size: [24, 24],
            text: '⮌'
        });
        btn_cancel.style({
            'line-height': '18px',
            'color': '#8B0000',
            'font-weight': 'bold'
        });

        // 8B0000
        //press_events(btn_cancel);

        const btn_ok = new Button({
            context: context,
            class: 'ok button',
            size: [24, 24],
            text: '✓'
        });
        btn_ok.style({
            'line-height': '18px',
            'color': '#228B22',   // forest green
            'font-weight': 'bold'
        });
        //press_events(btn_ok);

        // ok button too.

        const cancel_editing = () => {
            console.log('cancel_editing');

            // clear the suspended controls...
            sframe.clear();
            ctrl.remove_class('editing');
            ctrl.editing = false;
            ctrl.dom.attributes.contenteditable = false;

            ctrl.dom.el.textContent = initial_text;

        }

        const save_editing = () => {
            console.log('save_editing');

            // get the text content...

            //  inner html?
            // textContent 

            const new_text = ctrl.dom.el.textContent;
            console.log('new_text', new_text);

            sframe.clear();
            ctrl.remove_class('editing');
            ctrl.editing = false;
            ctrl.dom.attributes.contenteditable = false;

            // silent update of the text field?

            


            // raise a change event?
            //  other part of app will listen for change events.

            // edit-complete event would be nicely specific.

            ctrl.raise('edit-complete', {
                old: initial_text,
                value: new_text
            });

        }

        // these will be hidden when not in editing mode.
        //  or possibly not added to the DOM then?

        let has_events = false;

        const start_editing = () => {
            ctrl.editing = true;
            initial_text = ctrl.dom.el.textContent;
            ctrl.add_class('editing');

            //console.log('btn_cancel', btn_cancel);
            sframe.add(btn_cancel, 'tl');
            sframe.add(btn_ok, 'tr');

            if (!has_events) {
                btn_cancel.on('click', e => {
                    cancel_editing();
                })
                btn_ok.on('click', e => {
                    save_editing();
                })
                has_events = true;
            }

            // possible to focus on the point where it was clicked?
            ctrl.dom.attributes.contenteditable = true;
            // request animation frames to detect size changes?
            //  or careful just to trigger resize events with that?
            
            // Possibly the suspended_frame should cover that.
            //  RAF_Size_Monitor?
            //  Resize_Watcher?
            //   Seems like another mixin would help.
            //  Self_Resize_Event?
            //   Listening for size changes with requestanimationframe seems like it would do the job in many cases.
            //    Won't be ideal for very many of them I expect.

            //resize_watch(ctrl);
            //  The frame will handle this.

            




            










            // Also need to keep the suspended frame item positions in sync.





            // responde to keypresses etc?
            //  or only change the content once the OK button is clicked?



            // make contenteditable.
            



            // Not so sure about the problem here.
            //  Auto-activating when placed in active doc looks like the best way.

            /*

            setTimeout(() => {
                btn_cancel.activate();
                btn_ok.activate();
            }, 0);
            */

            



            // A popup 'done' button.
            // A popup 'cancel' button.

            // suspended_frame.show();
            //  shows the item within the suspended_frame.

            // then these button presses...

            /*
            btn_cancel.on('press-end', e => {
                cancel_editing();
            })
            btn_ok.on('press-end', e => {
                save_editing();
            })
            */

            
            




        }

        
        ctrl.on({
            'press-end': e_press_end => {
                console.log('e_press_end', e_press_end);

                // if not editing, start editing.


                if (!ctrl.editing) {
                    start_editing();
                }



            }
        })
        /*
        ctrl.on('press-end', e_press_end => {
            console.log('e_press_end', e_press_end);
        });
        */

    });
    
}


// Nice to write the functionality as mixins.
//  Makes it easier to move elsewhere, and makes this code clearer and more concise.





// String_Editor_Span?
class String_Span extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'string_span';
        spec.tag_name = 'span';
        spec.class = 'string';
        super(spec);
        // But be able to read the text from what's inside?
        field(this, 'value', spec.value);
        editable(this);

        const {context} = this;

        const compose = () => {
            //console.log('Text_Node', Text_Node);
            let tn = new Text_Node({
                context: context,
                text: spec.value
            })
            this.add(tn);
        }
        if (!spec.el) {
            compose();
        }


        // Were we given a value in the spec?
        //  If so, need to add the inner text node.


        // New client-side lifecycle idea:
        //  reconstruct stage.
        //  reconstructs the control from the rendered HTML.
        //   populating some values where necessary.


        // having a reconstruct function as standard within the ctrl-enh lifecycle could be very useful.












        // Need to respond to text change events.

        // Will sometimes have another text node added within this during construction, rather than using the .value field.




    }

    // listen for edit-complete to update the .text property.
    //  silent update?

    activate() {
        if (!this.__active) {
            super.activate();

            this.on({
                'edit-complete': e => {
                    const {old, value} = e;
                    //console.log('String span edit complete', [old, value]);
                    if (old !== value) {
                        this.value = value;
                    }
                }
            })

        }
    }


    // Popups outside of this?
    //  Will need to position the popup divs within the DOM.
    //  Suspended_Around_Bounding_Rect
    //  Frame



    // Popups around bounding rect (mixin)?
    //  Would be very useful for a variety of things that appear around the frames / borders of controls.








    // how / when does this get activated...?




    // setup for hover....

    // Click to edit

    // Editable behaviour
    //  Click to edit.




    // 
}

module.exports = String_Span;