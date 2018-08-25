/*
    Makes a control appear in place, but with absolute position, at the top of the DOM.
    Outside the overflow of what was its container.

    Measure current position
    Offset / position within document
        Move it to that location with absolute positioning.

    Be able to return it to its original position.

    // .popped_up = true
    // Properties on init, not on activation.
    // .popup
    // Some content will be hidden until it shows through popup.

*/

// The page context could give a floating layer if asked.

const jsgui = require('../html-core/html-core');
const stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
const Control = jsgui.Control;

const context_ensure_popup_layer = (context) => {
    let ctrl_document = context.ctrl_document;
    // then body...

    // .child_controls
    // .content.length

    console.log('ctrl_document', ctrl_document);

    let body = context.map_controls['body_0'];

    if (!body.popup_layer) {
        body.popup_layer = new Control({
            'context': context,
            '__type_name': 'popup_layer'
        });
        body.popup_layer.add_class('popup-layer');
        //body.popup_layer.dom.attributes.style.position = 'absolute';

        body.add(body.popup_layer);
    }
    return body.popup_layer;
}


const popup = (ctrl) => {
    let context = ctrl.context;
    // ctrl_document
    ctrl.popup = () => {
        let popup_layer = context_ensure_popup_layer(context);
        let parent, placeholder;
        setTimeout(() => {

            // Esnure the page context / body has got 
            // make it transparent rather than see-through
            // put a placeholder control in its original location.
            // move the control over to the body.
            //  the body could have a popup layer.
            //  just a div ctrl where all / most of the popups go.

            // ensure the page context's popup layer
            // swap it in its current position with a placeholder, move the ctrl to the popup layer.

            


            // ctrl measure.
            // getBoundingClientRect
           

            

            // Need to pay attention to moving content from one place to another.

            // control.add(ctrl)
            //  what if ctrl already has a parent
            //  already is in the DOM.
            //   need to remove the control from its previous parent.
            //    (no dom update)
            

            placeholder = new Control({
                'context': context,
                '__type_name': 'placeholder'
            });

            parent = ctrl.parent;

            let absolute_container = new Control({
                'context': context
            })

            popup_layer.add(absolute_container);
            absolute_container.add(placeholder);




            parent.content.swap(ctrl, placeholder);
            //ctrl.remove_class('hidden');
            //ctrl.add_class('invisible');

            let bcr = placeholder.dom.el.getBoundingClientRect();

            
            console.log('bcr', bcr);
            


            // ctrl could have an absolute-container.
            //  then the control can display (more) normally.

            absolute_container.dom.attrs.style.position = 'absolute';
            absolute_container.dom.attrs.style.left = bcr.left + 'px';
            absolute_container.dom.attrs.style.top = bcr.top + 'px';



            //setTimeout(() => {
            //    ctrl.remove_class('hidden');
            //}, 1000);

            ctrl.remove_class('hidden');
            
            

        }, 0);



        // controls won't have 2 parents.

        // moving but keeping a placeholder...
        //  could change the reference in the parent element.

        const replace = () => {
            ctrl.add_class('hidden');
            parent.content.swap(placeholder, ctrl);
        }
        return replace;


    }

}

module.exports = popup;