let selectable = (ctrl) => {

    //console.log('ctrl.select_unique', ctrl.select_unique);

    let old_selectable = ctrl.selectable;


    if (!ctrl.__selectable) {
        ctrl.__selectable = true;
        let _selectable = false;
        let _select_unique = false;

        // select_unique

        let click_handler = (e) => {

            //console.log('selectable click e', e);

            if (_selectable) {
                var ctrl_key = e.ctrlKey;
                var meta_key = e.metaKey;
                if (!_select_unique && (ctrl_key || meta_key)) {
                    ctrl.action_select_toggle();
                } else {
                    ctrl.action_select_only();
                }
            }




            //e.stopPropagation();
        }

        //console.log('ctrl.selectable', ctrl.selectable);
        //console.trace();


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

                ctrl.deselect = ctrl.deselect || (() => {
                    ctrl.find_selection_scope().deselect(ctrl);
                })
                if (value === true) {

                    ctrl.action_select_only = ctrl.action_select_only || (() => {
                        //console.log('action_select_only');
                        var ss = this.find_selection_scope();
                        //console.log('ss', ss);
                        ss.select_only(this);

                        //this.find_selection_scope().select_only(this);
                    })

                    ctrl.action_select_toggle = ctrl.action_select_toggle || (() => {
                        this.find_selection_scope().select_toggle(this);
                    })

                    // ctrl.deselect();

                    if (typeof document === 'undefined') {
                        ctrl._fields = ctrl._fields || {};
                        ctrl._fields['selectable'] = true;
                        //ctrl.is_selectable = true;

                        // send this over to the client as a property.
                        //  a field to send to the client.

                    } else {

                        //this.click(click_handler);
                        ctrl.on('click', click_handler);
                    }


                } else {
                    if (typeof document === 'undefined') {
                        ctrl._fields = ctrl._fields || {};
                        ctrl._fields['selectable'] = false;
                        //ctrl.is_selectable = true;

                        // send this over to the client as a property.
                        //  a field to send to the client.


                    } else {

                        //this.click(click_handler);
                        //console.log('make unselectable');
                        ctrl.off('click', click_handler);
                    }
                }
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


        if (old_selectable !== undefined) {
            ctrl.selectable = old_selectable;
        }

    }






}

module.exports = selectable;