/**
 * Created by james on 18/12/2016.
 */

// Could accept only some specific types of data eg numeric.
//  May well want nicer / custom scrollbars.

// It will be a text box but the selection list appears below.
//  So we will use List with its own scrollbar.

// Should be made out of component JSGUI controls as necessary. both option control as well as text box.

// text-input
//  drop-down-list (menu)

// Have a need for combo box
//  Choosing a month
//  Clicking on the box should bring up the full range of options
//   Could involve scrolling
//    In this situation, we want something totally HTML styled.
//    Not making use of native Options.
//     Keep native scrollbars for the moment. More work on jsgui scrollbars would help though.


// Hold a list of items
//  Data rendered as controls
//  

// Interested in data coming in from the side

// Item_Selector could be a good alternative.
//  More varied than Combo_Box. Not a problem having non-combo-box functionality.
const jsgui = require('./../../../../html-core/html-core');

//var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;



// Basic but then could be swapped.


// Allow searching / choosing with text.


// This should also allow flexibility in terms of how the items are displayed???


// Just allow a single icon next to the items?

// A text input part
// A list part

// A control suite would make sense
//  But maybe as another module.

// This in its default form uses a kind of popup-resizing.
//  There would need to be room for it to be displayed. Possibly in a popup overlay layer.



// Needs more work. Would be nice to make really simple implementation that does what is needed, while allowing extensions.

// May need to see about server-side autocomplete.
//   Maybe use a data resource or an autocomplete data (provider) resource on the client.
//     Could implement such a data provider on the client with an array.

// Websockets would probably be the fastest way to transfer the autocomplete suggestions data.
//   Could even have that on a different server / in a different process.
//     For the moment though, want to be able to easily hook up server-side data to client-side resources.

// await get_suggestions(str)
//   could access the server quite easily with things set up right on the client.
//     Maybe want to assign the data source on the server, then the control on the client makes a request to the client-server resource
//       access component, gets that to request the answer from the server, sends it to the client.

// Though setting it up with a property could be nicer.
//   It may automatically create the server-side resource that holds that data / responds to (authenticated and authorised?) client side
//     requests with it.
//   Generating a random 256 bit token to send to the client, then for the client to send back with every request could help.
//     It would be a key that allows access to that resource.
//       And the server-side resource publisher would need the key from the client to access the resource.

// Do need to consider specific resources for specific clients.
//   User-based.

// Including user-based security into jsgui3 could be useful.



// A countries selector could be a good example, both for server and client side implementations.










class Combo_Box extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'combo_box';
        super(spec);

        // Has various items.
        // At the top is a control that either shows the item selected, or search text.

        // spec.items

        // create Item control from the spec items
        //  They will be displayed in a vertical list
        //  



        //  
        //  Could use Items_Container mixin.
        //  Open_Closed mixin

        // Run-time mixins for the moment.



        // Maybe contain a single main area and a drop-down box

    }

}

module.exports = Combo_Box;