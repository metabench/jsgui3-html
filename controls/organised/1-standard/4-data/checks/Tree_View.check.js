
const Tree_View = require('../Tree_View');
const jsgui = require('../../../../_core');
const Page_Context = jsgui.Page_Context;

const context = new Page_Context();

const tree = new Tree_View({
    context,
    data: [
        {
            id: '1', label: 'Root 1', icon: 'R', children: [
                { id: '1.1', label: 'Child 1.1' },
                {
                    id: '1.2', label: 'Child 1.2', children: [
                        { id: '1.2.1', label: 'Grandchild 1.2.1' }
                    ]
                }
            ]
        },
        {
            id: '2', label: 'Root 2', expanded: true, children: [
                { id: '2.1', label: 'Child 2.1' }
            ]
        }
    ]
});

console.log('Tree_View rendered HTML:');
console.log(tree.all_html_render());
