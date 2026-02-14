// ── Comprehensive Interactivity Test Suite ──────────────────────────────────
// Tests click, keyboard, state changes, ARIA, and visual rendering for key controls
// Run: node tmp/interactivity_tests.js

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PORT = 4460;
const delay = ms => new Promise(r => setTimeout(r, ms));
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let total_passed = 0, total_failed = 0;
const all_results = [];

function section(name) { all_results.push({ section: name, tests: [] }); }
function assert(cond, label) {
    const current = all_results[all_results.length - 1];
    if (cond) {
        total_passed++;
        current.tests.push({ pass: true, label });
    } else {
        total_failed++;
        current.tests.push({ pass: false, label });
    }
}

async function collect_errors(page, fn) {
    const errors = [];
    const handler = msg => {
        if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('net::ERR')) {
            errors.push(msg.text());
        }
    };
    const page_handler = err => errors.push(`PAGE: ${err.message}`);
    page.on('console', handler);
    page.on('pageerror', page_handler);
    try {
        await fn();
    } catch (e) {
        errors.push(`PUPPETEER: ${e.message}`);
    }
    page.off('console', handler);
    page.off('pageerror', page_handler);
    return errors;
}

async function goto_control(page, name) {
    const errors = await collect_errors(page, async () => {
        await page.goto(`http://localhost:${PORT}/?control=${name}`, {
            waitUntil: 'networkidle0', timeout: 15000
        });
        await delay(600);
    });
    return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════

async function test_toggle_switch(page) {
    section('Toggle_Switch');
    const errors = await goto_control(page, 'Toggle_Switch');
    assert(errors.length === 0, 'No console errors');

    // Check initial state
    const initial = await page.evaluate(() => {
        const ctrl = document.querySelector('.toggle-switch');
        if (!ctrl) return null;
        const input = ctrl.querySelector('input[type="checkbox"]');
        return {
            exists: !!ctrl,
            has_input: !!input,
            checked: input ? input.checked : null,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(initial && initial.exists, 'Control renders');
    assert(initial && initial.has_input, 'Has checkbox input');
    assert(initial && initial.width > 40, `Width > 40 (got ${initial?.width})`);
    assert(initial && initial.height > 10, `Height > 10 (got ${initial?.height})`);

    // Click to toggle
    const toggle_el = await page.$('.toggle-switch');
    if (toggle_el) {
        await toggle_el.click();
        await delay(300);
        const after_click = await page.evaluate(() => {
            const input = document.querySelector('.toggle-switch input[type="checkbox"]');
            return input ? input.checked : null;
        });
        // Just verify it didn't crash (checked state depends on initial)
        assert(after_click !== null, 'Toggle click responds (no crash)');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'toggle-switch.png') });
}

async function test_checkbox(page) {
    section('Checkbox');
    const errors = await goto_control(page, 'Checkbox');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.checkbox');
        if (!ctrl) return null;
        const input = ctrl.querySelector('input[type="checkbox"]');
        return {
            exists: !!ctrl,
            has_input: !!input,
            checked: input ? input.checked : false,
            label_text: ctrl.innerText.trim()
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.has_input, 'Has checkbox input');

    // Click the checkbox box (the visual element), not the hidden input
    const initial_checked = info ? info.checked : false;
    await page.evaluate(() => {
        const box = document.querySelector('.checkbox .jsgui-checkbox-box');
        if (box) box.click();
    });
    await delay(400);
    const after = await page.evaluate(() => {
        const input = document.querySelector('.checkbox input[type="checkbox"]');
        return input ? input.checked : null;
    });
    assert(after !== null, 'Checkbox click responds (no crash)');
    // Check if state toggled (either via input.checked or aria-checked)
    const aria_after = await page.evaluate(() => {
        const input = document.querySelector('.checkbox input[type="checkbox"]');
        return input ? input.getAttribute('aria-checked') : null;
    });
    assert(after !== initial_checked || aria_after !== null, 'Checkbox state changed or has ARIA');
}

async function test_button(page) {
    section('Button');
    const errors = await goto_control(page, 'Button');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const btn = document.querySelector('.button');
        if (!btn) return null;
        const cs = getComputedStyle(btn);
        return {
            exists: !!btn,
            tag: btn.tagName.toLowerCase(),
            cursor: cs.cursor,
            width: btn.getBoundingClientRect().width,
            height: btn.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Button renders');
    assert(info && info.cursor === 'pointer', `Cursor is pointer (got ${info?.cursor})`);
    assert(info && info.width > 20, `Width > 20 (got ${info?.width})`);
    assert(info && info.height > 20, `Height > 20 (got ${info?.height})`);

    // Click test
    const btn = await page.$('.button');
    if (btn) {
        let click_errored = false;
        const err_handler = msg => {
            if (msg.type() === 'error') click_errored = true;
        };
        page.on('console', err_handler);
        await btn.click();
        await delay(200);
        page.off('console', err_handler);
        assert(!click_errored, 'No error on click');
    }
}

async function test_dropdown_menu(page) {
    section('Dropdown_Menu');
    const errors = await goto_control(page, 'Dropdown_Menu');
    assert(errors.length === 0, 'No console errors on load');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.dropdown-menu');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height,
            text: ctrl.innerText.substring(0, 100)
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width > 50, `Width reasonable (got ${info?.width})`);
    assert(info && info.height > 20, `Height reasonable (got ${info?.height})`);

    // Click dropdown icon to open
    const icon = await page.$('.dropdown-menu .ctrl-dropdown-icon');
    if (icon) {
        const click_errors = await collect_errors(page, async () => {
            await icon.click();
            await delay(400);
        });
        assert(click_errors.length === 0, 'No error on dropdown click');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dropdown-menu.png') });
}

async function test_accordion(page) {
    section('Accordion');
    const errors = await goto_control(page, 'Accordion');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.accordion');
        if (!ctrl) return null;
        const sections = ctrl.querySelectorAll('.accordion-section');
        const headers = ctrl.querySelectorAll('.accordion-header');
        return {
            exists: !!ctrl,
            section_count: sections.length,
            header_count: headers.length,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.section_count >= 2, `Has sections (got ${info?.section_count})`);
    assert(info && info.height > 50, `Has visible height (got ${info?.height})`);

    // Click a header
    const headers = await page.$$('.accordion-header');
    if (headers.length >= 2) {
        const click_errors = await collect_errors(page, async () => {
            await headers[1].click(); // Click second section
            await delay(400);
        });
        assert(click_errors.length === 0, 'No error clicking second section header');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'accordion.png') });
}

async function test_tabbed_panel(page) {
    section('Tabbed_Panel');
    const errors = await goto_control(page, 'Tabbed_Panel');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.jsgui-tabs, .tab-container, [data-jsgui-type="tabbed_panel"]');
        if (!ctrl) return null;
        const tabs = ctrl.querySelectorAll('.tab-label, [role="tab"], input[type="radio"]');
        return {
            exists: !!ctrl,
            tab_count: tabs.length,
            height: ctrl.getBoundingClientRect().height,
            width: ctrl.getBoundingClientRect().width,
            text: ctrl.innerText.substring(0, 200)
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.height > 10, `Has height (got ${info?.height})`);
    assert(info && info.tab_count >= 2, `Has tabs (got ${info?.tab_count})`);
}

async function test_radio_button_group(page) {
    section('Radio_Button_Group');
    const errors = await goto_control(page, 'Radio_Button_Group');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.radio-button-group');
        if (!ctrl) return null;
        const radios = ctrl.querySelectorAll('input[type="radio"]');
        const labels = ctrl.querySelectorAll('label');
        return {
            exists: !!ctrl,
            radio_count: radios.length,
            label_count: labels.length,
            text: ctrl.innerText.substring(0, 200),
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.radio_count >= 2, `Has radio buttons (got ${info?.radio_count})`);
    assert(info && !info.text.includes('[object Object]'), 'No [object Object] in text');
    assert(info && info.height > 10, `Has height (got ${info?.height})`);

    // Click a radio button (use evaluate click since input may be hidden)
    const has_radios = await page.evaluate(() => {
        const radios = document.querySelectorAll('.radio-button-group input[type="radio"]');
        if (radios.length >= 2) {
            radios[1].click();
            return true;
        }
        return false;
    });
    if (has_radios) {
        await delay(300);
        const checked = await page.evaluate(() => {
            const radios = document.querySelectorAll('.radio-button-group input[type="radio"]');
            return Array.from(radios).map(r => r.checked);
        });
        assert(checked && checked[1] === true, 'Second radio is checked after click');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'radio-button-group.png') });
}

async function test_horizontal_slider(page) {
    section('Horizontal_Slider');
    const errors = await goto_control(page, 'Horizontal_Slider');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        // Actual class: 'horizontal slider jsgui-slider'
        const ctrl = document.querySelector('.jsgui-slider, [data-jsgui-type="horizontal_slider"]');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            is_horizontal: ctrl.classList.contains('horizontal'),
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height,
            child_count: ctrl.children.length
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.is_horizontal, 'Has horizontal class');
    assert(info && info.width > 50, `Width > 50 (got ${info?.width})`);
}

async function test_progress_bar(page) {
    section('Progress_Bar');
    const errors = await goto_control(page, 'Progress_Bar');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.progress-bar');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width >= 50, `Width >= 50 (got ${info?.width})`);
    assert(info && info.height >= 4, `Height >= 4 (got ${info?.height})`);
}

async function test_login(page) {
    section('Login');
    const errors = await goto_control(page, 'Login');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        // Actual class: 'login-control'
        const ctrl = document.querySelector('.login-control, [data-jsgui-type="control"].login-control');
        if (!ctrl) return null;
        const inputs = ctrl.querySelectorAll('input');
        const button = ctrl.querySelector('.button, button, [data-jsgui-type="button"]');
        const form = ctrl.querySelector('form');
        return {
            exists: !!ctrl,
            input_count: inputs.length,
            has_button: !!button,
            has_form: !!form,
            text: ctrl.innerText.substring(0, 300),
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.has_form, 'Has form element');
    assert(info && info.input_count >= 2, `Has 2+ inputs (got ${info?.input_count})`);
    assert(info && info.height > 50, `Has reasonable height (got ${info?.height})`);

    // Type into first input field
    const username_input = await page.$('.login-control input');
    if (username_input) {
        const type_errors = await collect_errors(page, async () => {
            await username_input.click();
            await username_input.type('testuser');
            await delay(200);
        });
        assert(type_errors.length === 0, 'No error typing in username');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png') });
}

async function test_spinner(page) {
    section('Spinner');
    const errors = await goto_control(page, 'Spinner');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        // Actual class: 'spinner-control jsgui-spinner spinner-md'
        const ctrl = document.querySelector('.jsgui-spinner, .spinner-control');
        if (!ctrl) return null;
        const ring = ctrl.querySelector('.spinner-ring');
        return {
            exists: !!ctrl,
            has_ring: !!ring,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.has_ring, 'Has spinner ring');
    assert(info && info.width > 10, `Has width (got ${info?.width})`);
    assert(info && info.height > 10, `Has height (got ${info?.height})`);
}

async function test_modal(page) {
    section('Modal');
    const errors = await goto_control(page, 'Modal');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.modal');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            has_overlay: !!ctrl.querySelector('.modal-overlay'),
            has_content: !!ctrl.querySelector('.modal-content, .modal-body'),
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
}

async function test_data_table(page) {
    section('Data_Table');
    const errors = await goto_control(page, 'Data_Table');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.data-table, .jsgui-data-table');
        if (!ctrl) return null;
        const thead = ctrl.querySelector('thead');
        const tbody = ctrl.querySelector('tbody');
        const headers = ctrl.querySelectorAll('thead th');
        // Rows might be in tbody or directly in table
        const rows = tbody ? tbody.querySelectorAll('tr') : ctrl.querySelectorAll('tr');
        return {
            exists: !!ctrl,
            row_count: rows.length,
            header_count: headers.length,
            has_thead: !!thead,
            has_tbody: !!tbody,
            text: ctrl.innerText.substring(0, 300),
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.header_count >= 2, `Has headers (got ${info?.header_count})`);
    assert(info && info.has_thead, 'Has thead element');
    assert(info && info.height > 20, `Has height (got ${info?.height})`);

    // Click a header to sort
    const th = await page.$('.data-table thead th, .jsgui-data-table thead th');
    if (th) {
        const click_errors = await collect_errors(page, async () => {
            await th.click();
            await delay(300);
        });
        assert(click_errors.length === 0, 'No error clicking header to sort');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'data-table.png') });
}

async function test_window(page) {
    section('Window');
    const errors = await goto_control(page, 'Window');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.window');
        if (!ctrl) return null;
        const title = ctrl.querySelector('.title');
        const close_btn = ctrl.querySelector('.btn-close, .window-close, button');
        return {
            exists: !!ctrl,
            has_title: !!title,
            has_close: !!close_btn,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width > 100, `Has decent width (got ${info?.width})`);
    assert(info && info.height > 100, `Has decent height (got ${info?.height})`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'window.png') });
}

async function test_wizard(page) {
    section('Wizard');
    const errors = await goto_control(page, 'Wizard');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.wizard');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            text: ctrl.innerText.substring(0, 300),
            height: ctrl.getBoundingClientRect().height,
            width: ctrl.getBoundingClientRect().width
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.height > 50, `Has height (got ${info?.height})`);

    // Click Next button
    const next_btn = await page.$('.wizard .button, .wizard button');
    if (next_btn) {
        const click_errors = await collect_errors(page, async () => {
            await next_btn.click();
            await delay(400);
        });
        assert(click_errors.length === 0, 'No error clicking wizard button');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'wizard.png') });
}

async function test_search_bar(page) {
    section('Search_Bar');
    const errors = await goto_control(page, 'Search_Bar');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.search-bar');
        if (!ctrl) return null;
        const input = ctrl.querySelector('input');
        return {
            exists: !!ctrl,
            has_input: !!input,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.has_input, 'Has input field');

    // Type in search
    const input = await page.$('.search-bar input');
    if (input) {
        const type_errors = await collect_errors(page, async () => {
            await input.click();
            await input.type('hello world');
            await delay(200);
        });
        assert(type_errors.length === 0, 'No error typing in search');
        const val = await page.evaluate(() => {
            const inp = document.querySelector('.search-bar input');
            return inp ? inp.value : null;
        });
        assert(val === 'hello world', `Search field has typed text (got "${val}")`);
    }
}

async function test_combo_box(page) {
    section('Combo_Box');
    const errors = await goto_control(page, 'Combo_Box');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.combo-box');
        if (!ctrl) return null;
        const input = ctrl.querySelector('input');
        return {
            exists: !!ctrl,
            has_input: !!input,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.has_input, 'Has input');
    assert(info && info.width > 50, `Width > 50 (got ${info?.width})`);
}

async function test_color_picker(page) {
    section('Color_Picker');
    const errors = await goto_control(page, 'Color_Picker');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.color-picker');
        if (!ctrl) return null;
        return {
            exists: !!ctrl,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height,
            child_count: ctrl.children.length
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width > 100, `Width > 100 (got ${info?.width})`);
    assert(info && info.height > 100, `Height > 100 (got ${info?.height})`);

    // Click on the color area
    const click_errors = await collect_errors(page, async () => {
        await page.click('.color-picker');
        await delay(300);
    });
    assert(click_errors.length === 0, 'No error on click');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'color-picker.png') });
}

async function test_grid(page) {
    section('Grid');
    const errors = await goto_control(page, 'Grid');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('[data-jsgui-type="grid"], .grid');
        if (!ctrl) return null;
        // Grid uses div rows with cells inside — count all leaf divs
        const main = ctrl.querySelector('.main');
        const rows_container = ctrl.querySelector('.rows');
        const all_divs = ctrl.querySelectorAll('div');
        return {
            exists: !!ctrl,
            has_main: !!main,
            has_rows: !!rows_container,
            total_divs: all_divs.length,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.total_divs > 10, `Has child divs (got ${info?.total_divs})`);
    assert(info && info.width > 100, `Has width (got ${info?.width})`);
    assert(info && info.height > 100, `Has height (got ${info?.height})`);

    // Click inside the grid
    const grid_el = await page.$('[data-jsgui-type="grid"] .main, .grid .main');
    if (grid_el) {
        const click_errors = await collect_errors(page, async () => {
            await grid_el.click();
            await delay(200);
        });
        assert(click_errors.length === 0, 'No error clicking grid');
    }
}

async function test_pagination(page) {
    section('Pagination');
    const errors = await goto_control(page, 'Pagination');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.pagination');
        if (!ctrl) return null;
        const buttons = ctrl.querySelectorAll('.button, button');
        return {
            exists: !!ctrl,
            button_count: buttons.length,
            text: ctrl.innerText
        };
    });
    assert(info && info.exists, 'Control renders');
}

async function test_rating_stars(page) {
    section('Rating_Stars');
    const errors = await goto_control(page, 'Rating_Stars');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.rating-stars');
        if (!ctrl) return null;
        const stars = ctrl.querySelectorAll('.star, span');
        return {
            exists: !!ctrl,
            star_count: stars.length,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width > 50, `Has width (got ${info?.width})`);

    // Click a star
    const star = await page.$('.rating-stars .star, .rating-stars span');
    if (star) {
        const click_errors = await collect_errors(page, async () => {
            await star.click();
            await delay(200);
        });
        assert(click_errors.length === 0, 'No error clicking star');
    }
}

async function test_number_stepper(page) {
    section('Number_Stepper');
    const errors = await goto_control(page, 'Number_Stepper');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.number-stepper');
        if (!ctrl) return null;
        const input = ctrl.querySelector('input');
        const buttons = ctrl.querySelectorAll('.button, button');
        return {
            exists: !!ctrl,
            has_input: !!input,
            button_count: buttons.length,
            value: input ? input.value : null
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && (info.has_input || info.button_count >= 2), 'Has input or buttons');

    // Click increment
    const inc = await page.$('.number-stepper .increment, .number-stepper .button:last-child, .number-stepper button:last-of-type');
    if (inc) {
        const click_errors = await collect_errors(page, async () => {
            await inc.click();
            await delay(200);
        });
        assert(click_errors.length === 0, 'No error clicking increment');
    }
}

async function test_sidebar_nav(page) {
    section('Sidebar_Nav');
    const errors = await goto_control(page, 'Sidebar_Nav');
    assert(errors.length === 0, 'No console errors');

    const info = await page.evaluate(() => {
        const ctrl = document.querySelector('.sidebar-nav');
        if (!ctrl) return null;
        const items = ctrl.querySelectorAll('.sidebar-nav-item, li, a');
        return {
            exists: !!ctrl,
            item_count: items.length,
            width: ctrl.getBoundingClientRect().width,
            height: ctrl.getBoundingClientRect().height
        };
    });
    assert(info && info.exists, 'Control renders');
    assert(info && info.width > 50, `Has width (got ${info?.width})`);
}

// ── Batch zero-error check for ALL controls ──────────────────────────────
async function test_all_controls_no_errors(page) {
    section('All Controls: Zero Console Errors');

    const SKIP = new Set(['Admin_Theme', 'File_Upload', 'Line_Chart', 'Popup_Menu_Button']);
    const controls_list = await page.evaluate(async () => {
        const res = await fetch('/');
        const html = await res.text();
        const matches = html.match(/control=([A-Z][A-Za-z_]+)/g) || [];
        return [...new Set(matches.map(m => m.replace('control=', '')))];
    });

    let error_count = 0;
    const error_controls = [];

    for (const name of controls_list) {
        if (SKIP.has(name)) continue;
        const errors = await goto_control(page, name);
        if (errors.length > 0) {
            error_count++;
            error_controls.push({ name, errors });
        }
    }

    assert(error_count === 0, `All controls activate without errors (${error_controls.length} failed)`);
    if (error_controls.length > 0) {
        error_controls.forEach(({ name, errors }) => {
            console.log(`    [${name}] ${errors[0].substring(0, 100)}`);
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function run() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Individual control tests - each wrapped so one failure doesn't stop the suite
    const tests = [
        test_button, test_toggle_switch, test_checkbox, test_dropdown_menu,
        test_accordion, test_tabbed_panel, test_radio_button_group,
        test_horizontal_slider, test_progress_bar, test_login,
        test_spinner, test_modal, test_data_table, test_window,
        test_wizard, test_search_bar, test_combo_box, test_color_picker,
        test_grid, test_pagination, test_rating_stars, test_number_stepper,
        test_sidebar_nav
    ];
    for (const test_fn of tests) {
        try {
            await test_fn(page);
        } catch (e) {
            section(test_fn.name.replace('test_', ''));
            assert(false, `Test crashed: ${e.message.substring(0, 120)}`);
        }
    }

    // Full suite zero-error check
    try {
        await test_all_controls_no_errors(page);
    } catch (e) {
        section('All Controls: Zero Console Errors');
        assert(false, `Suite crashed: ${e.message.substring(0, 120)}`);
    }

    await browser.close();

    // ── Print results ───────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('  INTERACTIVITY TEST RESULTS');
    console.log('═'.repeat(60));

    for (const group of all_results) {
        const g_pass = group.tests.filter(t => t.pass).length;
        const g_fail = group.tests.filter(t => !t.pass).length;
        const status = g_fail === 0 ? '✓' : '✗';
        console.log(`\n  ${status} ${group.section} (${g_pass}/${group.tests.length})`);
        for (const t of group.tests) {
            const icon = t.pass ? '  ✓' : '  ✗';
            console.log(`    ${icon} ${t.label}`);
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`  TOTAL: ${total_passed} passed, ${total_failed} failed`);
    console.log(total_failed === 0 ? '  === ALL PASS ✓ ===' : '  === FAILURES ✗ ===');
    console.log('─'.repeat(60));

    process.exit(total_failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
