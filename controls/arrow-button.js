var jsgui = require('../html-core/html-core');
var Control = jsgui.Control;
let def = jsgui.is_defined;
const Button = require('./button');

class Arrow_Button extends Button {
    constructor(spec, add, make) {
        // Wont fields have been set?
        //spec['class'] = spec['class'] || 'button';


        spec.size = spec.size || [32, 32];

        spec.text = undefined;
        spec.__type_name = spec.__type_name || 'arrow_button';
        super(spec);
        //this.__type_name = 'button';

        



        /*

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100">
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
        <line x1="0" y1="50" x2="250" y2="50" stroke="#000" 
        stroke-width="8" marker-end="url(#arrowhead)" />
        </svg>

        */

        // It's rotation.
        //  .rotation property

        // get and set?

        // Could have an Angle class that handles both degrees, radians, and proportion of full rotation (meaning proportion of 2 pi radians)

        // half radians being a useful angle measurement.
        //  hr

        //console.log('spec.direction', spec.direction);

        let rotation = 0;
        
        Object.defineProperty(this, 'rotation', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() {
                return rotation;
            },
            set(value) {
                rotation = value;
                this.raise('change', {
                    'name': 'rotation',
                    'value': value
                });
            },
            enumerable: true,
            configurable: true
        });


        let direction;

        this.on('change', e => {
            if (e.name === 'rotation') {
                this.line.dom.attributes.transform = 'rotate(' + e.value + ', 50, 50)';
                this.polygon.dom.attributes.transform = 'rotate(' + e.value + ', 50, 50)';
            }
            if (e.name === 'direction') {
                //console.log('e', e);
                //line.dom.attributes.transform = 'rotate(' + e.value + ', 50, 50)';
                if (e.value === 'left') this.rotation = 270;
                if (e.value === 'up') this.rotation = 0;
                if (e.value === 'right') this.rotation = 90;
                if (e.value === 'down') this.rotation = 180;
            }
        });
        
        Object.defineProperty(this, 'direction', {
            // Using shorthand method names (ES2015 feature).
            // This is equivalent to:
            // get: function() { return bValue; },
            // set: function(newValue) { bValue = newValue; },
            get() {
                return direction;
            },
            set(value) {
                direction = value;
                //console.log('pre raise change - direction');
                this.raise('change', {
                    'name': 'direction',
                    'value': value
                });
            },
            enumerable: true,
            configurable: true
        });
        if (def(spec.rotation)) {
            rotation = spec.rotation;
        }

        //  || spec.no_compose === true
        if (!spec.el) {
            this.compose_arrow_button();

        }
        if (def(spec.direction)) {
            //console.log('spec.direction', spec.direction);
            // do want to change it
            this.direction = spec.direction;
            
        }
    }

    'compose_arrow_button' () {
        this.add_class('arrow');
        //this.add_class('button');
        // Want to have a system of accessing icons.
        //  Will be possible to do using a Postgres website db resource
        //   First want it working from disk though.

        // A way not to add the text like this to start with?
        //  Or just don't inherit from a button in some cases when we don't want this?

        // direction...
        //  left, l, r, right, u, ur, ru
        //   possibly express with angles in degrees and radians.

        // An arrow glyph with rotation would be cool.
        //  For the moment, I think SVG rendering would work the best.

        // Could give it an Arrow control as background.
        //  Not ready for background controls yet though.

        let svg = this.svg = new jsgui.svg({
            'context': this.context
        });
        svg.dom.attributes.viewBox = "0 0 100 100";

        // include all in a group



        /*

        let svgdefs = new jsgui.defs({
            'context': this.context
        });
        this.svg.add(svgdefs);

        let marker = new jsgui.marker({
            'context': this.context
        })
        marker.dom.attributes.id = 'arrowhead';
        marker.dom.attributes.markerWidth = 10;
        marker.dom.attributes.markerHeight = 7;
        marker.dom.attributes.refX = 2;
        marker.dom.attributes.refY = 3.5;
        marker.dom.attributes.orient = 'auto';
        svgdefs.add(marker);

        */


        let polygon = this.polygon = new jsgui.polygon({
            context: this.context
        })
        //polygon.dom.attributes.points = '0 0, 3 3.5, 0 7';
        polygon.dom.attributes.points = '50 0, 70 20, 30 20';

        // Polygon fill won't change with css
        //polygon.dom.attributes.fill = '#FF0000';
        //marker.add(polygon);

        let line = this.line = new jsgui.line({
            'context': this.context,

        });

        /*
        line.dom.attributes.x1 = 96;
        line.dom.attributes.y1 = 50;
        line.dom.attributes.x2 = 10;
        line.dom.attributes.y2 = 50;
        */

        // Could work these out based on rotation maths.

        line.dom.attributes.x1 = 50;
        line.dom.attributes.y1 = 96;
        line.dom.attributes.x2 = 50;
        line.dom.attributes.y2 = 10;

        //  transform="rotate(100)"

        // then rotation angle.
        //  could be given as a fraction of 2pi (full rotation radians).

        line.dom.attributes.transform = 'rotate(' + this.rotation + ', 50, 50)';
        polygon.dom.attributes.transform = 'rotate(' + this.rotation + ', 50, 50)';
        



        //line.dom.attributes.stroke = '#000000';
        //line.dom.attributes['marker-end'] = 'url(#arrowhead)';
        line.dom.attributes['stroke-width'] = 8;

        svg.add(line);
        svg.add(polygon);


        this.add(svg);
    }
    'activate' () {
        super.activate();
    }
}
module.exports = Arrow_Button;