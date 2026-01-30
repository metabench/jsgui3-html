const { expect } = require('chai');
const jsgui = require('../../html-core/html-core');
const controls = require('../../controls/controls');
const {
    apply_role,
    apply_label,
    apply_focus_ring,
    ensure_sr_text
} = require('../../control_mixins/a11y');

describe('Accessibility and Semantics', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('applies a11y helper attributes', () => {
        const ctrl = new jsgui.Control({ context });
        apply_role(ctrl, 'button');
        apply_label(ctrl, 'Close');
        apply_focus_ring(ctrl);
        ensure_sr_text(ctrl, 'Close');

        expect(ctrl.dom.attributes.role).to.equal('button');
        expect(ctrl.dom.attributes['aria-label']).to.equal('Close');
        expect(ctrl.has_class('focus-ring')).to.equal(true);

        let has_sr_only = false;
        ctrl.content.each(child => {
            if (child && child.has_class && child.has_class('sr-only')) {
                has_sr_only = true;
            }
        });
        expect(has_sr_only).to.equal(true);
    });

    it('moves list selection with keyboard navigation', () => {
        const list = new controls.List({
            context,
            items: ['Alpha', 'Beta']
        });

        list.register_this_and_subcontrols();
        document.body.innerHTML = list.html;

        jsgui.pre_activate(context);
        jsgui.activate(context);

        const event = new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
        list.dom.el.dispatchEvent(event);

        expect(list.selected_item.value).to.equal('Alpha');
        expect(list.dom.attributes['aria-activedescendant']).to.equal(list.selected_item.id);
    });

    it('moves tabs with keyboard navigation', () => {
        const tabbed_panel = new controls.Tabbed_Panel({
            context,
            tabs: ['One', 'Two', 'Three']
        });

        tabbed_panel.register_this_and_subcontrols();
        
        // Clear body first, then use insertAdjacentHTML to avoid HierarchyRequestError
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        document.body.insertAdjacentHTML('beforeend', tabbed_panel.html);

        jsgui.pre_activate(context);
        jsgui.activate(context);

        const tab_labels = tabbed_panel._tab_controls.tab_labels;
        expect(tab_labels[0].dom.attributes['aria-selected']).to.equal('true');

        const event = new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
        tabbed_panel.dom.el.dispatchEvent(event);

        expect(tabbed_panel.active_index).to.equal(1);
        expect(tab_labels[1].dom.attributes['aria-selected']).to.equal('true');
    });
});
