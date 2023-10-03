/**
 * Created by James on 16/09/2016.
 */
//"use strict";
const jsgui = require('lang-tools');
const Text_Node = require('./text-node');
const obext = require('obext');

const Page_Context = require('./page-context');
const Selection_Scope = require('./selection-scope');

const {parse_mount, parse} = require('./parse-mount');


const str_arr_mapify = jsgui.str_arr_mapify;
const get_a_sig = jsgui.get_a_sig;
const each = jsgui.each;


// Already using enhanced controls here.
//   Maybe could make those core and enhanced controls automatically use a default view.

const Control = jsgui.Control = require('./control-enh');


// Seems to make a problem with rendering or something....
//  Likely makes sense to have Control loaded though.

// Not sure where in composition / rendering it treats controls as normal objects / whatever else.
//  needs to be lower case c in its full name.
jsgui.load_type('control', 'C', item => (item instanceof Control));


const Evented_Class = jsgui.Evented_Class;
//jsgui.util = require('../lang/util');
//var Control = jsgui.Control = require('./control-enh');
var tof = jsgui.tof;
var map_Controls = jsgui.map_Controls = {};
const def = jsgui.is_defined;

const {
    prop
} = require('obext');

var core_extension = str_arr_mapify(function (tagName) {
    jsgui.controls[tagName] = jsgui[tagName] = class extends Control {
        constructor(spec) {
            let str;
            //console.log('typeof spec', typeof spec);
            if (typeof spec === 'string') {
                str = spec;
                spec = {
                    __type_name: tagName
                } 
            } else {

                if (typeof spec === 'object') {
                    spec.__type_name = tagName;
                }

                
            }

            
            super(spec);
            this.dom.tagName = tagName;
        }
    };
    jsgui[tagName].prototype._tag_name = tagName;
    map_Controls[tagName] = jsgui[tagName];
});

var core_extension_no_closing_tag = str_arr_mapify(function (tagName) {
    jsgui[tagName] = class extends Control {
        constructor(spec) {
            spec.__type_name = tagName;
            //spec.tagName = tagName;
            //console.log('core extension tagName ' + tagName);
            super(spec);
            //this.get('dom').set('tagName', tagName);
            this.dom.tagName = tagName;
            this.dom.noClosingTag = true;
            // dom.tagName?
        }
    };
    jsgui[tagName].prototype._tag_name = tagName;
    map_Controls[tagName] = jsgui[tagName];
});

var recursive_dom_iterate = function (el, callback) {
    //console.log('recursive_dom_iterate');
    callback(el);

    //console.log('tof(el.childNodes) ' + tof(el.childNodes));

    //each(el.childNodes, function(i, v) {
    //	console.log('v ' + v);
    //});

    //console.log('el.childNodes.length ' + el.childNodes.length);
    var cns = el.childNodes;
    //console.log('el', el);
    //console.log('cns.length', cns.length);
    for (var c = 0, l = cns.length; c < l; c++) {
        recursive_dom_iterate(cns[c], callback);
    }
}

var recursive_dom_iterate_depth = function (el, callback) {
    var cns = el.childNodes;
    for (var c = 0, l = cns.length; c < l; c++) {
        recursive_dom_iterate_depth(cns[c], callback);
    }
    callback(el);
}
// Want the document node to be linked with the context when activated (automatically)
// We find the html element control. That is the one that gets set to be the context's ctrl_document.

// Seems more like it activates the view?
//   The context is part of the view?

var activate = function (context) {
    // The context should already have the map of controls.

    console.log('jsgui html-core activate');
    //console.trace();
    // Not so sure we can have the client page context here - does it use resources?

    //ensure_Context_Menu_loaded(function(_Context_Menu) {
    //Context_Menu = _Context_Menu;

    console.log('jsgui.def_server_resources', jsgui.def_server_resources);
    // But making the calls uses client-side mechanisms.

    // Maybe do this in on activate on the client, in the client module.

    if (!context) {
        throw 'jsgui-html-enh activate(context) - need to supply context parameter.';
    }
    //context = context || new Page_Context();
    //console.log('jsgui-html-enh activate context', context);

    var map_controls = context.map_controls;

    var map_jsgui_els = {};
    var map_jsgui_types = {};
    //console.log('activate - beginning mapping');
    // Could put together the array of controls in order found.

    var arr_controls = [];
    // element registration
    // Recursive iteration where the innermost get called first....
    //  Would be useful here.
    // counting up the typed id numbers.

    var max_typed_ids = {};

    var id_before__ = function (id) {
        var pos1 = id.lastIndexOf('_');
        var res = id.substr(0, pos1);
        return res;
    }

    var num_after = function (id) {
        //var pos1 = id.lastIndexOf('_');
        //var res = parseInt(id.substr(pos1 + 1), 10);
        //return res;
        return parseInt(id.substr(id.lastIndexOf('_') + 1), 10);
    }
    
    let map_els = () => {
        recursive_dom_iterate(document, el => {

            //console.log('recursive_dom_iterate el', el);
            //console.log('tof el', tof(el));
            //console.log('2) el.tagName ' + el.tagName);
            const nt = el.nodeType;
            //console.log('nt ' + nt);

            // So for the 'HTML' tag name...
            //  We should make a control for the HTML document - or it should get activated.

            if (nt === 1) {
                const jsgui_id = el.getAttribute('data-jsgui-id');
                // Give the HTML document an ID?

                //console.log('jsgui_id ' + jsgui_id);
                if (jsgui_id) {
                    const ib = id_before__(jsgui_id), num = num_after(jsgui_id);
                    //console.log('num', num);
                    if (!def(max_typed_ids[ib])) {
                        max_typed_ids[ib] = num;
                    } else {
                        if (num > max_typed_ids[ib]) max_typed_ids[ib] = num;
                    }
                    //console.log('max_typed_ids', max_typed_ids);

                    map_jsgui_els[jsgui_id] = el;

                    var jsgui_type = el.getAttribute('data-jsgui-type');
                    //console.log('jsgui_type ' + jsgui_type);

                    // only if we have a type!
                    if (jsgui_type) map_jsgui_types[jsgui_id] = jsgui_type;
                    //console.log('jsgui_type ' + jsgui_type);
                }
            }
        });
    }
    map_els();
    context.set_max_ids(max_typed_ids);
    //console.log('map_jsgui_types', map_jsgui_types);
    each(map_jsgui_els, (el, jsgui_id) => {
        const l_tag_name = el.tagName.toLowerCase();
        if (jsgui_id) {
            var type = map_jsgui_types[jsgui_id];

            if (!map_controls[jsgui_id]) {
                // Only construct it if it does not exist already.

                var Cstr = context.map_Controls[type];
                //console.log('type', type);
                //console.log('!!Cstr', !!Cstr);

                if (Cstr) {
                    var ctrl = new Cstr({
                        'context': context,
                        '__type_name': type,
                        'id': jsgui_id,
                        'el': el
                    });
                    //console.log('ctrl._id()', ctrl._id());

                    arr_controls.push(ctrl);
                    //console.log('el.tagName', el.tagName);

                    if (l_tag_name === 'html') {
                        //console.log('el is document root el');
                        // The html element represents the root of a document.
                        //throw '2) stop';

                        context.ctrl_document = ctrl;
                    }
                    //console.log('1) jsgui_id', jsgui_id);

                    map_controls[jsgui_id] = ctrl;


                    //console.log('ctrl.dom.el', ctrl.dom.el);
                    //console.log('\n');
                    //console.log('ctrl._id()', ctrl._id());
                    //console.log('jsgui_id', jsgui_id);
                    //console.log('\n');
                } else {
                    console.log('Missing context.map_Controls for type ' + type + ', using generic Control');
                    // null type name?


                    var ctrl = new Control({
                        'context': context,
                        '__type_name': type,
                        'id': jsgui_id,
                        'el': el
                    });
                    //map_controls[jsgui_id] = ctrl;

                    //ctrl.__type_name = type;
                    arr_controls.push(ctrl);
                    //console.log('2) jsgui_id', jsgui_id);

                    map_controls[jsgui_id] = ctrl;
                }
            } else {
                //console.log('found control in map', jsgui_id);
                var ctrl = map_controls[jsgui_id];
                ctrl.dom.el = el;

                // Attach the DOM events.
                // This should only attach the DOM events that are already there.

                if (ctrl.attach_dom_events) ctrl.attach_dom_events();
            }

            //console.log('jsgui_id ' + jsgui_id);
            //console.log('ctrl._id() ' + ctrl._id());

        }
        // get the constructor from the id?
    });

    let child;
    recursive_dom_iterate_depth(document, (el) => {
        //console.log('el ', el);
        var nt = el.nodeType;
        //console.log('nt ' + nt);

        // And add text nodes?

        if (nt === 1) {
            var jsgui_id = el.getAttribute('data-jsgui-id');
            //console.log('* jsgui_id ' + jsgui_id);
            if (jsgui_id) {

                //console.log('map_controls', map_controls);

                const ctrl = map_controls[jsgui_id];
                ctrl.activate(ctrl.dom.el);

                if (child) {
                    child.parent = ctrl;
                }

                // Type name being set in initialization?


                //ctrl.__activating = false;
                //console.log('jsgui_type ' + jsgui_type);
                child = ctrl;
            }
        }
    });

    //console.log('code complete: jsgui html-core activate');


};

//var single_replacement;


/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

//'use strict'




// Seems like this won't be needed here as we have it in Text_Node.

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

/*
var matchHtmlRegExp = /["'&<>]/
function escapeHtml(string) {
    var str = '' + string
    var match = matchHtmlRegExp.exec(str)

    if (!match) {
        return str
    }

    var escape
    var html = ''
    var index = 0
    var lastIndex = 0

    for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
            case 34: // "
                escape = '&quot;'
                break
            case 38: // &
                escape = '&amp;'
                break
            case 39: // '
                escape = '&#39;'
                break
            case 60: // <
                escape = '&lt;'
                break
            case 62: // >
                escape = '&gt;'
                break
            default:
                continue
        }

        if (lastIndex !== index) {
            html += str.substring(lastIndex, index)
        }

        lastIndex = index + 1
        html += escape
    }

    return lastIndex !== index ?
        html + str.substring(lastIndex, index) :
        html
}
*/

jsgui.controls = jsgui.controls || {
    Control: Control
};


// Span should work through the underlying mechanisms.


// Extend / redo span here?
//  Need it to be very basic, but also have a text property and handle text changes.
//   Very often we want to say span.text and include a text node.

// Only a setter?
//  

// Make a getter and setter (prop) on the span.



// A new span file?

// A set of actually 'core' controls?
// Then basic controls?
// Then platform controls?
// Then other sets?

// Dealing with and using control-sets would be very helpful.

// Seems like controls like these have no model.
//   Could just have 'value'. That is the inner (text) content.

// Or the model could have a text value property.
//   That could be a way to have a span where its text can be changed / accessed more easily programatically.
//   Simple text or string editor.
//     But with extra restrictions... maybe could consider a number editor a base control?
//       But makes more sense to base it on a text or string editor.



jsgui.controls.span = jsgui.span = class span extends Control {
    constructor(spec) {
        spec.__type_name = 'span';
        super(spec);
        this.dom.tagName = 'span';
        spec = spec || {};

        //console.log('\nspec.text', spec.text);

        prop(this, 'text', spec.text || '');

        this.on('change', e_change => {
            //console.log('span e_change', e_change);
            //console.log('this.dom.el', this.dom.el);
            //console.log('this.content._arr', this.content._arr);

            // data_value within the content...
            //  should listen to changes in the data_value?

            const {name} = e_change;

            if (name === 'text') {

                //console.log('this.content', this.content);

                if (this.content._arr.length === 1) {
                    // a Data_Value?
    
                    // is it a Text_Node
    
                    if (this.content._arr[0] instanceof Text_Node) {
                        //console.log('is a Text_Node');
                        this.content._arr[0].text = e_change.value;
                    }
    
                    // Then when the data value changes, need to change the content.
                    //  Likely would be better as a Text_Node than Data_Value within the span.
                    //  Closer to HTML semantics.
    
                    // Could replace it with Text_Node here....
    
                    // Problem seems to be about activation putting in Data_Values.
                    //  Data_Value seems less important now.
    
    
    
                } else {

                    if (this.content._arr.length === 0) {

                    } else {
                        console.log('this.content._arr', this.content._arr);
                        console.trace();
                        throw 'NYI';
                    }

                    
                }
            }

            


        })

        //console.log('span control created');

        /*
        if (typeof spec.text !== 'undefined') {
            this._text = spec.text;
        } else {
            this._text = '';
        }
        */
        if (!spec.el) {
            this.compose_span();
        }

        //this.typeName = pr.typeName;
        //this.tagName = 'p';
    }
    
    compose_span() {

        // Maybe do it conventional and longwinded way
        // Then make convenience macros / fns / sugar around it.
        //console.log('this.text', this.text);

        if (this.text && this.text.length > 0) {
            //let tn = this.tn = this.Text_Node = this.text_node = new Text_Node({
                /*
            let tn = this.tn = this.text_node = new Text_Node({
                context: this.context,
                text: this.text
            });
            */


            // add function?
            // add(this, ...)

            this.add(this.tn = this.text_node = new Text_Node({
                context: this.context,
                text: this.text
            }));
        }
        
    }
    
}




// 2022 - Not really used much.
//   Can do this by having control.model only represent some type(s) of data
//     Then there can be 1 or more views, which are representations of those type(s) of data.
class String_Control extends Control {
    constructor(spec = {}) {
        spec.__type_name = 'string_control';
        super(spec);
        this.dom.tagName = undefined;
        spec = spec || {};

        //console.log('\nspec.text', spec.text);

        if (typeof spec.text !== 'undefined') {
            this._text = spec.text;
        } else {
            this._text = '';
        }
        if (!spec.el) {
            //this.compose_span();
        }

        //this.typeName = pr.typeName;
        //this.tagName = 'p';
    }
    //compose_span() {

    //}
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;

        this.raise('change', {
            'name': 'text',
            'value': value
        });

        // Should not really need to respond to such events anyway.
        //  principles of react etc.
    }

    all_html_render() {
        //console.log('all_html_render', this._text);
        return this._text;
    }

    activate() {
        // get the text node reference?

    }
}

jsgui.activate = activate;
//core_extension('html head title body div span h1 h2 h3 h4 h5 h6 label p a script button form img ul li audio video table tr td caption thead colgroup col');

// Making span work like default.

core_extension('html head title body div h1 h2 h3 h4 h5 h6 label p a script link button form textarea img ul li audio video table tr td caption thead colgroup col svg defs marker polygon line section code samp');
core_extension_no_closing_tag('link input meta');

// span?


// Activated so it can listen for a change in the text?

// Don't extend Control?
// Micro_Control?
// Attributeless_Control?
// Text_Only_Control?
// String_Control?
// String_Only_Control?

// Reimplement it from Data_Object?

// Would make sense to significantly reimplement text-node.
//  Hard for them to be active. They can't have IDs, hard to make them uniquely identifyable.

// Want to do more with / for editable and editing text.


// define the text property on a span.

// when it gets set, we change the text node content.


// Also parsing of text nodes?
//  May need to get these working when loading in the control's properties.

// Bringing obext will help with this.

// Looks like these could be made as View classes, and those go within Control...?
//   The control could be more powerful, allowing selection of different views.


class HTML_Document extends jsgui.Control {
    // no tag to render...
    //  but has dtd.
    constructor(spec = {}) {
        spec.tag_name = 'html';
        // but give it the tag_name 'html'.
        super(spec);
    }

    /*
    'render_dtd'() {
        return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n';
    }
    */
}

// .view.content
//   And the view gets activated too I suppose.
//   Start by just making an inactive view, but activatable. Then activate it.

// Can make control definitions more concise too.


class Blank_HTML_Document extends HTML_Document {
    constructor(spec = {}) {
        //console.log('super', typeof super);
        //console.log('Blank_HTML_Document');
        //HTML_Document.prototype.constructor.call(this, spec);
        super(spec);
        var context = this.context;
        //console.log('context ' + context);
        if (!spec.el) {
            //this.dom.tagName = 'html';
            var head = new jsgui.head({
                'context': context
            });
            this.content.add(head);
            var title = new jsgui.title({
                'context': context
            });
            head.content.add(title);
            var body = new jsgui.body({
                'context': context
            });
            this.content.add(body);
            // and have .head, .title, .body?
            // useful shortcuts?
            //this.set('head', head);
            //this.set('title', title);
            //this.set('body', body);

            // Should not have a function to retrieve them....?



            this.head = head;
            this.title = title;
            this.body = body;
            // Maybe connecting control fields?
            //this.connect_fields(['head', 'body', 'title']);
        }
        //console.log('content ' + stringify(this.content));
        //throw 'stop';
        //console.log('');
        //console.log('end init Blank_HTML_Document this._ ' + stringify(this._));
    }

    // But some other helper on the server???

    // get body() seems better.
    //   may change later.

    'body'() {
        //console.log('body sig', sig);
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig == '[]') {
            // find the body control.
            var content = this.content;
            //console.log('content', content);
            var body = content.get(1);
            //console.log('body', body);
            //throw 'stop';
            return body;
        }
    }
};

// Want a body function in other nodes, available throughout the document?


// Maybe call this Active_HTML_Document, move it to the server....



// Find 2d intersections
//  Useful for selection boxes

// Simple algorithm, for the moment. Won't use sectors.
//  Could be event driven, with events for when controls are found to be intersecting, or found not to be intersection.
//  .change event


class Intersection_Finder extends Evented_Class {
    constructor(spec) {
        // For all of the controls here.
        super(spec);
        // Needs to track the positions of the controls
        //  Or keep checking them frequently.
        let coords_ctrls;
        let update_ctrl_coords = () => {
            coords_ctrls = [];
            //console.log('spec.controls.length', spec.controls.length);
            each(spec.controls || spec.ctrls, ctrl => {
                //let [pos,, size] = ctrl.bcr();
                //console.log('bcr', ctrl.bcr());
                coords_ctrls.push([ctrl.bcr(), ctrl]);
            });
        }

        //console.log('coords_ctrls', coords_ctrls);
        let map_selected = new Map();
        let find_intersections = (coords) => {
            update_ctrl_coords();
            //console.log('coords[0]', coords[0]);
            //console.log('box coords', coords);
            let intersecting = [],
                newly_intersecting = [],
                previously_intersecting = [];;
            let [btl, bbr] = coords;
            //console.log('[btl, bbr]', [btl, bbr]);
            each(coords_ctrls, cc => {
                //console.log('cc', cc);

                let [ccoords, ctrl] = cc;
                let [cpos, cbr, csize] = ccoords;

                let intersect = (cpos[0] <= bbr[0] &&
                    btl[0] <= cbr[0] &&
                    cpos[1] <= bbr[1] &&
                    btl[1] <= cbr[1])

                //let y_intersect = ccoords[0][1] <= coords[1] && coords[1] <= ccoords[1][1];

                //console.log('intersect', intersect);
                //console.log('y_intersect', y_intersect);

                if (intersect) {
                    // newly intersecting
                    //console.log('map_selected.get(ctrl)', map_selected.get(ctrl));
                    if (map_selected.get(ctrl) !== true) {
                        newly_intersecting.push(ctrl);
                        map_selected.set(ctrl, true);
                    }
                    intersecting.push(ctrl);
                    //map_selected.set(ctrl, true);
                } else {
                    if (map_selected.get(ctrl) === true) {
                        previously_intersecting.push(ctrl);
                        map_selected.set(ctrl, false);
                    }
                }
            });
            return [intersecting, newly_intersecting, previously_intersecting];
        }
        // want a rectify function too.
        //  2 functions there, with the previous not being onchange, but prechange.

        prop(this, 'coords', (transform_coords) => {
            // some reversals....
            //console.log('transform_coords', transform_coords);
            if (transform_coords[0][1] > transform_coords[1][1]) {
                //console.log('yswap');
                let [a, b] = transform_coords;
                //transform_coords[0] = b; transform_coords[1] = a;
                transform_coords = [b, a];
            }

            if (transform_coords[0][0] > transform_coords[1][0]) {
                //console.log('xswap');
                let a = transform_coords[1][0];
                transform_coords[1][0] = transform_coords[0][0];
                transform_coords[0][0] = a;
            }
            //console.log('transform_coords', transform_coords);
            return transform_coords;
        }, (change_coords) => {
            //console.log('change_coords', change_coords);
            //let [i, new_i, un_i] = find_intersections(change_coords[0]);
            // if the intersections have changed...
            let intersections = find_intersections(change_coords[0]);
            //console.log('intersections', intersections);
            if (intersections[1].length > 0 || intersections[2].length > 0) {
                this.raise('change', {
                    'name': 'intersections',
                    'value': intersections
                });
            }
            /*
            console.log('i.length', i.length);
            // and to say they are unselected too...
            //  
            each(i, i => {
                if (map_selected.get(i) === true) {
                } else {
                    map_selected.set(i, true);

                }
            });
            */
        });
        // intersection box
        this.find_intersections = find_intersections;
    }
}

class Relative extends Control {
    constructor(spec) {
        spec.class = 'relative';
        super(spec);
    }
}

jsgui.Relative = Relative;
jsgui.String_Control = jsgui.controls.String_Control = String_Control;


//jsgui.Text_Node = Text_Node;


jsgui.HTML_Document = HTML_Document;
jsgui.Blank_HTML_Document = Blank_HTML_Document;
//jsgui.Client_HTML_Document = Client_HTML_Document;

// Active_Client_HTML_Document probably should come...
// Or really Active_HTML_Document (gets rendered on the server, includes the jsgui and specific client js)




jsgui.Text_Node = jsgui.controls.Text_Node = jsgui.Text_Node = jsgui.controls.Text_Node = Text_Node;

// References much better at top.


jsgui.Page_Context = Page_Context;
jsgui.Selection_Scope = Selection_Scope
jsgui.Intersection_Finder = Intersection_Finder;

// And load in all or a bunch of the controls.
// Can we require all of the controls at once, and then merge them?
jsgui.parse_mount = parse_mount;
jsgui.parse = parse;
//jsgui.Toggle_Button =

module.exports = jsgui;