const jsgui = require('../html-core/html-core');
const {Control, controls, tf, are_equal, each} = jsgui;
const {span} = controls;
const {prop, field} = require('obext');

// Use some mixins here...
//  Expandable
//  Inner space?

const Icon = require('./icon');

// May move the left_right creator function elsewhere.
// Control and multi-control creation functions.

// cfn seems like the right abbreviation.


// Always needs the context?
//  Hard to create controls without it.
//  context always as first property.

const c_left_right = (context, l_content, r_content) => {
    // Will retutn an array of 2 ctrls.

    const left = new Control({
        context: context,
        class: 'left'
    })
    left.add(l_content);
    const right = new Control({
        context: context,
        class: 'right'
    })
    right.add(r_content);
    const res = [left, right];
    return res;
}


// Integrated css / sass would be quite useful.
//  Can get the CSS generated from jsgui controls.

// Will be able to put css together from the (prototypes? classes ie constructors?) within jsgui.controls.

// item.css
// item.sass


// Would definitely be easier / neater (and like React) to define the CSS within the Control js file.
// Post browserify, pre babel...
//  That would be a decent time to remove these statements.



class Item extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'item';
        super(spec);
        this.add_class('item');

        // item can be given in the spec.
        //  then look at that object.
        const item = this.item = spec.item;
        const {context} = this;
        const compose = () => {
            const tfitem = tf(item);
            //console.log('tfitem', tfitem);

            if (tfitem === 'o') {
                // see what keys there are...
                //  use mfp?

                const item_keys = Object.keys(item).sort();
                //console.log('item_keys', item_keys);

                // icon and text?

                // Would be split into 2 parts.
                //  Icon, then the rest (text).

                if (item_keys.length === 2) {
                    if (are_equal(item_keys, ['icon', 'text'])) {
                        //console.log('item with icon and text');
                        
                        // then compose it this way.
                        //  probably want a left part and a right part.

                        //  a function to generate them?
                        // control / controls generator functions...

                        // Then a div / span with the text.
                        //  Div and p? p?

                        const main_content = new span({
                            context: context
                        });
                        main_content.add(item.text);

                        const lr = c_left_right(context, new Icon({
                            context: context,
                            key: item.icon,
                            size: [64, 64]
                        }), main_content);

                        console.log('lr');

                        // adding an array of content... should work!
                        //  TODO: Try it later.
                        each(lr, ctrl => {
                            this.add(ctrl);
                        })

                        // Multi-control creation functions
                        //  Saves encapsulating within a single control.


                        //left_right(new icon, div with text);
                        // would create two controls that cover left and right.
                        //  may be a useful way of creating and wrapping content.

                    }
                }
            }
        }
        if (!spec.el) {
            compose();
        }
    }
}

// CSS as JSON...?
// Could have css as css text.

// Compiling all the CSS together would make a lot of sense.
//  Rather than using basic.css so much. Styling is too separate and hard to find in there.

// The css resource can provide this.
//  Could even be inline within the main HTML file - may be better performance?

// overriding specific CSS properties?
//  maybe requires some kind of decent (simple?) model of css and its properties. would deal with a lot of strings.
//   use the same way that React builds the CSS?

// https://github.com/streamich/nano-css

// Maybe it can just join all the CSS together...
//  And in the right order, it could work quite well.

// It could just put together all of the css strings that get defined.
//  Even include it at the end of basic css?
//   or put it in controls.css
//    That would make sense. All css for all controls compiled into that.

// Item.sass|scss = ...


// Definitely seems like including CSS in the controls will get the whole thing to work better.
//  What about sending / not sending those defs to the client?
//   Some way to remove them in Babel / Browserify / Webpack?

// Would like them in the files, but not in the versions compiled and sent to the client.
//  A Babel transformer could recompile these files to remove the CSS definitions.
//   The CSS would be sent to the client as normal CSS anyway.

// Could create a copy of the whole directory structure pre-babel with the code removed?
//  Maybe look more into babel / typescript code removal options.
//  Or could remove all of this post-babel...
//   Would be able to find those pieces of code.
//   Closure compiler?
//    Gets much smaller js size than Uglify it seems.

// Removing the Class.css assignment statements from compiled js wouldnt be so hard I think.
//  But adds more complexity in the process. Makes programming it easier and less complex though.


// Making it so the CSS only applies within the object itsel - just use class names properly.

// putting it into controls.css makes sense.
// Could check all statements against the statements we have extracted to compile the CSS.

// Lets try this CSS file for the moment.
//  Seems like an easy way to set up the css that applies to the classes specified in the controls.

Item.css = `
.item .icon {
    width: 64px;
    height: 64px;
}
`; // Semicolon seems necessary. `;



const write_css_value = () => {
    
    Item.___css = `
    .item .icon {
        width: 64px;
        height: 64px;
    }
    `;

    Item.___css = {
        item: {
            width: '64px',
            height: '64px'
        }
    }
}


module.exports = Item;