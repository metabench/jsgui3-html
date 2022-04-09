


const Data_Transform_Resource = require('./data-transform-resource');

// Could be the place for compilations...
// Or land-tools, later lang-mini.

// Multiple compilers...



class Compilation_Resource extends Data_Transform_Resource {
    constructor(spec) {

        // What types of code go in and out?

        super(spec);


        // Could hold multiple compilers.

        // Needs to direct to the correct compiler.

        // query_compiler_resources(input_lang, output_lang)
        




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

module.exports = Compilation_Resource;