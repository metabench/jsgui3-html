
// just display mixin perhaps?
//  so a text box could display as a small box with intro text and '...', then expand when pressed.

// to become 'view'.
//  Likely won't be used in this form?


// Or it is view.display
//  Display is a property of view.

// See about putting other Contol functionality within .view?
//   That would be more comprehensive than just having .view on top of the existing control.

// See about programming it both ways for the moment???

// Both the .model and .view properties seem important...
//  But creating a .view object maybe is not so easy.
//   Could make current control functions more mixin-like?

//   .content goes inside .view?
//     could keep .view as a relatively simple object for the moment?
//       could make HTML_Control_View which includes rendering.

// want to solve view modes, and get a good standard for the more complicated controls that can appear in different ways.
















// will also have 'model' mixin

// more advanced controls will use both the 'model' and 'view' mixins.
//  within the view section, they will specify / refer to views that are specifically for a data type as specified in the model.

//  controls not themselves specifying the model?
//    but the control is only handling the view.
//      data model could be defined just above the control though.

// .model and .view:
//   Could have a Ctrl_Html_Element_View for example.
//   Would be a possible abstraction where it did not need to be rendered to HTML (as an element) specifically.
//     For example, could be rendered into a canvas or similar.






// ctrl.display property.


// Calendar seems like the perfect control and type of control to make use of this.
// Could be full screen and interactive, or it could be a very simple component
//  displaying events over upcoming days. Could be a date picker, possibly. Possibly abstract together the similar code.

// Seems somewhat heavyweight, not sure it's right for many of the simpler controls.
//  However may help coordination... small components of a control acting in coordination with the rest? Though that should prob be top-down?

// Maybe I am creating too many classes that will be made for individual controls.

// Possibly display modes can keep functions which then get executed according to which display mode option is selected.
//  ie the composition functions still get called within their normal place and scope.

// Seems like quite a large and complicated mixin...
//  Also seems like a 'major version' feature.

// This seems a lot like branching - conveniently arranging the branching for how a Control gets displayed.

// Let's make this by making some examples work....
//  May be better to have server as a dev dependency? Though it gets tricky if part of that breaks. Could help develop UI components.

// Maybe jsgui3-html-core would help?
//  Then a module such as jsgui3-html-controls? Both loaded into jsgui3-html?
//  jsgui3-html-core-controls? jsgui3-html-mixins?

// For the moment let's keep it simpler as one lib.


// Load mx display onto the control.
//  Access the .display property and its subproperties.
//   displaye.size could be / return a Control_Display_Size object.
//    could be quite specialised. Could also be simple to use.
//  .display will link things together, and have the functionality provided in the mixin.
//   or at least the structure of the functionality in the mixin.
//   

//  model, view and controller mixins may make sense here.
//   view.context possibly???










let lang = require('lang-tools');


// and fnl code too?
const {Evented_Class, tof, each} = lang;

// Rendering-time checks?
//  Or will it be that items actually added to / removed from Controls?
//   Probably best to integrate simply and safely with HTML rendering.
//   Different rendering depending on options.
//   Don't want to introduce low level changes if not important / greatly beneficial.
//    Would be easy enough to make skip rendering flags.
//    Or multiple collections of controls.

// Composition-time checks
//  And would have recomposition when necessary.

// so the compose function would check the display mode
// maybe the activate function would
//  though it could check what is available.?
//   better to make the content controls depending on the display mode.
//   want to make them quick to specify / describe.







// ctrl.display.color could be solved too.
//  may reasonably assume it refers to the background color.


// And a Ctrl_Display_Mode class perhaps.

// Ctrl_Display_Modes
//   Makes sense for storing these modes.

// Size modes
// Other presentation modes (may influence size??)
//  eg whether its in editing mode or not.


// Any need for a Ctrl_Display_Mode class?
//  Maybe it would need to store / be a place to hook some more advanced functionality.

// eg a Ctrl_Display_Mode object called 'small'.



// Ctrl_Display_Mode_Category
//  Like interactivity or interactions, or size.
//  Or color / colors.

// display.colors.a_part_with_a_name

// display.modes.colors (light and dark modes)
// display.modes.languages possibly
//  makes a lot of sense to have that kind of breakdown of display modes.

// Could create a category object for each of them?

// Want only a moderate amount of effort / boilerplate code needed in the controls.
// Want it to be very easy to call upon the functionality when using the controls.



class Ctrl_Display_Mode_Category extends Evented_Class {
    constructor(spec = {}) {

        super(spec);

        // spec.name should exist.

        let name;
        if (spec.name) {
            name = spec.name;
        } else {
            throw 'Ctrl_Display_Mode_Category requires a name property';
        }
    }
}


class Ctrl_Display_Modes_Categories extends Evented_Class {
    constructor(spec = {}) {
        
        super(spec);

        // spec.names for example.
        const map_categories = {}, arr_categories = [];

        if (spec.names) {
            if (tof(spec.names) === 'array') {
                each(spec.names, name => {
                    const cat = new Ctrl_Display_Mode_Category({name: name});
                    map_categories[name] = cat;
                    arr_categories.push(cat);
                })
            } else {
                throw 'NYI';
            }
        }
        // then use proxy to get by index???

        // What to do with them though?



        // should probably have size, colors, interactivity, (other styling) / presentation.
    }
}



class Ctrl_Display_Modes extends Evented_Class {
    constructor(spec = {}) {
        super(spec);
        // the Ctrl? Maybe dont need it :)
        // small, medium, large for example.
        // Would have multiple display mode categories.

        // Layout or formatting.
        //  Some layout options would be unavailable with really small sizes.
        //  Then there may be only really basic layouts, such as image and text caption.
        //   Want to make the same Control able to render relatively differently and have that easy to express in code.

        // Such as in the constructor, putting the control together, easy programmatic definition.

        // Also 2022 now that it all (lower level) basically works, can more more onto syntactic sugar.

        const arr_category_names = ['size', 'layout', 'colors', 'interactivity'];
        // theme as well? could be within colors too.
        //  these will have control over lower level CSS properties.

        // then create Ctrl_Display_Modes_Category object...
        //  or a Categories object to handle them all?

        const categories = new Ctrl_Display_Modes_Categories({names: arr_category_names});

        Object.defineProperty(ctrl, 'categories', {
            get() {
                return categories;
            },
            set(value) {
                throw 'NYI';
            }
        });

        // .colors
        // .

        /*
            {size: [['small', {}]]}

        */


        // size modes
        // functionality modes (eg editable or not)


        // And will raise events upon change.
        //  May need to update control.

    }
}



class Ctrl_Display extends Evented_Class {
    // so it can have on change events.

    constructor(spec = {}) {
        super(spec);
        let ctrl;
        if (spec.ctrl) ctrl = spec.ctrl;

        // .modes seems to make sense as an object.
        //   but then there can be different mode categories

        // Setting this up with some reasonable defaults for the moment....



        const modes = new Ctrl_Display_Modes({});

        Object.defineProperty(this, 'modes', {
            get() {
                return modes;
            },
            set(value) {

                // determine the type of the value

                // ctrl_display.mode = ...

                //  a string - is it one word? does it match a name of the defined or default display types.

                // eg .display = 'mini', sets the display mode.

                throw 'NYI';
            }
        });





        // Which modes are supported?
        //  Not all modes would need to be supported. Probably never want a full screen checkbox, though maybe want a fullscreen control
        //  with a very prominent checkbox.


        // Could get the preferred aspect ratio or shape through here.

        // display.size property
        //  more to do with size mode?

        // mode properties for different things.

        // display.mode.size makes sense for some things.
        //  perhaps display size could shortcut to it.





        // May make sense to set up the various default display modes.
        //  Then could set them differently or intelligently calculate them for different controls.

        // tinyicon 12x12
        // icon 32x32
        // small 128x128
        // mid 512x512
        // large 1024x768
        // full ???


        // are some display modes (only?) available as popups?
        //  or would they be available through a 'details' section?

        // Want to allow for flexibility, and the default case creating easy flexibility.







    }

}


// display.size = ...
//  named preset, or [w, h].
//  or even z 3d if we want shaped with 3d rendering.
//   would be cool to render polygons within the dom.
//   treat DOM as flat planes in z-index order.


let display = (ctrl, opts = {}) => {

    // And send the control display options through?

    // Should set up the modes here too?
    //  mx display makes a lot of sense for the name of the functionality.

    if (ctrl.display) {
        throw 'ctrl already has .display property';
    } else {
        const ctrl_display = new Ctrl_Display({
            ctrl: ctrl
        });
        Object.defineProperty(ctrl, 'display', {
            get() {
                return ctrl_display;
            },
            set(value) {

                // determine the type of the value

                // ctrl_display.mode = ...

                //  a string - is it one word? does it match a name of the defined or default display types.

                // eg .display = 'mini', sets the display mode.

                throw 'NYI';
            }
        });


    }




    // setup display modes on the control
    //  could set up some intelligent default sizes...
    //   eg 'icon' size is 32x32.
    
    // May get given info about the wanted shapes for the display modes (where possible).

    // preferred_ratio perhaps?
    // preferred_shape.ratio perhaps?
    // preferred_shape.width = 100% perhaps?
    // perferred_shape.available_width = true perhaps.


    // Could have this set up display modes with default options to start with.

    // Want it to be easy to call on and use display mode functionality.
    //  May want nice (CSS) transitions between display modes.

    // ctrl.display_mode = 'small' for example.
    // ctrl.popup_active property?
    // ctrl.display.popup ???

    // .display property?
    // .display.mode property perhaps?

    // ctrl.display seems like it could make sense for handling higher level display properties.
    //  above the CSS and DOM attributes.

}

module.exports = display;