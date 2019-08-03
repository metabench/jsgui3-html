

/*

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

let resizable = (ctrl) => {
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