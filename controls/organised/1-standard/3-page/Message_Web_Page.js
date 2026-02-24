var jsgui = require('../../../../html-core/html-core');
const Standard_Web_Page = require('./Standard_Web_Page');

class Message_Web_Page extends Standard_Web_Page {
    'constructor'(spec) {
        super(spec);

        //const obj_message = 

        // message object...
        const body = this.body;

        let text = '';
        let title = '';

        if (spec.text) text = spec.text;
        if (spec.title) title = spec.title;

        if (title) this.title = title;

        // And make a new h1 and p in the body.

        const h1 = new jsgui.h1(title);
        body.add(h1);

        const p = new jsgui.p(text);
        body.add(p);



        //const text = spec.message.text;



    }
}

module.exports = Message_Web_Page;
