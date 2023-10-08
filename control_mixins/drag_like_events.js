const {
	prop,
	field
} = require('obext');

const {
	each,
	tof
} = require('lang-tools');

/*
	Handling mouseup outside of the document.
	Should have a mousemove handler (while dragging) to check to see if the button in question has been released.
	Maybe only applies with the mouse drag?

	On mousemove, no buttons down means def not dragging???

	But getting clarity on which mouse buttons are down would help at the beginning.
	A class that models the mouse may help.

	Though let's focus on getting some specific and basic GUI things working.





*/


// control_helpers too perhaps.

// A positioning helper.
// A positioning info helper perhaps.

// Positions will need to get dealt with in all sorts of different ways.
//   To some extent it's worth modelling the CSS rules.

// Want to specify what adjustments to make in some cases, though having them made automatically and well is the ideal.
//   Automatically and out-of sync would be one of the worst behavioiurs.

// Though may be worth doing a bit of specific code here for draggable behaviours --- though having code that specifically
//   helps with all sorts of position calculations could work well here.

// Maybe some more classes could help too, eg Position_Confiner
//   And would apply to a Position object of some sort.

// Position_Confiner perhaps even, if using it would make the code at the higher level very clear.

// For the moment, see about handling variety of cases in the code here, see what is needed.

// Things like calculating the expected clearance between the edges and the bounds before moving.

// Ctrl_Pair_Positioning_Relationship_Info may be a useful class for some things.
//   Could be a good API for dealing with a variety of positioning issues in different parts of the codebase.

// May want to be specific about which positioning relationship info classes for for which overall setups.
//   Eg only for an absolutely positioned control within a relative one.
//     Would make sense for Ctrl_Pair_Positioning_Relationship_Info to have and use info on what CSS does.

// However, want to get some simpler cases involving bounds working here.

// A variety of very specific classes could help client-side, so long as the top level(s) of API are simple.

















// Want to make it simpler to create more specific behaviours like drag to grid position.
//  Drop targets could be one way to do that.

// Dynamic_Size could be an interesting one.
//  Uses the space available or the space it's given as a property.

// Maybe need drag-events mixin?
// Or drag-within?
//  the click-and-drag could be used for different things in different situations.
//  eg box select too.
// Want some kinds of specific handling, or mid-specificity handling.
//  Meaning on the higher level there is not much code to write in order to use the functionality.
//  Maybe it's a grid upgrade?
//   Such as dragging on a grid?
//   Or part of press-events?

// Somewhat complex mixin, seems to work well with the transform-xy drag mode.
//   Should make this a bit more general purpose, but where possible write idiomatic code.






// Get working with ghost drag too?
//  Want to get features demo working soon.
//  Probably separate pages will help to keep it simpler to begin with.
//  Maybe CMS should be finished to power it.

// disables console logging in this module.
//const console = {log: () => {}};


// Maybe a class may work better...?
// Could be easier to make variations and subclasses.


// Seems like we need a 'handle_to' ctrl option.
//   So dragging the hansdle drags the control it's the handle to.

// So here can specify a ctrl to use as the handle.


// Also be able to specify controls which don't start the drag.
//   Perhaps automatically make some kinds of controls, such as Buttons, not begin a drag or act as a drag handle.


// Seems like there is still a problem identifying parent nodes upon activation.
//   Looks like pre-activate needs to properly assign the parents.
//     Maybe / probably needs to assign / add the children into the parents contents.
//       maybe could shortcut that and assign .content._arr = [...]

// Could make some of the more complex / unwieldy activation code clearer in purposes.

const drag_like_events = (ctrl, opts = {}) => {

	let {
		
		//condition
	} = opts;
	// bounds could be a control.

    let start_action;

    if (!ctrl.__using_drag_like_events) {
        start_action = start_action || ['touchstart', 'mousedown'];
        if (tof(start_action) === 'string') start_action = [start_action];

        //console.log('ctrl.parent', ctrl.parent);
        //console.log('bounds', bounds);

        // Maybe have Window bounded within its parent by default.

        

        let pos_md, pos_mm, pos_mu, pos_md_within_ctrl;

        // pos_md_within_ctrl

        //console.log('ctrl.context.body', ctrl.context.body);

        let ctrl_body = ctrl.context.body();




        let dragging = false;
        let drag_offset_distance = opts.start_distance || 6;



        let movement_offset;
        let item_start_pos;

        //let bounds_size;
        //let bounds_offset;
        let half_item_width, item_width, initial_bcr;



        const el = ctrl.dom.el;


        
        let initial_ctrl_translate;


        // No actual drag taking place.
        //   Basically want to return the offsets.

        // will be a bit wordy for the moment.

        // .on('begin-drag-like-action')


        const begin_drag = (pos) => {



            //console.log('begin_drag like action', pos);

            // initial_bcr
            // initial_bounds_bcr
            initial_bcr = ctrl.bcr();
            dragging = true;
            //console.log('initial_bcr', initial_bcr);

            // These should help with the calculaton to keep it within the bounds, with different drag modes.

            // initial ctrl bcr offset from initial bounds bcr.

            const old_bounds_handling_code = () => {
                if (bounds) {
                    if (typeof bounds.bcr === 'function') {
                        initial_bounds_bcr = bounds.bcr();
                        //console.log('initial_bounds_bcr', initial_bounds_bcr);

                        // and the initial client translate x and y that are applied?

                        // And will have an estimated / computed new bcr when dragging???


                        // easy way to do the subtraction???

                        // pos offset from bcr???

                        // Maybe not needed...

                        // But a detailed / advanced Control_Positioning module or class could help.
                        // Control_Positioning_Helper.

                        // Helper almost being a mixin? Helper must have all functionality called from that helper.




                        initial_bcr_offset_from_bounds = [
                            [initial_bcr[0][0] - initial_bounds_bcr[0][0], initial_bcr[0][1] - initial_bounds_bcr[0][1]],
                            [initial_bcr[1][0] - initial_bounds_bcr[1][0], initial_bcr[1][1] - initial_bounds_bcr[1][1]],
                            [initial_bcr[2][0] - initial_bounds_bcr[2][0], initial_bcr[2][1] - initial_bounds_bcr[2][1]]
                        ]

                        //console.log('initial_bcr_offset_from_bounds', initial_bcr_offset_from_bounds);


                        //initial_bcr_offset_from_bounds = [[initial_bounds_bcr[]], [], []]

                    }
                }
            }
    


            ctrl.raise('drag-like-action-start');
        }



        const move_drag = (pos) => {
            //let ctrl_size = ctrl.bcr()[2];
            //let ctrl_size = [ctrl.dom.el.offsetWidth, ctrl.dom.el.offsetHeight];

            //console.log('bounds_size', bounds_size);
            //console.log('ctrl_size', ctrl_size);

            //console.log('move_drag pos', pos);

            // No such thing as drag_mode.

            ctrl.raise('drag-like-action-move', {
                offset: movement_offset
            });

            

        }

        const body_mm = e_mm => {
            let touch_count = 1;
            if (e_mm.touches) touch_count = e_mm.touches.length;

            // 

            if (e_mm.touches) {
                pos_mm = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
            } else {
                pos_mm = [e_mm.pageX, e_mm.pageY];
            }

            

            // could store a variable that tracks the last event.

            //console.log('movement_offset', movement_offset);
            //console.log('item_start_pos', item_start_pos);
            //console.log('pos_md', pos_md);
            //console.log('pos_mm', pos_mm);


            if (touch_count === 1) {

                if (e_mm.pageX || e_mm.touches) {

                    let pos_mm;

                    if (e_mm.touches) {
                        pos_mm = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
                    } else {
                        pos_mm = [e_mm.pageX, e_mm.pageY];
                    }

                    if (pos_mm[0] !== undefined && pos_mm[1] !== undefined) {
                        movement_offset = [pos_mm[0] - pos_md[0], pos_mm[1] - pos_md[1]];
                        if (!dragging) {
                            //movement_offset = [(offset_mm[0]), Math.abs(offset_mm[1])];
                            let abs_offset = [Math.abs(movement_offset[0]), Math.abs(movement_offset[1])];
                            let abs_offset_dist = Math.sqrt(Math.pow(abs_offset[0], 2) + Math.pow(abs_offset[1], 2));

                            //console.log('drag_offset_distance', drag_offset_distance);

                            //console.log('abs_offset_dist', abs_offset_dist);
                            if (abs_offset_dist >= drag_offset_distance) {
                                begin_drag(pos_mm);
                            }
                        } else {
                            move_drag(pos_mm);
                        }
                    }

                    
                    
                }


            }
            // Looks like they are passive now by default.
            //e_mm.preventDefault();
        }

        const end_drag = e_mu => {
            // depending on if it is touch or mouse

            ctrl_body.off('mousemove', body_mm);
            ctrl_body.off('mouseup', body_mu);

            ctrl_body.off('touchmove', body_mm);
            ctrl_body.off('touchend', body_mu);

            if (dragging) {
                dragging = false;
                //console.log('end_drag', end_drag);
                //console.trace();
                // Also end drag attempt...
                //  Want it switched off on mouseup.
                //console.log('pre raise drag complete');
                //console.log('movement_offset', movement_offset);

                //ctrl.raise();
                ctrl.raise('drag-like-action-end', {
                    offset: movement_offset
                });
            }
        }

        const body_mu = e_mu => {
            // release
            //console.log('body_mu', e_mu);
            //console.trace();
            end_drag(e_mu);
        }



        const h_md = (e_md) => {
            //console.log('dragable e_md', e_md);

            //console.log('e_md.pageX', e_md.pageX);

            // Strange...
            if (e_md.pageX) {
                pos_md_within_ctrl = [e_md.offsetX, e_md.offsetX];
            } else {
                pos_md_within_ctrl = [0, 0];
            }
            dragging = false;

            //pos_md_within_ctrl = [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];

            //if (drag_mode === 'x') {
            //pos_md = [e_md.layerX, e_md.layerY];

            // Cancel move if there are multiple touches?
            //  Want to recognise pinch / 2 finger rotate events.

            pos_md = [e_md.pageX || e_md.touches[0].pageX, e_md.pageY || e_md.touches[0].pageY];

            //console.log('pos_md', pos_md);

            // get the 3d translation value...
            //  possibly using the system of dims to set the translate value will help too.

            // .t3d typed array
            //  and can listen to changes in these values in between frames.





            // need to mm pos like this too...

            //} else {
            //pos_md = [e_md.pageX || e_md.touches[0].pageX, e_md.pageY || e_md.touches[0].pageY];
            //}
            ctrl_body.on('mousemove', body_mm);
            ctrl_body.on('mouseup', body_mu);
            ctrl_body.on('touchmove', body_mm);
            ctrl_body.on('touchend', body_mu);

            //e_md.stopPropagation();
            //e_md.preventDefault();
        }

        field(ctrl, 'drag_like_events');
        //field(ctrl, 'select_unique');
        //let id = ctrl._id();
        ctrl.on('change', e_change => {
            //console.log('e_change', e_change);


            let n = e_change.name,
                value = e_change.value;

            // Maybe make an abstraction for switching mixins on and off (attaching and unattaching event handlers)



            if (n === 'drag_like_events') {
                if (value === true) {
                    // ctrl.deselect();
                    //console.trace();

                    if (typeof document === 'undefined') {} else {
                        // on activation of control.

                        let apply_start_handlers = (start_action) => {

                            // handle is the ctrl itself???

                            //console.log('apply_start_handlers handle', handle);
                            //console.trace();

                            

                            if (!ctrl.has_drag_like_md_handler) {
                                ctrl.has_drag_like_md_handler = true;
                                each(start_action, sa => {
                                    ctrl.on(sa, h_md);
                                });
                                //handle.on('touchstart', h_md);
                                //handle.on('mousedown', h_md);
                            }
                            
                        }
                        //console.log('handle.has_drag_md_handler', handle.has_drag_md_handler);
                        ctrl.once_active(() => {
                            //console.log('dragable once_active');
                            apply_start_handlers(start_action);
                        });
                    }
                } else {
                    if (typeof document === 'undefined') {} else {

                        
                        (start_action => {
                            each(start_action, sa => {
                                ctrl.off(sa, h_md);
                            });
                        })(start_action);
                        


                        /*
                        handle.off('touchstart', h_md);
                        handle.off('mousedown', h_md);
                        */
                        ctrl.has_drag_md_handler = false;


                    }
                }
            }
        })

        ctrl.__using_drag_like_events = true;
    }

	//control

	// And maybe same / similar for the resize handle.
	//   Maybe make the resize handle dragable???
	//     Prob don't need to in most cases, use more specific programming for it.





 

}

module.exports = drag_like_events;