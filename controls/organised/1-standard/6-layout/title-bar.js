var jsgui = require('./../../../../html-core/html-core');

const {stringify, each, tof, def, Control} = jsgui;

var fields = [
    ['text', String]
];


// describe available actions for the control's view model.
const view_model_spec = {
    name: 'title_bar',
    version: '0.0.1',
    type: 'control',
    fields: {
        number_of_lines: 1
    },
    actions: ['close', 'minimize', 'maximize', 'restore']

}

class Title_Bar extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'title_bar';

        super(spec, fields);

        if (!spec.el) {
            this.add_class('title-bar title bar');
            var span = new jsgui.span({
                'context': this.context,
                'text': this.text
            })
            this.add(span);
        }
        
    }
};
module.exports = Title_Bar;