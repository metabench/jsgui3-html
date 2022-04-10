var jsgui = require('./../../../../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, def = jsgui.is_defined;
var Control = jsgui.Control;

class Modal extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'modal';
        super(spec);
        this.add_class('modal');

    }
}

module.exports = Modal;