const jsgui = require('./../../../../html-core/html-core');
const {
    Control,
    parse_mount,
    parse
} = jsgui;
const {
    prop,
    field
} = require('obext');
class Icon extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'icon';
        let size = spec.size = spec.size || [64, 64];
        super(spec);
        const {
            context
        } = this;
        this.add_class('icon');
        field(this, 'key', spec.icon_key || spec.key);
        const compose = () => {
            const {
                key
            } = this;
            const imgurl = '/img/icons/' + key;
            const img = new jsgui.img({
                context: context,
                size: [64, 64]
            });
            img.dom.attributes.src = imgurl;
            this.add(img);
            this._ctrl_fields = this._ctrl_fields || {};
            this._ctrl_fields.img = img;
        }
        if (!spec.el) {
            compose();
        }
    }
    activate() {
        if (!this.__active) {
            super.activate();
            const {
                img
            } = this;
            this.on('change', ({
                name,
                value
            }) => {
                if (name === 'key') {
                    const imgurl = '/img/icons/' + value;
                    img.dom.attributes.src = imgurl;
                }
            })
        }
    }
}
module.exports = Icon;