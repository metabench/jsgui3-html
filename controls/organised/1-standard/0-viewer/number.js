
var jsgui = require('../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;


// Maybe viewers and editors will not be so separated.
//   

class Number_Viewer extends Control {
    constructor(spec) {
        super(spec);
        var make = this.make;
        this.add_class('number-viewer');
        this.__type_name = 'number_viewer';
        var span = new jsgui.span({
            'context': this.context
        })
        if (is_defined(spec.value)) {
            this.set('value', spec.value);
        }
        this.add(span);
        this.set('span', span);
        this.refresh_internal();
    }
    'refresh_internal'() {
        var value = this.get('value');
        var span = this.get('span');
        var span_content = span.content;
        var tval = tof(value);
        var context = this._context;
        var content = this.content;

        if (tval == 'data_value') {
            span_content.clear();
            span_content.push(value.value());
        }
        if (tval == 'number') {
            span_content.clear();
            span_content.push(value);
        }
    }
    'activate'() {
        this._super();
        var that = this;
        var hover_class = 'bg-light-yellow';
        var span = this.get('span');
        var span_content = span.content;
        var content_val = span_content.get(0).value();
        var num = JSON.parse(content_val);
        that.set('value', num);
        that.selectable();
        jsgui.hover_class(that, hover_class);
    }
};
module.exports = Number_Viewer;