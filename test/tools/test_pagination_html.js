const jsgui = require('../../html-core/html-core');
const Pagination = require('../../controls/organised/1-standard/5-ui/pagination');

try {
    const context = new jsgui.Page_Context();
    const pagination = new Pagination({
        context,
        page: 1,
        page_count: 3
    });
    console.log('--- Pagination HTML ---');
    console.log(pagination.html);
} catch (e) {
    console.error(e.stack);
}
