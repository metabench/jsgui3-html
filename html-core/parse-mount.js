//const htmlparser = require('htmlparser');

// htmlparser2
//  faster? used in cheerio (like jQuery)

// page_context.map_Ctrls
//  then it will create the controls using the appropriate constructors.

// It's appropriate to make this before making the Business Suite controls.

// Mount content into a control - meaning the control itself would need to be changed.
//const htmlparser = require('htmlparser');

// htmlparser2
//  faster? used in cheerio (like jQuery)

// page_context.map_Ctrls
//  then it will create the controls using the appropriate constructors.

// It's appropriate to make this before making the Business Suite controls.

// Mount content into a control - meaning the control itself would need to be changed.

// parse_mount function will just create the controls.
//  they could then be put into a DOM.

const { Default_Handler, Html_Parser } = require('./html_parser');
const { tof, each } = require('lang-tools');
const Text_Node = require('./text-node');

const map_jsgui_attr_names = {
    'name': true,
    'class': true,
    'content': true,
    '__type_name': true,
    'context': true,
    'key': true,
    'size': true
}

// Maybe redo this, making use of a recursion function.

// Just parse and add?
// Parse and instantiate?
// Parse and construct?

let __tpl_id = 0;

const tpl = function (strings, ...values) {
    const values_map = {};
    let str_content = '';

    strings.forEach((str, i) => {
        str_content += str;
        if (i < values.length) {
            const val = values[i];
            const placeholder = `__JSGUI_VAL_${__tpl_id++}__`;
            values_map[placeholder] = val;
            str_content += placeholder;
        }
    });

    return {
        str_content,
        values_map,
        mount: function (target, control_set) {
            // Activation mode: target already has a DOM element (client-side activation)
            if (target.dom && target.dom.el && typeof target._activate_tpl_bindings === 'function') {
                if (typeof target._restore_model_state_from_dom === 'function') {
                    target._restore_model_state_from_dom();
                }
                target._needs_tpl_activation = true;
                return [];
            }

            let cs = control_set || parse_mount.default_control_set || (target.context ? target.context.map_Controls : undefined);
            if (!cs || !cs.span) {
                // If it's still missing core HTML elements, try to get them from the global html-core exports to prevent lacking control exceptions
                try {
                    cs = require('./html-core').controls || {};
                } catch (err) {
                    cs = typeof jsgui !== 'undefined' ? jsgui.controls : {};
                }
            }

            // Store owner ID for binding serialization (activation support)
            const owner_id = target._id ? target._id() : null;
            if (owner_id) {
                values_map.__tpl_owner_id__ = owner_id;
            }

            let sync_err, sync_res;
            parse(str_content, target.context, cs, values_map, (err, res_parse) => {
                sync_err = err;
                sync_res = res_parse;
            });

            if (sync_err) throw sync_err;
            if (!sync_res) throw new Error("parse did not complete synchronously");

            const [depth_0_ctrls, res_controls] = sync_res;

            each(res_controls.named, (ctrl, name) => {
                target[name] = ctrl;
            });

            const is_active_context = target.context && target.context.__is_active;

            each(depth_0_ctrls, new_ctrl => {
                target.add(new_ctrl);
                if (is_active_context) {
                    setTimeout(() => {
                        new_ctrl.activate();
                    }, 0);
                }
            });

            // Serialize model state for activation
            if (owner_id && target.data && target.data.model) {
                const _bound_props = new Set();
                const _collect_bound = (ctrl) => {
                    if (ctrl && ctrl.dom && ctrl.dom.attributes) {
                        const attrs = ctrl.dom.attributes;
                        const attr_keys = Object.keys(attrs);
                        for (let i = 0; i < attr_keys.length; i++) {
                            const k = attr_keys[i];
                            if (k.startsWith('data-jsgui-bind-') && k !== 'data-jsgui-bind-owner' && k !== 'data-jsgui-bind-class') {
                                _bound_props.add(attrs[k]);
                            }
                            if (k === 'data-jsgui-bind-class') {
                                const pairs = String(attrs[k]).split(',');
                                for (let j = 0; j < pairs.length; j++) {
                                    const sep = pairs[j].indexOf(':');
                                    if (sep > 0) _bound_props.add(pairs[j].substring(sep + 1));
                                }
                            }
                        }
                    }
                    if (ctrl && ctrl.content && ctrl.content._arr) {
                        for (let i = 0; i < ctrl.content._arr.length; i++) {
                            _collect_bound(ctrl.content._arr[i]);
                        }
                    }
                };
                each(depth_0_ctrls, c => _collect_bound(c));

                if (_bound_props.size > 0) {
                    const _state = {};
                    const _unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : v)) : v;
                    for (const p of _bound_props) {
                        const raw = target.data.model.get ? target.data.model.get(p) : target.data.model[p];
                        const val = _unwrap(raw);
                        if (val !== undefined && typeof val !== 'function') {
                            if (typeof val === 'object' && val !== null) {
                                // Skip complex objects; only serialize primitives
                            } else {
                                _state[p] = val;
                            }
                        }
                    }
                    if (Object.keys(_state).length > 0) {
                        // Use &quot; encoding for safe HTML attribute embedding
                        const json = JSON.stringify(_state).replace(/"/g, '&quot;');
                        target.dom.attributes['data-jsgui-model-state'] = json;
                    }
                }
            }

            return depth_0_ctrls;
        }
    };
};

const log = () => { }
const parse = function (str_content, context, control_set, values_map_or_callback, callback) {
    let values_map = {};
    if (typeof values_map_or_callback === 'function') {
        callback = values_map_or_callback;
    } else if (values_map_or_callback) {
        values_map = values_map_or_callback;
    }

    //console.log('Parsing');
    //console.log('-------');
    //console.log('');
    str_content = str_content.trim();

    const handler = new Default_Handler(function (error, dom) {
        if (error) {
            log('parse error', error);
        }
        //[...do something for errors...]
        else {
            log('dom', dom);

            let recurse = (dom, depth, callback) => {
                let tdom = tof(dom);
                let res;
                log('tdom', tdom);
                log('dom item', dom);

                if (tdom === 'array') {
                    //res = [];
                    each(dom, (v, i) => {
                        //res.push(recurse)
                        recurse(v, depth + 1, callback);
                        // then later (depth first) callback
                        callback(v, depth, i);

                    })
                } else if (tdom === 'object') {
                    if (dom.children) {
                        each(dom.children, (child, i) => {
                            recurse(child, depth + 1, callback);

                            callback(child, depth, i);
                        })
                    }
                } else {
                    log('dom', dom);
                }
            }
            let last_depth = 0;
            let map_siblings_at_depth = {};
            let res_controls = {};
            const handle_text = (text, depth, sibling_index) => {
                // Not so sure we can give it the parent right here.
                //  Can only reconnect it once it's been put into the DOM.

                let tn = new Text_Node({
                    text: text,
                    context: context,
                    sibling_index: sibling_index
                });
                res_controls.unnamed = res_controls.unnamed || [];
                res_controls.unnamed.push(tn);
                map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                map_siblings_at_depth[depth].push(tn);
                last_depth = depth;

                // Any way of reconnecting the text node back with the DOM element?
                //  sibling_index property could help them to be reconnected later on, once its in the DOM.

                // Does seem like work on reconnecting text content / nodes with the activation of controls will be useful.
                //  Want the jsgui text node controls to have a reference to the DOM node.

                // Will look them up using the sibling index.

            }

            const handle_tag = (tag, depth, sibling_index) => {
                //console.log('handle_tag tag', tag);
                //console.log('depth', depth);
                //console.log('last_depth', last_depth);
                const tag_with_no_children = {};
                if (tag.raw) tag_with_no_children.raw = tag.raw;
                if (tag.data) tag_with_no_children.data = tag.data;
                if (tag.type) tag_with_no_children.type = tag.type;
                if (tag.name) tag_with_no_children.name = tag.name;
                if (tag.attribs) tag_with_no_children.attribs = tag.attribs;

                // Probably only worth giving the sibling index for text nodes, as that's where its needed to reconnect them.
                //  Need to make sure things work right with non-parse-mount too.

                const create_ctrl = (tag, content) => {

                    //console.log('tag.name', tag.name);
                    //console.log('!!control_set[tag.name]', !!control_set[tag.name]);

                    if (control_set[tag.name]) {
                        let Ctrl = control_set[tag.name];
                        log('tag', tag);
                        let a = tag.attribs || {};
                        if (content) a.content = content;
                        each(content, item => {
                            //log('content item', item);
                            //log('Object.keys(content item)', Object.keys(item));
                            //log('(content item.__type_name)', (item.__type_name));
                            //log('(content item._text)', (item._text));
                            //log('(content item.text)', (item.text));
                        })
                        // want an easier way to view the content.
                        //  don't want large printouts of the jsgui controls.
                        log('attribs a', a);
                        log('\n\n');
                        //log('!!target', !!target);
                        //log('!!target.context', !!target.context);
                        a.context = context;
                        let ctrl = new Ctrl(a);
                        if (a.name) {
                            res_controls.named = res_controls.named || {};
                            res_controls.named[a.name] = ctrl;
                        } else {
                            res_controls.unnamed = res_controls.unnamed || [];
                            res_controls.unnamed.push(ctrl);
                        }

                        const resolve_val = (v) => {
                            if (typeof v === 'string') {
                                const trimmed = v.trim();
                                if (trimmed.startsWith('__JSGUI_VAL_') && trimmed.endsWith('__')) {
                                    if (values_map && trimmed in values_map) {
                                        return values_map[trimmed];
                                    }
                                }
                            }
                            return v;
                        };

                        const arr_dom_attrs = [];
                        each(a, (a_value, a_name) => {
                            if (!map_jsgui_attr_names[a_name]) {
                                // Resolve placeholder if necessary
                                const resolved_val = resolve_val(a_value);
                                arr_dom_attrs.push([a_name, resolved_val])
                            }
                        })
                        each(arr_dom_attrs, attr => {
                            const [name, value] = attr;

                            // Advanced `bind-class` attribute
                            if (name === 'bind-class') {
                                if (value && typeof value === 'object') {
                                    const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;
                                    const _bcm_parts = [];
                                    each(value, (binding_val, class_name) => {
                                        let source_model, source_prop, transform_fn;
                                        if (Array.isArray(binding_val) && binding_val.length >= 2) {
                                            source_model = binding_val[0];
                                            source_prop = binding_val[1];
                                            if (binding_val.length >= 3 && typeof binding_val[2] === 'function') {
                                                transform_fn = binding_val[2];
                                            }
                                        } else if (binding_val && typeof binding_val === 'object' && binding_val.model) {
                                            source_model = binding_val.model;
                                            source_prop = binding_val.prop;
                                        }

                                        // Collect for activation serialization
                                        if (source_prop) {
                                            let part = class_name + ':' + source_prop;
                                            if (transform_fn) {
                                                // Detect simple negation: v => !v
                                                const fn_str = transform_fn.toString();
                                                if (/^\s*\(?\s*\w+\s*\)?\s*=>\s*!\s*\w+\s*$/.test(fn_str) ||
                                                    /^function\s*\(\w+\)\s*\{\s*return\s+!\w+\s*;?\s*\}$/.test(fn_str)) {
                                                    part = class_name + ':!' + source_prop;
                                                }
                                            }
                                            _bcm_parts.push(part);
                                        }

                                        if (source_model && source_prop && ctrl.watch) {
                                            const update_class = (val) => {
                                                const resolved = transform_fn ? transform_fn(unwrap(val)) : unwrap(val);
                                                if (resolved) ctrl.add_class(class_name);
                                                else ctrl.remove_class(class_name);
                                            };
                                            const init_val = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                            update_class(init_val);

                                            ctrl.watch(source_model, source_prop, (e) => {
                                                update_class((e && e.value !== undefined) ? e.value : e);
                                            });
                                        }
                                    });
                                    // Serialize bind-class for activation
                                    if (_bcm_parts.length > 0) {
                                        ctrl.dom.attributes['data-jsgui-bind-class'] = _bcm_parts.join(',');
                                        if (values_map && values_map.__tpl_owner_id__) {
                                            ctrl.dom.attributes['data-jsgui-bind-owner'] = values_map.__tpl_owner_id__;
                                        }
                                    }
                                }
                                return; // Skip standard attribute mapping
                            }

                            // Advanced `bind-style` attribute
                            if (name === 'bind-style') {
                                if (value && typeof value === 'object') {
                                    const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;
                                    each(value, (binding_val, style_prop) => {
                                        let source_model, source_prop;
                                        if (Array.isArray(binding_val) && binding_val.length === 2) {
                                            [source_model, source_prop] = binding_val;
                                        } else if (binding_val && typeof binding_val === 'object' && binding_val.model) {
                                            source_model = binding_val.model;
                                            source_prop = binding_val.prop;
                                        }

                                        if (source_model && source_prop && ctrl.watch) {
                                            const update_style = (raw_val) => {
                                                const val = unwrap(raw_val);
                                                ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

                                                if (val === null || val === undefined || val === false) {
                                                    delete ctrl.dom.attributes.style[style_prop];
                                                    if (ctrl.dom.el) {
                                                        if (style_prop.startsWith('--')) ctrl.dom.el.style.setProperty(style_prop, '');
                                                        else ctrl.dom.el.style[style_prop] = '';
                                                    }
                                                } else {
                                                    ctrl.dom.attributes.style[style_prop] = val;
                                                    if (ctrl.dom.el) {
                                                        if (style_prop.startsWith('--')) ctrl.dom.el.style.setProperty(style_prop, val);
                                                        else ctrl.dom.el.style[style_prop] = val;
                                                    }
                                                }
                                            };
                                            const init_val = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                            update_style(init_val);

                                            ctrl.watch(source_model, source_prop, (e) => {
                                                update_style((e && e.value !== undefined) ? e.value : e);
                                            });
                                        }
                                    });
                                }
                                return; // Skip standard attribute mapping
                            }

                            // Advanced `bind-visible` attribute
                            if (name === 'bind-visible') {
                                let source_model, source_prop;
                                if (Array.isArray(value) && value.length === 2) {
                                    [source_model, source_prop] = value;
                                } else if (value && typeof value === 'object' && value.model) {
                                    source_model = value.model;
                                    source_prop = value.prop;
                                }

                                if (source_model && source_prop && ctrl.watch) {
                                    const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;
                                    const update_visible = (raw_val) => {
                                        const is_visible = !!unwrap(raw_val);
                                        ctrl.dom.attributes.style = ctrl.dom.attributes.style || {};

                                        if (is_visible) {
                                            if (ctrl.dom.attributes.style.display === 'none') {
                                                delete ctrl.dom.attributes.style.display;
                                            }
                                            if (ctrl.dom.el && ctrl.dom.el.style.display === 'none') {
                                                ctrl.dom.el.style.display = '';
                                            }
                                        } else {
                                            ctrl.dom.attributes.style.display = 'none';
                                            if (ctrl.dom.el) ctrl.dom.el.style.display = 'none';
                                        }
                                    };

                                    const init_val = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                    update_visible(init_val);

                                    ctrl.watch(source_model, source_prop, (e) => {
                                        update_visible((e && e.value !== undefined) ? e.value : e);
                                    });
                                }
                                return; // Skip standard attribute mapping
                            }

                            // Advanced `bind-list` attribute
                            if (name === 'bind-list') {
                                const template_func = a.template ? resolve_val(a.template) : null;
                                let source_model, source_prop;
                                if (Array.isArray(value) && value.length === 2) {
                                    [source_model, source_prop] = value;
                                } else if (value && typeof value === 'object' && value.model) {
                                    source_model = value.model;
                                    source_prop = value.prop;
                                }

                                if (source_model && source_prop && template_func) {
                                    const render_list = () => {
                                        ctrl.clear();
                                        const list = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                        const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;
                                        const arr = unwrap(list);

                                        if (arr && Array.isArray(arr)) {
                                            arr.forEach((item, i) => {
                                                const child_layout = template_func(item, i);
                                                if (child_layout && child_layout.mount) child_layout.mount(ctrl);
                                                else if (child_layout.add_class) ctrl.add(child_layout); // is a Control
                                            });
                                        } else if (arr && arr.each) { // Data_Object Collection
                                            let i = 0;
                                            arr.each(item => {
                                                const child_layout = template_func(item, i++);
                                                if (child_layout && child_layout.mount) child_layout.mount(ctrl);
                                                else if (child_layout.add_class) ctrl.add(child_layout);
                                            });
                                        }
                                    };

                                    if (ctrl.watch) {
                                        ctrl.watch(source_model, source_prop, () => render_list());
                                        const current_list = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                        if (current_list && current_list.on) current_list.on('change', () => render_list());
                                    }
                                    render_list();
                                }
                                return;
                            }

                            // Normal `bind-*` properties
                            if (name.startsWith('bind-')) {
                                const dest_prop = name.substring(5);
                                let source_model, source_prop, opts = { bidirectional: true };

                                if (Array.isArray(value) && value.length === 2) {
                                    [source_model, source_prop] = value;
                                } else if (value && typeof value === 'object' && value.model) {
                                    source_model = value.model;
                                    source_prop = value.prop;
                                    opts = value.options || opts;
                                }

                                if (source_model && source_prop) {
                                    // Serialize binding for activation
                                    ctrl.dom.attributes['data-jsgui-bind-' + dest_prop] = source_prop;
                                    if (values_map && values_map.__tpl_owner_id__) {
                                        ctrl.dom.attributes['data-jsgui-bind-owner'] = values_map.__tpl_owner_id__;
                                    }

                                    if (dest_prop === 'text') {
                                        // BIND-TEXT: set SSR text content + watch for changes
                                        const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;
                                        const init_val = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                        const text_str = unwrap(init_val);
                                        if (text_str !== undefined && text_str !== null) {
                                            ctrl.add(String(text_str));
                                        }
                                        if (ctrl.watch) {
                                            ctrl.watch(source_model, source_prop, (e) => {
                                                const new_val = unwrap((e && e.value !== undefined) ? e.value : e);
                                                const str = (new_val === undefined || new_val === null) ? '' : String(new_val);
                                                if (ctrl.dom.el) {
                                                    ctrl.dom.el.textContent = str;
                                                }
                                            });
                                        }
                                        return;
                                    }

                                    if ((tag.name === 'input' || tag.name === 'textarea' || tag.name === 'select') && dest_prop === 'value') {
                                        // NATIVE HTML INPUT INTERCEPTION
                                        const unwrap = (v) => v ? (typeof v.value === 'function' ? v.value() : (v.value !== undefined ? v.value : (v.get ? v.get() : v))) : v;

                                        const update_dom = (val) => {
                                            const uval = unwrap(val);
                                            const str_val = (uval === undefined || uval === null) ? '' : String(uval);
                                            ctrl.dom.attributes.value = str_val;
                                            if (ctrl.dom.el) ctrl.dom.el.value = str_val;
                                        };
                                        const init_val = source_model.get ? source_model.get(source_prop) : source_model[source_prop];
                                        update_dom(init_val);

                                        if (ctrl.watch) {
                                            ctrl.watch(source_model, source_prop, (e) => {
                                                update_dom((e && e.value !== undefined) ? e.value : e);
                                            });
                                        }

                                        if (opts.bidirectional !== false) {
                                            const on_dom_change = (e) => {
                                                const new_val = e.target ? e.target.value : (e.value || '');
                                                let typed_val = new_val;
                                                if (ctrl.dom.attributes.type === 'number') {
                                                    const n = Number(new_val);
                                                    if (!isNaN(n)) typed_val = n;
                                                }
                                                if (source_model.set) source_model.set(source_prop, typed_val);
                                                else source_model[source_prop] = typed_val;
                                            };
                                            if (ctrl.on) {
                                                ctrl.on('input', on_dom_change);
                                                ctrl.on('change', on_dom_change);
                                            }
                                        }
                                    } else if (ctrl._binding_manager) {
                                        ctrl._binding_manager.bind_value(
                                            source_model, source_prop,
                                            ctrl.data.model, dest_prop,
                                            opts
                                        );
                                    } else if (ctrl.data && ctrl.data.model) {
                                        ctrl.data.model.set(dest_prop, source_model.get ? source_model.get(source_prop) : source_model[source_prop]);
                                        // TODO: watch
                                    }
                                }
                                return;
                            }

                            if (name.startsWith('on-')) {
                                const event_name = name.substring(3);
                                if (typeof value === 'function') {
                                    ctrl.on(event_name, value);
                                    // Serialize for activation - extract method name from function source
                                    if (values_map && values_map.__tpl_owner_id__) {
                                        const fn_str = value.toString();
                                        const method_match = fn_str.match(/this\.(\w+)\s*\(/);
                                        if (method_match) {
                                            ctrl.dom.attributes['data-jsgui-on-' + event_name] = method_match[1];
                                            ctrl.dom.attributes['data-jsgui-bind-owner'] = values_map.__tpl_owner_id__;
                                        }
                                    }
                                }
                                return;
                            }

                            if (name === 'template') {
                                // Ignore template property entirely for DOM layout strings, it's consumed by bind-list
                                return;
                            }

                            if (name === 'data-model') {
                                if (!ctrl.data) ctrl.data = {};
                                ctrl.data.model = value;
                                return;
                            }

                            if (typeof value === 'string') {
                                ctrl.dom.attributes[name] = value;
                            } else {
                                ctrl.dom.attributes[name] = value;
                                ctrl[name] = value;
                            }
                        });

                        return ctrl;
                    } else {
                        // The app's controls need to be loaded / registered previous to this.
                        //log('lacking jsgui control for ' + tag.name);
                        // The server app should register it?
                        //console.log('tag', tag);
                        console.trace();
                        throw 'lacking jsgui control for ' + tag.name;
                    }
                }
                let my_children;
                let ctrl;

                if (depth > last_depth) {
                    ctrl = create_ctrl(tag_with_no_children);
                    map_siblings_at_depth[depth] = []; // because its a new depth?
                    map_siblings_at_depth[depth].push(ctrl);

                } else if (depth < last_depth) {
                    //console.log('depth decrease');
                    my_children = map_siblings_at_depth[last_depth];
                    if (my_children) {
                        ctrl = create_ctrl(tag_with_no_children, my_children);
                    } else {
                        ctrl = create_ctrl(tag_with_no_children);
                    }
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[last_depth] = null;
                    map_siblings_at_depth[depth].push(ctrl);
                } else {
                    ctrl = create_ctrl(tag_with_no_children);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[depth].push(ctrl);
                }
                // Create a control out of the tag
                last_depth = depth;
            }
            // goes depth-first.
            //  want the item's sibling index too.
            try {
                recurse(dom, 0, (item, depth, sibling_index) => {
                    if (item.type === 'text') {
                        let trimmed = item.data.trim();
                        //log('trimmed', trimmed);
                        //log('trimmed.length', trimmed.length);
                        if (trimmed.length > 0) {
                            handle_text(item.raw, depth, sibling_index);
                        }
                        // Need to rapidly 
                    } else if (item.type === 'tag' || item.type === 'script' || item.type === 'style') {
                        // does it have children?
                        // if not, create a control from the children.
                        // then if it does, what are its control children?
                        //log('tag item', item);
                        //log('item.children.length', item.children.length);
                        handle_tag(item, depth, sibling_index);
                    }
                });
                const depth_0_ctrls = map_siblings_at_depth[0] || [];
                callback(null, [depth_0_ctrls, res_controls]);
            } catch (e) {
                console.error("Error in parse recurse:", e.stack);
                callback(e);
            }
        }
        //[...parsing done, do something...]
    });
    var parser = new Html_Parser(handler);
    parser.parse_complete(str_content);
}

// Not sure why this separation breaks things.
//  Timing - cant be async, needs to be immediate with callback. Cant await the parsing promise and have it work.


// Maybe change back to old parse_mount and fix tomorrow?
//  Or parse function will always / just use a callback?

const parse_mount = function (str_content, target, control_set, values_map = {}) {
    // And this should be a promise too, it seems.
    //  Not so sure though.
    //  Promise puts in some kind of a delay.

    // Maybe this fn would be better with a callback too.
    return new Promise(async (solve, jettison) => {
        let container;
        let a = arguments;
        let l = a.length;
        if (l >= 3 && a[2] && typeof a[2].add === 'function') {
            container = a[2];
            control_set = a[3];
            values_map = a[4] || {};
        } else {
            container = target;
        }
        const { context } = target;
        // And make it async to announce when it's complete?
        //  Won't take long though.

        //const [depth_0_ctrls, res_controls] = await parse(str_content, context, control_set);

        parse(str_content, context, control_set, values_map, (err, res_parse) => {
            if (err) {
                jettison(err);
            } else {

                const [depth_0_ctrls, res_controls] = res_parse;

                //console.log('depth_0_ctrls', depth_0_ctrls);
                //console.log('res_controls', res_controls);

                // Go through all named controls.
                //  Set the name of target[a.name] = ctrl;
                each(res_controls.named, (ctrl, name) => {
                    //console.log('name', name);
                    target[name] = ctrl;
                });
                const is_active_context = context.__is_active;

                //console.log('is_active_context', is_active_context);
                //console.log('depth_0_ctrls.length', depth_0_ctrls.length);
                each(depth_0_ctrls, new_ctrl => {
                    //console.log('pre add new_ctrl');

                    // how many children within this control?
                    //console.log('');
                    //console.log('new_ctrl._id()', new_ctrl._id());
                    //console.log('new_ctrl', new_ctrl);

                    // parse does not add content (correctly) to the first level 0.

                    container.add(new_ctrl);
                    // activate it here?
                    //  test to see if it's in an active context?
                    //console.log('is_active_context', is_active_context);
                    // Wait...?
                    //  May be better to integrate auto activation at a lower level.

                    if (is_active_context) {
                        setTimeout(() => {
                            new_ctrl.activate();
                        }, 0);
                    }
                });

                //log('res_controls', res_controls);
                //log('Object.keys(res_controls)', Object.keys(res_controls));
                //console.log('Object.keys(res_controls.named)', Object.keys(res_controls.named));

                // Go through the named controls.
                // should have both .named and .unnamed

                // Maybe don't bother with this?
                //  Are they all named?
                //   Or reconstruct it?

                //console.log('!!res_controls.named', !!res_controls.named);

                if (res_controls.named) {
                    target._ctrl_fields = target._ctrl_fields || {};
                    Object.assign(target._ctrl_fields, res_controls.named);
                }

                solve(depth_0_ctrls);

            }
        })






    })





}





// with 4 params - have a target, and a container

const ____old_parse_mount = function (str_content, target, control_set) {

    let container;
    let a = arguments;
    let l = a.length;
    if (l === 4) {
        container = a[2];
        control_set = a[3];
    } else {
        container = target;
    }
    // Add it to the container (may be subcontrol). Mount it to the target.
    // A promise would probably do for the moment.
    //  could use var DOMParser = require('xmldom').DOMParser;

    // May need to make some nice isomorphic code for browser and node.

    console.log('parse_mount str_content', str_content);
    // Unfortunately seems like it will be async when using htmlparser?
    //  Or need a callback?
    //  Make a new parser, find one, use integrated parser somehow?

    // Parse the str_content into a DOM.
    //  parse-mounts into the target

    // Comes up with a spec for each of the items parsed.

    // remove white space first

    str_content = str_content.trim();

    const { context } = target;

    //log('parse_mount str_content', str_content);
    //log('target._id()', target._id());

    // Recursively go through the html-like, creating jsgui controls.
    //  This will enable much more concise expression of jgsui controls.

    //var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
    var handler = new Default_Handler(function (error, dom) {
        if (error) {
            log('parse error', error);
        }
        //[...do something for errors...]
        else {
            log('dom', dom);
            // Then can recurse through the dom object.
            //  Nice that it parses non-standard elements.

            // depth-first recursion for creation of the elements.
            //  Then will add them to the parents as they get created.
            // replace the children with controls?

            // when doing 

            let recurse = (dom, depth, callback) => {
                let tdom = tof(dom);
                let res;
                log('tdom', tdom);
                log('dom item', dom);

                if (tdom === 'array') {
                    //res = [];
                    each(dom, v => {
                        //res.push(recurse)
                        recurse(v, depth + 1, callback);

                        // then later (depth first) callback
                        callback(v, depth);

                    })
                } else if (tdom === 'object') {
                    if (dom.children) {
                        each(dom.children, child => {
                            recurse(child, depth + 1, callback);

                            callback(child, depth);
                        })
                    }
                } else {
                    log('dom', dom);
                }
            }
            // want to create the items as well.
            //  start with innermost, adding the child controls to the outer ones.
            //   need to be able to run controls from these strings which come as templates.
            //   eliminate the need for much of the control construction code, at least make it much more concise.


            /*
            const new_ctrl_made = (ctrl) => {
                // this will need to assemble to controls into a heirachy.
                //  May need to know the depth so to know which to join together.

                // includes text controls
            }
            */

            // handle text
            //  should know what level the text is at
            //   needs to know when the level decreases so we can put the children in the parent.

            let last_depth = 0;

            // maybe need a map of siblings at depth
            //let child_nodes = [];
            // siblings in a list, children in a list?
            //  or only need one list with depth-first?
            // can build it up within the closure.

            // sounds like we need it as we add to the tree at different depths.
            // map of open arrays at different depths?

            // need to push the text node at the depth.

            let map_siblings_at_depth = {};
            // Then when moving up a depth we nullify the array
            //  Then moving down the depth we create a new array.
            //  Do this for controls.
            //  Including text controls.

            let res_controls = {};

            const handle_text = (text, depth) => {

                //child_nodes.push(text);

                // Maybe don't need the text node control here.
                //  When we have the text as a single child, we can declare it as a property.
                //  However, the full text node instantiation makes sense for not taking shortcuts.

                let tn = new control_set.Text_Node({
                    text: text,
                    context: context
                });

                //log('tn', tn);
                //log('text', text);
                //log('tn instanceof Text_Node', tn instanceof control_set.Text_Node);
                //log('tn.text', tn.text);
                //log('tn._text', tn._text);
                //throw 'stop';
                res_controls.unnamed = res_controls.unnamed || [];
                res_controls.unnamed.push(tn);
                // push it into siblings at depth too.
                map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                map_siblings_at_depth[depth].push(tn);

                // doesn't have a name though.
                //  there will be other unnamed controls that should be returned in the results.
                // The names maybe will not be so important.

                last_depth = depth;
            }

            // an array of siblings at levels
            //  then remove? the array when going up a level, use it as the children for a node?

            // need to be able to start up a node while specifying its content?
            //  including the content in the spec could work well.
            //   

            // Get rid of the span rendering shortcut?
            //  Always use the textNode?
            //  Have the .text property a shortcut to modifying that text node?

            // Span .text is really convenient in many cases.
            // Spans can contain other elements so it's worth being careful.

            // The .text shortcut looks like its not carrying out the underlying dom functionality.
            //  Better to have it do the underlying dom tasks properly, and then have sugar around that.

            // So don't have special rendering for the span element.
            // Divs / controls can take text nodes too.

            // Maybe have .text read-only.
            //  .set_text too?
            //  .set_text for convenience in some situations.
            //   In other situations, we use proper text nodes alongside whatever else goes inside a span.

            // the .text set and get property could stay for convienience.
            //  It needs to deal with textNode object underneith though.

            // General route is to handle things in the conventional DOM way on a lower level
            //  Then on a higher level there will be systems of convenience for the programmer.

            // So setting text will replace the content.
            //  Get rid of the specialised span rendering.
            //  Get rid of text property for the moment?
            //   Or have it do its stuff on a lower level.


            const handle_tag = (tag, depth) => {

                console.log('handle_tag tag', tag);

                const tag_with_no_children = {};
                if (tag.raw) tag_with_no_children.raw = tag.raw;
                if (tag.data) tag_with_no_children.data = tag.data;
                if (tag.type) tag_with_no_children.type = tag.type;
                if (tag.name) tag_with_no_children.name = tag.name;
                if (tag.attribs) tag_with_no_children.attribs = tag.attribs;

                // Then the name property - need to use these named controls to set the control's _ctrl_fields

                //log('handle_tag tag_with_no_children', tag_with_no_children);
                // maybe pass through the tag with no children. the children have been made into controls.

                // will add to the collection of siblings.
                // has the depth increased?
                // create control...

                // and the children? content
                const create_ctrl = (tag, content) => {
                    if (control_set[tag.name]) {
                        //log('has jsgui control for ' + tag.name);

                        // need to look into if there are child jsgui controls within this.

                        let Ctrl = control_set[tag.name];
                        // work out the spec as well.
                        log('tag', tag);
                        let a = tag.attribs || {};

                        // Why isnt content working in the spec?
                        //  Expecially with a Text_Node?
                        if (content) a.content = content;
                        //log('content.length', content.length);

                        each(content, item => {
                            //log('content item', item);
                            //log('Object.keys(content item)', Object.keys(item));
                            //log('(content item.__type_name)', (item.__type_name));
                            //log('(content item._text)', (item._text));
                            //log('(content item.text)', (item.text));
                        })

                        // want an easier way to view the content.
                        //  don't want large printouts of the jsgui controls.



                        log('attribs a', a);
                        log('\n\n');
                        //log('!!target', !!target);
                        //log('!!target.context', !!target.context);
                        a.context = context;

                        let ctrl = new Ctrl(a);
                        if (a.name) {
                            res_controls.named = res_controls.named || {};
                            res_controls.named[a.name] = ctrl;

                            // Expected behaviour to replace existing composition code.
                            target[a.name] = ctrl;

                            //res_controls[a.name] = ctrl;
                        } else {
                            res_controls.unnamed = res_controls.unnamed || [];
                            res_controls.unnamed.push(ctrl);
                        }
                        // and unnamed controls
                        //  an array of them...

                        // The name property - possibly name could be stored by the control itself.
                        //  Different to its id.

                        //log('!!ctrl', !!ctrl);
                        //log('depth', depth);

                        return ctrl;
                    } else {
                        // The app's controls need to be loaded / registered previous to this.
                        //log('lacking jsgui control for ' + tag.name);

                        // The server app should register it?


                        //console.log('tag', tag);
                        console.trace();

                        throw 'lacking jsgui control for ' + tag.name;
                    }
                }

                // create the control at this stage?
                //  having a 'content' or 'children' property could work well here.
                //  setting .content would make sense well.

                let my_children;
                let ctrl;

                if (depth > last_depth) {

                    // Likely will happen.
                    //  The fix I put in got lost before.
                    //  It does not need to do that much where there are no child nodes.



                    ctrl = create_ctrl(tag_with_no_children);
                    //map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    map_siblings_at_depth[depth] = []; // because its a new depth?
                    map_siblings_at_depth[depth].push(ctrl);

                    console.log('depth > last_depth [depth, last_depth]', [depth, last_depth]);
                    console.trace();
                    //throw 'NYI';

                    // Not sure how this will happen as the depth should move outwards?
                    //  Will need to check / measure recursion order.

                    // 
                    map_siblings_at_depth[depth] = [];

                    // but need to add the item.
                    //map_siblings_at_depth[depth].push();

                    //log('child_nodes', child_nodes);

                    //child_nodes = [];


                } else if (depth < last_depth) {

                    //log('child_nodes', child_nodes);
                    // create the control.

                    //child_nodes = [];
                    // my children in array!!!
                    //log('last_depth', last_depth);

                    my_children = map_siblings_at_depth[last_depth];
                    //log('my_children', my_children);

                    //throw 'stop';

                    if (my_children) {
                        //log('my_children.length', my_children.length);
                        ctrl = create_ctrl(tag_with_no_children, my_children);
                    } else {
                        ctrl = create_ctrl(tag_with_no_children);
                    }
                    //log('ctrl.content._arr.length', ctrl.content._arr.length);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    // do we need to keep these child controls now?
                    //  prob best not to.
                    map_siblings_at_depth[last_depth] = null;
                    map_siblings_at_depth[depth].push(ctrl);

                    // create the ctrl including the content.

                    // create the control with the children.
                    //  maybe just say they are 'content'.

                    // being able to choose content subcontrols at declaration seems very important here.


                } else {
                    ctrl = create_ctrl(tag_with_no_children);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[depth].push(ctrl);

                    // I think that means that this one doesn't have children either.
                    // same depth - sibling
                    //  create a new control.
                    //   I think this means that the last control in the loop had no subcontrols.
                    // Will need to observe the algo in operation to make sure it works correctly.
                    //child_nodes.push(tag)

                }
                // Create a control out of the tag
                last_depth = depth;
            }

            // goes depth-first.
            recurse(dom, 0, (item, depth) => {
                //log('item', item);
                //log('depth', depth);

                // analyse the item
                //  is it an element (tag)?

                if (item.type === 'text') {
                    // These don't have children
                    //  They are also the inner-most.
                    // create a jsgui text node.
                    //log('text item', item);
                    // trim it

                    let trimmed = item.data.trim();
                    //log('trimmed', trimmed);
                    //log('trimmed.length', trimmed.length);

                    if (trimmed.length > 0) {
                        handle_text(item.raw, depth);
                    }
                    // Need to rapidly 
                } else if (item.type === 'tag' || item.type === 'script' || item.type === 'style') {
                    // does it have children?

                    // if not, create a control from the children.

                    // then if it does, what are its control children?

                    //log('tag item', item);
                    //log('item.children.length', item.children.length);

                    handle_tag(item, depth);

                    /*
                    if (!item.children) {
                        log('no children item', item);
                        throw 'stop';
                    }
                    */

                }
            });
            // Really not that good parse-mount being async.
            //  May need to fix that for it to work.
            //   Composition should be instant, but does not need to return a value.

            // Would be best to separate out the parsing.
            //
            // the parse result is the depth 0 controls.

            const depth_0_ctrls = map_siblings_at_depth[0];


            // then once the recursion is done, see what's at level 0
            //log('');
            //log('map_siblings_at_depth[0]', map_siblings_at_depth[0]);

            //log('map_siblings_at_depth[0].length', map_siblings_at_depth[0].length);

            //log('map_siblings_at_depth', map_siblings_at_depth);
            //throw 'stop';

            // context.__is_active?
            //  
            //const context = target.context;
            const is_active_context = context.__is_active;

            each(depth_0_ctrls, new_ctrl => {
                container.add(new_ctrl);

                // activate it here?
                //  test to see if it's in an active context?

                //console.log('is_active_context', is_active_context);

                // Wait...?
                //  May be better to integrate auto activation at a lower level.

                if (is_active_context) {
                    setTimeout(() => {
                        new_ctrl.activate();
                    }, 0);
                }

            });

            target._ctrl_fields = target._ctrl_fields || {};
            //log('res_controls', res_controls);
            //log('Object.keys(res_controls)', Object.keys(res_controls));
            //console.log('Object.keys(res_controls.named)', Object.keys(res_controls.named));

            // Go through the named controls.
            // should have both .named and .unnamed

            // Maybe don't bother with this?
            //  Are they all named?
            //   Or reconstruct it?

            if (res_controls.named) {
                Object.assign(target._ctrl_fields, res_controls.named);
            }

            //throw 'stop';

            // and a callback?
            // Seems like the async is not a problem - but its not adding the text.

            // Handling async composition may be useful though.



            //throw 'stop';
        }
        //[...parsing done, do something...]
    });
    var parser = new Html_Parser(handler);
    parser.parse_complete(str_content);
}
//

const res = {
    parse: parse,
    parse_mount: parse_mount,
    tpl: tpl
}

module.exports = res;
