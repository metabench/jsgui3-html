// Other notifications within the framework?

// Kind of seems like both model and view.
//  Can be deleted from view... and when that happens maybe it will get deleted from the model as well.


// Data_Object could be upgraded to be like this???
//  The Control is based on Data_Object anyway.
//   Kind of as though it is the model (and view) all in one.
// May be best to iterate to make these data models work...

// Making a simple API may be the best....
//  a validate function
//  a data_transform_in function
//   being able to accept different types of data.

// Representing a color or a date in a really simple way.
// ['red', 'ui8']
// ['day_of_month', 'num (1 to 31)']





let deletable = (ctrl) => {
    // Respond to touch events.

    // generally want a 'press' event too.
    //  Could be a click, or a touch press.

    // Could raise a press or click event.
    //  Press could cover click and touch.
    //  Click could specifically be a mouse event to make least confusion / ambiguity long term.

    // Could have an emulate_clicks option.

    // Setting deletable to true or false...

    

    //console.log('ctrl.delete', ctrl.delete);

    ctrl.delete = () => {

        // remove it from the DOM
        ctrl.remove();

        // raise a delete event
        
        ctrl.raise('delete');
        // Delete corresponding objects too.

    }
}

module.exports = deletable;