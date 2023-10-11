

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

const {tof} = require('lang-tools');


// Will also allow resizing with a 'frame' surrounding it.

const resizable = (ctrl, options = {resize_mode: 'br_handle'}) => {


  const extra_margin = options.extra_margin !== undefined ? options.extra_margin : 2;
  // And specify a minimum size here?
  //  Or size bounds? Could just specify lower size bounds.

  // Bounds as array? Bounds as a ctrl?


  // Size bounds as well as extent bounds.


  const {bounds} = options;
  const extent_bounds = options.extent_bounds || options.extent;

  const t_extent_bounds = tof(extent_bounds);

  // Default lower bounds of window size will help.


  let min_bound, max_bound;

  if (bounds) {
    [min_bound, max_bound] = bounds;
  }



  // And secondary bounds too...?
  // Such as not resizing so that it would extend (down or right or wherever) outside the bounds of a ctrl.
  //   Probably its container control

  // That is more like 'extent bounds' rather than size bounds.

  // Extend bounds being the a control.




  // if (extent_bounds instanceOf Control)....

  // ???

  // tof would be more foolproof for typing.
  

  // resize_method?
  // method?

  // resize_mode?
  //   br_handle may be one of the simplest to get working.
  //   may be all we need for Window right now.


  // borders-all-directions perhaps?
  //   maybe better with thicker borders, or accept 1, 2 or 3 pixels more, inside the borders?

  const {resize_mode} = options;


  const start_action = ['touchstart', 'mousedown'];

  let initial_size, initial_measured_pos_within_ctrl_bounds;

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

          // Would be worth setting the size bounds here...?

          //   Doubt it would be a significant perf hit to measure and calculate it on move...?
          //     Though that could be an option.

          //console.log('t_extent_bounds', t_extent_bounds);
          initial_size = ctrl.bcr()[2];

          // initial_ctrl_bounds_size ???
          // initial_measured_pos_within_ctrl_bounds perhaps....?




          if (t_extent_bounds === 'control') {
            // Determine what size the window is starting at....

            const ctrl_bcr = ctrl.bcr();
            const extent_bounds_ctrl_bcr = extent_bounds.bcr();

            const pos_offset = [ctrl_bcr[0][0] - extent_bounds_ctrl_bcr[0][0], ctrl_bcr[0][1] - extent_bounds_ctrl_bcr[0][1]];
            //console.log('pos_offset', pos_offset);

            // Then will need to work out how much remaining size is available....?

            //const ctrl_measured_size = ctrl_bcr[2];
            const extent_bounds_ctrl_measured_size = extent_bounds_ctrl_bcr[2];

            // work out amount of space remaining within the extent_bounds_ctrl

            //console.log('ctrl_measured_size', ctrl_measured_size);
            //console.log('extent_bounds_ctrl_measured_size', extent_bounds_ctrl_measured_size);

            

            const bounded_max_size = [extent_bounds_ctrl_measured_size[0] - pos_offset[0] - extra_margin, extent_bounds_ctrl_measured_size[1] - pos_offset[1] - extra_margin];

            //console.log('bounded_max_size', bounded_max_size);

            max_bound = bounded_max_size;


          }



          
          ctrl.add_class('no-transitions');
          ctrl_br_resize_handle.add_class('resizing');
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
          if (max_bound) {
            if (new_size[0] > max_bound[0]) new_size[0] = max_bound[0];
            if (new_size[1] > max_bound[1]) new_size[1] = max_bound[1];
          }

          //if (t_extent_bounds === 'control') {
            // Check it's not extending past the extent_bounds bcr.
            //   Need to take translation into account too???




            
          //}

          ctrl.size = new_size;



        })

        ctrl_br_resize_handle.on('drag-like-action-end', e_drag_like_action_end => {
          //console.log('e_drag_like_action_move', e_drag_like_action_move);
          //ctrl.dom.attributes.style.transition = css_transition;
          ctrl_br_resize_handle.remove_class('resizing');
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