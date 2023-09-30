

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

// Could make this a tree-router

// Could make this an Evented_Class / observable
//  Evented_Class that raises its own log events.



class Routing_Tree {
    constructor(spec) {
        this.root = new Routing_Tree_Node();
    }
    get arr_paths() {
        const res = [];
        const iterate = (node) => {


            if (node.mapNormalPathChildren) {
                // Object.entries()
                console.log('node.name', node.name);
                const children = Object.entries(node.mapNormalPathChildren);

                if (children.length > 0) {
                    for (let c = 0; c < children.length; c++) {
                        iterate(children[c]);
                    }
                }
            }
        }
        return res;
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


            // Maybe make some options / classes to hold options / option sets for URL modification.


            // 
            // Maybe best not to remove this initial '/'???

            //if (strRoute.substr(0, 1) == '/') strRoute = strRoute.substr(1);
            // remove any beginning or trailing '/' from the route

            //if (strRoute.substr(strRoute.length - 1) == '/') strRoute = strRoute.substr(0, strRoute.length - 1);
            //console.log('strRoute ' + strRoute);
            var splitRoute = strRoute.split('/');

            //console.log('splitRoute', splitRoute);

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
                        //console.log('next_level_node', next_level_node);
                        if (!next_level_node) {
                            currentNode.mapNormalPathChildren[strLevel] = new Routing_Tree_Node();
                            next_level_node = currentNode.mapNormalPathChildren[strLevel];
                            // 
                            //console.log('should have made node');
                        }

                        if (c === splitRoute.length - 1) {
                            //console.log('c === splitRoute.length - 1');
                            //console.log('currentNode', currentNode);
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

        //console.log('router get url: ', url);
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
            // remove any beginning or trailing '/' from the route???


            //if (url.substr(url.length - 1) == '/') url = url.substr(0, url.length - 1);

            //if (url.substr(0, 1) == '/') url = url.substr(1);
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
                                if (url.endsWith('/')) str_wildcard_value += '/';

                                //console.log('url', url);
                                //console.log(`url.endsWith('/')`, url.endsWith('/'));
                                //console.log('a) str_wildcard_value', str_wildcard_value);

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

Routing_Tree.Node = Routing_Tree_Node;
Routing_Tree.Variable_Node = Variable_Routing_Tree_Node;
Routing_Tree.Wildcard_Node = Wildcard_Routing_Tree_Node;

module.exports = Routing_Tree;