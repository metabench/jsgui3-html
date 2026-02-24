const {
    prop,
    field
} = require('obext');
const { each, is_array, is_def } = require('lang-mini');

/**
 * Selectable mixin — adds selection state to a control.
 *
 * Tracks `selected` as a boolean reactive property and optionally
 * applies the `'selected'` CSS class. On the server side the state
 * is persisted through the view data model so it survives SSR.
 *
 * @param {Control} ctrl        - the control to enhance
 * @param {*}       ctrl_handle - control handle (passed through)
 * @param {Object}  [opts]      - options
 */
const selectable = (ctrl, ctrl_handle, opts) => {
    ctrl._selectable_mixin_state = ctrl._selectable_mixin_state || {};
    const mx_state = ctrl._selectable_mixin_state;

    const setup_isomorphic = () => {
        if (mx_state.isomorphic_applied) return;
        mx_state.isomorphic_applied = true;

        const mixins = ctrl.view?.data?.model?.mixins;
        if (mixins && typeof mixins.each === 'function' && typeof mixins.push === 'function') {
            let has_selectable = false;
            mixins.each(mixin => {
                if (mixin && mixin.name === 'selectable') has_selectable = true;
            });

            if (!has_selectable) {
                const old_silent = mixins.silent;
                mixins.silent = true;
                mixins.push({
                    name: 'selectable'
                });
                mixins.silent = old_silent;
            }
        }

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
        if (!mx_state.server_pre_render_applied) {
            mx_state.server_pre_render_applied = true;

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
    }

    if (ctrl.dom.el) {
        if (mx_state.dom_applied) return;
        mx_state.dom_applied = true;

        let select_toggle = false;
        let select_multi = false;
        let condition;
        let preventDefault = true;
        let selection_action = ['mousedown', 'touchstart'];
        let enable_drag = false;

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
            if (opts.drag) {
                enable_drag = true;
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
                    // Drag selection support (opt-in via opts.drag = true)
                    if (enable_drag && !ctrl._drag_select_applied) {
                        ctrl._drag_select_applied = true;
                        const drag_el = (ctrl_handle.dom && ctrl_handle.dom.el) || ctrl_handle.el;
                        if (drag_el) {
                            const DRAG_THRESHOLD = 4;
                            let drag_md_pos = null;
                            let drag_active = false;

                            const on_drag_mm = (e) => {
                                if (!drag_md_pos) return;
                                if (!drag_active) {
                                    const dx = e.pageX - drag_md_pos[0];
                                    const dy = e.pageY - drag_md_pos[1];
                                    if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
                                        drag_active = true;
                                        ctrl.raise('drag-select-start', { source: ctrl, event: e });
                                    }
                                } else {
                                    ctrl.raise('drag-select-move', { source: ctrl, event: e });
                                }
                                e.preventDefault();
                            };
                            const on_drag_mu = (e) => {
                                if (drag_active) {
                                    ctrl.raise('drag-select-end', { source: ctrl, event: e });
                                }
                                drag_md_pos = null;
                                drag_active = false;
                                document.removeEventListener('mousemove', on_drag_mm);
                                document.removeEventListener('mouseup', on_drag_mu);
                            };

                            drag_el.addEventListener('mousedown', (e) => {
                                if (!ctrl.selectable || ctrl.disabled) return;
                                drag_md_pos = [e.pageX, e.pageY];
                                drag_active = false;
                                document.addEventListener('mousemove', on_drag_mm);
                                document.addEventListener('mouseup', on_drag_mu);
                            });
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
module.exports = selectable;
