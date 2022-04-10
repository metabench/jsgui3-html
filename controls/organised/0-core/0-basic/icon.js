const jsgui = require('./../../../../html-core/html-core');

// text input?
// search button
//   an icon system would be of great help.
//    references to web resources for icons too.
//    making use of them from local CMS as well. CMS and icons could be integrated well.

const {Control, parse_mount, parse} = jsgui;

//const Button = require('./button');
//const Text_Input = require('./text-input');

// Worth having a 'text' property.
//  Use oext.

// Will support rapid lookups.
//  Results will not be part of this right now though.

// Worth having a property or field to represent the 'text'.
//  Possibly Data_Value will be of use.

// or ._ being an evented class that stores properties?
// specific change events for specific properties?

const {prop, field} = require('obext');

// The search bar having toolboxes would make sense.
//  For holding buttons etc.

// Fixed icon sizes?
//  

class Icon extends Control {
    constructor(spec) {
        // Capitalise type names?
        spec.__type_name = spec.__type_name || 'icon';
        let size = spec.size = spec.size || [64, 64];
        super(spec);

        const {context} = this;

        // Composed of the button and the text input.
        // Needs to itself raise an event / events from the search button being pressed.
        //  How to do that with parse_mount?
        //   Would get the created items back, and then be able in interact with them.
        this.add_class('icon');
        // a prop for the text being enough?
        /*
        prop(this, 'value', (e_change) => {
            console.log('text prop e_change', e_change);
        });
        */
        // 'name' field conflicting with parse-mount?
        //   change that to something jsgui-specific? name makes sense and works there though.
        field(this, 'key', spec.icon_key || spec.key);

        // an icon key / name

        const compose = () => {

            // find out the img src.
            const {key} = this;
            const imgurl = '/img/icons/' + key;
            // restrict the image size too...

            // Dealing with the size property. Should not treat it as a DOM attribute.
            //  A parse-mount exemption for 'size'? it'll get put in the spec.

            // and want to set the size here...
            //  hopefully will work within parse_mount.

            //  has a problem with JSON / obj / arr properties with parse_mount.
            //   Likely to need to do JSON parsing?
            //   parse-mount recieving some properties as JSON?
            //    more flexibility in setting properties such as size, giving it JSON?
            //     want this to be easy and flexible. Likely to require (more) string parsing.

            //parse_mount(`<img size="${JSON.stringify(size)}" name="img" src="${imgurl}"></img>`, this, jsgui.controls);

            // but its async for the moment :(

            // Got another rendering bug too :(
            //  Seems to be with styles.

            const img = new jsgui.img({context: context, size: [64, 64]});
            img.dom.attributes.src = imgurl;
            this.add(img);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.img = img;

            //  parse_mount with properties given as JSON not working right now.

            //(async() => {

                // parse image, not parse_mount.

                // CSS properties / jsgui styling properties should be easier to specify within the control spec.
                //  ctrl prototype .own_css_class(name, def)
                //  being able to define the css within the js file would help a lot, keeping the various concerns nearer each other.

                // and give dom attributes in constructor
                

                /*
                await parse_mount(`<img name="img" src="${imgurl}"></img>`, this, jsgui.controls);
                // Setting the size property messes it up...?

                // Seems not to be in style rendering after all - more like re-rendering.
                console.log('');
                console.log('pre set img size');
                this.img.size = size;
                console.log('post set image size');
                console.log('');
                */
            //})();

            
            

            //parse_mount(`<img name="img" src="${imgurl}" size="${this.size}"></img>`, this, jsgui.controls);

        }

        if (!spec.el) {
            compose();

            // Will itself contain an image.
            // Will make use of images within /img/icons path.

            // worth putting an image inside the icon container div.




            //const jsguiml = '<Text_Input name="input"></Text_Input><Button name="btn"></Button>';
            //jsgui.parse_mount(jsguiml, this, jsgui.controls);
        }
    }

    // onkeypress 

    activate() {
        if (!this.__active) {
            super.activate();

            const {img} = this;

            // Respond to key change.
            //  Change properties of the image control.

            // An new, sorthand way for defining control classes would be of use.
            //  As in write change responders etc.
            //  .ch...
            //  .ach...   active changes...

            this.on('change', ({name, value}) => {
                if (name === 'key') {
                    const imgurl = '/img/icons/' + value;
                    img.dom.attributes.src = imgurl;
                }
            })


            
        }
        
    }
}

module.exports = Icon;
