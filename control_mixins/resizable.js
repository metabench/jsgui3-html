

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

Want really easy (top level) syntax for resizing and use of resize handles.

Movement of the resize handle (drag-like operation) causes window to resize, resize handle does not need to move explicitly through code if
it's positioned in the correct part of the window with existing CSS (or other position binding).

Keep this code relativel simple if possible.

Could have mode specifically for a BR fixed in the right place (part of / relative to the window) and respond to events on it.

Maybe a drag_like_events mixin???
Seems worth getting really explicit about what is being done and what is needed, where code can be common to various mixins
and pieces of functionality.

Drag_Like_Events or something like that drag_like_events mixin could provide the basis.
Handles mouse downs and gives the offset(s) from starting positions.

Does seem best to solve and use general case code for things like this.
Going by offset with the mousedown position seems like the right approach to take.

Maybe Drag_Offset_Events???
Really we want to know the offsets.

// want easy use of drag_like_events
//   does not need to be actually dragging (moving) something, could use drag_like_events to power resize handles.











*/

// Seem like quite a lot of different potential ways to do UI for resize.
//  This would be the place for them.

// This will take some cues from dragable, which is fairly comprehensive, while also providing a really simple API
//   to use it.

const Control = require('../html-core/control');

const drag_like_events = require('./drag_like_events');


// Will also allow resizing with a 'frame' surrounding it.

const resizable = (ctrl, options = {resize_mode: 'br_handle'}) => {

  // And specify a minimum size here?
  //  Or size bounds? Could just specify lower size bounds.

  // Bounds as array? Bounds as a ctrl?

  const {bounds} = options;

  // Default lower bounds of window size will help.


  let min_bound, max_bound;

  if (bounds) {
    [min_bound, max_bound] = bounds;
  }




  

  // resize_method?
  // method?

  // resize_mode?
  //   br_handle may be one of the simplest to get working.
  //   may be all we need for Window right now.


  // borders-all-directions perhaps?
  //   maybe better with thicker borders, or accept 1, 2 or 3 pixels more, inside the borders?

  const {resize_mode} = options;


  const start_action = ['touchstart', 'mousedown'];

  let initial_size;

  // will disable css transitions for the duration of the drag_like_action



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
        ctrl_br_resize_handle.activate();

        ctrl.ctrl_br_resize_handle = ctrl_br_resize_handle;

        drag_like_events(ctrl_br_resize_handle);
        ctrl_br_resize_handle.drag_like_events = true;

        let css_transition;

        ctrl_br_resize_handle.on('drag-like-action-start', () => {
          //console.log('e_drag_like_action_move', e_drag_like_action_move);
          //initial_size = ctrl.size;
          //css_transition = ctrl.dom.attributes.style.transition;

          // Looks like we need to bug fix this... not getting the transition style properly.
          //   Likely we want finer grain control over transitions.


          //console.log('1) css_transition', css_transition);

          initial_size = ctrl.bcr()[2];
          ctrl.add_class('no-transitions');
          //ctrl.dom.attributes.style.transition = 'none';

          // Improving the size property would help.
          //   Maybe could have and make use of a Control_Position_And_Size_Info_Helper ?




          //console.log('initial_size', initial_size);




        })


        ctrl_br_resize_handle.on('drag-like-action-move', e_drag_like_action_move => {
          //console.log('e_drag_like_action_move', e_drag_like_action_move);

          const {offset} = e_drag_like_action_move;

          // Then adjust the size....
          const new_size = [initial_size[0] + offset[0], initial_size[1] + offset[1]];
          //console.log('new_size', new_size);

          if (min_bound) {
            if (new_size[0] < min_bound[0]) new_size[0] = min_bound[0];
            if (new_size[1] < min_bound[1]) new_size[1] = min_bound[1];
          }

          ctrl.size = new_size;



        })

        ctrl_br_resize_handle.on('drag-like-action-end', e_drag_like_action_end => {
          //console.log('e_drag_like_action_move', e_drag_like_action_move);
          //ctrl.dom.attributes.style.transition = css_transition;

          ctrl.remove_class('no-transitions');

          //console.log('2) css_transition', css_transition);
          /*

          

          const {offset} = e_drag_like_action_move;

          // Then adjust the size....
          const new_size = [initial_size[0] + offset[0], initial_size[1] + offset[1]];
          //console.log('new_size', new_size);
          ctrl.size = new_size;

          */





        })

        

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