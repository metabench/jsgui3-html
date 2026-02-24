const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');

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

        const root_node = tree.get_visible_nodes()[0];
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
        document.body.innerHTML = tree.html;

        jsgui.pre_activate(context);
        jsgui.activate(context);

        tree.set_active_node(tree.get_visible_nodes()[1], { select: false });
        const start_id = tree.get_visible_nodes()[1].dom.attributes.id;
        expect(tree.dom.attributes['aria-activedescendant']).to.equal(start_id);

        const event = new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
        tree.dom.el.dispatchEvent(event);
        expect(tree.active_node.text).to.equal('Alpha');
    });
});
