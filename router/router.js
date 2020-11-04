// Tree_Router?

var url = require('url-parse'),
    jsgui = require('lang-tools'),
    //os = require('os'),
    //http = require('http');
    stringify = jsgui.stringify,
    each = jsgui.each,
    arrayify = jsgui.arrayify,
    tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class,
    Data_Object = jsgui.Data_Object;
var fp = jsgui.fp,
    is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;
var get_item_sig = jsgui.get_item_sig;

// Not a Data_Object.
//  Adding this to a Collection should not put it inside a Data_Object layer.

const Routing_Tree = require('./routing-tree');

class Router {
    constructor(spec) {
        spec = spec || {};
        //super(spec);
        //this.set('type_levels', ['router']);
        if (spec.name) this.name = spec.name;
        this.routing_tree = new Routing_Tree();
    }
    'start'(callback) {
        callback(null, true);
    }
    'set_route'(str_route, context, fn_handler) {
        //var rt = this.get('routing_tree');
        return this.routing_tree.set(str_route, context, fn_handler);
    }
    'meets_requirements'() {
        return true;
    }
    'process'(req, res) {
        var remoteAddress = req.connection.remoteAddress;
        //var rt = this.get('routing_tree');
        var rt = this.routing_tree;

        //console.log('process rt', rt);
        let parsed_url;
        try {
            parsed_url = url(req.url, true);
        } catch (err) {
            console.log('error parsing url', req.url);
        }

        if (parsed_url) {
            var splitPath = parsed_url.pathname.substr(1).split('/');

            //console.log('req.url', req.url);

            var route_res = rt.get(req.url);
            var processor_values_pair;
            var t_handler;

            //console.log('route_res', route_res);

            if (tof(route_res) === 'array') {
                processor_values_pair = route_res;
                var context, handler, params;
                if (route_res.length === 2) {
                    var rr_sig = get_item_sig(route_res, 1);
                    if (rr_sig == '[D,f]') {
                        context = processor_values_pair[0];
                        handler = processor_values_pair[1];
                    }
                    if (rr_sig == '[f,o]') {
                        handler = processor_values_pair[0];
                        params = processor_values_pair[1];
                    }
                }
                if (route_res.length === 3) {
                    context = processor_values_pair[0];
                    handler = processor_values_pair[1];
                    params = processor_values_pair[2];
                }
                if (params) req.params = params;

                //console.log('context', context);
                //console.log('handler', handler);
                //console.log('params', params);

                if (context) {
                    handler.call(context, req, res);
                } else {
                    t_handler = typeof handler;
                    if (typeof handler === 'function') {
                        handler(req, res);
                    } else {
                        if (t_handler === 'undefined') {
                            // Got this when some were trying to hack me.
                            //  Any .php is a hack attempt.
                            let their_ip = req.connection.remoteAddress;
                            let last_part = splitPath[splitPath.length - 1];
                            //console.log('last_part', last_part);
                            if (last_part.indexOf('.php') > -1) {
                                // looks like a hack attempt
                            }
                            console.log('1) no defined route result ', their_ip.padEnd(16, ' '), splitPath);

                            // Some kind of 404 handler makes sense.
                            return false;
                        } else {
                            // handler may be undefined.
                            console.log('handler', handler);
                            throw 'Expected handler to be a function';
                        }
                    }
                }
            } else if (tof(route_res) === 'function') {
                if (context) {
                    route_res.call(context, req, res);
                } else {
                    // call the function... but maybe it's best / necessary to include the context.
                    //  call using the context when it exists, within the wildcard handler.
                    route_res(req, res);
                }
            } else if (tof(route_res) === 'undefined') {
                console.log('2) no defined route result', splitPath);
                return false;
            }
            if (processor_values_pair) {

            }
            return true;
        } else {
            return false;
        }
        //var 
        //console.log('parsed_url', parsed_url);
    }
}
//Router.prototype.type_levels = ['router'];
Router.Routing_Tree = Routing_Tree;

module.exports = Router;