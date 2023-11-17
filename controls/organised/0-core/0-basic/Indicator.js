const jsgui = require('./../../../../html-core/html-core');
const {
    Control,
    parse_mount,
    parse,
    field
} = jsgui;

// Nice to make this flexible - make use of resources, svg, jsgui3-gfx....
//   Would be better to have this make use of other (lower level) functionality and to provide a nice API here.

// Would be nice to have low and medium level image features available to various controls, will be easy to put icons where they need to be
//   though this Icon control should make it easier in some ways.


class Indicator extends Control {



    constructor(spec) {
        spec.__type_name = spec.__type_name || 'indicator';
        //let size = spec.size = spec.size || [64, 64];
        super(spec);
        const {
            context
        } = this;
        this.add_class('indicator');
        
        if (!spec.el) {
            //compose();
        }
    }
    activate() {
        if (!this.__active) {
            super.activate();

            
        }
    }
}
module.exports = Indicator;