const Compiler_Resource = require("../compiler-resource");
// But don't want it here?
//  Or want an expanded html jsgui module?

// jsgui.tpl is powerful, being the declarative HTML processing entry point, but it's fairly compact too.
//  Could load the babel functions later on, not require them here.



class Compiler_Babel extends Compiler_Resource {
    constructor(spec) {

        // What types of code go in and out?

        super(spec);

    }

    // load_babel_module(mod_babel)

}

module.exports = Compiler_Babel;
