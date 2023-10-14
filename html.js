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
jsgui.Resource.Data_KV = require('./resource/data-kv-resource');
jsgui.Resource.Data_Transform = require('./resource/data-transform-resource');
jsgui.Resource.Compilation = require('./resource/compilation-resource');
jsgui.Resource.Compiler = require('./resource/compiler-resource');


jsgui.gfx = require('jsgui3-gfx-core');


// Or create the property / getter for the rect.
//.  Maybe (even) the setter too.

// Maybe have different possible positioning or layout modes / options.
//.  Modes being sets of options? Or ways of operating?

// jsgui.gfx.Rectange / .Rect

// ctrl.rect perhaps?
// ctrl.bounding.rect???

// ctrl.bcr even....
//.  and upgrade that bounding client rect function to return a Rectangle instance?

// rect.expand('left', 80) for example.

// could give the 'rect' getters for [0], [1], [2] so that it keeps the currently used interface of bcr() results.

// ctrl.box perhaps?
// ctrl.client.rect perhaps?
// then could abbreviate it to ctrl.rect perhaps?
// ctrl.box ? ctrl.bx ? 






// Control.prototype.rect = ... ?


// Should possibly have means to compile HTML and a few other things,
//  Possibly having compilers loaded when needed with their own require / import statement.

// Compilers often operate on disk.
//  How to use compilers with programmatic streams?
//  Maybe will need to run some of them on disk.
jsgui.Resource.load_compiler = (name, jsfn, options) => {
    throw 'NYI';

}



//var Controls = require('./controls/controls');

jsgui.controls = jsgui.controls || {};
Object.assign(jsgui.controls, require('./controls/controls'));
//jsgui.controls = require('./controls/controls');

// will get rid of this (or not?)
Object.assign(jsgui, jsgui.controls);
jsgui.mixins = jsgui.mx = require('./control_mixins/mx');

//jsgui.Toggle_Button =

module.exports = jsgui;