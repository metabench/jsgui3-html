/**
 * Created by James on 03/08/2014.
 */
/*

if (typeof define !== 'function') { var define = require('amdefine')(module) }


// Also want to make an MDI window system (Multiple Document Interface)

define(["../../jsgui-html", "./panel"],
    function(jsgui, Panel) {
*/

var jsgui = require('../html-core/html-core');
var Panel = require('./panel');

var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof,
    is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var group = jsgui.group;

// Extensions of inner frames within inner frames...
//  The relative frame container, which has an inner frame. Then if something extends that, it would be good for that
//  to have an inner_control of its own and seamlessly expose that one while using the one above that.

// Relate the inner_control more to that level of the control heirachy.
//	Then make it so that they are navigable in sequence.
//  Not for the moment though.
//  I'll just have the Window control contain a relative div.

//var Relative_Frame = Control.

/*

 'fields': {
 'layout_mode': String
 },
 */


var fields = {
    'layout_mode': String
};
class Multi_Layout_Mode extends Control {

    // could have a title field.
    //'fields': {
    //	'title': String
    //},




    // maybe add before make would be better. add will probably be used more.
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'multi_layout_mode';
        super(spec);

        // Don't register controls on the server?
        this.layout_mode = spec.layout_mode;


        // May be having probs with make
        var make = this.context.make;

        var context = this.context;

        //this.__type_name = 'multi_layout_mode';

        //this.add_class('multi-layout-mode');
        this.add_class('multi-layout-mode');

        if (!spec.el) {
            this.compose_mlm();

        }

    }
    'compose_mlm'() {
        var layout_mode = this.layout_mode;
        let context = this.context;

        if (layout_mode) {
            this.add_class(layout_mode);
        }

        //console.log('layout_mode', layout_mode);
        //console.log('tof layout_mode', tof(layout_mode));
        //  And the main content in the fluid area...
        //   That could be a useful default of fluid-fixed.

        var panel_title = new Panel({
            'context': context,
            'name': 'title'
        })
        panel_title.add_class('title');

        var panel_navigation = new Panel({
            'context': context,
            'name': 'navigation'
        })
        panel_navigation.add_class('navigation');

        var panel_main = new Panel({
            'context': context,
            'name': 'main'
        })
        panel_main.add_class('main');

        var panel_misc = new Panel({
            'context': context,
            'name': 'misc'
        })
        panel_misc.add_class('misc');

        if (layout_mode == 'fluid-fixed') {
            // make the html like in
            //  http://www.dynamicdrive.com/style/layouts/item/css-liquid-layout-22-fluid-fixed/

            // top
            // left_wrapper
            //  left
            // right
            // bottom
            /*
            var panel_top = new Panel({
                'context': context,
                'name': 'top'
            })
            panel_top.add_class('top');
            */

            var panel_top = new Panel({
                'context': context,
                'name': 'top'
            })
            panel_top.add_class('top');

            var panel_left_wrapper = new Panel({
                'context': context,
                'name': 'left-wrapper'
            })
            panel_left_wrapper.add_class('left-wrapper');

            var panel_left = new Panel({
                'context': context,
                'name': 'left'
            })
            panel_left.add_class('left');

            var panel_right = new Panel({
                'context': context,
                'name': 'right'
            })
            panel_right.add_class('right');

            var panel_bottom = new Panel({
                'context': context,
                'name': 'bottom'
            })
            panel_bottom.add_class('bottom');
            // will expose, top, left, right, bottom


            this.add(panel_top);
            this.add(panel_left_wrapper);
            panel_left_wrapper.add(panel_left);
            this.add(panel_right);
            this.add(panel_bottom);

            panel_top.add(panel_title);
            panel_bottom.add(panel_navigation);
            panel_left.add(panel_main);
            panel_right.add(panel_misc);


            // layout_mode

        } else if (layout_mode === 'tools-at-top') {

            this.add(panel_title);
            this.add(panel_navigation);
            this.add(panel_misc);
            this.add(panel_main);

        } else {


            this.add(panel_title);
            this.add(panel_navigation);
            this.add(panel_main);
            this.add(panel_misc);


        } 

        this.title = panel_title;
        this.nav = this.navigation = panel_navigation;
        this.main = panel_main;
        this.misc = panel_misc;

        this._ctrl_fields = this._ctrl_fields || {};

        console.log('pre add ctrl fields');
        
        Object.assign(this._ctrl_fields, {
            'title': panel_title,
            'nav': panel_navigation,
            'main': panel_main,
            'misc': panel_misc
        });
    }
    'activate'() {
        if (!this.__active) {
            super.activate();
        }
        // May need to register Flexiboard in some way on the client.
        
    }


    //,
    // Takes on the menu of the maximized window (for the moment).
    //  Could have its own menu possibly
    //'menu': function(menu_spec) {


    //}
}
module.exports = Multi_Layout_Mode;