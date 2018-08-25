var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
//var Control = jsgui.Control;
var Control =  require('../html-core/control-enh');

let util = require('../lang/util');

var v_subtract = util.v_subtract;
var v_add = util.v_add;

class Resize_Handle extends Control {

    // Though maybe tell it to be an array and it should be an array rather than a collection?
    //  Or a Data_Value that holds an array?

    constructor(spec, add, make) {
        spec = spec || {};
        spec.__type_name = spec.__type_name || 'resize_handle';
        super(spec);

        // Always active?

        //this.active();
        var that = this;
        var context = this.context;
        this.target = spec.target;
        this.position = spec.position;

        // left, top, right, bottom



        if (!spec.abstract && !spec.el) {
            this.add_class('resize-handle');

            //this.dom.attributes['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");
            this.dom.attributes['data-jsgui-ctrl-fields'] = stringify({
                'target': this.target._id()
            }).replace(/"/g, "'");
            

        }

    }
    'activate'() {

        if (!this.__active) {
            //console.log('activate Resize_Handle');
            super.activate();
            var that = this;
            var context = this.context;
            //console.log('context', context);
            var body = context.body();
            //console.log('body', body);
            var target = this.target;

            this.add_event_listener('mousedown', (e_mousedown) => {
                //console.log('e_mousedown', e_mousedown);

                var md_page_pos = [e_mousedown.pageX, e_mousedown.pageY];
                target.begin_resize();


                //console.log('md_page_pos', md_page_pos);

                // Add the body event listener.

                var fn_mousemove = (e_mousemove) => {
                    //console.log('e_mousemove', e_mousemove);

                    var mm_page_pos = [e_mousemove.pageX, e_mousemove.pageY];
                    //console.log('mm_page_pos', mm_page_pos);

                    var offset = v_subtract(mm_page_pos, md_page_pos);
                    //console.log('offset', offset);

                    target.mid_resize(offset);


    
                    // Add the body event listener.
    
    
                }
                var fn_mouseup = (e_mouseup) => {
                    console.log('e_mouseup', e_mouseup);

                    var mu_page_pos = [e_mouseup.pageX, e_mouseup.pageY];
                    //console.log('mm_page_pos', mm_page_pos);

                    var offset = v_subtract(mu_page_pos, md_page_pos);
                    console.log('mu offset', offset);

                    body.remove_event_listener('mousemove', fn_mousemove);
                    body.remove_event_listener('mouseup', fn_mouseup);

                    target.end_resize(offset);



    
                    // Add the body event listener.
    
    
                }

                body.add_event_listener('mousemove', fn_mousemove);
                body.add_event_listener('mouseup', fn_mouseup);


            });

        }
    }
}

module.exports = Resize_Handle;
