

// Also see about more low / mid level support for compositional models modes.
//   Supporting a wordy API (explicit but not rediculous), but with shortcuts, will be helpful.




class Cell extends Control {
    constructor(spec) {
        (spec = spec || {}).__type_name = 'cell';
        super(spec);
        this.add_class('cell');
        field(this, 'x', spec.x);
        field(this, 'y', spec.y);
        field(this, 'data', spec.data);
        if (!spec.el) {
            this.compose_grid_cell();
        }
    }
    compose_grid_cell() {
        let o = {
            context: this.context
        };
        if (this.data) o.text = this.data;
        this.add(this.span = new jsgui.span(o));
        this._ctrl_fields = this._ctrl_fields || {};
        this._ctrl_fields.span = this.span;
    }
    activate() {
        if (!this.__active) {
            super.activate();
            mx_selectable(this);
        }
    }
}

module.exports = Cell;

// And also want to integrate with data sources.
// Possibly a Data_Grid subclass of Data_Model could help most with this.
//   Especially with the data updating, and representing that on a grid.

// Also, the Grid control was the control that was proving most difficult when it came to the .size property.
//  Ambiguity over if it's the dimensions of the data, or the size in pixels in the UI.

// .view.size may be a useful way to express it clearly.
// .data.size or .data.model.value.size even....

// Do want the unambiguous short(er) ways of expressing it.

// .view.ui.data.model.size even???

// a ui model or ui data model???
// .view.ui.data.copy()
// view.ui.data.toUInt8Array() ???

// having .data be more general, then data.model being the data_model instance makes sense in terms of a flexible API.
//   Writing this should be fairly concise because some high level code can use the very specific mid level code to do things that would
//   otherwise take a few lines or be more complex than it otherwise would without the very specific mid level code.







