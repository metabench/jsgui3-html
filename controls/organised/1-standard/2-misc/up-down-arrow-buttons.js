// object viewer
/*
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
};

define(["../../../../jsgui-html-enh"],
	function(jsgui) {
*/

var jsgui = require('../../../../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;
var group = jsgui.group;
var Button = require('../../0-core/0-basic/0-native-compositional/button');

class Up_Down_Arrow_Buttons extends Control {
    // Maybe should put this into a form, so that it does a form post.
    //  That could possibly be disabled.
    constructor(spec) {
        super(spec);
        var make = this.make;
        //this._super(spec);
        this.add_class('up-down-arrow-buttons');
        this.__type_name = 'up_down_arrow_buttons';
        // Render up button and down button.

        var btn_up = new Button({
          'context': this.context,
          'text': 'up'
        });
        var btn_down = new Button({
          'context': this.context,
          'text': 'down'
        });
        this.add(btn_up);
        this.add(btn_down);
        this.set('btn_up', btn_up);
        this.set('btn_down', btn_down);
        this.btn_up = btn_up;
        this.btn_down = btn_down;
        var that = this;
    }
    'activate'() {
        super.activate();
        var that = this;
        var btn_up = this.btn_up || this.get('btn_up');
        var btn_down = this.btn_down || this.get('btn_down');

        if (btn_up && typeof btn_up.on === 'function') {
            btn_up.on('click', function(e_click) {
              that.raise('up');
            });
        }

        if (btn_down && typeof btn_down.on === 'function') {
            btn_down.on('click', function(e_click) {
              that.raise('down');
            });
        }
    }
}
module.exports = Up_Down_Arrow_Buttons;
