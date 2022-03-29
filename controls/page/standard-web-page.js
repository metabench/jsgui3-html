
// Header, footer
// Left panel
// Right panel
// Main

var jsgui = require('../../html-core/html-core');

// Is a page control. Ie is an HTML document.

class Standard_Web_Page extends jsgui.Client_HTML_Document {
    constructor(spec) {
        super(spec);
    }
}

module.exports = Standard_Web_Page;
