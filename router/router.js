// Tree_Router?

// Somewhat substantial changes with it not removing the first '/'.

var url = require('url-parse'),
    //jsgui = require('lang-tools'),
    jsgui = require('lang-tools'),
    //os = require('os'),
    //http = require('http');
    //stringify = jsgui.stringify,
    //each = jsgui.each,
    //arrayify = jsgui.arrayify,
    tof = jsgui.tof;
//var filter_map_by_regex = jsgui.filter_map_by_regex;
//var Class = jsgui.Class,
//    Data_Object = jsgui.Data_Object;
//var fp = jsgui.fp,
//    is_defined = jsgui.is_defined;
//var Collection = jsgui.Collection;
var get_item_sig = jsgui.get_item_sig;

// Not a Data_Object.
//  Adding this to a Collection should not put it inside a Data_Object layer.

// Should make this able to deal with routing to different 'host' value servers.

const Routing_Tree = require('./routing-tree');

const default_logger = (level, message, meta) => {
    const log_meta = meta && Object.keys(meta).length ? meta : undefined;
    if (level === 'error' && console.error) {
        console.error('[router]', message, log_meta || '');
    } else if (level === 'warn' && console.warn) {
        console.warn('[router]', message, log_meta || '');
    } else if (console.log) {
        console.log('[router]', message, log_meta || '');
    }
};

const default_not_found_handler = (req, res) => {
    if (res) {
        if (typeof res.statusCode === 'number') {
            res.statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 404;
        }
        if (typeof res.setHeader === 'function' && !res.headersSent) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        }
        if (typeof res.end === 'function' && !res.writableEnded) {
            res.end('Not Found');
        }
    }
};

class Router {
    constructor(spec) {
        spec = spec || {};
        //this.set('type_levels', ['router']);
        if (spec.name) {
            this.name = spec.name;
        } else {
            this.name = 'Router';
        }
        this.routing_tree = new Routing_Tree();
        this.logger = spec.logger || default_logger;
        this.handle_not_found_fn = spec.handle_not_found || default_not_found_handler;
        this.handle_error_fn = spec.handle_error;
        this._listeners = new Map();
    }
    on(event_name, handler) {
        if (!handler) return this;
        let set_listeners = this._listeners.get(event_name);
        if (!set_listeners) {
            set_listeners = new Set();
            this._listeners.set(event_name, set_listeners);
        }
        set_listeners.add(handler);
        return this;
    }
    off(event_name, handler) {
        if (!handler) return this;
        const set_listeners = this._listeners.get(event_name);
        if (set_listeners) {
            set_listeners.delete(handler);
            if (set_listeners.size === 0) {
                this._listeners.delete(event_name);
            }
        }
        return this;
    }
    emit(event_name, ...args) {
        const set_listeners = this._listeners.get(event_name);
        if (!set_listeners || set_listeners.size === 0) return false;
        for (const listener of Array.from(set_listeners)) {
            try {
                listener(...args);
            } catch (err) {
                this._log('error', 'router_listener_error', {
                    event: event_name,
                    error: err
                });
            }
        }
        return true;
    }
    _log(level, message, meta) {
        if (this.logger) {
            try {
                this.logger(level, message, meta || {});
            } catch (err) {
                if (console && console.error) {
                    console.error('[router] logger error', err);
                }
            }
        }
    }
    set_logger(fn_logger) {
        this.logger = fn_logger || default_logger;
    }
    set_not_found_handler(fn_handler) {
        this.handle_not_found_fn = fn_handler || default_not_found_handler;
    }
    set_error_handler(fn_handler) {
        this.handle_error_fn = fn_handler;
    }
    'start'(callback) {
        callback(null, true);
    }
    'set_route'(str_route, context, fn_handler) {
        //var rt = this.get('routing_tree');

        // Routing tree not properly setting routes beginning with '/'?
        this._log('debug', 'set_route', {
            route: str_route
        });
        return this.routing_tree.set(str_route, context, fn_handler);
    }
    'meets_requirements'() {
        return true;
    }
    _invoke_handler(handler, context, req, res, params, result) {
        try {
            if (params && typeof params === 'object') {
                req.params = params;
            }
            if (context) {
                handler.call(context, req, res);
            } else {
                handler(req, res);
            }
            result.handled = true;
            result.params = params;
        } catch (err) {
            result.handled = true;
            result.params = params;
            result.handlerError = err;
            this._log('error', 'handler_error', {
                url: req && req.url,
                error: err,
                params
            });
            this.emit('error', err, {
                req,
                res,
                params,
                handler
            });
            if (this.handle_error_fn) {
                try {
                    this.handle_error_fn(err, req, res, params);
                } catch (secondary_err) {
                    this._log('error', 'error_handler_failure', {
                        url: req && req.url,
                        error: secondary_err
                    });
                    this.emit('error', secondary_err, {
                        req,
                        res,
                        params,
                        handler: this.handle_error_fn,
                        stage: 'error-handler'
                    });
                }
            }
        }
    }
    _handle_not_found(req, res, meta, result) {
        const details = Object.assign({
            url: req && req.url
        }, meta || {});
        this._log('warn', 'route_not_found', details);
        this.emit('not-found', {
            req,
            res,
            meta: details
        });
        if (this.handle_not_found_fn) {
            try {
                this.handle_not_found_fn(req, res);
            } catch (err) {
                result.handlerError = err;
                this._log('error', 'not_found_handler_error', {
                    url: req && req.url,
                    error: err
                });
                this.emit('error', err, {
                    req,
                    res,
                    stage: 'not-found'
                });
            }
        }
    }
    get arr_paths() {
        return this.routing_tree.arr_paths;
    }
    'process'(req, res) {

        const result = {
            handled: false,
            params: undefined,
            handlerError: undefined
        };

        var rt = this.routing_tree;

        let parsed_url;
        try {
            parsed_url = url(req.url, true);
        } catch (err) {
            this._log('error', 'url_parse_error', {
                url: req && req.url,
                error: err
            });
            result.handlerError = err;
            this.emit('error', err, {
                req,
                res,
                stage: 'url-parse'
            });
            return result;
        }

        if (!parsed_url) {
            return result;
        }

        var route_res = rt.get(req.url);
        var handler;
        var context;
        var params;

        var route_type = tof(route_res);

        if (route_type === 'array') {
            var rr_sig = get_item_sig(route_res, 1);
            if (route_res.length === 3) {
                context = route_res[0];
                handler = route_res[1];
                params = route_res[2];
            } else if (rr_sig == '[D,f]') {
                context = route_res[0];
                handler = route_res[1];
            } else if (rr_sig == '[f,o]') {
                handler = route_res[0];
                params = route_res[1];
            } else if (rr_sig == '[o,f]') {
                context = route_res[0];
                handler = route_res[1];
            } else if (route_res.length === 2 && typeof route_res[0] === 'function' && tof(route_res[1]) === 'object') {
                handler = route_res[0];
                params = route_res[1];
            }
        } else if (route_type === 'function') {
            handler = route_res;
        } else if (route_type === 'object' && route_res) {
            if (typeof route_res.handler === 'function') {
                handler = route_res.handler;
                context = route_res.context;
                if (route_res.params) {
                    params = route_res.params;
                }
            }
        }

        if (handler && typeof handler === 'function') {
            this._invoke_handler(handler, context, req, res, params, result);
            return result;
        }

        this._handle_not_found(req, res, {
            url: req && req.url
        }, result);
        return result;
    }
}
//Router.prototype.type_levels = ['router'];
Router.Routing_Tree = Routing_Tree;

module.exports = Router;