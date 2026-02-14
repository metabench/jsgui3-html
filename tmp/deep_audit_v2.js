// Deep audit v2 — uses known control list, fast, comprehensive
const puppeteer = require('puppeteer');
const delay = ms => new Promise(r => setTimeout(r, ms));
const PORT = 4460;

const SKIP = new Set(['Admin_Theme']);

// All control names from controls.js
const ALL_CONTROLS = [
    'Active_HTML_Document','Activity_Feed','Alert_Banner','Accordion','Arrow_Button',
    'Audio_Volume','Avatar','Badge','Button','Canvas','Breadcrumbs','Calendar',
    'Cell','Context_Menu','Chip','Color_Grid','Color_Palette','Color_Picker',
    'Color_Picker_Tabbed','Checkbox','Combo_Box','Command_Palette','Cluster',
    'Dropdown_Menu','Drawer','Data_Grid','Data_Filter','Datetime_Picker',
    'File_Upload','Form_Container','Form_Field','Grid','Grid_Gap','Grid_Cell',
    'Horizontal_Menu','Horizontal_Slider','Data_Row','Data_Table','Date_Picker',
    'Dropdown_List','Email_Input','File_Tree','File_Tree_Node','Icon',
    'Inline_Validation_Message','Key_Value_Table','Item','Item_Selector',
    'Left_Right_Arrows_Selector','Line_Chart','List','Log_Viewer','Login',
    'Menu_Node','Message_Web_Page','Meter','Modal','Month_View','Master_Detail',
    'Matrix','Multi_Layout_Mode','Number_Input','Number_Stepper','Object_Editor',
    'Panel','Pagination','Plus_Minus_Toggle_Button','Property_Editor',
    'Property_Grid','Property_Viewer','Progress_Bar','Popup_Menu_Button',
    'Pop_Over','Radio_Button','Radio_Button_Group','Radio_Button_Tab',
    'Rating_Stars','Reorderable_List','Resource_Viewer','Rich_Text_Editor',
    'Rich_Text_Toolbar','Scroll_View','Scrollbar','Search_Bar','Select_Options',
    'Single_Line','Skeleton_Loader','Spinner','Split_Pane','Stat_Card',
    'Status_Dashboard','Stack','Standard_Web_Page','Start_Stop_Toggle_Button',
    'String_Span','Tag_Input','Tabbed_Panel','Tel_Input','Textarea','Text_Field',
    'Text_Item','Text_Input','Time_Picker','Tile_Slider','Toast','Toggle_Switch',
    'Stepped_Slider','Timespan_Selector','Title_Bar','Titled_Panel',
    'Toggle_Button','Toolbar','Toolbox','Tooltip','Tree','Tree_Node',
    'Tree_View','Tree_Table','Up_Down_Arrow_Buttons','Url_Input',
    'Vertical_Expander','Center','Stepper','Window','Window_Manager',
    'Indicator','Status_Indicator','Validation_Status_Indicator','Range_Input',
    'Password_Input','Virtual_List','Virtual_Grid','Error_Summary',
    'Sidebar_Nav','Wizard','Inline_Cell_Edit','Markdown_Viewer',
    'Bar_Chart','Pie_Chart','Sparkline','Area_Chart','Gauge'
];

async function run() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log(`Auditing ${ALL_CONTROLS.length} controls...\n`);

    const issues = [];
    const summaries = [];
    let ok = 0;

    for (const name of ALL_CONTROLS) {
        if (SKIP.has(name)) { summaries.push({ name, status: 'SKIP' }); continue; }

        const ctrl_issues = [];
        const console_msgs = [];
        const page_errors = [];

        const console_handler = msg => {
            const type = msg.type();
            const text = msg.text();
            if (text.includes('favicon') || text.includes('net::ERR')) return;
            if (type === 'error') console_msgs.push({ type: 'error', text });
            if (text.includes('[jsgui]')) console_msgs.push({ type: 'jsgui', text });
        };
        const error_handler = err => page_errors.push(err.message);

        page.on('console', console_handler);
        page.on('pageerror', error_handler);

        try {
            await page.goto(`http://localhost:${PORT}/?control=${name}`, { waitUntil: 'networkidle0', timeout: 15000 });
            await delay(400);
        } catch (e) {
            ctrl_issues.push(`LOAD_FAIL: ${e.message.substring(0, 80)}`);
            page.off('console', console_handler);
            page.off('pageerror', error_handler);
            issues.push({ name, issues: ctrl_issues });
            summaries.push({ name, status: 'FAIL' });
            continue;
        }

        const info = await page.evaluate(() => {
            const mount = document.querySelector('#control-mount');
            if (!mount) return { no_mount: true };
            const first = mount.children[0];
            if (!first) return { empty_mount: true, html: mount.innerHTML.substring(0, 300) };

            const rect = first.getBoundingClientRect();
            const all_text = first.innerText || '';
            const all_children = first.querySelectorAll('*');
            
            // Count zero-size visible elements (excluding SVG internals, hidden, inputs)
            let zero_size = 0;
            const invisible_tags = new Set(['INPUT','SCRIPT','BR','PATH','TITLE','STYLE','LINK','META','HEAD','CIRCLE','LINE','RECT','SVG','POLYLINE','POLYGON','STOP','DEFS','LINEARGRADIENT']);
            for (const child of all_children) {
                if (invisible_tags.has(child.tagName)) continue;
                if (child.classList.contains('hidden') || child.classList.contains('spinner-label')) continue;
                const cs = getComputedStyle(child);
                if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                const cr = child.getBoundingClientRect();
                if (cr.width === 0 && cr.height === 0) zero_size++;
            }
            
            // Check for overflow
            let overflow = 0;
            for (const child of all_children) {
                const cr = child.getBoundingClientRect();
                if (cr.right > 3000 || cr.bottom > 10000) overflow++;
            }

            return {
                tag: first.tagName,
                cls: first.className.substring(0, 150),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                children: first.children.length,
                descendants: all_children.length,
                text_len: all_text.length,
                text: all_text.substring(0, 300).replace(/\n/g, '|'),
                has_obj_obj: all_text.includes('[object Object]'),
                has_undefined: /\bundefined\b/.test(all_text),
                has_nan: /\bNaN\b/.test(all_text),
                zero_size,
                overflow,
                inputs: first.querySelectorAll('input').length,
                buttons: first.querySelectorAll('button, .button, [data-jsgui-type="button"]').length,
                has_role: first.hasAttribute('role'),
                role: first.getAttribute('role'),
                tabindex: first.getAttribute('tabindex'),
                aria_count: Array.from(first.attributes).filter(a => a.name.startsWith('aria-')).length
            };
        });

        page.off('console', console_handler);
        page.off('pageerror', error_handler);

        if (!info || info.no_mount) {
            ctrl_issues.push('NO_MOUNT');
        } else if (info.empty_mount) {
            ctrl_issues.push(`EMPTY_MOUNT: ${info.html}`);
        } else {
            if (info.w === 0 && info.h === 0) ctrl_issues.push('INVISIBLE: 0x0 dimensions');
            else if (info.w === 0) ctrl_issues.push('ZERO_WIDTH');
            else if (info.h === 0) ctrl_issues.push('ZERO_HEIGHT');
            if (info.has_obj_obj) ctrl_issues.push(`[object Object] in text: "${info.text.substring(0, 80)}"`);
            if (info.has_undefined) ctrl_issues.push(`"undefined" in text: "${info.text.substring(0, 80)}"`);
            if (info.has_nan) ctrl_issues.push(`"NaN" in text: "${info.text.substring(0, 80)}"`);
            if (info.zero_size > 8) ctrl_issues.push(`${info.zero_size} zero-size visible descendants`);
            if (info.overflow > 0) ctrl_issues.push(`${info.overflow} elements overflow viewport`);
        }

        // Console & page errors
        const errs = console_msgs.filter(m => m.type === 'error');
        const jsgui = console_msgs.filter(m => m.type === 'jsgui');
        if (page_errors.length > 0) ctrl_issues.push(`PAGE_ERROR: ${page_errors[0].substring(0, 120)}`);
        if (errs.length > 0) ctrl_issues.push(`CONSOLE_ERROR: ${errs[0].text.substring(0, 120)}`);
        if (jsgui.length > 0) ctrl_issues.push(`JSGUI_WARN: ${jsgui.map(j => j.text.substring(0, 80)).join('; ')}`);

        if (ctrl_issues.length > 0) {
            issues.push({ name, issues: ctrl_issues, info });
            summaries.push({ name, status: 'ISSUE' });
        } else {
            ok++;
            summaries.push({ name, status: 'OK', info });
        }
    }

    await browser.close();

    // ── Print ──
    console.log('═'.repeat(60));
    console.log('  DEEP AUDIT RESULTS');
    console.log('═'.repeat(60));

    if (issues.length > 0) {
        console.log(`\n  ${issues.length} controls with issues:\n`);
        for (const { name, issues: ci, info } of issues) {
            const dims = info ? `${info.w}x${info.h}` : '?';
            console.log(`  [${name}] (${dims})`);
            for (const issue of ci) {
                console.log(`    - ${issue}`);
            }
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`  TOTAL: ${ALL_CONTROLS.length} controls`);
    console.log(`  OK: ${ok}`);
    console.log(`  Issues: ${issues.length}`);
    console.log(`  Skipped: ${SKIP.size}`);
    console.log('─'.repeat(60));
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
