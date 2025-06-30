const {
    prop,
    field
} = require('obext');
const {each, is_array, is_def} = require('lang-mini');

// Listening to a pre-server-side-render or pre-ssr event would help with persisting some things.
// Maybe want some more specific view data model persistance.

// server-pre-render event I think.

// Being able to say a grid is selectable or has selectableness, ie the grid cells can be selected.

const selectable = (ctrl, ctrl_handle, opts) => {
    const setup_isomorphic = () => {
        const old_silent = ctrl.view.data.model.mixins.silent;
        ctrl.view.data.model.mixins.silent = true;
        ctrl.view.data.model.mixins.push({
            name: 'selectable'
        });
        ctrl.view.data.model.mixins.silent = old_silent;
        ctrl.on('change', e_change => {
            let {
                name,
                value
            } = e_change;
            if (name === 'selected') {
                if (value) {
                    ctrl.add_class('selected');
                } else {
                    ctrl.remove_class('selected');
                }
            };
            return true;
        });
    }
    setup_isomorphic();

    if (typeof document === 'undefined') {
        ctrl.on('server-pre-render', e => {
            //console.log('selectable server-pre-render');

            if (ctrl.selectable === true) {
                ctrl._fields = ctrl._fields || {};
                //ctrl._fields.selected = ctrl.selected;

                ctrl._fields.selectable = true;

                if (ctrl.selected === true) {
                    ctrl._fields.selected = true;
                }

            }

        })
    }

    if (ctrl.dom.el) {
        let select_toggle = false;
        let select_multi = false;
        let condition;
        let preventDefault = true;
        let selection_action = ['mousedown', 'touchstart'];

        const old_selectable = ctrl.selectable;


        if (old_selectable) {
            console.trace();
            throw 'NYI / Deprecated';
        } else {
            if (!opts) {
                if (ctrl_handle) {
                    if (!ctrl_handle.activate) {
                        opts = ctrl_handle;
                        ctrl_handle = undefined;
                    }
                }
            }
            if (opts) {
                if (opts.handle) {
                    ctrl_handle = opts.handle;
                }
                if (opts.select_toggle || opts.toggle) {
                    select_toggle = true;
                }
                if (opts.select_multi || opts.multi) {
                    select_multi = true;
                }
                if (opts.single) {
                    select_multi = false;
                }
                if (opts.selection_action) {
                    selection_action = opts.selection_action;
                }
                if (opts.condition) {
                    condition = opts.condition;
                }
                if (opts.preventDefault === false) {
                    preventDefault = false;
                }
            }
            ctrl_handle = ctrl_handle || ctrl;
            
            let click_handler = (e) => {
                if (ctrl.selectable && !ctrl.selection_scope && !ctrl.disabled) {
                    if (!condition || condition()) {
                        var ctrl_key = e.ctrlKey;
                        var meta_key = e.metaKey;
                        if (select_multi) {
                            if ((ctrl_key || meta_key)) {
                                ctrl.action_select_toggle();
                            } else {
                                if (select_toggle) {
                                    ctrl.action_select_toggle();
                                } else {
                                    ctrl.action_select_only();
                                }
                            }
                        } else {
                            if (select_toggle) {
                                if (ctrl.selected) {
                                    ctrl.deselect();
                                } else {
                                    ctrl.action_select_only();
                                }
                            } else {
                                ctrl.action_select_only();
                            }
                        }
                        if (preventDefault) {
                            e.preventDefault();
                        }
                    } else {
                        console.log('failed condition check');
                    }
                } else {
                }
            }
            let ss;
            const apply_all = ctrl => {
                let id = ctrl._id();
                ctrl.on('change', e_change => {
                    let n = e_change.name,
                        value = e_change.value;
                    let ss = ctrl.find_selection_scope();
                    if (n === 'selected') {
                        if (value === true) {
                            ctrl.add_class('selected');
                            if (ss) ss.map_selected_controls[id] = ctrl;
                        } else {
                            ctrl.remove_class('selected');
                            if (ss) ss.map_selected_controls[id] = null;
                        }
                    }
                    if (n === 'selectable') {
                        if (value === true) {
                                apply_active_selectable(ctrl);
                        } else {
                            if (typeof document === 'undefined') {
                            } else {
                                if (is_array(selection_action)) {
                                    selection_action.forEach(i => {
                                        ctrl_handle.off(i, click_handler);
                                    })
                                } else {
                                    ctrl_handle.off(selection_action, click_handler);
                                }
                                ctrl_handle.has_selection_click_handler = false;
                            }
                        }
                    }
                });
            }
            const apply_active_selectable = ctrl => {
                ctrl.deselect = ctrl.deselect || (() => {
                    ss = ss || ctrl.find_selection_scope();
                    if (ss) ss.deselect(ctrl);
                    ctrl.raise('deselect');
                });
                ctrl.select = ctrl.select || (() => {
                    ss = ss || ctrl.find_selection_scope();
                    if (ss) ss.select(ctrl);
                    ctrl.raise('select');
                });
                ctrl.action_select_only = ctrl.action_select_only || (() => {
                    ss = ss || ctrl.find_selection_scope();
                    if (ss) {
                        ss.select_only(ctrl);
                    } else {
                        each(ctrl.siblings, sibling => {
                            sibling.selected = false;
                        });
                        ctrl.selected = true
                    }
                });
                ctrl.action_select_toggle = ctrl.action_select_toggle || (() => {
                    ss = ss || ctrl.find_selection_scope();
                    ss.select_toggle(ctrl);
                });
                if (typeof document === 'undefined') {
                } else {
                    ctrl.once_active(() => {
                        if (!ctrl_handle.has_selection_click_handler) {
                            ctrl_handle.has_selection_click_handler = true;
                            if (Array.isArray(selection_action)) {
                                selection_action.forEach(i => {
                                    ctrl_handle.on(i, click_handler);
                                })
                            } else {
                                ctrl_handle.on(selection_action, click_handler);
                            }
                        }
                    });
                }
            }
            //if (!old_selectable) {
                field(ctrl, 'selected');
                field(ctrl, 'selectable');
                apply_all(ctrl);
            //};
            ctrl.on('activate', e => {
                if (ctrl.selectable) apply_all(ctrl);
            })

            //if (old_selectable !== undefined) {
            //    ctrl.selectable = old_selectable;
            //}
        }

        
    }
}
module.exports = selectable;