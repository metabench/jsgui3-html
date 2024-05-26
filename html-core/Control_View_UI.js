const {field, Data_Object, Data_Value, Evented_Class} = require('lang-tools');


const Control_View_UI_Low_Level = require('./Control_View_UI_Low_Level');

// Have a Data class?
//  Data_Model_Data even???
//  Just call it Data for the moment.

// jsgui3-data for now.


// And the Data class has a .model

// Control_View_UI_Compositional

// Compositional system is a bit complex....




class Control_View_UI_Compositional extends Data_Object {
    constructor(...a) {
        super(...a);

        // Models....
        //   Data_Model_List???
        //   Is getting on to Collection.

        // But just an array for the moment.

        
        this.models = [];


        field(this, 'model', new Data_Value());

        // A Data_Value that is set up to store an array?
        //  Later... just use js array here.


    }
}

class Control_View_UI_Active_Compositional extends Control_View_UI_Compositional {
    constructor(...a) {
        super(...a);

        // And this has a .model, a Data_Value (possibly???)
        //  That Data_Value would need to store control constructors.
        //  That should be OK, can get that better supported if needed.

        // .model of course.

        // a .model property.


        // maybe just a field for model so it can change and updates known about???

        // should respond to changes....
        //   at least raise the event.

        //field(this, 'model', new Data_Value());

        // Will need to listen to changes to recompose, as well as being able to use this compositional model to compose for the first time.









    }
}



class Control_View_UI_Active extends Data_Object {
    constructor(...a) {
        super(...a);


        const compositional = new Control_View_UI_Active_Compositional();
        Object.defineProperty(this, 'compositional', {get: () => compositional});


    }
}




class Control_View_UI extends Data_Object {
    constructor(...a) {
        super(...a);

        // context????


        // .data.model

        const active = new Control_View_UI_Active();
        // and a read-only property to access it....
        Object.defineProperty(this, 'active', {get: () => active});

        // .compositional

        const compositional = new Control_View_UI_Compositional();
        Object.defineProperty(this, 'compositional', {get: () => compositional});

        // compositional.model property is needed.
        //   And need to be able to set and make use of compositional models.

        //const ll = new Control_View_UI_Low_Level();
        //Object.defineProperty(this, 'll', {get: () => ll});




        // ui.compositional.active.model
        // ui.active.compositional.model

        // view.presentational???


        // view.ui.presentational.data.model perhaps???


        // view.ui.ll.data.model makes sense.








        // Does make for very clear syntax, and clarity that there can be inactive compositional models too.



        // ui.compositional.models too


    }

}

module.exports = Control_View_UI;