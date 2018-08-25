// object editor

/*
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(["../../../../jsgui-html-enh", "../../viewer/basic/string"], 
	function(jsgui, String_Viewer) {
		*/
var jsgui = require('../../html-core/html-core');
var String_Viewer = require('../viewer/string');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

class String_Editor extends String_Viewer {

    // Bit of a problem with this...
    //  Input does not work when it keeps the same size as the text.
    //  Input needs to be at least slightly bigger than the text.
    //  So, I'm thinking that a new version could be made,
    //   where it displays the text in a span, but there is a hidden input, with focus, being edited.

    // Another possibility is to use contenteditable, but to restrict what gets allowed (maybe not so easy)
    //  Could use blur keyup paste events
    //   have it replace anything in the HTML that's a tag / formatting with plain text.
    //  That seems like a decent way of doing it. Would then be able to expand the size of the contenteditable
    //   to the size of its content? I think that happens anyway...


    // Maybe should put this into a form, so that it does a form post.
    //  That could possibly be disabled.

    // I think persisting the values in the editor, and having them actually do something, like run a CMS,
    // will be very helpful.




    constructor(spec) {
        super(spec);
        var make = this.make;
        var that = this;
        //this._super(spec);

        this.add_class('string-editor');
        this.__type_name = 'string_editor';

        var that = this;


    }
    'refresh_internal'() {
        //this._super();
        this.super.refresh_internal();

    }
    '_edit'() {
        var input = this.get('input');
        if (!input) {

            // we can position it absolutely over the existing element...
            // or hide the existing one?
            // I think it would be easier as a child of existing element.
            //  first child.

            var content = this.content;
            // superimpose it over the span.

            var span = this.get('span');
            // position of the span compared to this.

            var el = this.dom.el;

            var span_bcr = span.dom.el.getBoundingClientRect();
            var this_bcr = el.getBoundingClientRect();

            //console.log('span_bcr', span_bcr);
            //console.log('this_bcr', this_bcr);

            var span_x_offset = span_bcr.left - this_bcr.left;
            var w = span_bcr.width;

            var value = this.get('value');

            // new Resizing_Input
            //  That type of resizing input control will be a bit specialised.
            //  Will automatically keep in sync with the text inside it.
            //  In this case, there is a corresponding SPAN, so the text size could be easier to measure.
            // Perhaps we can set up a Resizing_Input with a corresponding span.
            //  If it does not have one, it uses a hidden span or div to do its calculations.

            input = new jsgui.input({
                'context': this._context
            });
            input.set('dom.attributes.value', value);
            //console.log('value', value);

            // could respond to input keydown?





            // That would be a convenient interface to get the current font size.
            //  It would maybe get it from an abstraction, or from the dom (maybe get computed style)
            var font_size = span.style('font-size');
            var font = span.style('font');
            //console.log('font_size', font_size);


            input.style({
                'position': 'absolute',
                'margin-left': span_x_offset + 'px',
                'width': w + 'px',
                'outline': '0',
                //'background-color': 'transparent',
                'border': '0px solid',
                //'font-size': font_size
                'font': font
            });


            content.insert(input, 0);
            var iel = input.dom.el;
            var spanel = span.dom.el;

            iel.focus();

            var sync_size = function(e) {
                //console.log('input keydown');

                // Perhaps need to see what the letter is, and add it to the span, then measure it
                //  Want there to be space when the item is put into the span.
                console.log('e', e);

                // Keeping a comfort margin within the object?
                //  It may be possible to work out the new width first, with a different means of updating
                //  the span.

                // Fairly sure we'll need a better way.
                //  Is better to make sure there is enough space in the input before putting the extra character
                //  in place.

                // It may be better to suppress adding the text to the input, put it into the span,
                //  measure the span, size the input, then put the text in.
                // Don't want the input getting to much text inside it.

                setTimeout(function() {
                    var scrollWidth = iel.scrollWidth;
                    console.log('scrollWidth', scrollWidth);

                    input.style({
                        'width': scrollWidth + 'px'
                    });
                }, 0);




            }

            //input.on('keydown', function(e_keydown) {
            //	sync_size(e_keydown);
            //});
            /*
            input.on('keyup', function(e_keydown) {
                sync_size();
            });

            */
            input.on('keypress', function(e_keydown) {
                sync_size();
            });
            // Then want to focus on the input and select all of its content.


            // Need accurate measuring of text width.
            //  I think we need a ResizingTextInput control here, want to encapsulate that tricky programming.


            //content.superimpose_over(span);
            // means set some properties.
            //  does not have to be in the same place...???
            //  may depend on measurements.

            console.log('has inserted input.');

            this.set('editing', true);
        }

    }
    'activate'() {

        this._super();
        var that = this;
        //this.on('blur')

        // it's for blurring the span.
        //  want to listen to the span's blur event.

        var span = this.get('span');
        span.on('blur', function(e_blur) {
            console.log('e_blur', e_blur);

            // Then it will be time to update the text value property?
            //  I think the text value would likely be a Data_Object, which could be connected in such
            //  a way that it gets persisted.


        });
        //span.

        //var span = this.get('span');
        //console.log('span', span);
        //console.log('this._', this._);
        //span.set('dom.attributes.contenteditable', 'true');


        var selected_on_mousedown;

        this.on('mousedown', function(e_down) {
            console.log('mousedown');
            var span_selected = this.get('span.selected');
            console.log('md span_selected', span_selected);

            selected_on_mousedown = span_selected;
        })

        this.on('click', function(e_click) {
            // Event before the click has been processed by other automatic processors?
            //  Want to know if it became selected in the click.
            //  If it was already selected.

            // Could use mousedown perhaps.
            //  May be better to find out what happened as the click took place?

            // Or on mousedown we see if its selected or not?

            //console.log('string editor click event');

            // Then if it is selected, and not in edit mode, put it into edit mode.

            //var mode = this.get('mode');
            var selected = that.get('selected');
            var editing = that.get('editing');

            //console.log('selected', selected);
            //console.log('editing', editing);

            if (selected &! editing) {
                console.log('selected and not editing');
            }

            // what about the content text being selected?

            var span_selected = this.get('span.selected');
            console.log('span_selected', span_selected);

            span.dom.el.setAttribute('contenteditable', true);

            //if (selected_on_mousedown &! editing) {
            //	console.log('was selected on mousedown, not currently editing');

            //	that.edit();
            //}

        });

        // Also want some code that prevents the single line content editable from having extra lines or html
        //  put in.

        // Will remove all line breaks...
        var elSpan = span.dom.el;
        span.on('keyup', function(e_keyup) {
            console.log('span keyup');

            // Adjust the span content to remove all line breaks (or other tags...)

            // I think looking for br elements and removing them will work...
            var cns = elSpan.childNodes;
            console.log('cns.length ' + cns.length);

            if (cns.length > 1) {
                // I think it should only be 1.

                /*
                each(cns, function(i, cn) {
                    //console.log('cn.tagName ' + cn.tagName);
                    //if (i > 0) {
                    //	elSpan.removeChild(cn);
                    //};
                    console.log('cn', cn);
                    console.log('cn.nodeType ' + cn.nodeType);

                    if (cn.nodeType == 3) {
                        // keep it...
                    } else {
                        // mark it for removal.
                        //  harder to do this in a loop, messes up the each.
                        //elSpan.removeChild(cn);
                    }
                });
                */

                for (var i = 0; i < cns.length; i++) {
                    var cn = cns[i];
                    if (cn.nodeType == 3) {
                        // keep it...
                    } else {
                        // mark it for removal.
                        //  harder to do this in a loop, messes up the each.
                        elSpan.removeChild(cn);
                        i--;
                    }
                }
                // Joining together any remaining text nodes may make sense. Not sure it is so important though.



                // But could join them back together again, rather than just removing it?
            }

        });

        // on activation, we can give this a new textinput.

    }
};
module.exports = String_Editor;

		//return String_Editor;
	//}
//);