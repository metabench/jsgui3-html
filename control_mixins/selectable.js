const {
    prop,
    field
} = require('obext');

let selectable = (ctrl, ctrl_handle) => {
    let selection_action = ['mousedown', 'touchstart'];

    // touchstart as well.


    // select on mousedown?
    ctrl_handle = ctrl_handle || ctrl;
    let old_selectable = ctrl.selectable;
    let click_handler = (e) => {
        console.log('selectable click e', e);
        //console.log('!!ctrl.selection_scope', !!ctrl.selection_scope);
        //console.log('ctrl.selectable', ctrl.selectable);
        if (ctrl.selectable && !ctrl.selection_scope) {
            var ctrl_key = e.ctrlKey;
            var meta_key = e.metaKey;
            if ((ctrl_key || meta_key)) {
                ctrl.action_select_toggle();
            } else {
                //console.log('pre select only');
                //console.log('ctrl.action_select_only', ctrl.action_select_only);
                ctrl.action_select_only();
            }
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

    if (!old_selectable) {
        field(ctrl, 'selected');
        field(ctrl, 'selectable');
        field(ctrl, 'select_unique');
        let id = ctrl._id();


        // only once the control is active...

        //ctrl.once_active(() => {
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
                    //ctrl.add_class('selected');
                    ss.map_selected_controls[id] = ctrl;
                } else {
                    //ctrl.remove_class('selected');
                    ss.map_selected_controls[id] = null;
                }
            }
            if (n === 'selectable') {
                if (value === true) {
                    ctrl.deselect = ctrl.deselect || (() => {
                        if (ss) ss.deselect(ctrl);
                    });
                    ctrl.action_select_only = ctrl.action_select_only || (() => {
                        //console.log('action_select_only');
                        let ss = ctrl.find_selection_scope();
                        //console.log('ss', ss);
                        if (ss) {
                            ss.select_only(ctrl);
                            ctrl.raise('select');
                        }
                        //this.find_selection_scope().select_only(this);
                    });
                    ctrl.action_select_toggle = ctrl.action_select_toggle || (() => {
                        let ss = ctrl.find_selection_scope();
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

                        ctrl.once_active(() => {
                            console.log('selectable once active');

                            if (!ctrl_handle.has_selection_click_handler) {
                                ctrl_handle.has_selection_click_handler = true;
                                //setTimeout(() => {

                                    if (Array.isArray(selection_action)) {
                                        console.log('selection_action', selection_action);


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
                        ctrl_handle.off(selection_action, click_handler);
                        ctrl_handle.has_selection_click_handler = false;
                    }
                }
            }
        })
        //});


    };

    if (true) {
        //ctrl.__selectable = true;
        //let _selectable = false;
        //let _select_unique = false;
        // select_unique

        //console.log('ctrl.selectable', ctrl.selectable);
        //console.trace();

        try {

        } catch (err) {

        }

        // but it won't be defined.
        if (old_selectable !== undefined) {
            ctrl.selectable = old_selectable;
        }
        /*
        Object.defineProperty(ctrl, 'selectable', {
            get() {
                return _selectable;
            },
            set(value) {

                //console.log('set selectable', value);

                // However, should be stored as RGB or better a Color object.
                //  Just [r, g, b] for the moment.
                //  Color object with a Typed Array could be nice.
                //  pixel.color = ...
                //   could be OK for low level programming.

                let old = _selectable;
                _selectable = value;
                // Handling the change may be best here though.
                ctrl.raise('change', {
                    'name': 'selectable',
                    'old': old,
                    //'new': _disabled,
                    'value': _selectable
                });
            },
            enumerable: true,
            configurable: true
        });
        */

        /*
        Object.defineProperty(ctrl, 'select_unique', {
            get() {
                return _select_unique;
            },
            set(value) {

                //console.log('set selectable', value);

                // However, should be stored as RGB or better a Color object.
                //  Just [r, g, b] for the moment.
                //  Color object with a Typed Array could be nice.
                //  pixel.color = ...
                //   could be OK for low level programming.

                let old = _select_unique;
                _select_unique = value;

                // Handling the change may be best here though.
                if (typeof document === 'undefined') {
                    ctrl._fields = ctrl._fields || {};
                    ctrl._fields['select_unique'] = value;
                    //ctrl.is_selectable = true;

                    // send this over to the client as a property.
                    //  a field to send to the client.

                }


                this.raise('change', {
                    'name': 'select_unique',
                    'old': old,
                    //'new': _disabled,
                    'value': _selectable
                });

            },
            enumerable: true,
            configurable: false
        });
        */
    }

}

module.exports = selectable;