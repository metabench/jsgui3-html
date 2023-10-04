

/*


1. That it can be resized
2. How it can be resized

There may be a resizable type interface or set of expectations and functionality, but then different UIs to do the resizing.


autosizing perhaps
smart-size?
size-options?
size?
sizes?
display-modes? and sizes?
navigation modes too?
  eg popup-explore interface
need to separate the abstractions of the content itself and the structure its displayed in
  eg could show a tree as a tree component of through navigation of (virtual) pages.

maybe should have size-binding?
bind-size mixin.

bind mixin?
  binds one control to another
  so the size can depend on the amount of space it has available.
  defining the amount of size available or finding it in some cases 
    change those cases so the size gets bound rather than set just once.

bind-dimensions?

UI to enable the user to resize it, by integrating handles?
// Will use dimension and overlays in various ways to facilitate this.
//  Maybe work on this a bit later.

ui-resizable? or assumed.
*/

// Seem like quite a lot of different potential ways to do UI for resize.
//  This would be the place for them.

// This will take some cues from dragable, which is fairly comprehensive, while also providing a really simple API
//   to use it.

const Control = require('../html-core/control');

const resizable = (ctrl, options = {resize_mode: 'br_handle'}) => {

  // resize_method?
  // method?

  // resize_mode?
  //   br_handle may be one of the simplest to get working.
  //   may be all we need for Window right now.


  // borders-all-directions perhaps?
  //   maybe better with thicker borders, or accept 1, 2 or 3 pixels more, inside the borders?

  const {resize_mode} = options;


  const start_action = ['touchstart', 'mousedown'];

  


  if (resize_mode === 'br_handle') {

    if (ctrl.ctrl_relative) {

      // Check if it's already installed???

      if (ctrl.ctrl_br_resize_handle) {
        console.log('ctrl.ctrl_br_resize_handle already detected');
      } else {
        const ctrl_br_resize_handle = new Control({
          context: ctrl.context
        })
        ctrl_br_resize_handle.add_class('bottom-right');
        ctrl_br_resize_handle.add_class('resize-handle');
        ctrl_br_resize_handle.add('◢');

        // But does it have one already???
        ctrl.ctrl_relative.add(ctrl_br_resize_handle);
        ctrl.ctrl_br_resize_handle = ctrl_br_resize_handle;
      }


      // Create a new resize handle control in there.

      



    } else {
      console.trace();
      throw 'NYI';
    }

  }







    // Respond to touch events.

    // generally want a 'press' event too.
    //  Could be a click, or a touch press.

    // Could raise a press or click event.
    //  Press could cover click and touch.
    //  Click could specifically be a mouse event to make least confusion / ambiguity long term.
    // Could have an emulate_clicks option.
    // Setting deletable to true or false...
    
    /*
    console.log('ctrl.delete', ctrl.delete);

    ctrl.delete = () => {

        // remove it from the DOM
        ctrl.remove();

        // raise a delete event
        
        ctrl.raise('delete');
        // Delete corresponding objects too.

    }
    */

    // Controls already have resize functionaliy
    //  Possibly move resizing here.

    // Should do more setting other controls as resize handles.

    
}

module.exports = resizable;