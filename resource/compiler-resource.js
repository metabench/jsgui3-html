


const Data_Transform_Resource = require('./data-transform-resource');

// Could be the place for compilations...
// Or land-tools, later lang-mini.

// Multiple compilers...

// Could be accessible by function call, http api call, maybe path and fs based.

// Actual Lang / Language objects may be of use for setting up and correctly referencing / logging compilations.

// Language
// Version
// Language_Version


// Maybe building into lang-tools would be better.

// class Programming_Language
//  Could get into detailed definitions / descriptions.
//   Could wind up large and complex, a lot of info represented.

// Bringing some compilation to the client side in the longer run may be very helpful.
//  Or option of bringing compilation to client side.




// An instance of this could be compiler_babel.



class Compiler_Resource extends Data_Transform_Resource {
    constructor(spec) {

        // What types of code go in and out?

        // input.lang
        // output.lang


        super(spec);


    }


    // Which languages?
    //  String names
    //  Or objects describing the languages / formats....

    // With templating, will need to provide it with various values as well....
    //  A single values object should be OK.
    //   Or a promise / observable that will return them.






    // Could be either remote or local....
    // Call through web API, other means, or directly calling a function in the JS codebase.
    



}

module.exports = Compiler_Resource;