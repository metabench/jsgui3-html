
const Resource_Viewer = require('../Resource_Viewer');
const jsgui = require('../../../../_core');
const Page_Context = jsgui.Page_Context;

const context = new Page_Context();

const resource_data = {
    name: '/api/tick-stream',
    type: 'observable',
    icon: '📊',
    status: 'active',
    description: 'Real-time tick counter',
    properties: {
        schema: { type: 'int' },
        connections: 3,
        created: '2024-01-18T07:00:00Z'
    },
    actions: [
        { name: 'pause', label: 'Pause' },
        { name: 'stop', label: 'Stop' }
    ]
};

const rv = new Resource_Viewer({
    context,
    resource: resource_data,
    expandable: true,
    onAction: (e) => {
        console.log('Action triggered:', e.action);
    }
});

// Default view
console.log('Resource_Viewer HTML (Default):');
console.log(rv.all_html_render());

// Expanded view
rv.view.data.model.expanded = true;
// Need to re-render or simulate expansion if render logic depends on it (it usually does for hidden class)
// Note: Client-side usually toggles class, but here we can check if 'expanded' class is conditional in render.
// Our implementation of `toggle_details_view` adds/removes class. The render might just render with/without class.
// Since we are server-side / static rendering, we rely on the state being reflected in DOM classes.
// However `toggle_details_view` runs on change.
// Updating model should trigger it if `all_html_render` re-evaluates or if DOM was updated in memory.
// `jsgui` controls usually update `dom.el` or `content` in response to changes.
// Since we are running in node, `all_html_render` serializes the current state of the DOM/Controls.

console.log('\nResource_Viewer HTML (Expanded):');
console.log(rv.all_html_render());
