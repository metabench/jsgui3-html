const jsgui = require('lang-tools');
const { patch_lang_tools } = require('./lang_tools_compat');
patch_lang_tools();
const Text_Node = require('./text-node');
const Page_Context = require('./page-context');
const Selection_Scope = require('./selection-scope');
const Control_Data = require('./Control_Data');
const Control_View = require('./Control_View');
const {parse_mount, parse} = require('./parse-mount');
const {str_arr_mapify, get_a_sig, each, prop} = jsgui;
//const Control = jsgui.Control = require('./control-enh');

const Control = jsgui.Control = require('./Data_Model_View_Model_Control');
jsgui.load_type('control', 'C', item => (item instanceof Control));
const Evented_Class = jsgui.Evented_Class;
var tof = jsgui.tof;
var map_Controls = jsgui.map_Controls = {};
const def = jsgui.is_defined;
var core_extension = str_arr_mapify(function (tagName) {
    jsgui.controls[tagName] = jsgui[tagName] = class extends Control {
        constructor(spec) {
            let str;
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
            super(spec);
            this.dom.tagName = tagName;
            this.dom.noClosingTag = true;
        }
    };
    jsgui[tagName].prototype._tag_name = tagName;
    map_Controls[tagName] = jsgui[tagName];
});
var recursive_dom_iterate = function (el, callback) {
    callback(el);
    var cns = el.childNodes;
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
const pre_activate = (context) => {
    console.log('jsgui html-core pre_activate');
    if (!context) {
        throw 'jsgui-html-enh pre_activate(context) - need to supply context parameter.';
    }
    const map_controls = context.map_controls || {};
    var map_jsgui_els = {};
    var map_jsgui_types = {};
    var arr_controls = [];
    var max_typed_ids = {};
    const map_ctrl_parent_ids_by_ctrl_ids = {};
    var id_before__ = function (id) {
        var pos1 = id.lastIndexOf('_');
        var res = id.substr(0, pos1);
        return res;
    }
    var num_after = function (id) {
        return parseInt(id.substr(id.lastIndexOf('_') + 1), 10);
    }
    let map_els = () => {
        recursive_dom_iterate(document, el => {
            const nt = el.nodeType;
            if (nt === 1) {
                const jsgui_id = el.getAttribute('data-jsgui-id');
                if (jsgui_id) {
                    if (el.parentNode) {
                        if (el.parentNode.nodeType === 1) {
                            const parent_jsgui_id = el.parentNode.getAttribute('data-jsgui-id');
                            if (parent_jsgui_id) {
                                map_ctrl_parent_ids_by_ctrl_ids[jsgui_id] = parent_jsgui_id;
                            }
                        }
                    }
                    const ib = id_before__(jsgui_id), num = num_after(jsgui_id);
                    if (!def(max_typed_ids[ib])) {
                        max_typed_ids[ib] = num;
                    } else {
                        if (num > max_typed_ids[ib]) max_typed_ids[ib] = num;
                    }
                    map_jsgui_els[jsgui_id] = el;
                    var jsgui_type = el.getAttribute('data-jsgui-type');
                    if (jsgui_type) map_jsgui_types[jsgui_id] = jsgui_type;
                }
            }
        });
    }
    map_els();
    context.set_max_ids(max_typed_ids);
    each(map_jsgui_els, (el, jsgui_id) => {
        const l_tag_name = el.tagName.toLowerCase();
        if (jsgui_id) {
            var type = map_jsgui_types[jsgui_id];
            if (!map_controls[jsgui_id]) {
                var Cstr = context.map_Controls[type];
                if (Cstr) {
                    const parent_jsgui_id = map_ctrl_parent_ids_by_ctrl_ids[jsgui_id];
                    const ctrl_spec = {
                        'context': context,
                        '__type_name': type,
                        'id': jsgui_id,
                        'el': el
                    }
                    if (parent_jsgui_id) {
                        if (map_controls[parent_jsgui_id]) {
                        }
                    }
                    var ctrl = new Cstr(ctrl_spec);
                    if (parent_jsgui_id) {
                        if (map_controls[parent_jsgui_id]) {
                        }
                    }
                    arr_controls.push(ctrl);
                    if (l_tag_name === 'html') {
                        context.ctrl_document = ctrl;
                    }
                    map_controls[jsgui_id] = ctrl;
                } else {
                    console.log('Missing context.map_Controls for type ' + type + ', using generic Control');
                    var ctrl = new Control({
                        'context': context,
                        '__type_name': type,
                        'id': jsgui_id,
                        'el': el
                    });
                    arr_controls.push(ctrl);
                    map_controls[jsgui_id] = ctrl;
                }
            } else {
                var ctrl = map_controls[jsgui_id];
                ctrl.dom.el = el;
                if (ctrl.attach_dom_events) ctrl.attach_dom_events();
            }
        }
    });
    recursive_dom_iterate_depth(document, (el) => {
        var nt = el.nodeType;
        if (nt === 1) {
            var jsgui_id = el.getAttribute('data-jsgui-id');
            if (jsgui_id) {
                const ctrl = map_controls[jsgui_id];
                ctrl.pre_activate(ctrl.dom.el);
            }
        }
    });
}
const activate = function (context) {
    const map_controls = context.map_controls;
    console.log('jsgui html-core activate');
    console.log('jsgui.def_server_resources', jsgui.def_server_resources);
    if (!context) {
        throw 'jsgui-html-enh activate(context) - need to supply context parameter.';
    }
    recursive_dom_iterate_depth(document, (el) => {
        var nt = el.nodeType;
        if (nt === 1) {
            var jsgui_id = el.getAttribute('data-jsgui-id');
            if (jsgui_id) {
                const ctrl = map_controls[jsgui_id];
                ctrl.activate(ctrl.dom.el);
            }
        }
    });
};
jsgui.controls = jsgui.controls || {
    Control
};

// Maybe get rid of this, should work in abstract anyway.
jsgui.controls.span = jsgui.span = class span extends Control {
    constructor(spec) {
        spec.__type_name = 'span';
        super(spec);
        this.dom.tagName = 'span';
        spec = spec || {};
        prop(this, 'text', spec.text || '');
	        this.on('change', e_change => {
	            const {name} = e_change;
	            if (name === 'text') {
	                const new_text = typeof e_change.value === 'undefined' || e_change.value === null ? '' : String(e_change.value);
	                const content_arr = this.content._arr;

	                if (content_arr.length === 1 && content_arr[0] instanceof Text_Node) {
	                    content_arr[0].text = new_text;
	                } else {
	                    let existing_text_node;
	                    for (let idx = 0; idx < content_arr.length; idx++) {
	                        if (content_arr[idx] instanceof Text_Node) {
	                            existing_text_node = content_arr[idx];
	                            break;
	                        }
	                    }
	                    if (existing_text_node) {
	                        existing_text_node.text = new_text;
	                    } else {
	                        const tn = new Text_Node({
	                            context: this.context,
	                            text: new_text
	                        });
	                        if (this.content && typeof this.content.insert === 'function') {
	                            this.content.insert(tn, 0);
	                        } else {
	                            this.add(tn);
	                        }
	                        this.tn = this.text_node = tn;
	                    }
	                }
	            }
	        })
        if (!spec.el) {
            this.compose_span();
        }
    }
    compose_span() {
        if (this.text && this.text.length > 0) {
            this.add(this.tn = this.text_node = new Text_Node({
                context: this.context,
                text: this.text
            }));
        }
    }
}
class String_Control extends Control {
    constructor(spec = {}) {
        spec.__type_name = 'string_control';
        super(spec);
        this.dom.tagName = undefined;
        spec = spec || {};
        if (typeof spec.text !== 'undefined') {
            this._text = spec.text;
        } else {
            this._text = '';
        }
        if (!spec.el) {
        }
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.raise('change', {
            'name': 'text',
            'value': value
        });
    }
    all_html_render() {
        return this._text;
    }
    activate() {
    }
}
jsgui.pre_activate = pre_activate;
jsgui.activate = activate;
core_extension('html head title body div select option h1 h2 h3 h4 h5 h6 label p a script link button form textarea img ul li audio video table tr td caption thead colgroup col svg defs marker polygon line section code samp canvas');
core_extension_no_closing_tag('link input meta');
class HTML_Document extends jsgui.Control {
    constructor(spec = {}) {
        spec.tag_name = 'html';
        super(spec);
    }
}
class Blank_HTML_Document extends HTML_Document {
    constructor(spec = {}) {
        super(spec);
        var context = this.context;
        if (!spec.el) {
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
            this.head = head;
            this.title = title;
            this.body = body;
        }
    }
    'body'() {
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig == '[]') {
            var content = this.content;
            var body = content.get(1);
            return body;
        }
    }
};
class Intersection_Finder extends Evented_Class {
    constructor(spec) {
        super(spec);
        let coords_ctrls;
        let update_ctrl_coords = () => {
            coords_ctrls = [];
            each(spec.controls || spec.ctrls, ctrl => {
                coords_ctrls.push([ctrl.bcr(), ctrl]);
            });
        }
        let map_selected = new Map();
        let find_intersections = (coords) => {
            update_ctrl_coords();
            let intersecting = [],
                newly_intersecting = [],
                previously_intersecting = [];;
            let [btl, bbr] = coords;
            each(coords_ctrls, cc => {
                let [ccoords, ctrl] = cc;
                let [cpos, cbr, csize] = ccoords;
                let intersect = (cpos[0] <= bbr[0] &&
                    btl[0] <= cbr[0] &&
                    cpos[1] <= bbr[1] &&
                    btl[1] <= cbr[1])
                if (intersect) {
                    if (map_selected.get(ctrl) !== true) {
                        newly_intersecting.push(ctrl);
                        map_selected.set(ctrl, true);
                    }
                    intersecting.push(ctrl);
                } else {
                    if (map_selected.get(ctrl) === true) {
                        previously_intersecting.push(ctrl);
                        map_selected.set(ctrl, false);
                    }
                }
            });
            return [intersecting, newly_intersecting, previously_intersecting];
        }
        prop(this, 'coords', (transform_coords) => {
            if (transform_coords[0][1] > transform_coords[1][1]) {
                let [a, b] = transform_coords;
                transform_coords = [b, a];
            }
            if (transform_coords[0][0] > transform_coords[1][0]) {
                let a = transform_coords[1][0];
                transform_coords[1][0] = transform_coords[0][0];
                transform_coords[0][0] = a;
            }
            return transform_coords;
        }, (change_coords) => {
            let intersections = find_intersections(change_coords[0]);
            if (intersections[1].length > 0 || intersections[2].length > 0) {
                this.raise('change', {
                    'name': 'intersections',
                    'value': intersections
                });
            }
        });
        this.find_intersections = find_intersections;
    }
}
class Relative extends Control {
    constructor(spec) {
        spec.class = 'relative';
        super(spec);
    }
}

//jsgui.Active_HTML_Document = require('./Active_HTML_Document');

jsgui.Control_Data = Control_Data;
jsgui.Control_View = Control_View;
jsgui.Relative = Relative;
jsgui.String_Control = jsgui.controls.String_Control = String_Control;
jsgui.HTML_Document = HTML_Document;
jsgui.Blank_HTML_Document = Blank_HTML_Document;
jsgui.Text_Node = jsgui.controls.Text_Node = jsgui.Text_Node = jsgui.controls.Text_Node = Text_Node;
jsgui.Page_Context = Page_Context;
jsgui.Selection_Scope = Selection_Scope
jsgui.Intersection_Finder = Intersection_Finder;
jsgui.parse_mount = parse_mount;
jsgui.parse = parse;
module.exports = jsgui;
