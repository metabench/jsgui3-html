// Copyright James Vickers 2016, james@metabench.com

var jsgui = require('../html-core/html-core');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, extend = jsgui.extend;
var Control = jsgui.Control;
var Collection = jsgui.Collection;


// Could have the range as a field.
//  A 2d range may be a useful type for this.


// Making various things into fields that get sent to the client?

/*
 'fields': {
 //'num_days': Number
 'range': Array,
 'vert_margin': Number,
 'left_margin': Number,
 'right_margin': Number,
 'axis_thickness': Number,
 'x_major_notch_spacing': Number,
 'y_major_notch_spacing': Number,
 'x_minor_notch_spacing': Number,
 'y_minor_notch_spacing': Number,
 'suppress_0_axes_labels': Boolean,

 // For internal use
 'x_origin': Number,
 'y_origin': Number
 },
 */

class Line_Chart extends Control {

    constructor(spec) {
        super(spec);
        this.__type_name = 'line_chart';

        // Specify num_days

        // Will have y axis down the left.
        // Will have x axis down the middle
        if (!spec.abstract && !spec.el) {

            this.add_class('line-chart no-select');

            var vert_margin = 10;
            var left_margin = 80;
            var right_margin = 24;
            var axis_thickness = 2;

            var x_major_notch_spacing = spec.x_major_notch_spacing || spec.major_notch_spacing || 50;
            var y_major_notch_spacing = spec.y_major_notch_spacing || spec.major_notch_spacing || 50;

            var x_minor_notch_spacing = spec.x_minor_notch_spacing || spec.major_minor_spacing || 10;
            var y_minor_notch_spacing = spec.y_minor_notch_spacing || spec.major_minor_spacing || 10;

            var suppress_0_axes_labels = true;

            this.set({
                'vert_margin': vert_margin,
                'left_margin': left_margin,
                'right_margin': right_margin,
                'axis_thickness': axis_thickness,
                'x_major_notch_spacing': x_major_notch_spacing,
                'y_major_notch_spacing': y_major_notch_spacing,
                'x_minor_notch_spacing': x_minor_notch_spacing,
                'y_minor_notch_spacing': y_minor_notch_spacing,
                'suppress_0_axes_labels': suppress_0_axes_labels
            });
            this.add_full_axes();
        }

        // When it's rendered on the server, we don't know quite how much space the chart will need.
        //  Still, server side rendering and client side activation fits the general pattern.




        // number of units on x axis
        // x min y min

        // range could be given as [[0, 0,], [20, 20]];
        //  could assume origin [0, 0] if it's not given.

        var num_days = this.get('num_days');

        if (typeof window == 'undefined') {
            // For sending the fields to the client.

            extend(this._fields = this._fields || {}, {
                'vert_margin': vert_margin,
                'left_margin': left_margin,
                'right_margin': right_margin,
                'axis_thickness': axis_thickness,
                'x_major_notch_spacing': x_major_notch_spacing,
                'y_major_notch_spacing': y_major_notch_spacing,
                'x_minor_notch_spacing': x_minor_notch_spacing,
                'y_minor_notch_spacing': y_minor_notch_spacing,
                'suppress_0_axes_labels': suppress_0_axes_labels,
                'range': this.get('range').value(),
                'x_origin': this.get('x_origin').value(),
                'y_origin': this.get('y_origin').value()
            });
        }
    }

    'add_full_axes'() {

        var vert_margin = this.get('vert_margin');
        var left_margin = this.get('left_margin');
        var right_margin = this.get('right_margin');
        var axis_thickness = this.get('axis_thickness');
        var x_major_notch_spacing = this.get('x_major_notch_spacing');
        var y_major_notch_spacing = this.get('y_major_notch_spacing');
        var x_minor_notch_spacing = this.get('x_minor_notch_spacing');
        var y_minor_notch_spacing = this.get('y_minor_notch_spacing');
        var suppress_0_axes_labels = this.get('suppress_0_axes_labels');




        var size = this.get('size').value();
        //console.log('size', size);


        var w = size[0][0];
        var h = size[1][0];

        var range = this.get('range').value();

        console.log('range', range);

        var y_axis_x, x_axis_y;

        var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];

        // Want to show the Y axis at the origin if possible.

        // Is the x point 0 within the grid? if so, show the y axis at that position.

        var x_range = x_max - x_min, y_range = y_max - y_min;
        //console.log('x_min', x_min);
        //console.log('x_max', x_max);


        var y_axis_is_at_origin = x_min <= 0 && x_max >= 0;
        var x_axis_is_at_origin = y_min <= 0 && y_max >= 0;

        // Position of chart_left, position of chart_right

        var x_axis_left = left_margin;
        var x_axis_right = w - right_margin;
        var y_axis_top = vert_margin;
        var y_axis_bottom = h - vert_margin;

        var x_chart_distance = x_axis_right - x_axis_left;
        var y_chart_distance = y_axis_bottom - y_axis_top;

        var x_axis_length = w - left_margin - right_margin;
        var y_axis_length = h - (2 * vert_margin);

        var x_scale = x_range / x_axis_length;
        var y_scale = y_range / y_axis_length;

        // would be good to have the origin position.

        var x_origin, y_origin;


        var values_from_pixel_location = function(px_loc) {
            var vect_from_origin = [px_loc[0] - x_origin, px_loc[1] - y_origin];
            //console.log('vect_from_origin', vect_from_origin);
            // and then the values, obtained by scaling.

            var res = [Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1)];
            return res;


        };

        var pixel_location_from_values = function(values) {
            var res = [Math.round(origin[0] + values[0] * 1 / x_scale), Math.round(origin[1] + values[1] * -1 / y_scale)];
            return res;
        };

        var x_location_from_value = function(x_value) {
            return Math.round(x_origin + x_value * 1 / x_scale)
        };
        var y_location_from_value = function(y_value) {
            return Math.round(y_origin + y_value * -1 / y_scale)
        };

        //console.log('tof range', tof(range));
        //console.log('range', range);

        var svg = new Control({
            'context': this.context,
            'tag_name': 'svg'
        });

        svg.set('dom.attributes', {
            'width': w,
            'height': h,
            'viewPort': '0 0 ' + w + ' ' + h,
            'version': '1.1',
            'xmlns': 'http://www.w3.org/2000/svg'
        });

        this.add(svg);
        this.set('svg', svg);

        if (y_axis_is_at_origin) {
            // Proportion to the right of the origin, proportion to the left of the origin.

            //x_range - x_min;
            //onsole.log('x_range + x_min', x_range + x_min);

            var prop_through = (-1 * x_min) / x_range;
            var distance_through = x_chart_distance * prop_through;

            //console.log('pos', prop_through);

            x_origin = x_axis_left + distance_through;


            y_axis_x = x_origin;

        } else {
            // Draw it on the left
            throw 'stop';
        }

        if (x_axis_is_at_origin) {
            // Proportion to the right of the origin, proportion to the left of the origin.

            //x_range - x_min;
            //onsole.log('x_range + x_min', x_range + x_min);

            var prop_through = (-1 * y_min) / y_range;
            //console.log('prop_through', prop_through);
            var distance_through = y_chart_distance * prop_through;
            //console.log('distance_through', distance_through);



            //console.log('pos', prop_through);

            y_origin = y_axis_bottom - distance_through;
            x_axis_y = y_origin;

        } else {
            // Draw it on the left
            throw 'stop';
        }

        this.x_origin = x_origin;
        this.y_origin = y_origin;

        // Not necessarily going from the origin.
        //  Also want to have server-side rendering, client-side activation.

        //var origin = [left_margin - 1, (h - axis_thickness) / 2];

        //console.log('y_axis_x', y_axis_x);

        var y_axis_top = vert_margin;
        var y_axis_bottom = h - vert_margin;

        var add_y_axis_line = function() {

            var y_axis = new Control({
                'context': this.context,
                'tag_name': 'line'
            });

            y_axis.set('dom.attributes', {
                'width': 10,
                'height': h,
                'x1': y_axis_x,
                'y1': y_axis_top,
                'x2': y_axis_x,
                'y2': y_axis_bottom,
                'stroke': '#000000',
                'stroke-width': 2
            });

            svg.add(y_axis);
        };

        var add_x_axis_line = function() {
            var x_axis = new Control({
                'context': this.context,
                'tag_name': 'line'
            });

            x_axis.set('dom.attributes', {
                'width': 10,
                'height': h,
                'x1': x_axis_left,
                'y1': x_axis_y,
                'x2': x_axis_right,
                'y2': x_axis_y,
                'stroke': '#000000',
                'stroke-width': 2
            });

            svg.add(x_axis);
        };

        var add_x_notch_group = function(spacing, height) {
            //console.log('x_min', x_min);
            //console.log('spacing', spacing);
            var num_notches_left_of_origin = Math.floor((x_min * -1) / spacing);
            var num_notches_right_of_origin = Math.floor(x_max / spacing);
            var first_notch_x_value = num_notches_left_of_origin * spacing * -1;
            // then we repeat through the range...
            var notch_x_value = first_notch_x_value;
            // Need functions to convert between logical grid and screen coords.
            while (notch_x_value <= x_max) {

                // then need to get the x pixel value using a function

                var x_notch = new Control({
                    'context': this.context,
                    'tag_name': 'line'
                });

                var x_location = x_location_from_value(notch_x_value);

                // calculate the notch x position.

                x_notch.set('dom.attributes', {
                    'width': 2,
                    'height': height,
                    'x1': x_location,
                    'y1': y_origin,
                    'x2': x_location,
                    'y2': y_origin + height,
                    'stroke': '#AAAAAA',
                    'stroke-width': 2
                    //'xmlns': 'http://www.w3.org/2000/svg',
                    //'version': '1.1'
                });

                svg.add(x_notch);

                notch_x_value += spacing;
            }
        }

        var add_x_label_group = function(spacing) {
            var num_notches_left_of_origin = Math.floor((x_min * -1) / spacing);
            var num_notches_right_of_origin = Math.floor(x_max / spacing);
            var first_notch_x_value = num_notches_left_of_origin * spacing * -1;
            // then we repeat through the range...
            var notch_x_value = first_notch_x_value;
            // Need functions to convert between logical grid and screen coords.

            while (notch_x_value <= x_max) {

                // then need to get the x pixel value using a function

                if (!(suppress_0_axes_labels && notch_x_value === 0)) {
                    var x_location = x_location_from_value(notch_x_value);
                    var x_notch_label = new Control({
                        'context': this.context,
                        'tag_name': 'text'
                    });
                    x_notch_label.set('dom.attributes', {
                        'x': x_location - 4,
                        'y': y_origin + 28,
                        'font-family': 'Verdana',
                        'font-size': 14
                    });
                    x_notch_label.add(notch_x_value + '');
                    svg.add(x_notch_label);
                }
                notch_x_value += spacing;
            }
        }
        var add_y_label_group = function(spacing) {
            var num_notches_below_origin = Math.floor((y_min * -1) / spacing);
            var num_notches_above_origin = Math.floor(y_max / spacing);

            var first_notch_y_value = num_notches_below_origin * spacing * -1;

            // then we repeat through the range...

            var notch_y_value = first_notch_y_value;

            // Need functions to convert between logical grid and screen coords.

            while (notch_y_value <= y_max) {

                // then need to get the x pixel value using a function

                if (!(suppress_0_axes_labels && notch_y_value === 0)) {

                    var y_notch = new Control({
                        'context': this.context,
                        'tag_name': 'line'
                    });

                    var y_location = y_location_from_value(notch_y_value);

                    var y_notch_label = new Control({
                        'context': this.context,
                        'tag_name': 'text'
                    });

                    y_notch_label.set('dom.attributes', {
                        'x': x_origin - 48,
                        'y': y_location + 6,
                        'font-family': 'Verdana',
                        'font-size': 14
                    });
                    y_notch_label.add(notch_y_value + '');

                    svg.add(y_notch_label);
                }
                notch_y_value += spacing;
            }
        }

        var add_y_notch_group = function(spacing, length) {
            //console.log('x_min', x_min);
            //console.log('spacing', spacing);
            var num_notches_below_origin = Math.floor((y_min * -1) / spacing);


            var num_notches_above_origin = Math.floor(y_max / spacing);

            var first_notch_y_value = num_notches_below_origin * spacing * -1;

            // then we repeat through the range...

            var notch_y_value = first_notch_y_value;

            // Need functions to convert between logical grid and screen coords.

            while (notch_y_value <= y_max) {

                // then need to get the x pixel value using a function

                var y_notch = new Control({
                    'context': this.context,
                    'tag_name': 'line'
                });

                var y_location = y_location_from_value(notch_y_value);

                y_notch.set('dom.attributes', {
                    'width': length,
                    'height': 2,
                    'x1': x_origin - length,
                    'y1': y_location,
                    'x2': x_origin,
                    'y2': y_location,
                    'stroke': '#AAAAAA',
                    'stroke-width': 2
                    //'xmlns': 'http://www.w3.org/2000/svg',
                    //'version': '1.1'
                });

                svg.add(y_notch);

                notch_y_value += spacing;
            }
        }


        var add_x_axis_major_notches = function() {
            // x_major_notch_spacing

            // paint notches from origin (if origin is shown)

            // Or paint them from one side, in sync with the origin.

            // Painting both ways from origin makes sense logically.
            //  Partial adding / painting would work.

            // Really is best to work out the range of values, that will go through the origin if necessary.

            //var num_notches_left_of_origin = Math.floor((x_min * -1) / x_major_notch_spacing);
            add_x_notch_group(x_major_notch_spacing, 20);

        }

        var add_x_axis_minor_notches = function() {
            // x_major_notch_spacing

            // paint notches from origin (if origin is shown)

            // Or paint them from one side, in sync with the origin.

            // Painting both ways from origin makes sense logically.
            //  Partial adding / painting would work.

            // Really is best to work out the range of values, that will go through the origin if necessary.

            //var num_notches_left_of_origin = Math.floor((x_min * -1) / x_major_notch_spacing);
            //console.log('x_minor_notch_spacing', x_minor_notch_spacing);
            add_x_notch_group(x_minor_notch_spacing, 10);

        }

        var add_origin_label = function() {
            var origin_label = new Control({
                'context': this.context,
                'tag_name': 'text'
            });

            origin_label.set('dom.attributes', {
                'x': x_origin - 14,
                'y': y_origin + 14,
                'font-family': 'Verdana',
                'font-size': 14//,
                //'xmlns': 'http://www.w3.org/2000/svg',
                //'version': '1.1'
            });

            origin_label.add('0');

            svg.add(origin_label);
        }

        var add_y_axis_major_notches = function() {
            add_y_notch_group(y_major_notch_spacing, 20);
        }

        var add_y_axis_minor_notches = function() {
            console.log('x_minor_notch_spacing', y_minor_notch_spacing);
            add_y_notch_group(y_minor_notch_spacing, 10);

        }

        var add_major_x_axis_labels = function() {
            add_x_label_group(x_major_notch_spacing);
        }
        var add_major_y_axis_labels = function() {
            add_y_label_group(y_major_notch_spacing);
        }

        var add_major_axes_labels = function() {
            add_major_x_axis_labels();
            add_major_y_axis_labels();
        }

        add_x_axis_minor_notches();
        add_x_axis_major_notches();

        add_y_axis_minor_notches();
        add_y_axis_major_notches();

        add_x_axis_line();
        add_y_axis_line();

        add_major_axes_labels();
        add_origin_label();
    }

    'render_axes'() {

    }

    'values_from_pixel_location'(px_loc) {
        var el = this.dom.el;
        var w = el.clientWidth;
        var h = el.clientHeight;
        var x_origin = this.x_origin;
        var y_origin = this.y_origin;
        var vert_margin = this.vert_margin;
        var left_margin = this.left_margin;
        var right_margin = this.right_margin;
        var x_axis_length = w - left_margin - right_margin;
        var y_axis_length = h - (2 * vert_margin);
        var range = this.range;
        var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
        var x_range = x_max - x_min, y_range = y_max - y_min;
        var x_scale = x_range / x_axis_length;
        var y_scale = y_range / y_axis_length;
        var vect_from_origin = [px_loc[0] - x_origin, px_loc[1] - y_origin];
        //console.log('vect_from_origin', vect_from_origin);
        // and then the values, obtained by scaling.

        var res = [Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1)];
        return res;
    }
    'pixel_location_from_values'(values) {
        var el = this.dom.el;
        var w, h;
        if (el) {
            w = el.clientWidth;
            h = el.clientHeight;
        } else {
            var size = this.size();
            //console.log('size', size);
            //throw 'stop';
            w = size._[0][0];
            h = size._[1][0];
        }
        // and if we don't have the element?


        var x_origin = this.x_origin;
        var y_origin = this.y_origin;
        var vert_margin = this.vert_margin;
        var left_margin = this.left_margin;
        var right_margin = this.right_margin;
        var x_axis_length = w - left_margin - right_margin;
        var y_axis_length = h - (2 * vert_margin);
        var range = this.range;

        //console.log('vert_margin', vert_margin);
        //console.log('y_axis_length', y_axis_length);

        var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];
        var x_range = x_max - x_min, y_range = y_max - y_min;
        var x_scale = x_range / x_axis_length;
        var y_scale = y_range / y_axis_length;

        //console.log('values', values);
        //console.log('y_scale', y_scale);
        //console.log('y_origin', y_origin);
        //console.log('values', values);

        var res = [Math.round(x_origin + values[0] * 1 / x_scale), Math.round(y_origin + values[1] * -1 / y_scale)];
        return res;
    }
    'activate'() {
        if (!this.__active) {
            super.activate();
            var that = this;
            //console.log('this', this);
            //throw 'stop';
            //var retrieved_el = this.dom.el;
            //console.log('!!retrieved_el', !!retrieved_el);
            //console.log('retrieved_el', retrieved_el);
            var el = this.dom.el;
            //throw 'stop';
            // But want a better way to get the size.
            //  Want a standard, encapsulated way.

            var w = el.clientWidth;
            var h = el.clientHeight;
            var size = [w, h];

            // Size could have been sent as a property?
            //  Or it loads it from the inline style.

            var vert_margin = this.vert_margin;
            var left_margin = this.left_margin;
            var right_margin = this.right_margin;
            var axis_thickness = this.axis_thickness;
            var x_major_notch_spacing = this.x_major_notch_spacing;
            var y_major_notch_spacing = this.y_major_notch_spacing;
            var x_minor_notch_spacing = this.x_minor_notch_spacing;
            var y_minor_notch_spacing = this.y_minor_notch_spacing;
            var suppress_0_axes_labels = this.suppress_0_axes_labels;



            var x_origin = this.x_origin;
            var y_origin = this.y_origin;

            var range = this.range;
            var x_min = range[0][0], y_min = range[0][1], x_max = range[1][0], y_max = range[1][1];

            var y_axis_is_at_origin = x_min <= 0 && x_max >= 0;
            var x_axis_is_at_origin = y_min <= 0 && y_max >= 0;

            // Position of chart_left, position of chart_right

            var x_axis_left = left_margin;
            var x_axis_right = w - right_margin;
            var y_axis_top = vert_margin;
            var y_axis_bottom = h - vert_margin;

            //var x_chart_distance = x_axis_right - x_axis_left;
            //var y_chart_distance = y_axis_bottom - y_axis_top;

            var x_axis_length = w - left_margin - right_margin;
            var y_axis_length = h - (2 * vert_margin);

            // Want to show the Y axis at the origin if possible.

            // Is the x point 0 within the grid? if so, show the y axis at that position.

            var x_range = x_max - x_min, y_range = y_max - y_min;
            var x_scale = x_range / x_axis_length;
            var y_scale = y_range / y_axis_length;


            var log_values = function() {
                console.log('x_range', x_range);
                console.log('y_range', y_range);
                console.log('x_scale', x_scale);
                console.log('y_scale', y_scale);

                console.log('left_margin', left_margin);
                console.log('right_margin', right_margin);
                console.log('range', range);
                console.log('tof range', tof(range));
            }

            // They items got are Data_Values.
            var context = this.context;

            var values_from_pixel_location = function(px_loc) {
                var vect_from_origin = [px_loc[0] - x_origin, px_loc[1] - y_origin];
                //console.log('vect_from_origin', vect_from_origin);
                // and then the values, obtained by scaling.

                var res = [Math.round(vect_from_origin[0] * x_scale), Math.round(vect_from_origin[1] * y_scale * -1)];
                return res;


            };

            var pixel_location_from_values = function(values) {
                var res = [Math.round(origin[0] + values[0] * 1 / x_scale), Math.round(origin[1] + values[1] * -1 / y_scale)];
                return res;
            };

            var x_location_from_value = function(x_value) {
                return Math.round(x_origin + x_value * 1 / x_scale)
            };
            var y_location_from_value = function(y_value) {
                return Math.round(y_origin + y_value * -1 / y_scale)
            };


            // Want a mousemove that shows where the bounds will be placed
            //  Will show highlight of bound or bound point the mouse is over.

            var findPos = function(obj) {
                var curleft = curtop = 0;
                if (obj.offsetParent) {
                    do {
                        curleft += obj.offsetLeft;
                        curtop += obj.offsetTop;
                    }  while (obj = obj.offsetParent);
                }
                return [curleft, curtop];
            }
            // Need a way of getting the event to the app with the chart positions.

            // 22/11/2015 - Was considering adding event interceptors to jsgui.
            //  Will not do that, as we can change the event object here, then other event handlers can access new properties.

            this.add_event_listener('mousemove', function(e_mousemove) {
                //console.log('e_mousemove', e_mousemove);
                // See the logical points it corresponds to.
                var pos = findPos(el);
                //var pos = bcr[0];
                var click_x, click_y;
                if (e_mousemove.pageX || e_mousemove.pageY) {
                    click_x = e_mousemove.pageX;
                    click_y = e_mousemove.pageY;
                }
                var click_pos = [click_x, click_y];
                var pos_within_this = jsgui.v_subtract(click_pos, pos);
                //console.log('pos_within_this', pos_within_this);
                var values = values_from_pixel_location(pos_within_this);
                //console.log('values', values);
                e_mousemove.chart_position = values;
                //return false
            });
            this.add_event_listener('click', function(e_click) {
                var pos = findPos(el);
                //var pos = bcr[0];
                var click_x, click_y;
                if (e_click.pageX || e_click.pageY) {
                    click_x = e_click.pageX;
                    click_y = e_click.pageY;
                }
                var click_pos = [click_x, click_y];
                var pos_within_this = jsgui.v_subtract(click_pos, pos);
                var values = values_from_pixel_location(pos_within_this);
                e_click.chart_position = values;
            });
        }
    }
}

module.exports = Line_Chart;
