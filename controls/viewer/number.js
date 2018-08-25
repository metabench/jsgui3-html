
var jsgui = require('../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;


class Number_Viewer extends Control {

    // Maybe should put this into a form, so that it does a form post.
    //  That could possibly be disabled.


    constructor(spec) {
        super(spec);
        var make = this.make;
        //this._super(spec);

        this.add_class('number-viewer');
        this.__type_name = 'number_viewer';

        var that = this;

        var span = new jsgui.span({
            'context': this.context
        })

        if (is_defined(spec.value)) {


            //span.add(spec.value);
            this.set('value', spec.value);
        }

        this.add(span);
        this.set('span', span);
        this.refresh_internal();

        // After the span_content, there may be space for an editing tool, such as up and down buttons.


        /*

        this.add_event_listener('change', function(e) {
            that.refresh_internal();
        })
        */

        // when the object changes, we re-render.
        //  Not sure about re-rendering the whole thing though.

    }
    'refresh_internal'() {
        var value = this.get('value');

        var span = this.get('span');
        var span_content = span.content;

        var tval = tof(value);

        //console.log('tval', tval);

        //console.log('------------------------------------------');
        //console.log('');

        var context = this._context;
        var content = this.content;
        //console.log('**** String viewer content ' + content);

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
        //that.click(function(e) { that.action_select_only() })
        var hover_class = 'bg-light-yellow';

        // I think a selectable behaviour may be good.
        //  Could use .on / bind event
        //  and trigger / raise 'select' / 'deselect'

        // Can have event listeners that listen out for these various things.




        // this looks like a simple selectable behaviour.

        // Making it selectable... selectable using the lower level dom binding well...
        //  Changing how it binds the events to the DOM.

        // But in its own selection scope?
        //

        var span = this.get('span');
        var span_content = span.content;
        //console.log('span_content', span_content);
        //console.log('span_content.get(0)', span_content.get(0));

        var content_val = span_content.get(0).value();
        //console.log('content_val', content_val);
        //console.log('tof content_val', tof(content_val));

        var num = JSON.parse(content_val);
        //console.log('num', num);

        this.set('value', num);

        that.selectable();
        jsgui.hover_class(this, hover_class);
    }
};
module.exports = Number_Viewer;