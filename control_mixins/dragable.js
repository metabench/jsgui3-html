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

let dragable = (ctrl, opts = {}) => {


	// Check if it's using that mixin already???

	// ctrl.__is_using_dragable_mixin = true???

	// some mixins could only be used once on any control at one time.
	//   some not....
	//   or maybe would have better perf with just one of some of them.


	// A mixin that gets a control raising drag (offset) events could help.
	//   or drag_action_offset_events????

	// drag_like_events may be the best for now.

	// 



	//  ctrl.mixins.all.contains ...???


	// Should possibly have some internal classes or functions that implement draggable functionality?

	//   It's nice to call the mixin as a function, mixins could use helper classes internally.

	//   The translate3d css transformation is possibly highest performance.
	//     Don't want to only rely on that though.
	//       For the moment though, focus on that mode for implementing drag movement.

	// Fixing dragging within the confines of a drag bounds control will be good.








	// And may use pointer press events instead?
	//  Or that's to replace click...?

	//console.log('applying dragable mixin');


	//let selection_action = 'mousedown';
	// select on mousedown?

	//console.log('dragable');

	// Be able to specify that the handle excludes some of its subcontrols?
	//   All of its subcontrols?

	// handle_exclude?


	// bounds, handle
	let {
		bounds,
		handle,
		mode,
		start_action,
		condition
	} = opts;
	// bounds could be a control.

	//control

	// And maybe same / similar for the resize handle.
	//   Maybe make the resize handle dragable???
	//     Prob don't need to in most cases, use more specific programming for it.





	start_action = start_action || ['touchstart', 'mousedown'];

	//console.log('start_action', start_action);

	if (tof(start_action) === 'string') start_action = [start_action];

	//console.log('ctrl.parent', ctrl.parent);
	//console.log('bounds', bounds);

	// Maybe have Window bounded within its parent by default.

	// boundary control
	let bounds_pos;
	let bounds_is_parent = bounds && bounds === ctrl.parent;
	// if the bounding control is the parent, it doesn't require copying to the body.

	if (bounds === 'parent') {
		bounds = ctrl.parent;
		bounds_is_parent = true;
	}
	//console.log('bounds', bounds);

	if (bounds) {
		bounds_pos = bounds.pos || [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];
	}

	//console.log('ctrl.parent', ctrl.parent);
	//console.log('bounds_is_parent', bounds_is_parent);
	handle = handle || ctrl;


	let old_dragable = ctrl.dragable;

	// Also drag within bounds?
	//  Within bounds of parent?

	// 

	let drag_mode = opts.drag_mode || opts.mode || 'body';

	//console.log('bounds_is_parent', bounds_is_parent);


	if (bounds_is_parent) {
		// Work the bounds restriction into the 'translate' drag mode.

		//drag_mode = 'within-parent';
		//bounds = 

		// Code the movement restrictions within the specific drag modes.


	}


	//console.log('1) drag_mode', drag_mode);

	//console.log('dragable drag_mode', drag_mode);

	// Changing position within another control - not putting it into the document root.
	// 
	/*
	let click_handler = (e) => {
	    //console.log('selectable click e', e);
	    //console.log('!!ctrl.selection_scope', !!ctrl.selection_scope);
	    //console.log('ctrl.selectable', ctrl.selectable);
	    if (ctrl.dragable && !ctrl.selection_scope) {
	        var ctrl_key = e.ctrlKey;
	        var meta_key = e.metaKey;
	        if ((ctrl_key || meta_key)) {
	                ctrl.action_select_toggle();
	        } else {
	            //console.log('pre select only');
	            //console.log('ctrl.action_select_only', ctrl.action_select_only);
	            ctrl.action_select_only();
	        }
	    }
	}
	*/

	// calculate a drag mode.
	//  'within-parent'
	//  'body'

	let pos_md, pos_mm, pos_mu, pos_md_within_ctrl;

	// pos_md_within_ctrl

	//console.log('ctrl.context.body', ctrl.context.body);

	let ctrl_body = ctrl.context.body();
	let dragging = false;
	let drag_offset_distance = opts.start_distance || 6;

	let movement_offset;
	let item_start_pos;

	let bounds_size;
	let bounds_offset;
	let half_item_width, item_width;


	let initial_bounds_bcr, initial_bcr;

	let initial_bcr_offset_from_bounds;


	// translate, set position, set absolute position...?

	// different options for how the movement gets done.

	// absolute pos
	// relative pos
	//  a block with neither of them... can use transform translate.
	//   include translation vectors in the control's dims?
	//    using that css 3d translate makes a lot of sense.

	//  dims allowing for 3d translations too??
	//   that would be 3 more items
	//   could even remove the size from this?
	//    calculate the size?
	//    or when the positions are not set, can still have the size.


	const el = ctrl.dom.el;


	let ctrl_translation3d = new Float32Array(3);   // ???
	//  now can set (2d) translation properties directly.

	//  will make use of them do do the translate drag mode.


	//  and could make direct reference to this... original ctrl translation
	let initial_ctrl_translation3d;
	let initial_ctrl_translate;




	// Does seem better to set some properties of translation 3d using this animation frame update system.
	//  Include scaling and rotation in dims?

	//  Or wider than dims... numeric presentation properties....
	//  Could have different modes for how many properties get tracked

	// x, y, w, h, tx, ty, tz, rotation, scalex, scalez?
	//  There could be plenty mores
	//  Especially with setting colors (primary and secondary, and onwards)
	//  Quite a lot of properties could be expressed and changed through a ta system.

	// Lets leave out translate z for the moment??? Rotation, lets keep that.
	//  Keep it 2d for the moment.








	












	const begin_drag = (pos) => {
		//console.log('begin_drag', pos);

		// initial_bcr
		// initial_bounds_bcr
		initial_bcr = ctrl.bcr();
		//console.log('initial_bcr', initial_bcr);

		// These should help with the calculaton to keep it within the bounds, with different drag modes.

		// initial ctrl bcr offset from initial bounds bcr.


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





		// drag mode transform xy?

		// drag mode translate?
		//  could be used with ghost and other options too....


		// popup-copy method
		//  then when it's lower opacity it's ghost.


		// Setting dims values would help with positioning.
		//  It could be fast programatically too.

		//console.log('drag_mode', drag_mode);


		if (drag_mode === 'within-parent') {
			dragging = true;
			// move the item
			// need to calculate move offsets.
			//  measure the item's initial position.
			//console.log('parent.size', parent.size);

			//console.log('ctrl.pos', ctrl.pos);

			item_start_pos = ctrl.pos;

			//item_start_pos = ctrl.bcr()[0];
			//console.log('item_start_pos', item_start_pos);
			//console.log('movement_offset', movement_offset);
			//console.log('ctrl.position', ctrl.position);
			//console.log('1) ctrl.pos', ctrl.pos);
			//console.log('ctrl', ctrl);

			//throw 'stop';

			const ctrl_pos_to_be = [item_start_pos[0] - movement_offset[0], item_start_pos[1] - movement_offset[1]];

			// then bound that pos to be within a bounds...?

			//let new_pos = [item_start_pos[0] - movement_offset[0], item_start_pos[1] - movement_offset[1]];
			//ctrl.pos = new_pos;
			ctrl.pos = ctrl_pos_to_be;


			//console.log('2) ctrl.pos', ctrl.pos);
			//let new_item_pos = 
		} else if (drag_mode === 'translate') {

			// May not need the initial translate.
			//  ???
			// Need to fix this for when dragging a ctrl(el) that is already absolutely positioned.


			// Don't need to keep track of the original position.
			// Need to know the original press pos.
			//console.log('drag_mode: translate');

			// initial bcr
			// initial bounds bcr if there is one




			initial_ctrl_translate = ctrl.ta.slice(6, 8);
			//console.log('initial_ctrl_translate', initial_ctrl_translate);


			// find out the inital translate properties
			//  all css transform properties... need to parse that?
			//   may need more lower level work on css transforms
			//   also probably move away from proxies with styles.
			//    defineproperty is all we need for defined cases.

			// var style = window.getComputedStyle(element [, pseudoElt]);
			//const style = window.getComputedStyle(el);
			//console.log('style', style);
			dragging = true;

			// no need to use an initial translate position...?

			// initial translate position does make sense here.
			//  or some way to build up / aggregate translations / transformations.

			


			//  better to go into the element's styles?
			//   getting 3d translation vector as a typed array, referring to it there would help a lot.

			// matrix3d will be powerful in places....

			// want to fish out the translate3d value.

			//  other framework code on the animation and positioning would be nice.
			//   would mean that the style property actually gets changed when requestAnimationFrame happens.
			//    movement itself would also be simpler and a more optimised call.


			// 

			// Need to know any initial translation and modify that.


		} else {

			// Horizontal restriction - do this elsewhere?

			// May be a boolean restriction rather than a mode.
			//   Mode will probably be more about underlying implementation.

			if (drag_mode === 'x') {
				dragging = true;
				item_start_pos = ctrl.pos || [ctrl.dom.el.offsetLeft, ctrl.dom.el.offsetTop];
				//console.log('item_start_pos', item_start_pos);

				half_item_width = Math.round(ctrl.dom.el.offsetWidth / 2);
				item_width = (ctrl.dom.el.offsetWidth);
				bounds_offset = [bounds.dom.el.offsetLeft, bounds.dom.el.offsetTop];

				//console.log('item_start_pos', item_start_pos);
				//console.log('movement_offset', movement_offset);
				//console.log('bounds_pos', bounds_pos);

				//let new_pos = [item_start_pos[0] + movement_offset[0] + bounds_offset[0] - pos_md_within_ctrl[0] - item_width, item_start_pos[1]];
				//let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
				//console.log('item_start_pos[1]', item_start_pos[1]);

				//ctrl.pos = new_pos;
				ctrl.pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
			} else {
				console.log('drag_mode', drag_mode);
				throw 'NYI';
			}
		}

		ctrl.raise('dragstart');
	}
	const move_drag = (pos) => {
		//let ctrl_size = ctrl.bcr()[2];
		let ctrl_size = [ctrl.dom.el.offsetWidth, ctrl.dom.el.offsetHeight];

		//console.log('bounds_size', bounds_size);
		//console.log('ctrl_size', ctrl_size);

		//console.log('move_drag pos', pos);

		if (drag_mode === 'translate') {
			//console.log('translate drag move');
			// will use movement_offset

			//console.log('movement_offset', movement_offset);
			//console.log('initial_ctrl_translate', initial_ctrl_translate);

			// Yes, initial translation info matters.

			// Also restrict within any bounds, if there is one.

			// But how to restrict the translated ctrl to within the specified bounds.

			// Then apply a movement restriction.

			//console.log('[tr_x, tr_y]', [tr_x, tr_y]);


			// And if there is a bounds, calculate what the maximum allowed movement offsets are....



			// Maybe could calculate available movement distances based on initial bounds position data.



			

			let tr_x = movement_offset[0] + initial_ctrl_translate[0];
			let tr_y = movement_offset[1] + initial_ctrl_translate[1];

			// Adjustments....?
			//   Keeping within a bounds?

			//   How much CSS etc is necessary to recalculate here?

			//   Keeping within a specific bounds...?

			//   Maybe could ask a bounds checker to potentially adjust the values before assigning them...?




			

			// May be better to re-measure all relevant sizes and positions on each frame.

			// Possibly more comprehensive position bounds system is needed.
			//   Something that's specialised in dealing with positions, specific rules for them, and positions of elements / nodes
			//   relative to other nodes, with different types of CSS positioning.

			// Then using that would make code that relies on position rules easier to write.
			//   Want a simple API that expresses the rules easily enough here.

			// Checking every frame for the bcr measured positions may be the way.




			// Check if it's within the bounds...?
			//   Making use of more specific helper classes and APIs would help here.

			// And take into account the initial translation value....

			// The bounds calculations involving translated positions is somewhat more complicated too.


			// Maybe have / use a jsgui3 positions interface that can handle various complexities.
			//   Such as position coming from a variety of things, such as [left, top] of something absolutely positioned,
			//     things being positioned (internally?) through CSS and HTML layout, also translate 3d as well as 2d components
			//     of the position.

			// Getting the positions of things right in an easy way could be a critical feature of jsgui3.
			//   Simple specifcation of things, could internally use some optimisations such as translate3d.




			

			if (bounds) {
				// And check if the bounds is a control...?

				// And subtract initial_ctrl_translate???
				const min_x_movement_offset = -1 * (initial_bcr_offset_from_bounds[0][0] - initial_ctrl_translate[0]);
				if (tr_x < min_x_movement_offset) tr_x = min_x_movement_offset;



				const max_x_movement_offset = -1 * (initial_bcr_offset_from_bounds[1][0] - initial_ctrl_translate[0]);
				if (tr_x > max_x_movement_offset) tr_x = max_x_movement_offset;


				const min_y_movement_offset = -1 * (initial_bcr_offset_from_bounds[0][1] - initial_ctrl_translate[1]);
				if (tr_y < min_y_movement_offset) tr_y = min_y_movement_offset;
				const max_y_movement_offset = -1 * (initial_bcr_offset_from_bounds[1][1] - initial_ctrl_translate[1]);
				if (tr_y > max_y_movement_offset) tr_y = max_y_movement_offset;


				// Ensure potential position is within bounds....



				//console.log('[tr_x, tr_y]', [tr_x, tr_y]);
				//console.log('[min_x_movement_offset, max_x_movement_offset]', [min_x_movement_offset, max_x_movement_offset]);

			}

			

			// Then keep x and y within the bounded range, making necessary compensations and adjustments.

			// Will the new position be within the bcr of the bounds control?
			//  Maybe measure that (single) bcr here.
			//  In case that bounds control has moved.

			// Initial bcr offset...
			//   And the translation should make adjustments for it.

			// Maybe need more advanced position measuring / calculation functionality.
			//   May need a very explicit model of how the measurements are made and which adjustments are applied to what.

			// And code in assumptions / tests such as the bounds not having moved since the start...?

			









			ctrl.ta[6] = tr_x;
			ctrl.ta[7] = tr_y;



		} else if (drag_mode === 'within-parent') {
			//console.log('bounds', bounds);
			bounds = bounds || ctrl.parent;
			bounds_size = bounds.bcr()[2];

			//console.log('bounds_size', bounds_size);
			let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1] + movement_offset[1]];

			if (new_pos[0] < 0) new_pos[0] = 0;
			if (new_pos[1] < 0) new_pos[1] = 0;

			if (new_pos[0] > bounds_size[0] - ctrl_size[0]) new_pos[0] = bounds_size[0] - ctrl_size[0];
			if (new_pos[1] > bounds_size[1] - ctrl_size[1]) new_pos[1] = bounds_size[1] - ctrl_size[1];

			//console.log('new_pos', new_pos);
			ctrl.pos = new_pos;
		} else if (drag_mode === 'x') {
			//bounds_size = bounds.bcr()[2];
			bounds_size = [bounds.dom.el.offsetWidth, bounds.dom.el.offsetHeight];
			//console.log('bounds.dom.el', bounds.dom.el);
			//console.log('bounds_size', bounds_size);
			//console.log('bounds_pos', bounds_pos);
			// half_item_width


			//let new_pos = [item_start_pos[0] + movement_offset[0] + bounds_pos[0] - pos_md_within_ctrl[0] - half_item_width, item_start_pos[1]];
			//console.log('item_start_pos', item_start_pos);
			let new_pos = [item_start_pos[0] + movement_offset[0], item_start_pos[1]];
			//console.log('* new_pos', new_pos);

			if (new_pos[0] < bounds_pos[0] - half_item_width) new_pos[0] = bounds_pos[0] - half_item_width;
			//if (new_pos[1] < 0) new_pos[1] = 0;

			// bounds left

			if (new_pos[0] > bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width) new_pos[0] = bounds_size[0] - ctrl_size[0] + bounds_offset[0] + half_item_width;
			//if (new_pos[1] > bounds_size[1] - ctrl_size[1]) new_pos[1] = bounds_size[1] - ctrl_size[1];
			//console.log('** new_pos', new_pos);
			//console.log('new_pos', new_pos);
			ctrl.pos = new_pos;
		}
		// and need body drag mode too / back.
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
			ctrl.raise('dragend', {
				movement_offset: movement_offset
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

		// use offset
		// [e_mm.pageX || e_mm.touches[0].pageX, e_mm.pageY || e_mm.touches[0].pageY];
		if (!condition || condition()) {

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
			// Does this break selectable / other mixins?
			//e_md.preventDefault();
		}
		//e_md.stopPropagation();
		//e_md.preventDefault();
	}

	/*
	ctrl.on('change', e_change => {
		let {
			name,
			value
		} = e_change;
		/// *
		//if (name === 'selected') {
		//    //console.log('selected value', value);
		//    if (value) {
		//        ctrl.add_class('selected');
		//    } else {
		//        ctrl.remove_class('selected');
		//    }
		//}
		//* /
		//return true;
	})
	*/

	//console.log('old_dragable', old_dragable);

	// The 'dragable' field makes sense here.



	if (!old_dragable) {
		//field(ctrl, 'selected');
		field(ctrl, 'dragable');
		//field(ctrl, 'select_unique');
		//let id = ctrl._id();
		ctrl.on('change', e_change => {
			//console.log('e_change', e_change);
			let n = e_change.name,
				value = e_change.value;

			// Maybe make an abstraction for switching mixins on and off (attaching and unattaching event handlers)



			if (n === 'dragable') {
				if (value === true) {
					// ctrl.deselect();
					//console.trace();

					if (typeof document === 'undefined') {} else {
						// on activation of control.

						let apply_start_handlers = (start_action) => {
							//console.log('apply_start_handlers handle', handle);
							//console.trace();
							if (!handle.has_drag_md_handler) {
								handle.has_drag_md_handler = true;
								each(start_action, sa => {
									handle.on(sa, h_md);
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
								handle.off(sa, h_md);
							});
						})(start_action);
						/*
						handle.off('touchstart', h_md);
						handle.off('mousedown', h_md);
						*/
						handle.has_drag_md_handler = false;
					}
				}
			}
		})
	}

	if (old_dragable !== undefined) {
		ctrl.dragable = old_dragable;
	}

}

module.exports = dragable;