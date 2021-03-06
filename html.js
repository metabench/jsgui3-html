/**
 * Created by James on 16/09/2016.
 * 
 * 
 * 
 * Splitting jsgui3 into some smaller modules makes a lot of sense.
 * Being able to reference just the client code.

// core
//  includes html-core, lang, resource and router
// controls-core
// controls-jsobj
// server
//  includes examples
// controls-business

 */
//"use strict";
var jsgui = require('./html-core/html-core');

/*
var str_arr_mapify = jsgui.str_arr_mapify;
var get_a_sig = jsgui.get_a_sig;
var each = jsgui.each;
var Control = jsgui.Control;
var map_Controls = jsgui.map_Controls = {};
// And load in all or a bunch of the controls.

// Can we require all of the controls at once, and then merge them?
*/
jsgui.Router = require('./router/router');
jsgui.Resource = require('./resource/resource');
jsgui.Resource_Pool = require('./resource/pool');

// sync load of css.
//  need to be able to serve that CSS to the user.
// if running on the server...

if (typeof document === 'undefined') {

    var fs = require('fs');
    //let basic_css_path = libpath.resolve('./css/basic.css');
    const libpath = require('path');

    let basic_css_path = libpath.join(__dirname, 'css', 'basic.css');

    //console.log('__dirname', __dirname);
    //console.log('basic_css_path', basic_css_path);
    var basic_css = fs.readFileSync(basic_css_path, 'utf8');

    // Want the css strings.
    // Want the css ASTs as well.

    // Want to be able to get the CSS properties in order to have default sizes in some situations.

    jsgui.css = {
        'basic': basic_css
    };
}
//var Controls = require('./controls/controls');

jsgui.controls = jsgui.controls || {};
Object.assign(jsgui.controls, require('./controls/controls'));
//jsgui.controls = require('./controls/controls');

// will get rid of this
Object.assign(jsgui, jsgui.controls);
jsgui.mixins = jsgui.mx = require('./control_mixins/mx');

//jsgui.Toggle_Button =

module.exports = jsgui;