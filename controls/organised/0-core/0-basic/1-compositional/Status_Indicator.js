

const Indicator = require('./Indicator');

// Could link to a property or even a .status property by default.
//   listen for on change status of a Data_Model or control.

// 

// 'View Data Model' sounds like a data model that ius used to describe the view, possibly in terms of other data models.



// This is a good one to work on for view model abstraction. It's both simple and could be made complex.
//   On or off, or some more complex status.

// So there could be multiple view models. Create multiple view model specs, or have a system where multiple can
//   be handled within a single spec.


class Status_Indicator extends Indicator {
    constructor(spec) {
        super(spec);

        // on status change?

        // bind some status words with css classes even.
        //     

        this.on('change', e => {
            const { name, value } = e;
            //if (name === 'status') {
            //    this.update_status(value);
            //}
            console.log('status indicator change', name, value);
        });
        this.data.on('change', e => {
            const { name, value } = e;
            //if (name === 'status') {
            //    this.update_status(value);
            //}
            console.log('status indicator .data change', name, value);
        });
        this.data.model.on('change', e => {
            const { name, value } = e;
            //if (name === 'status') {
            //    this.update_status(value);
            //}
            console.log('status indicator .data.model change', name, value);
        });
    }

    // bind this to a data value?
    //   simple function, could deal with lower level stuff where necessary.

    
}

// listen for status changes in something its linked to or its own data model.

Status_Indicator.css = `
.indicator {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background-color: var(--status-indicator-color, gray);
}       
.indicator.on {
    background-color: green;
}       
.indicator.off {
    background-color: red;
}
.indicator.yes {
    background-color: blue;
}
.indicator.no {
    background-color: orange;
}   
.indicator.unknown {
    background-color: gray;
}   
`;

module.exports = Status_Indicator;

// then yes or no statuses. or on and off?

