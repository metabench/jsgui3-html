//const Control = require('./control-core');
const {tof, Evented_Class} = require('lang-mini');

// Using a field / prop may work better.
//  Get closer to the more concise and reasonable functional way of coding this.

const escape_html_replacements = [
    [/&/g, '&amp;'],
    [/</g, '&lt;'],
    [/>/g, '&gt;'],
    [/"/g, '&quot;'], //"
    [/'/g, '&#x27;'], //'
    [/\//g, '&#x2F;']
];

const escape_html = (str) => {

    //console.log('tof(str) ' + tof(str));

    //console.log('escape_html str ' + str);
    //console.log('tof str ' + tof(str));

    if (tof(str) == 'data_value') str = str.get();

    var single_replacement;
    for (var c = 0, l = escape_html_replacements.length; c < l; c++) {
        single_replacement = escape_html_replacements[c]
        str = str.replace(single_replacement[0], single_replacement[1]);
    }
    //each(escape_html_replacements, function (i, v) {
    //    str = str.replace(v[0], v[1]);
    //});

    return str;
};

// Want to be able to change the text of an active text node.
//  So, the text node will have an 'el'. Maybe dom.node?

// Maybe don't extend control?

// Do need to have activation as well...?
//  Need to correlate the text node with its dom element.
//   That can't be done through the use of jsgui ids.
//    Will use sibling_index instead.

// When activating controls containing text nodes, can then correlate the textNode class with the element, by referring to the sibling index.

// Can give its parent control or element in the spec?
//  That means we could get access to the element very quickly.


class textNode extends Evented_Class {
//class textNode extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'text_node'

        super();

        //super(spec);
        if (typeof spec == 'string') {
            //this._.text = spec;
            //this.innerHtml = spec;
            spec = {
                'text': spec
            };
        }

        spec.nodeType = 3;
        spec = spec || {};

        if (spec.el) {
            this.dom = {
                el: spec.el
            }
        } else {
            this.dom = {};
        }

        if (spec.sibling_index) this.sibling_index = spec.sibling_index;

        //ctrl_init_call(this, spec);
        //this._super(spec);

        // the underscore properties could make sense in Data_Objects and controls.
        //  have the getters and setters that change the property and also raise the change event.

        // Proxies seem like a possibility to listen for such changes.
        //  However, we would make the changes to the proxy object.
        //  Possibly could have something that raises a change event.

        // Proxies could get trickier when they are in the object heirachy.

        //this._ = {};

        if (typeof spec.text !== 'undefined') {
            this._text = spec.text;
        }
        //this.typeName = pr.typeName;
        //this.tagName = 'p';

        // Will not require activation.
        //  Don't think Text_Node gets activated anyway.
        this.on('change', e_change => {
            //console.log('Text_Node change', e_change);

            if (this.dom.el) {
                this.dom.el.nodeValue = e_change.value;
            }
        })

    }
    activate() {
        if (!this.__active) {

            console.log('activate textNode control');
            console.log('this.sibling_index', this.sibling_index);

            this.__active = true;
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
    'all_html_render'() {
        // nx = no escape
        return this.nx ? this._text || '' : escape_html(this._text || '') || '';
    }

    // getter and setter for the text itself?
    //  A variety of properties will use getters and setters so that the updates get noted.

};

module.exports = textNode;