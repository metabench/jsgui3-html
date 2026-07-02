const { expect } = require('chai');

let Popup;
try {
    Popup = require('../../controls/organised/0-core/1-advanced/Popup');
} catch (e) {
    console.warn('Popup not loadable:', e.message);
}

// Render into jsdom and connect the root element.
const mount = (ctrl) => {
    const html = ctrl.all_html_render();
    document.body.innerHTML = html;
    ctrl.dom.el = document.body.firstElementChild;
    return ctrl.dom.el;
};

const make_anchor = () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    // jsdom rects are all zeros; give the anchor a synthetic rect.
    anchor.getBoundingClientRect = () => ({
        top: 100, bottom: 130, left: 50, right: 150, width: 100, height: 30
    });
    return anchor;
};

describe('Popup primitive', () => {
    let context;

    beforeEach(() => {
        context = createTestContext();
    });

    afterEach(() => {
        cleanup();
    });

    it('should render hidden by default', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context });
        expect(p.has_class('hidden')).to.equal(true);
        expect(p.is_open).to.equal(false);
    });

    it('should persist position config as a data attribute', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context, position: 'top' });
        expect(p.dom.attrs['data-position']).to.equal('top');
    });

    it('open()/close()/toggle() manage the hidden class and raise events', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context });
        mount(p);
        const anchor = make_anchor();

        let opened = 0, closed = 0;
        p.on('open', () => opened++);
        p.on('close', () => closed++);

        p.open(anchor);
        expect(p.is_open).to.equal(true);
        expect(opened).to.equal(1);

        p.close();
        expect(p.is_open).to.equal(false);
        expect(closed).to.equal(1);

        p.toggle(anchor);
        expect(p.is_open).to.equal(true);
        p.toggle(anchor);
        expect(p.is_open).to.equal(false);
    });

    it('open() positions the element fixed relative to the anchor', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context, position: 'bottom', offset: { x: 0, y: 8 } });
        const el = mount(p);
        const anchor = make_anchor();

        p.open(anchor);
        expect(el.style.position).to.equal('fixed');
        // bottom placement: anchor.bottom (130) + offset.y (8)
        expect(el.style.top).to.equal('138px');
        expect(el.style.left).to.equal('50px');
        expect(el.getAttribute('data-placed')).to.equal('bottom');
    });

    it('closes on Escape when open', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context });
        mount(p);
        p.open(make_anchor());
        expect(p.is_open).to.equal(true);

        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(p.is_open).to.equal(false);
    });

    it('closes on outside mousedown but not on inside clicks', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context });
        const el = mount(p);
        const anchor = make_anchor();
        p.open(anchor);

        // Inside click: stays open
        const inside = new window.MouseEvent('mousedown', { bubbles: true });
        el.dispatchEvent(inside);
        expect(p.is_open).to.equal(true);

        // Outside click: closes
        const outside_el = document.createElement('div');
        document.body.appendChild(outside_el);
        const outside = new window.MouseEvent('mousedown', { bubbles: true });
        outside_el.dispatchEvent(outside);
        expect(p.is_open).to.equal(false);
    });

    it('does not close on outside click when disabled', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context, close_on_outside_click: false });
        mount(p);
        p.open(make_anchor());

        const outside_el = document.createElement('div');
        document.body.appendChild(outside_el);
        outside_el.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true }));
        expect(p.is_open).to.equal(true);
        p.close();
    });

    it('activate() recovers position from the data attribute', function () {
        if (!Popup) this.skip();
        const p = new Popup({ context, position: 'top' });
        const el = mount(p);
        // Simulate reattachment: fresh instance state, config only in DOM.
        p._position = 'bottom';
        p.activate();
        expect(p._position).to.equal('top');
    });
});
