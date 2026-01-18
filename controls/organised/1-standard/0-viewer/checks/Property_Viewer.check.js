
const Property_Viewer = require('../Property_Viewer');
const jsgui = require('../../../../_core');
const Page_Context = jsgui.Page_Context;

const context = new Page_Context();

const viewer = new Property_Viewer({
    context,
    data: {
        name: 'My Resource',
        type: 'observable',
        status: 'active',
        connections: 5,
        created: new Date('2024-01-01'),
        link: 'https://example.com'
    },
    schema: {
        name: { label: 'Name', type: 'string' },
        type: { label: 'Type', type: 'badge', badgeClass: 'type-badge' },
        status: { label: 'Status', type: 'status', statusMap: { active: 'green', paused: 'yellow' } },
        connections: { label: 'Connections', type: 'number' },
        created: { label: 'Created At', type: 'date' },
        link: { label: 'Documentation', type: 'link' }
    }
});

console.log('Property_Viewer rendered HTML:');
console.log(viewer.all_html_render());
