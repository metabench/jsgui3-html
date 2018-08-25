const htmlparser = require('htmlparser');

// htmlparser2
//  faster? used in cheerio (like jQuery)

// page_context.map_Ctrls
//  then it will create the controls using the appropriate constructors.

// It's appropriate to make this before making the Business Suite controls.

// Mount content into a control - meaning the control itself would need to be changed.

// parse_mount function will just create the controls.
//  they could then be put into a DOM.

const parse_mount = (html, context) => {
    // parser in other thread?

    //var htmlparser = require("htmlparser2");

    /*
    var parser = new htmlparser.Parser({
        onopentag: function (name, attribs) {
            //if (name === "script" && attribs.type === "text/javascript") {
            //    console.log("JS! Hooray!");
            //}

            console.log('name', name);
            console.log('attribs', attribs);

        },
        ontext: function (text) {
            console.log("-->", text);
        },
        onclosetag: function (tagname) {
            if (tagname === "script") {
                console.log("That's it?!");
            }
        },
        onend: () => {
            console.log('parsing complete');
        }
    }, {
        decodeEntities: true
    });
    parser.write(html);
    parser.end();

    */

    var handler = new htmlparser.DomHandler((error, dom) => {
        if (error)
            throw 'err';
        else {
            console.log('dom', dom);
        }
        
    });
    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.end();
}
//


module.exports = parse_mount;