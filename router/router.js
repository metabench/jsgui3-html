var url = require('url'),
    jsgui = require('../lang/lang'),
    os = require('os'),
    http = require('http');

var stringify = jsgui.stringify,
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

// May need some general purpose traversal functions?
class Routing_Tree_Node {
    constructor(spec) {
        spec = spec || {};
        if (spec.handler) this.handler = spec.handler;
        this.mapNormalPathChildren = {};
    }
}
class Variable_Routing_Tree_Node {
    constructor(spec) {
        this.name = spec.name;
        if (spec.handler) this.handler = spec.handler;
        this.mapNormalPathChildren = {};
    }
}
class Wildcard_Routing_Tree_Node {
    constructor(spec) {

    }
}

// Wildcards having names?
//  Or it just processes the wildcard info as one variable?

// Want to be able to get the Routing_Tree_Node corresponding with a path

class Routing_Tree {
    constructor(spec) {
        this.root = new Routing_Tree_Node();
    }
    'setRoot404'(handler) {
        this.root404Handler = handler;
    }
    'set'(strRoute, context, handler) {

        if (!handler) {
            handler = context;
            context = undefined;
        }
        if (strRoute == '/') {
            //console.log('setting root handler');
            //throw 'stop';
            if (context) this.root.context = context;
            this.root.handler = handler;
        } else {
            if (strRoute.substr(0, 1) == '/') strRoute = strRoute.substr(1);
            // remove any beginning or trailing '/' from the route

            if (strRoute.substr(strRoute.length - 1) == '/') strRoute = strRoute.substr(0, strRoute.length - 1);
            //console.log('strRoute ' + strRoute);
            var splitRoute = strRoute.split('/');
            var currentNode = this.root;

            // traverse through to find the place.
            //  need to deal with creating variable nodes too if needed.

            var c = 0;
            while (c < splitRoute.length) {
                var strLevel = splitRoute[c];
                var isVariable = strLevel.substr(0, 1) == ':';
                var isWildcard = strLevel == '*';
                if (isVariable) {
                    var variableName = strLevel.substr(1);
                    //console.log('variableName', variableName);
                    if (!currentNode.variableChild) {
                        currentNode.variableChild = new Variable_Routing_Tree_Node({
                            'name': variableName
                        });
                        if (c == splitRoute.length - 1) {
                            currentNode.variableChild.handler = handler;
                            if (context) currentNode.variableChild.context = context;
                        }
                        currentNode = currentNode.variableChild;
                    } else {
                        currentNode = currentNode.variableChild;
                    }
                    //throw '8) stop';
                } else {
                    if (isWildcard) {
                        currentNode.wildcardChild = new Wildcard_Routing_Tree_Node();
                        currentNode.wildcardChild.handler = handler;
                        if (context) currentNode.wildcardChild.context = context;
                    } else {
                        var next_level_node = currentNode.mapNormalPathChildren[strLevel];
                        if (!next_level_node) {
                            currentNode.mapNormalPathChildren[strLevel] = new Routing_Tree_Node();
                            next_level_node = currentNode.mapNormalPathChildren[strLevel];
                        }

                        if (c == splitRoute.length - 1) {
                            currentNode.mapNormalPathChildren[strLevel].handler = handler;
                            if (context) currentNode.mapNormalPathChildren[strLevel].context = context;
                        }
                        currentNode = next_level_node;
                        //console.log('new currentNode ' + currentNode);
                    }
                }
                c++;
            }
        }
    }
    'get'(url) {
        // routes the URL through the tree
        var params;
        if (url == '/') {
            var root = this.root;
            //console.log('root.context', root.context);
            if (root.context) {
                return [root.context, this.root.handler, {}];
            } else {
                var res;
                if (this.root.handler) {
                    res = this.root.handler;
                } else {
                    if (this.root.wildcardChild) {
                        if (this.root.wildcardChild.handler) {
                            if (this.root.wildcardChild.context) {
                                return [this.root.wildcardChild.context, this.root.wildcardChild.handler, {}];
                            } else {
                                return this.root.wildcardChild.handler;
                            }
                            throw 'stop';
                        }
                    }
                }
                return res;
            }
        } else {
            // remove any beginning or trailing '/' from the route
            if (url.substr(url.length - 1) == '/') url = url.substr(0, url.length - 1);
            if (url.substr(0, 1) == '/') url = url.substr(1);
            // process the url to remove the querystring.
            var posQM = url.indexOf('?');
            if (posQM > -1) {
                url = url.substr(0, posQM);
            }
            //console.log('url ' + url);
            var splitUrl = url.split('/');
            var currentNode = this.root;
            // traverse through to find the place.
            var c = 0;
            while (c < splitUrl.length) {
                var strLevel = splitUrl[c];
                if (currentNode) {
                    var next_level_node = currentNode.mapNormalPathChildren[strLevel];
                    if (next_level_node) {
                        //console.log('no next level node'); //???
                    } else {
                        if (currentNode.variableChild) {
                            next_level_node = currentNode.variableChild;
                            //console.log('next_level_node', next_level_node);
                            params = params || {};
                            params[currentNode.variableChild.name] = decodeURI(strLevel);
                        } else {
                            if (currentNode.wildcardChild) {
                                var arr_the_rest = splitUrl.slice(c);
                                //console.log('arr_the_rest', arr_the_rest);
                                var str_wildcard_value = arr_the_rest.join('/');
                                if (currentNode.wildcardChild.context) {
                                    return [currentNode.wildcardChild.context, currentNode.wildcardChild.handler, {
                                        'wildcard_value': str_wildcard_value
                                    }];
                                } else {
                                    return [currentNode.wildcardChild.handler, {
                                        'wildcard_value': str_wildcard_value
                                    }];
                                }
                            }
                        }
                    }
                }
                if (c === splitUrl.length - 1) {
                    //console.log('the last');
                    //console.log('!!next_level_node', !!next_level_node);
                    if (next_level_node) {
                        //console.log('next_level_node', next_level_node);
                        //console.log('next_level_node.handler ' + next_level_node.handler);
                        if (next_level_node.handler) {
                            if (params) {
                                if (next_level_node.context) {
                                    return [next_level_node.context, next_level_node.handler, params];
                                } else {
                                    return [next_level_node.handler, params];
                                }
                            } else {
                                if (next_level_node.context) {
                                    return [next_level_node.context, next_level_node.handler];
                                } else {
                                    return next_level_node.handler;
                                }
                            }
                        } else {
                            if (next_level_node.wildcardChild) {
                                var arr_the_rest = splitUrl.slice(c);
                                //console.log('arr_the_rest', arr_the_rest);
                                var str_wildcard_value = arr_the_rest.join('/');
                                //console.log('str_wildcard_value', str_wildcard_value);
                                if (params) {
                                    params.wildcard_value = decodeURI(str_wildcard_value);

                                    if (next_level_node.wildcardChild.context) {
                                        return [next_level_node.wildcardChild.context, next_level_node.wildcardChild.handler, params];
                                    } else {
                                        return [next_level_node.wildcardChild.handler, params];
                                    }
                                } else {
                                    if (next_level_node.wildcardChild.context) {

                                        return [next_level_node.wildcardChild.context, next_level_node.wildcardChild.handler, params];
                                    } else {
                                        return [next_level_node.wildcardChild.handler, {
                                            'wildcard_value': str_wildcard_value
                                        }];
                                    }
                                }
                            }
                            // Could handle a variable handler here?
                        }
                    } else {
                        if (currentNode) {
                            return [currentNode.handler, params];
                        }

                    }
                }
                currentNode = next_level_node;
                c++;
            }
            return this.root404Handler;
            // having 404 within websocket connection? why not, when using an internal path.
            //throw '5) stop';
        }
    }
}

// Not a Data_Object.
//  Adding this to a Collection should not put it inside a Data_Object layer.


class Router {

    //'fields': {
    //    'routing_tree': Routing_Tree
    //}

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

        var url_parts = url.parse(req.url, true);
        var splitPath = url_parts.path.substr(1).split('/');

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
                        console.log('1) no defined route result', splitPath);

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
    }
}

//Router.prototype.type_levels = ['router'];

Router.Routing_Tree = Routing_Tree;

module.exports = Router;