// Also want to make an MDI window system (Multiple Document Interface)
var jsgui = require('./../../../../html-core/html-core');
var Horizontal_Menu = require('./../../../organised/1-standard/5-ui/horizontal-menu');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var fields = {
	'title': String
};

const {dragable, resizable} = require('../../../../control_mixins/mx');

// Similar in some ways to selectable.

// .become_the_active_window
// .become_an_inactive_window

// .siblings('become_an_inactive_window') perhaps????
//.  or simple each syntax? each_sibling?

// Maybe consider .each() query functions.

//. .siblings.each(Window).become_an_inactive_window()

//  .siblings.each(Window).set('the_active_window', false);

//  .siblings.each(Window).set(Window.flag)('active', false);

// .siblings.each(Window).remove_class('active');
//.  .each returning a 'group query object'...
//.    maybe proxies could get this working best?
//.    so when calling a function on that, it would call the function on the whole group.
//.    want to make it make functions available (easily)
//.    though maybe it wouldn't hurt to list them as well.

// .siblings.remove_class('active') even???
//.  does seem like the right syntax for the coder.

// Maybe it could make a collection of siblings whenever that is queried???

// Maybe a Control_Collection would help? Would extend Collection, and also have some / many functions that call / pass through
//. functions on the controls.

// So addressing a group of controls, and doing remove_class or close

// Definitely looks worth making more ways to make the UI coding easier.
//.  And more concise on the top level.



// focusable ???

// window.has_focus = true;
//. ????

//   
// active property mixin???
// can_be_active mixin ???
// apply the mixin, ?(set can_be_active = true?) or set can_be_active to true by default.

// window.active = true;
//.  would make the other windows inactive.

// window.active = false; - can set this on the siblings when one is made active.





//const  = require('../../../../control_mixins/resizable');

// Making the top bar a drag handle should not be so hard.

// Maybe want a somewhat general default sizing system / class / system of classes.

// Looks like window functionality should be available with easy syntax.

// Maximise, minimise, resize handles.

// An optional statusbar at the bottom would help too.

// Win2K - buttons in group on the right of the titlebar, in this order:

// .minimize
// .maximize
// .close

// .button-group?
// .button.group perhaps


// .mid_size_state ??

// And buttons can go on the left or the right.


// And maybe a context menu with hardly anything on it.
//   Or size settings? Maximize, Minimize, Close?
//     Possibly disable Maximize when already maximized?

// Though this is the very basic window, will be used in demos, but it itself is not a demo. Maybe no context menu by default.


// The resize handle seems most important.
//   Resizable would have a way of working within a relative internal ctrl.

// .ctrl_relative

// Does seem like using a more formal state setting and tracking system would help.
//.  not sure about .was_maximized_just_before_minimizing 
//.    partly because it maybe would not compress so well with current settings
//.With state setting and tracking this could be referenced idiomatically, set automatically.




// Self-adjusting positioning behaviour when in the minimized state forming a bar at the bottom, so that if there
//.  is space to the left it moves into that space
//.  is space in at the right in the row below moves into that space

// Could try making a really simple implementation to start with.

// Through a function to determine the distance to the control (element) to the left, (a sibling???), if there is such an element,
//.  or to the boundary of the parent that it's inside.
// May need to go through all the siblings.
//. May need to measure a few bcrs?
//. Would be best / fastest if it used the position data within jsgui.
//.   Doing it idiomatically? Making use of and adjustments for both ltpos and t3d2dpos
//.    

// More generalised functionality for measuring distances to the nearest sibling to the left could help...?
//.  Though some specific code, if it's not too long and uses good enough idioms, could be most effective.


// And the control would have some kind of event loop where it does the checks and gets moving...
//.  Maybe could do that 6 times a second? 5 times a second? 4 times a second?

// A check every 250ms would not be that much of a delay.

// But properties such as 'velocity', 'friction', 'mass', 'acceleration'???
//.  A reasonable amount of physics modelling would be useful.
//.  But for the moment a much simpler adjustment system would help.
//.    It could maybe even just do a 4px move every time it checks if that adjustment can happen.
//.  Also, could turn on and off this kind of adjustment checking depending on the situation, eg stop once complete.

// Only when in the minimized state do it.
//.  Setting up states, behaviours, state switches could help if it makes for a nicer programming API here.












class Window extends Control {
	// maybe add before make would be better. add will probably be used more.

	// Would ideally keep the code here descriptive of what the window is and does.




	constructor(spec, add, make) {
		super(spec);
		this.__type_name = 'window';
		this.add_class('window');


		if (!spec.abstract && !spec.el) {

			const {context} = this;



			// Looks like the (very) old way of making and using abstract controls is still here, failing when app tries to use it.

			// Seems like the 'compose' function here.

			// Basically needs to better / properly make (compose) the internal controls.
			//   Worth looking into APIs that enable fast definition of internals.
			//  

			
			

			const div_relative = new Control({
				context
			});
			div_relative.add_class('relative');
			//this.add(div_relative);

			const title_bar = new Control({
				context
			});
			title_bar.add_class('title');
			title_bar.add_class('bar');

			// And add a span inside it for the title text.



			// Minimise and maximise buttons.

			const title_h2 = new jsgui.controls.h2({
				context
			})
			title_bar.add(title_h2);

			if (typeof spec.title === 'string') {
				title_h2.add(spec.title);
			}
			

			// Then the buttons on the titlebar.
			// Maybe will try some abstractions but not so sure....

			const right_button_group = new Control({
				context
			});
			right_button_group.add_class('button-group');
			right_button_group.add_class('right');

			// Then add the 3 buttons.
			//   Maybe integrated system for icons will help.
			//   Easily integrate SVGs and PNGs.

			const btn_minimize = new jsgui.controls.Button({
				context
			});

			// 🗕
			//btn_minimize.add('🗕');
			// ⊖
			//btn_minimize.add('▪');

			const span = (text) => {
				const res = new jsgui.controls.span({context});
				res.add(text);
				return res;
			}


			btn_minimize.add(span('⊖'));

			right_button_group.add(btn_minimize);

			const btn_maximize = new jsgui.controls.Button({
				context
			});


			// Seems like it gets escaped when we add it like this.
			// Maybe we don't want to process or escape HTML?
			//   Though checking it will in fact render as a text node may be important.
			//   Maybe could unescape & only (after the escaping).


			//btn_maximize.add('🗖')
			// ⊕
			btn_maximize.add(span('⊕'))
			//btn_maximize.add('⬛')

			right_button_group.add(btn_maximize);

			const btn_close = new jsgui.controls.Button({
				context
			});

			// ⓧ⊗. ⊗

			btn_close.add(span('⊗'))

			// ❎
			right_button_group.add(btn_close);



			//title_bar.add(title_h2);

			title_bar.add(right_button_group);
			div_relative.add(title_bar);



			const ctrl_inner = new Control({
				context
			})
			ctrl_inner.add_class('inner');
			div_relative.add(ctrl_inner);

			this.add(div_relative);
			//this.add(title_bar);

			




			



			// So it having relative positioning would help that inner area to scroll.
			//  May have a listener for the inner control being set.
			// May also need to size the inner control so that the scrollbars also fit.
			//  Then inside that inner control, there is a larger logical area.
			//   A div that does not have any size or overflow set.
			//   That div can get moved around.
			// Not so sure about setting an inner size.
			//  Seems appropriate though.
			//  Could have a large control inside the inner control if necessary.
			// The scrollbar system should be baked into enhanced controls.
			// enhanced_control.scrollbars();
			// should be that easy to switch on the jsgui scrollbars.
			// It should not make use of the standard inner_control... or if it does, inner_control functionality needs to be written around scrollbar functionality.
			// So to start with, we need to make sure that a control makes use of an inner control area.
			//  Difficulty comes from a control that does not take scrollbars into account and has its own inner_control.
			// Possibly the Window control is not the best example to start with.
			// Or work on the Window control as well as some more generic examples.



			//var inner_control = div_relative.add(make(Control({'class': 'inner'})));
			//console.log('this._id() ' + this._id());
			//console.log('inner_control._id() ' + inner_control._id());


			/*

			

			*/
			this.ctrl_inner = ctrl_inner;
			this.inner = ctrl_inner;
			this.title_bar = title_bar;
			this.ctrl_relative = div_relative;


			this._ctrl_fields = this._ctrl_fields || {};

			this._ctrl_fields.ctrl_inner = ctrl_inner;
			this._ctrl_fields.inner = ctrl_inner;
			this._ctrl_fields.title_bar = title_bar;
			this._ctrl_fields.ctrl_relative = div_relative;


			// And need to have it remember the buttons, so their press events can be handled.

			this._ctrl_fields.btn_minimize = btn_minimize;
			this._ctrl_fields.btn_maximize = btn_maximize;
			this._ctrl_fields.btn_close = btn_close;

			// ctrl_inner


			// use different quotes...
			//this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
		}
	}

	// Clicking or pressing the window should bring it to the front.



	bring_to_front_z() {
		let max_z = 0;
		each(this.parent.content, (ctrl) => {
			if (ctrl !== this) {
				const z = parseInt(ctrl.dom.attributes.style['z-index']);
				//console.log('ctrl.dom.attributes.style[\'z-index\']', ctrl.dom.attributes.style['z-index']);
				//console.log('z', z);
				if (!isNaN(z) && z > max_z) max_z = z;
				//console.log('1) max_z', max_z);
			}
		});
		//console.log('2) max_z', max_z);
		this.dom.attributes.style['z-index'] = parseInt(max_z) + 1;
	}

	// a lower level function here???
	// An adjusted glide function?
	glide_to_pos(pos) {
		return new Promise((s, j) => {

			//const [tx, ty] = [this.ta[6], this.ta[7]];
			const [my_new_left, my_new_top] = pos;

			const x_diff = my_new_left - this.ta[6];
			const y_diff = my_new_top - this.ta[7];
			//console.log('y_diff', y_diff);


			// Want to do it in something like 0.14s, 140ms, about 8 frames at 60fps.

			// Requesting animation frames seems like this may be the way to do it.

			const ms_total_animation_time = 140;

			// but can we assume time has moved along since the 0th?

			let animation_start;

			const start_tx = this.ta[6];
			const start_ty = this.ta[7];

			let i_frame = 0;

			const skip_zeroth_frame = false;

			// Delaying by one frame. May make this into an option.
			const process_frame = () => {

				if (skip_zeroth_frame && i_frame === 0) {

					requestAnimationFrame(timestamp => {
						i_frame++;
						process_frame();
					});

				} else {
					requestAnimationFrame(timestamp => {
						if (!animation_start) {
							animation_start = timestamp;
							process_frame();
						} else {
							const time_since = timestamp - animation_start;
	
							//console.log('time_since', time_since);
	
							if (time_since < ms_total_animation_time) {
								const proportion_through = time_since / ms_total_animation_time;
								const proportional_x_diff = x_diff * proportion_through;
								const proportional_y_diff = y_diff * proportion_through;
								this.ta[6] = start_tx + proportional_x_diff;
								this.ta[7] = start_ty + proportional_y_diff;
								i_frame++;
								process_frame();
							} else {
								this.ta[6] = start_tx + x_diff;
								this.ta[7] = start_ty + y_diff;
								//this.dom.el.style.transition = '';
								//callback();
								s();
								//
							}
						}
					})
				}
				
				
			}
			process_frame();

		})
	}

	// Could make this async.
	async minimize() {
		if (this.manager) {
			this.manager.minimize(this);
		} else {

			// May separate code into different minimization modes.
			const my_bcr = this.bcr();

			

			if (!this.has_class('minimized')) {
				//this.dom.el.style.transition = 'width 0.14s linear, height 0.14s linear;';

				const width_to_minimize_to = 280;
				const minimized_height = 31;

				if (this.has_class('maximized')) {

					this.was_maximized_just_before_minimizing = true;

					

					this.pre_minimized_pos = this.pre_maximized_pos;
					this.pre_minimized_size = this.pre_maximized_size;
					this.remove_class('maximized');

					//setTimeout(() => {
					//	this.dom.el.style.transition = '';
					//}, 144);


				} else {
					this.was_maximized_just_before_minimizing = false;


					this.pre_minimized_pos = my_bcr[0];
					this.pre_minimized_size = my_bcr[2];
				}

				this.dragable = false;
				// Width to minimize to = 280.

				

				// dock to the bottom of the window, and animate the move.

				//  Maybe include the docking code here.
				//    Need to make this work with / supporting the translate(3d) values on the element.

				const parent_bcr = this.parent.bcr();
				const parent_size = parent_bcr[2];
				//console.log('parent_bcr', parent_bcr);


				// maybe could get from the CSS or have value written to the CSS, or use more general means.

				// What about other minimized items in the parent, possibly items positioned on that bottom row?
				//   Could go through all minimized controls within the parent.

				// use the .ta typed array properties....

				

				//console.log('[tx, ty]', [tx, ty]);

				//console.log('my_new_top', my_new_top);

				// Need to determine the position to minimize to.
				//. Position within its container (parent).

				// So look at the sibling minimized windows.

				// Consider squashing other minimized windows' widths to fit?
				// Seems better to stack the minimized windows vertically.
				//.  Then on maximize, would need to rearrange the minimized windows.

				// Want to keep the code simple and clear on this level where possible.

				setTimeout(() => {
					this.size = [width_to_minimize_to, minimized_height];
				}, 17)

				

				const determine_pos_to_minimize_to = () => {
					// Go through the siblings....

					// And will see the first place where space is available....

					// For the moment, put it to the right of any existing ones.
					//   Though it does seem worth detecting if a row is full and to place it there.

					// Worth looking for space row by row.
					//.  Though it seems more worth getting the right map / data of the positions and extents of all existing minimized windows
					//.  Then sort them, and move through them looking for where there is a space.

					let minimized_sibling_window_bcrs = [];

					

					each(this.parent.content, (ctrl) => {
						if (ctrl !== this) {

							// And is it a minimized window???

							if (ctrl.has_class('window') && ctrl.has_class('minimized')) {

								//console.log('ctrl.pos', ctrl.pos);

								// .pos? .spos? .sp for size and position? .ps positon and size?

								// .bcr property seems like it could be better as a getter.




								const ctrl_bcr = ctrl.bcr();
								//const [pos, brpos, size] = ctrl_bcr;

								minimized_sibling_window_bcrs.push(ctrl_bcr);



								//console.log('bcr_pos', bcr_pos);

							}

							//const z = parseInt(ctrl.dom.attributes.style['z-index']);
							//console.log('ctrl.dom.attributes.style[\'z-index\']', ctrl.dom.attributes.style['z-index']);
							//console.log('z', z);
							//if (!isNaN(z) && z > max_z) max_z = z;
							//console.log('1) max_z', max_z);
						}
					});

					if (minimized_sibling_window_bcrs.length > 0) {

						minimized_sibling_window_bcrs.sort((a, b) => {
							if (a[0][1] === b[0][1]) {
								return a[1][0] - b[1][0];
							} else {
								return b[0][1] - a[0][1];
							}
						});
	
						//console.log('minimized_sibling_window_bcrs', minimized_sibling_window_bcrs);
						// And put it after the last....
	
						const last_bcr = minimized_sibling_window_bcrs.at(-1);
	
						// then determine if there is the space in the row for it.
	
						const last_r = last_bcr[1][0];
	
						// May be making assumption here, should be careful.
						//. 	
	
						const extra_margin = 2;

						//console.log('last_r + width_to_minimize_to + extra_margin', last_r + width_to_minimize_to + extra_margin);
	
						if (parent_size[0] >= last_r + width_to_minimize_to + extra_margin) {
							return [last_bcr[1][0] + extra_margin, last_bcr[0][1]];
						} else {
							// a new row up, on the left
							return [0, last_bcr[0][1] - extra_margin - minimized_height];
						}

					} else {
						return [0, parent_size[1] - minimized_height];
					}

					

					// sort the bcrs by [0][1] descending then [1][0] ascending.
				}

				const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));

				const dest_pos = determine_pos_to_minimize_to();
				dest_pos[0] -= ltpos[0];
				dest_pos[1] -= ltpos[1];

				/*
				
				glide_to_position([my_new_left, my_new_top], () => {
					this.add_class('minimized');
					

				});
				*/

				await this.glide_to_pos(dest_pos);
				this.add_class('minimized');

				//console.log('[my_new_left, my_new_top]', [my_new_left, my_new_top]);


				//const my_new_left = 0;
				//const my_new_top = parent_size[1] - minimized_height;



				

			} else {
				// Unminimize

				// Would put it back into the maximized state if it was maximized before.
				//.  was_maximized_immediately_prior_to_minimization ????
				//.    does seem like an important thing to know in this case.
				// Pre-minimize state.

				// Unmaximize will never minimize the window.

				if (this.was_maximized_just_before_minimizing) {
					await this.maximize();
				} else {
					// Glide it to the prior size (and pos)

					//this.pre_minimized_pos = this.pre_maximized_pos;
					//this.pre_minimized_size = this.pre_maximized_size;

					setTimeout(() => {
						this.size = this.pre_minimized_size;
					}, 17)

					//this.size = this.pre_minimized_size;

					// pre maximised lt_pos as well????

					const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));

					//console.log('ltpos', ltpos);

					const dest_pos = [this.pre_minimized_pos[0] - ltpos[0], this.pre_minimized_pos[1] - ltpos[1]];


					await this.glide_to_pos(dest_pos);
					this.remove_class('minimized');
					this.dragable = true;

				}










			}

			

			



			//this.ta[7] = this.ta[7] + y_diff;

			//this.ta[7] = my_new_top



			// Assign a t3d frame sequence. ????
			//   (but does this assume and fps??)
			//   Maybe best to calculate upon the timing of each frame...?









			// this.dock(this.parent, 'bottom') ???

			//console.trace();
			//throw 'NYI';
		}
	}

	async maximize() {
		if (this.manager) {
			this.manager.maximize(this);
		} else {

			// Could check if it already is maximized.


			


			if (this.has_class('maximized')) {

				// transition: width 0.14s linear, height 0.14s linear; 

				//this.dom.el.style.transition = 'width 0.14s linear, height 0.14s linear;';


				// Unmaximize

				// Return to the size and position before it was maximized.

				// this.pre_maximized_size ??

				this.remove_class('maximized');
				// But the bcr includes borders....

				setTimeout(() => {
					this.size = [this.pre_maximized_size[0] - 2, this.pre_maximized_size[1] - 2];

				}, 17)
				
				//console.log('this.pre_maximized_pos', this.pre_maximized_pos);

				this.dragable = true;

				// Then animate translate it into that position.

				// And get the bcr of this to compute the difference(s)...?

				//const [tx, ty] = [this.ta[6], this.ta[7]];

				// The glide_to_pos function would be better if it itself made that correction.
				//.  Maybe best if it uses some kind of array subtraction functio too, its in lang.



				const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));

				//console.log('ltpos', ltpos);

				const dest_pos = [this.pre_maximized_pos[0] - ltpos[0], this.pre_maximized_pos[1] - ltpos[1]];

				await this.glide_to_pos(dest_pos);

				/*

				const my_new_left = this.pre_maximized_pos[0];
				const my_new_top = this.pre_maximized_pos[1];


				// The glide_to_pos function would help.

				// Control.ltpos could help - it's the pos that's specifically the css left and top values.


				const x_diff = my_new_left - tx;
				const y_diff = my_new_top - ty;
				//console.log('y_diff', y_diff);


				// Want to do it in something like 0.14s, 140ms, about 8 frames at 60fps.

				// Requesting animation frames seems like this may be the way to do it.

				const ms_total_animation_time = 140;
				// but can we assume time has moved along since the 0th?

				let animation_start;

				const start_tx = this.ta[6];
				const start_ty = this.ta[7];

				const process_frame = () => {
					
					requestAnimationFrame(timestamp => {
						if (!animation_start) {
							animation_start = timestamp;
							process_frame();
						} else {
							const time_since = timestamp - animation_start;

							//console.log('time_since', time_since);

							if (time_since < ms_total_animation_time) {
								const proportion_through = time_since / ms_total_animation_time;
								const proportional_x_diff = x_diff * proportion_through;
								const proportional_y_diff = y_diff * proportion_through;
								this.ta[6] = start_tx + proportional_x_diff;
								this.ta[7] = start_ty + proportional_y_diff;
								process_frame();
							} else {
								this.ta[6] = start_tx + x_diff;
								this.ta[7] = start_ty + y_diff;

								//this.dom.el.style.transition = '';
							}
						}
					})
				}

				process_frame();
				*/


			} else {

				const my_bcr = this.bcr();

				//console.log('my_bcr', my_bcr);

				const ltpos = [this.dom.attributes.style.left, this.dom.attributes.style.top].map(x => parseInt(x));

				//console.log('ltpos', ltpos);

				// Then reduce the target t3d position by that...?


				//this.pre_maximized_pos = my_bcr[0];
				//this.pre_maximized_size = my_bcr[2];
				//this.dom.el.style.transition = 'width 0.14s linear, height 0.14s linear;';

				if (this.has_class('minimized')) {
					this.remove_class('minimized');
					this.pre_maximized_pos = this.pre_minimized_pos;
					this.pre_maximized_size = this.pre_minimized_size;
				} else {
					this.pre_maximized_pos = my_bcr[0];
					this.pre_maximized_size = my_bcr[2];
				}

				
				this.add_class('maximized');



				this.dragable = false;
				const parent_bcr = this.parent.bcr();


				const parent_size = parent_bcr[2];

				// set own size...

				// Some adjustement for border...?


				// undet size even???

				setTimeout(() => {
					this.size = [parent_size[0] - 4, parent_size[1] - 4];

				}, 17)

				
				
				// And to move it to 0,0 over a few frames...

				const [tx, ty] = [this.ta[6], this.ta[7]];


				//const ltpos = [this.dom.attributes.style.left || 0, this.dom.attributes.style.top || 0].map(x => parseInt(x));

				//console.log('ltpos', ltpos);

				const dest_pos = [0 - ltpos[0], 0 - ltpos[1]];

				await this.glide_to_pos(dest_pos);

				//const my_new_left = ;
				//const my_new_top = -1 * ltpos[1];

				/*

				const x_diff = my_new_left - tx;
				const y_diff = my_new_top - ty;
				//console.log('y_diff', y_diff);


				// Want to do it in something like 0.14s, 140ms, about 8 frames at 60fps.

				// Requesting animation frames seems like this may be the way to do it.

				const ms_total_animation_time = 140;
				// but can we assume time has moved along since the 0th?

				let animation_start;

				const start_tx = this.ta[6];
				const start_ty = this.ta[7];

				const process_frame = () => {
					
					requestAnimationFrame(timestamp => {
						if (!animation_start) {
							animation_start = timestamp;
							process_frame();
						} else {
							const time_since = timestamp - animation_start;

							//console.log('time_since', time_since);

							if (time_since < ms_total_animation_time) {
								const proportion_through = time_since / ms_total_animation_time;
								const proportional_x_diff = x_diff * proportion_through;
								const proportional_y_diff = y_diff * proportion_through;
								this.ta[6] = start_tx + proportional_x_diff;
								this.ta[7] = start_ty + proportional_y_diff;
								process_frame();
							} else {
								this.ta[6] = start_tx + x_diff;
								this.ta[7] = start_ty + y_diff;

								//this.dom.el.style.transition = '';
							}
						}
					})
				}

				process_frame();
				*/

			}

			



			// set the size, it will transition to that size.

			// Also will set the position....

			// Needs to become the (inner) size of the parent.
			

			//console.trace();
			//throw 'NYI';
		}
	}

	close() {
		if (this.manager) {
			this.manager.close(this);
		} else {

			// A bug - strange it's not being removed the first time.

			this.remove();
			//this.remove();

			//console.trace();
			//throw 'NYI';
		}
	}

	/*
	'resizable'() {

		// Though maybe the resizable mixin is the right way to do this now.
		//   Or this gets set up through a non-mixin API?


		this.set('resizable', 'right-bottom');
		// This needs to be a property that gets sent to the client.
		//  Call them active_fields?
		this.set('dom.attributes.data-jsgui-fields', "{'resizable': 'right-bottom'}");
		// Want the resizable field to go to the client as well.
		// Want a convenient way of specifying that something gets sent to the client as a field / property.


	}
	*/


	'activate'() {
		if (!this.__active) {

			// Nicer if more things get activated automatically, such as drag handles get specified earlier on
			//   and then activated on the client.





			// May need to register Flexiboard in some way on the client.
            super.activate();

			const {title_bar, btn_minimize, btn_maximize, btn_close} = this;

			btn_close.on('click', () => {
				//console.log('click close');
				this.close();
			})
			btn_close.on('press', () => {
				//console.log('press close');
				this.close();
			})

			btn_maximize.on('click', () => {
				//console.log('click maximize');
				this.maximize();
			})
			btn_maximize.on('press', () => {
				//console.log('press maximize');
				this.maximize();
			})

			btn_minimize.on('click', () => {
				//console.log('click minimize');
				this.minimize();
			})
			btn_minimize.on('press', () => {
				//console.log('press minimize');
				this.minimize();
			})

			title_bar.on('dblclick', () => {
				//console.log('press minimize');

				this.maximize();
			})

			// dblclick

			// Client-side should assign parent controls when it activates.
			//   Not so sure why it's not.

			// Maybe a 'parent' getter could get it?
			//   Seems like some more ctrl activation work


			//console.log('this.parent', this.parent);
			//console.log('this._parent', this._parent);

			// Though maybe parents get assigned later?
			//   Maybe all parents should get assigned before controls get activated, so they can access the reference.

			// Parent does not seem to be available at this stage.
			//   Maybe should improve activation / pre-activation code for this.
			//   Pre-activate assign (known) ctrl parents may help a lot.
			//     It would get that info out of the structure of the HTML.



			this.on('mousedown', () => {
				this.bring_to_front_z();

				// May be more to do with focus?
				//.  Seems worth better integrating this if it's anything complex

			});



			dragable(this, {
                drag_mode: 'translate',
				handle: this.title_bar,
				bounds: this.parent
            });
            
            //console.log('dragable mixin applied to square box');
            this.dragable = true;


			resizable(this, {
				resize_mode: 'br_handle',
				bounds: [[120, 80], undefined],
				extent_bounds: this.parent
			});

			// Space checking could be a useful more general feature / mixin.

			// sibling_positions???

			// A better positioning and relationships API?
			//.  Worth considering what it should do, what API it provides, and how it does it.
			//.    A kind of position query system?
			//.    Caching / optimized info access?
			//.      Eg a large ta that contains lots of data for lots of controls
			//.        Maybe quite a lot of numbers for very specific things.

			// Seems like getting the 'very specific things' API right will help, and then using it to make a more general
			//.  purpose API.


			// Position relationships system...?
			//.  System to query positions of things in flexible way???
			//.    Does seem like very specific measurements and calculation on lower level, providing intuitive API
			//.      on higher level.


			/*
			const ifinder = new jsgui.Intersection_Finder({
				controls: 
			});
			*/

			// Maybe remake Intersection_Finder to be somewhat different.
			//.  Could make it more advanced overall.



			

			setInterval(() => {
				// Is there a space on the same row???

				// Still could make the code much more concise and idiomatic.
				//.  The Rectangle class really helps so far. Nice that it has a mostly compatable API with the old bcr() return value.



				//. 

				if (this.has_class('minimized')) {
					//console.log('this.top', this.top);


					// ctrl.rect.extend('left', 80).intersections(ctrl.every.sibling.rect).max('width');
					//. Some kind of syntax like this could get the value in one line of code, easy to understand.

					// ctrl.every would provide a 'collective' object of the thing that follows.

					// every.sibling getter returns Collective of control's siblings.

					// this.siblings.length???
					// this.siblings.filter(has_class) ???

					// More rectangle goemetry object and function usage will help to keep code more concise.



					const extended_bcr = this.bcr().extend('left', 80);
					//my_bcr;

					//console.log('extended_bcr[0]', extended_bcr[0]);
					//console.log('extended_bcr[2]', extended_bcr[2]);

					// then the bcrs of the minimized siblings....

					// need a .siblings getter.
					//.  seems like core Control functionality.

					//console.log('this.siblings.length', this.siblings.length);

					const minimized_siblings = this.siblings.filter(x => x.has_class('minimized'));

					// then the intersections between extended_bcr and minimized siblings...

					// Overlaps should be able to process / assess an array of controls.
					//.  Would look at their bcrs....

					const overlaps = extended_bcr.overlaps(minimized_siblings);

					//console.log('minimized_siblings.length', minimized_siblings.length);
					//console.log('overlaps', overlaps);

					// And which overlap has the maximum width?
					// What is the maximum width?

					if (overlaps && overlaps.length > 0) {

						// No overlaps...?
						//console.log('overlaps', overlaps);

						// Need to be more specific about where the overlap is....



						const max_overlap_width = Math.max(...overlaps.map(x => x.w))

						// May be failing to detect the overlap width properly.

						//console.log('max_overlap_width', max_overlap_width);

						// Then how far from the left edge of the container / parent is this control?


						// would look at the parent.bcr

						


						if (max_overlap_width <= 78) {

							const parent_bcr = this.parent.bcr();
							const parent_left = parent_bcr[0][0];
							const my_bcr = this.bcr();
							const my_left = my_bcr[0][0];

							const dist_from_parent_left = my_left - parent_left;
							//console.log('dist_from_parent_left', dist_from_parent_left);
							if (dist_from_parent_left > 2) {

								/*

								if (dist_from_parent_left > 8) {
									this.ta[6] = this.ta[6] - 8;
								} else {
									this.ta[6] = this.ta[6] - 1;
								}
								*/

								this.ta[6] = this.ta[6] - 1;

							}

						}

						

						
						// this.compare('left').to(this.parent)
						//.  producing some kind of property comparison object.




						// Then if it's a low number there is plenty of space.


						// Want to make really easy to read and write code, for example very idiomatic for how to move a control
						//. to the left, could express it in a few ways.

						// this.move('left', 2).

						// this.x -= 2.






					} else {

						const parent_bcr = this.parent.bcr();
						const parent_left = parent_bcr[0][0];
						const my_bcr = this.bcr();
						const my_left = my_bcr[0][0];

						const dist_from_parent_left = my_left - parent_left;
						//console.log('dist_from_parent_left', dist_from_parent_left);
						if (dist_from_parent_left > 2) {

							if (dist_from_parent_left > 8) {
								this.ta[6] = this.ta[6] - 8;
							} else {
								this.ta[6] = this.ta[6] - dist_from_parent_left;
							}

						}

					}

					


					// filter(this.siblings, x => x.has_class('minimized'))









					// 

					// this.siblings.bcr

					// this.is.any.sibling.bcr.within.band.extending.left.pixels(8).of(this.bcr)

					// Definitely want to improve the syntax for accessing this kind of information.
					// Defining the band / strip space to the left of a ctrl.
					//.  Then asking which controls are within that space.
					//     some kind of overlaps_bcr function.

					// More powerful access to position and size functions could help.
					//. Such as defining a bounds / shape that extends to the left of a control.
					//.  Then checking if any of that control's siblings are within that bounds.

					// .radar perhaps?

					// ctrl.virtual_surrounding_regions.left_band.detect(ctrl.siblings) perhaps???

					// Does look like some means of doing this with an idiomatic API would help a lot.
					// ctrl.detect(ctrl.siblings, 'within', 80, 'of', 'left-band') ???

					//. Both idiomatic and specific would help.

					// this.bcr().extend('left', 80).detect_intersections_with(this.siblings)
					//. using a set of more graphical primitives would help.

					// Does seem like it's worth connecting up to jsgui3-gfx-core.

					














					//this.top -= 4;

					// A relatively quick and simple scan for how much space it has to the left...?
					//. Only consider those that are in the same row?
					//   Or detect any that overlap a box to the left.


					// That works, don't want such jagged movement though.

					// It could detect the space to the left every 250ms.
					//.  Then it could smoothly move into place, possibly continuing to detect if the amount of space has increased.

					// Accelerate type commands could help express this type of code concisely and clearly.
					//.  Rapid sibling position checking and proximity detection would help.

					// ctrl.siblings.proximity ????

					// ctrl.sense_siblings_proximities?
					// ctrl.sense_closest_sibling_proximities ????

					// ctrl.adjacent_sibling_proximities ????
					//.  even is collision detection.
					//.    could see about using sectors or something like that when there are > 20 ??? siblings.
					

					// Deflinitely looks like a more in-depth way of reliably measuring these will help, and best to make it
					//.  a mixin so it can be used in a variety of controls.









					// Do want to make the higher level .pos, .left, .right code make use of both
					//. style left, top, translate3d x, y
					//. and possibly other types of positioning???
					//.   but maybe not this particular property.
					//.   have it represent both the left and top properties as well as translate3d.
					//.     translate3d will be used on a lower level in some / many cases in order to improve performance.




				}

				// eg this.left -= 4 ...

			}, 18);

			// and should set the property as well, that's how the mixins work.
			//   the mixins give it the capability.

			// Also use the 'resizable' mixin.
			//   That may need to be quite flexible and have code paths for a variety of cases.





			// And attach the onclick / on press events here.

			// Buttons get pressed.
			//   Press should be the right / default / available term to use for buttons, and button-like things.





			/*


			var context = this.context;



			var ctrl_relative = this.get('ctrl_relative');


			//console.log('activate Window');
			//var content = this.content;
			//console.log('content.length ' + content.length());


			var top_bar = this.title_bar;


			const old_broken_activation_code = () => {
				top_bar.drag_handle_to(this);
				// Need better get system, can either get as data_value or normal js value.


				var resizable = this.get('resizable');
				if (resizable && resizable.value) resizable = resizable.value();
				//console.log('resizable', resizable);
				if (resizable == 'right-bottom') {
					var resize_handle = new Control({
						'class': 'right-bottom resize-handle',
						'context': context
					});
					//resize_handle.resize_handle_to(this, 'right-bottom');
					// And inline style for where it is...
					//  need to know the size of the window.
					var size = this.size();
					//console.log('size', size);
					// for the moment resize handle height is 16px...
					//  We maybe measure this from CSS.
					var resize_handle_width = 16;
					var resize_handle_height = 16;
					var x = size[0] - resize_handle_width;
					var y = size[1] - resize_handle_height;
					resize_handle.style({
						'left': x + 'px',
						'top': y + 'px'
					});
				}

			}
			*/

		}
	}

	// Menu / menubar could be provided by a mixin / other Control / mix of them


	// Menubar would be below the titlebar.

	/*
	'menu'(menu_spec) {
		// Should build this on compose.

		// Should probably take a JS object that holds the menu structure.
		//  Possibly event handlers as well?
		//console.log('window menu menu_spec', menu_spec);
		var h_menu_spec = {
			'value': menu_spec,
			'context': this.context
		}
		//menu_spec.context = this.context;
		// the menu spec includes a menu value...
		//  it renders that into the necessary nested controls.
		var h_menu = new Horizontal_Menu(h_menu_spec);
		// then it needs to get inserted before the inner content.
		// Need content collection insert before.
		var ic = this.inner_control;
		var ic_parent = ic.parent;
		h_menu.insert_before(ic);
		// So needs to be able to access parent controls.
		h_menu.active();
		//throw 'stop;'
	}
	*/


}

Window.css = `

.relative {
	position: relative;
	
}

.window.no-transitions {
	transition: none !important; 
}



:root {
	--rhsqsize: 16px;
}


.resize-handle {
	width: var(--rhsqsize);
	height: var(--rhsqsize);
	/* background-color: #FF0000; */
	color: #CCCCCC;
	opacity: 0.45;
	position: absolute;
	line-height: var(--rhsqsize);
	font-size: var(--rhsqsize);
	user-select: none;
	transition: color 0.14s ease-in-out, opacity 0.14s ease-in-out;
}

.resize-handle:hover {
	color: #EFCF00;
	opacity: 0.5;

}
.resize-handle.resizing {
	color: #FFDF00;
	opacity: 1;

}

.bottom-right.resize-handle {
	right: 0;
	bottom: 0;
	cursor: nwse-resize;
	z-index: 10000001;

}



.window {
    position: absolute;
    border: 1px solid #CCCCCC;
	background-color: #F4F4F4;
	width: 360px;
	height: 360px;
	border-radius: 5px;
	transition: width 0.14s linear, height 0.14s linear; 

	/* 
	   this should be applied when needed and then removed, as it slows down window resizing with the resize handle.

	   perhaps could do calculation alongside the window position calculation too, not using css transition.
	*/

	overflow: hidden;
	-webkit-user-select: none;
	user-select: none;
}

.window .relative {
	height: inherit;
	overflow: hidden;
}

.window.minimized {
	height: 31px;
}

.window.minimized .bottom-right.resize-handle {
	display: none;
}

.window.maximized .bottom-right.resize-handle {
	display: none;
}

.window .title.bar {
    height: 31px;
    /* width: 100%; */
    /* padding-left: 8px; */
	background-color: #0D4F8B;
    color: #FFFFFF;
    font-size: 12px;
    line-height: 32px;
    text-indent: 4px;
    /* text-align: center; */
    /* background-color: #FFFFFF; */
    -webkit-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
	border-radius: 4px;
	-webkit-user-select: none;
	user-select: none;
	overflow: hidden;
	cursor: default;
}

.window .title.bar h2 {
	font-weight: 400;
	margin-left: 42px;
	float: left;
}

.window .title.bar > span {
    vertical-align: middle;
    line-height: 31px;
}

.window .title.bar .button > span {
	transform: scale(2);
    display: inline-block;
	line-height: 13px;
    height: 14px;
}


.window .title.bar .right {
    margin-right: 2px;
    margin-top: 2px;
    position: absolute;
    right: 0;
    top: 0;
	background-color: #0D4F8B;
	height: 29px;
}

.window .title.bar .button {
    width: 26px;
	height: 26px;
	line-height: 24px;
	font-size: 14px;
}

.window .title.bar .button + .button {
    margin-left: 3px;
}

.window .relative .inner {
	width: 100%;
	height: calc(100% - 31px);
}



`

module.exports = Window;
