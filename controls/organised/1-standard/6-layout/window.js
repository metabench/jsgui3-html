// Also want to make an MDI window system (Multiple Document Interface)
var jsgui = require('./../../../../html-core/html-core');
var Horizontal_Menu = require('./../../../organised/1-standard/5-ui/horizontal-menu');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var fields = {
	'title': String
};

const {dragable} = require('../../../../control_mixins/mx');

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

			// Minimise and maximise buttons.

			const title_h2 = new jsgui.controls.h2({
				context
			})
			title_bar.add(title_h2);
			

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

			this.remove_class('maximized');
			this.add_class('minimized');

			//console.trace();
			//throw 'NYI';
		}
	}

	maximize() {
		if (this.manager) {
			this.manager.maximize(this);
		} else {


			this.remove_class('minimized');
			this.add_class('maximized');
			

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

			const {btn_minimize, btn_maximize, btn_close} = this;

			btn_close.on('click', () => {
				console.log('click close');
				this.close();
			})
			btn_close.on('press', () => {
				console.log('press close');
				this.close();
			})

			btn_maximize.on('click', () => {
				console.log('click maximize');
				this.maximize();
			})
			btn_maximize.on('press', () => {
				console.log('press maximize');
				this.maximize();
			})

			btn_minimize.on('click', () => {
				console.log('click minimize');
				this.minimize();
			})
			btn_minimize.on('press', () => {
				console.log('press minimize');
				this.minimize();
			})

			dragable(this, {
                drag_mode: 'translate',
				handle: this.title_bar
            });
            
            //console.log('dragable mixin applied to square box');
            this.dragable = true;


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


.window {
    position: absolute;
    border: 1px solid #CCCCCC;
	background-color: #F4F4F4;
	width: 360px;
	height: 360px;
	border-radius: 5px;
}

.window.minimized {
	height: auto;
}

.window .title.bar {
    height: 31px;
    /* width: 100%; */
    /* padding-left: 8px; */
	background-color: #0D4F8B;
    color: #FFFFFF;
    font-size: 13px;
    line-height: 32px;
    text-indent: 4px;
    /* text-align: center; */
    /* background-color: #FFFFFF; */
    -webkit-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
    box-shadow: inset 0px -2px 2px -2px rgba(0, 0, 0, 0.75);
	border-radius: 4px;
	user-select: none;
}

.window .title.bar span {
    vertical-align: middle;
    line-height: 31px;
}


.window .title.bar .right {
    float: right;
	margin-right: 2px;
	margin-top: 2px;
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
