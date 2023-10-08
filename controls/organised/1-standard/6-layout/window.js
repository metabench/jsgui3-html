// Also want to make an MDI window system (Multiple Document Interface)
var jsgui = require('./../../../../html-core/html-core');
var Horizontal_Menu = require('./../../../organised/1-standard/5-ui/horizontal-menu');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var fields = {
	'title': String
};

const {dragable, resizable} = require('../../../../control_mixins/mx');
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

			
			const old_and_now_broken = () => {
				var div_relative = add(make(Control({'class': 'relative'})))
				var title_bar = div_relative.add(make(Control({'class': 'title bar'})));


				var dv_title = this.title;


				var title_h2 = make(jsgui.h2());
				title_bar.add(title_h2);

				if (dv_title) {
					var title = dv_title.value();
					title_h2.add(title);
				}
			}

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
			btn_minimize.add('▪');

			right_button_group.add(btn_minimize);

			const btn_maximize = new jsgui.controls.Button({
				context
			});


			// Seems like it gets escaped when we add it like this.
			// Maybe we don't want to process or escape HTML?
			//   Though checking it will in fact render as a text node may be important.
			//   Maybe could unescape & only (after the escaping).


			//btn_maximize.add('🗖')
			btn_maximize.add('⬛')

			right_button_group.add(btn_maximize);

			const btn_close = new jsgui.controls.Button({
				context
			});

			btn_close.add('❎')

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
			this.title_bar = title_bar;
			this.ctrl_relative = div_relative;


			this._ctrl_fields = this._ctrl_fields || {};

			this._ctrl_fields.ctrl_inner = ctrl_inner;
			this._ctrl_fields.title_bar = title_bar;
			this._ctrl_fields.ctrl_relative = div_relative;


			// And need to have it remember the buttons, so their press events can be handled.

			this._ctrl_fields.btn_minimize = btn_minimize;
			this._ctrl_fields.btn_maximize = btn_maximize;
			this._ctrl_fields.btn_close = btn_close;


			// use different quotes...
			//this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
		}
	}

	minimize() {
		if (this.manager) {
			this.manager.minimize(this);
		} else {

			// May separate code into different minimization modes.
			const my_bcr = this.bcr();

			if (!this.has_class('minimized')) {
				//this.dom.el.style.transition = 'width 0.14s linear, height 0.14s linear;';

				if (this.has_class('maximized')) {

					

					this.pre_minimized_pos = this.pre_maximized_pos;
					this.pre_minimized_size = this.pre_maximized_size;
					this.remove_class('maximized');

					//setTimeout(() => {
					//	this.dom.el.style.transition = '';
					//}, 144);


				} else {



					this.pre_minimized_pos = my_bcr[0];
					this.pre_minimized_size = my_bcr[2];
				}

				


				this.add_class('minimized');

				const minimized_height = 31;
				this.size = [280, minimized_height];

				



				

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

				const [tx, ty] = [this.ta[6], this.ta[7]];

				//console.log('[tx, ty]', [tx, ty]);

				//console.log('my_new_top', my_new_top);

				const my_new_left = 0;
				const my_new_top = parent_size[1] - minimized_height;

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

	maximize() {
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
				this.size = [this.pre_maximized_size[0] - 2, this.pre_maximized_size[1] - 2];

				//console.log('this.pre_maximized_pos', this.pre_maximized_pos);

				this.dragable = true;

				// Then animate translate it into that position.

				// And get the bcr of this to compute the difference(s)...?

				const [tx, ty] = [this.ta[6], this.ta[7]];
				const my_new_left = this.pre_maximized_pos[0];
				const my_new_top = this.pre_maximized_pos[1];

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


			} else {

				const my_bcr = this.bcr();
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

				this.size = [parent_size[0] - 4, parent_size[1] - 4];
				
				// And to move it to 0,0 over a few frames...

				const [tx, ty] = [this.ta[6], this.ta[7]];
				const my_new_left = 0;
				const my_new_top = 0;

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
			this.remove();

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

.resize-handle {
	width: 18px;
	height: 18px;
	/* background-color: #FF0000; */
	color: #CCCCCC;
	opacity: 0.8;
	position: absolute;
	line-height: 18px;
	font-size: 18px;
	user-select: none;
	transition: color 0.14s ease-in-out, opacity 0.14s ease-in-out;
}

.resize-handle:hover {
	color: #FFDF00;
	opacity: 1;

}
.bottom-right.resize-handle {
	right: 0;
	bottom: 0;
	cursor: nwse-resize;


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
	user-select: none;
	overflow: hidden;
}

.window .title.bar h2 {
	font-weight: 400;
	margin-left: 42px;
	float: left;
}

.window .title.bar span {
    vertical-align: middle;
    line-height: 31px;
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


`

module.exports = Window;
