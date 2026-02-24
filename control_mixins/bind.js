/**
 * Bind mixin — positional / layout binding between controls.
 *
 * Allows a control to be bound to a location or another control
 * so its position and/or size update reactively when the reference
 * changes (e.g. on window resize).
 *
 * **Status:** work-in-progress; the public API may change.
 *
 * @module control_mixins/bind
 */

const bind = (ctrl, location) => {

    // Sets position / size of ctrl relative to another / location.
    //  Now able to monitor the positions of things better.
    //   still need to respond to a redim event?

    //  redim being a change in dimensions.
    //   if the amount of space available for a control changes, then we need to be able to
    


    // Binds the ctrl into free space?

    // Parsing of location binding...?
    //  Could make an OO object out if it.

    // Possibly other styling / positioning functionality should be made as mixins too.

    // Binding a control to another control or distance / space will require listening for when the control size or dimensions change.
    //  Do this with requestAnimationFrame?
    //  Or responding to events in a chain that cause its resizing?
    //   ie will a control know when it's being resized / its size changes due to css?

    // Could check its size after a window resize event.
    //  That would be one time to recalculate / recalibrate sizing.

    // Bound control will likely be in a body-relative absolute layer.

    // Control being within an overlay / modal layer / background layer...
    // May need to get info about the control's parent.

    // Functional binding?

    // More work on resize events and notifications.
    //  Worth making an example / demo for this.

    // resize_events mixin?
    // dims_events mixin?

    // more in the Page_Context to do with resize events?
    //  context.on resize could happen when the window resizes.

    // https://www.npmjs.com/package/resize-observer-polyfill

    // Possibly do a little lower level framework work on repositioning and resizing.
    //  Get some things working an then reach for tools & polyfills.

    // Spatial binding will make use of noticing and monitoring changes to dimensions.

    // Possibly some will only happen after screen resize.
    //  Not so sure about frequent getBoundingClientRect regarding performance.
    
    // Possibly having a smaller set of components to actively check.
    //  Check for changed values being given to the system.

    















}

module.exports = bind;