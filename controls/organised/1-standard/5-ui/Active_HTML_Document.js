const jsgui = require('../html-core/html-core');

const {Blank_HTML_Document} = jsgui;



class Active_HTML_Document extends Blank_HTML_Document {



    constructor(spec = {}) {
        //console.log('Client_HTML_Document');
        super(spec);
        //spec.context.ctrl_document = this;
        this.active();
    }

    // Seems a bit like 'view features'.

    'include_js'(url) {
        /*
        Add it to the end of the body instead.
        */
        //var head = this.get('head');
        const body = this.get('body');
        var script = new jsgui.script({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        });
        var dom = script.dom;
        var domAttributes = dom.attributes;
        domAttributes.type = 'text/javascript';
        domAttributes.src = url;
        body.add(script);
    }

    'include_css'(url) {
        var head = this.get('head');
        var link = new jsgui.link({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        })
        // <script data-main="scripts/main" src="scripts/require.js"></script>
        var dom = link.dom;
        var domAttributes = dom.attributes;
        domAttributes['rel'] = 'stylesheet';
        domAttributes['type'] = 'text/css';
        //domAttributes.set('src', '/js/require.js');
        domAttributes['href'] = url;
        head.content.add(link);
    }

    'include_jsgui_client'(js_file_require_data_main) {
        js_file_require_data_main = js_file_require_data_main || '/js/web/jsgui-html-client';
        var head = this.head;
        var body = this.body;
        var script = new jsgui.script({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        })
        var domAttributes = script.dom.attributes;
        domAttributes.set({
            'type': 'text/javascript',
            'src': '/js/web/require.js',
            'data-main': js_file_require_data_main
        });
        body.add(script);
    }
    'include_client_css'() {
        var head = this.get('head');
        var link = new jsgui.link({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        });
        var domAttributes = link.dom.attributes;
        domAttributes.rel = 'stylesheet';
        domAttributes.type = 'text/css';
        domAttributes.href = '/css/basic.css';
        head.content.add(link);
        // <link rel="stylesheet" type="text/css" href="theme.css">
    }
    // also need to include jsgui client css
}

module.exports = Active_HTML_Document;