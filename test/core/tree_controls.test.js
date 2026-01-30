const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

// Helper to get tree nodes from main.content Collection
const get_tree_nodes = (tree) => {
    const content = tree.main && tree.main.content;
    if (!content) return [];
    const result = [];
    content.each(item => {
        if (item && item.__type_name === 'tree_node') {
            result.push(item);
        }
    });
    return result;
};

describe('Tree Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('loads children lazily', async () => {
        const tree = new controls.Tree({
            context,
            nodes: [{
                text: 'Root',
                load_children: async () => [{ text: 'Child' }]
            }]
        });

        const tree_nodes = get_tree_nodes(tree);
        const root_node = tree_nodes[0];
        await root_node.ensure_children_loaded();

        expect(root_node.inner_control.content._arr.length).to.equal(1);
        expect(root_node.get_child_nodes()[0].text).to.equal('Child');
    });

    it('updates active node with keyboard navigation', () => {
        const tree = new controls.Tree({
            context,
            nodes: [{ text: 'Alpha' }, { text: 'Beta' }],
            multi_select: true
        });

        tree.register_this_and_subcontrols();
        
        // Clear body first, then use insertAdjacentHTML to avoid HierarchyRequestError
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        document.body.insertAdjacentHTML('beforeend', tree.html);

        jsgui.pre_activate(context);
        jsgui.activate(context);

        // Use Tree's built-in method to get visible nodes
        const tree_nodes = tree.get_visible_nodes();
        expect(tree_nodes.length).to.be.at.least(2, 'Tree should have at least 2 nodes');
        
        tree.set_active_node(tree_nodes[1], {select: false});
        const start_id = tree_nodes[1].dom.attributes.id;
        expect(tree.dom.attributes['aria-activedescendant']).to.equal(start_id);

        const event = new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
        tree.dom.el.dispatchEvent(event);
        expect(tree.active_node.text).to.equal('Alpha');
    });
});
