const {
    prop,
    field
} = require('obext');


// Worth redoing this / changing it later
//  Support press-events
//  Default to selecting on complete press.
//  Half-select or something on press-down?

// Seems rather important to fix this / upgrade this.
//  Always??? use press-events?
//   Makes sense as long as press-events works well.


// Makes a capability as a mixin.
//  Selectable can be true or false.
//  Mixins should generally provide capabilities rather than switch on functionality...?
//   Could switch some thing on with intelligent defaults.


// Maybe this can be rewritten and simplified.
//  Code made less complex here?
//  Change it gradually?

// Click, press, pointer dowm, pointer up etc...
//  Choice about what action triggers the selection.





let selectable = (ctrl, ctrl_handle, opts) => {
    // A few variables concerning how selection works.
    // ui action -> selection action
    // select 1
    //  deselect with further select action
    // select multi
    // select_toggle
    // select_multi
    // two different variables would cover it.
    // but still single selection.
    let select_toggle = false;
    // select only...
    let select_multi = false;
    // will allow meta key toggle
    let condition;

    let preventDefault = true;
    // maybe defining a bunch of params and actions?
    //  then having a 'mode' preset.
    // press action
    //  select_only
    //  
    // and then options for selecting multiple with the meta / ctrl key
    // Or it could be a selection scope mode.
    //let multi_select = 

    // Press events will be better
    //  And be able to respond to press-end as well as press-start, that will be configurable.
    

    let selection_action = ['mousedown', 'touchstart'];

    // want select on press-end
    //  could make sense to use press-events here.
    //  more versitile. press-events could become a greater part of the platform.

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

        // disable default select?
        //  or respond to a different event / set of events.
    }
    // Should have options,
    //  with the handle being one of the options.
    //   Though could interpret the params to keep the API.
    //   Can check if it is a control.
    // touchstart as well.
    // select on mousedown?
    ctrl_handle = ctrl_handle || ctrl;
    let old_selectable = ctrl.selectable;
    let click_handler = (e) => {
        // or not a click
        console.log('selectable click e', e);
        //console.log('!!ctrl.selection_scope', !!ctrl.selection_scope);
        //console.log('ctrl.selectable', ctrl.selectable);

        if (ctrl.selectable && !ctrl.selection_scope && !ctrl.disabled) {
            if (!condition || condition()) {
                //console.log('passed condition check');
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
                        //console.log('pre select only');
                        //console.log('ctrl.action_select_only', ctrl.action_select_only);
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
                //e.stopPropagation();
                //e.preventDefault();
            } else {
                console.log('failed condition check');
            }
            //e.stopPropagation();
            //e.preventDefault();
        }
    }
    ctrl.on('change', e_change => {
        let {
            name,
            value
        } = e_change;
        if (name === 'selected') {
            //console.log('selected value', value);
            if (value) {
                ctrl.add_class('selected');
            } else {
                ctrl.remove_class('selected');
            }
        };
        return true;
    });

    let ss;
    const apply_all = ctrl => {
        let id = ctrl._id();
        //ctrl.once_active(() => {
        // 

        ctrl.on('change', e_change => {
            //console.log('e_change', e_change);
            let n = e_change.name,
                value = e_change.value;
            // old selectable value too?
            // notify the selection scope?
            let ss = ctrl.find_selection_scope();
            if (n === 'selected') {
                //console.log('1) ss', ss);
                if (value === true) {
                    ctrl.add_class('selected');
                    ss.map_selected_controls[id] = ctrl;
                } else {
                    ctrl.remove_class('selected');
                    ss.map_selected_controls[id] = null;
                }
            }
            if (n === 'selectable') {
                if (value === true) {
                    //ctrl.once_active(() => {
                        apply_active_selectable(ctrl);
                    //})
                } else {
                    if (typeof document === 'undefined') {
                        //ctrl._fields = ctrl._fields || {};
                        //ctrl._fields['selectable'] = false;
                        //ctrl.is_selectable = true;
                        // send this over to the client as a property.
                        //  a field to send to the client.
                    } else {
                        //this.click(click_handler);
                        //console.log('make unselectable');

                        if (Array.isArray(selection_action)) {
                            //console.log('selection_action', selection_action);
                            selection_action.forEach(i => {
                                ctrl_handle.off(i, click_handler);
                            })
                        } else {
                            ctrl_handle.off(selection_action, click_handler);
                        }
                        //ctrl_handle.off(selection_action, click_handler);
                        ctrl_handle.has_selection_click_handler = false;
                    }
                }
            }
        })
    }

    const apply_active_selectable = ctrl => {
        //ss = ss || ctrl.find_selection_scope();
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
        // need to listen for the control desele-

        ctrl.action_select_only = ctrl.action_select_only || (() => {
            //console.log('action_select_only');
            ss = ss || ctrl.find_selection_scope();
            //console.log('ss', ss);
            if (ss) {
                ss.select_only(ctrl);
                //ctrl.raise('select');
                //ctrl.add_class('selected');
            }
            //this.find_selection_scope().select_only(this);
        });
        ctrl.action_select_toggle = ctrl.action_select_toggle || (() => {
            ss = ss || ctrl.find_selection_scope();
            //console.log('ss', ss);
            ss.select_toggle(ctrl);
        });
        // ctrl.deselect();
        if (typeof document === 'undefined') {
            //ctrl._fields = ctrl._fields || {};
            //ctrl._fields['selectable'] = true;
            //ctrl.is_selectable = true;
            // send this over to the client as a property.
            //  a field to send to the client.
        } else {
            // Problem with multiple once_active callbacks?
            //console.log('pre once active');
            //console.log('ctrl.__active', ctrl.__active);
            ctrl.once_active(() => {
                //console.log('selectable once active');

                if (!ctrl_handle.has_selection_click_handler) {
                    ctrl_handle.has_selection_click_handler = true;
                    //setTimeout(() => {

                    if (Array.isArray(selection_action)) {
                        //console.log('selection_action', selection_action);
                        selection_action.forEach(i => {
                            ctrl_handle.on(i, click_handler);
                        })
                    } else {
                        ctrl_handle.on(selection_action, click_handler);
                    }
                    // bit of a hack to fix a bug.
                    //}, 0);
                }
            });
            //this.click(click_handler);
            //console.log('ctrl.has_selection_click_handler', ctrl.has_selection_click_handler);
        }
    }

    if (!old_selectable) {
        field(ctrl, 'selected');
        field(ctrl, 'selectable');
        //field(ctrl, 'select_unique');
        //});
        apply_all(ctrl);
    };

    ctrl.on('activate', e => {
        //console.log('selectable ctrl activate', ctrl.selectable);
        if (ctrl.selectable) apply_all(ctrl);
    })

    if (old_selectable !== undefined) {
        ctrl.selectable = old_selectable;
    }
}

module.exports = selectable;