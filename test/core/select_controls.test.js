const { expect } = require('chai');
const controls = require('../../controls/controls');

describe('Select/List/Combo Controls', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('loads select options asynchronously and updates selection', async () => {
        const select_options = new controls.Select_Options({
            context,
            load_items: async () => ['Alpha', 'Beta']
        });

        await select_options.load_items();
        expect(select_options.items).to.have.lengthOf(2);

        select_options.set_selected_value('Beta');
        expect(select_options.selected_item.value).to.equal('Beta');
        expect(select_options.dom.attributes['aria-activedescendant']).to.equal(select_options.selected_item.id);
    });

    it('filters list items with typeahead text', () => {
        const list = new controls.List({
            context,
            items: ['Alpha', 'Beta', 'Gamma']
        });

        list.set_filter_text('et');
        expect(list.filtered_items).to.have.lengthOf(1);
        expect(list.filtered_items[0].label).to.equal('Beta');
        expect(list.content._arr.length).to.equal(1);
    });

    it('filters and selects combo box items', () => {
        const combo_box = new controls.Combo_Box({
            context,
            items: ['Alpha', 'Beta', 'Gamma']
        });

        combo_box.set_filter_text('ga');
        expect(combo_box.filtered_items).to.have.lengthOf(1);

        combo_box.set_selected_value('Beta');
        expect(combo_box.get_value()).to.equal('Beta');
        expect(combo_box.input.dom.attributes['aria-activedescendant']).to.equal(combo_box.selected_item.id);

        combo_box.set_open(true);
        expect(combo_box.input.dom.attributes['aria-expanded']).to.equal('true');
    });
});
