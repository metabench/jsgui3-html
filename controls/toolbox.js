const jsgui = require('../html-core/html-core');
const {Control} = jsgui;
const {prop, field} = require('obext');

class Toolbox extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'toolbox';
        super(spec);
        this.add_class('toolbox');
    }
}

module.exports = Toolbox;