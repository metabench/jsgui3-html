
const jsgui = require('../../../../../html-core/html-core');
const {
    apply_focus_ring,
    apply_role
} = require('../../../../../control_mixins/a11y');

const {stringify, each, tof, Control} = jsgui;
//var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
//var Control = jsgui.Control;

// Maybe we can just use 'item'.


// Could make this API the same as tree node where possible.

class Menu_Node extends Control {
    // fields... text, value, type?
    //  type could specify some kind of validation, or also 'password'.

    // single field?

    // Actually having a different content?
    //  Or use inner_content.

    // Menu node having expanded and contracted states.

    // Menu Node has an image and some text, and a contrainer control for othe Menu nodes.
    //  Can be collapsed so that the internal items don't show

    //'fields': [
    //['text', String]


    //],

    //'fields': {
    //	'img_src': 'string',
    //	'text': 'string'
    //},

    //  and can have other fields possibly.


    constructor(spec, add, make) {
        // Wont fields have been set?

        super(spec);

        // Can take an image
        // Can take some text.
        //  That's all I'll have in the Menu node for now.
        this.__type_name = 'menu_node';
        this.dom.attributes.role = 'none';
        //var that = this;
        if (!this._abstract) {
            if (!spec.el) {
                this.add_class('menu-node');
                var spec_state = spec.state, state;

                var main_control = make(Control({ 'class': 'main' }));
                this.add(main_control);
                this.main_control = main_control;
                apply_role(main_control, 'menuitem');
                apply_focus_ring(main_control);
                main_control.dom.attributes.tabindex = '-1';
                //console.log('**** spec.img_src', spec.img_src);
                if (spec.img_src) {
                    //var img_src = this.get('img_src');
                }
                if (spec.text) {
                    //this.set('text', spec.text);
                    this.text = spec.text;

                    var span = make(jsgui.span({}));

                    //var text = this.get('text');
                    //console.log('text', text);
                    //console.log('tof text', tof(text));

                    span.add(spec.text);
                    main_control.add(span);
                }
                var menu = spec.menu;
                if (menu) {
                    this.set('menu', menu);
                }

                var inner_control = this.inner_control = make(Control({ 'class': 'inner hidden' }));
                inner_control.dom.attributes.role = 'menu';
                inner_control.dom.attributes.id = inner_control._id();
                this.add(inner_control);

                // Inner may not just be the title.

                //this.set('inner_control', inner_control);

                //inner_control.hide();

                //var inner_control_content = inner_control.content;
                // reference to a menu control.
                // maybe take 'value' here
                if (spec.value) {
                    // depending on the type of obj, work differently.
                    //  array of strings, just make those menu items.

                    var obj_menu = spec.value;
                    var t_obj_menu = tof(obj_menu);
                    console.log('t_obj_menu', t_obj_menu);

                    if (t_obj_menu == 'array') {
                        each(obj_menu, function(v) {
                            // make a new menu node with that as the value?

                            var tv = tof(v);
                            if (tv == 'string') {
                                // new node with text, no inner nodes.

                                var nested_menu_node = make(Menu_Node({
                                    'text': v,
                                    'menu': menu
                                }));
                                inner_control.add(nested_menu_node);
                            }
                        })
                    }
                }

                var ctrl_fields = {
                    'inner_control': inner_control._id(),
                    'main_control': main_control._id(),
                    'menu': spec.menu._id()
                }

                // use different quotes...

                this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));

                if (spec_state) {

                    // open and closed
                    if (spec_state == 'open' || spec_state == 'closed') {
                        state = this.set('state', spec_state);
                    } else {
                        throw 'spec.state expects "open" or "closed".';
                    }
                } else {
                    state = this.set('state', 'open');
                }
                this.update_aria_state();
            }
        }
    }
    'activate'() {

        if (!this.__active) {
            super.activate();

            var inner_control = this.inner_control;
            var main_control = this.main_control;
            var menu = this.menu;

            var that = this;

        }
    }
    update_aria_state() {
        const main_control = this.main_control;
        if (!main_control || !main_control.dom) return;
        const has_children = !!(this.inner_control && this.inner_control.content && this.inner_control.content._arr.length);
        if (has_children) {
            main_control.dom.attributes['aria-haspopup'] = 'true';
            main_control.dom.attributes['aria-controls'] = this.inner_control.dom.attributes.id;
            main_control.dom.attributes['aria-expanded'] = this.state === 'open' ? 'true' : 'false';
        } else {
            main_control.dom.attributes['aria-haspopup'] = 'false';
            main_control.dom.attributes['aria-expanded'] = 'false';
        }
    }
    'close_all'() {
        console.log('menu-node close_all');

        // need to do this recursively I think.
        //  could call this recursively on all nodes.
        //

        var inner_control = this.inner_control;

        inner_control.content.each(function(v, i) {
            //console.log('i', i);
            //console.log('v', v);
            var tn = v.__type_name;
            //console.log('tn', tn);
            if (tn == 'menu_node') {
                v.close_all();
            }
            //v.close_all();
        });

        inner_control.hide();
        // this.silent?
        this.set('state', 'closed', true); // silent
        this.update_aria_state();

    }
    'close'() {
        var inner_control = this.inner_control;
        inner_control.hide();
        this.set('state', 'closed', true);
        this.update_aria_state();
    }
    'open'() {
        var inner_control = this.inner_control;
        inner_control.show();
        this.set('state', 'open', true);
        this.update_aria_state();
    }


}
module.exports = Menu_Node;
