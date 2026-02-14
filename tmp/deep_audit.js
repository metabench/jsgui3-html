// Deep audit of all controls — checks rendering, activation, console errors,
// DOM structure, interactive elements, missing features, and visual anomalies
const puppeteer = require('puppeteer');
const delay = ms => new Promise(r => setTimeout(r, ms));
const PORT = 4460;

const SKIP = new Set(['Admin_Theme']);

async function run() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Get all control names from the gallery index
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
    const control_names = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="control="]');
        return Array.from(links).map(a => {
            const m = a.href.match(/control=([^&]+)/);
            return m ? m[1] : null;
        }).filter(Boolean);
    });

    console.log(`Found ${control_names.length} controls to audit\n`);

    const issues = [];

    for (const name of control_names) {
        if (SKIP.has(name)) continue;
        
        const control_issues = [];
        const console_msgs = [];
        const page_errors = [];

        const console_handler = msg => {
            const type = msg.type();
            const text = msg.text();
            if (text.includes('favicon') || text.includes('net::ERR')) return;
            if (type === 'error') console_msgs.push({ type: 'error', text });
            else if (type === 'warning') console_msgs.push({ type: 'warn', text });
            // Capture jsgui warnings about reserved keys
            if (text.includes('[jsgui]')) console_msgs.push({ type: 'jsgui', text });
        };
        const error_handler = err => page_errors.push(err.message);

        page.on('console', console_handler);
        page.on('pageerror', error_handler);

        try {
            await page.goto(`http://localhost:${PORT}/?control=${name}`, { waitUntil: 'networkidle0', timeout: 15000 });
            await delay(500);
        } catch (e) {
            control_issues.push(`LOAD_FAIL: ${e.message.substring(0, 100)}`);
            page.off('console', console_handler);
            page.off('pageerror', error_handler);
            issues.push({ name, issues: control_issues, console_msgs, page_errors });
            continue;
        }

        // Gather comprehensive DOM info
        const info = await page.evaluate(() => {
            const mount = document.querySelector('#control-mount');
            if (!mount) return { no_mount: true };
            const first = mount.children[0];
            if (!first) return { empty_mount: true, innerHTML: mount.innerHTML.substring(0, 200) };

            const rect = first.getBoundingClientRect();
            const cs = getComputedStyle(first);

            // Check for common issues
            const all_text = first.innerText || '';
            const all_html = first.innerHTML || '';
            
            // Interactive elements
            const inputs = first.querySelectorAll('input');
            const buttons = first.querySelectorAll('button, .button, [data-jsgui-type="button"]');
            const links = first.querySelectorAll('a');
            const selects = first.querySelectorAll('select');
            
            // Accessibility
            const has_role = first.hasAttribute('role');
            const aria_attrs = Array.from(first.attributes).filter(a => a.name.startsWith('aria-')).map(a => a.name);
            const tabindex = first.getAttribute('tabindex');
            
            // Visual
            const all_children = first.querySelectorAll('*');
            let zero_size_count = 0;
            let overflow_count = 0;
            for (const child of all_children) {
                const cr = child.getBoundingClientRect();
                if (cr.width === 0 && cr.height === 0 && child.tagName !== 'INPUT' && 
                    child.tagName !== 'SCRIPT' && child.tagName !== 'BR' &&
                    !child.classList.contains('hidden') &&
                    child.tagName !== 'PATH' && child.tagName !== 'TITLE') {
                    zero_size_count++;
                }
                // Check for overflow beyond viewport
                if (cr.right > 1300 || cr.bottom > 5000) overflow_count++;
            }

            // Check for object Object rendering
            const has_object_object = all_text.includes('[object Object]');
            // Check for undefined text
            const has_undefined = all_text.includes('undefined') && !all_text.includes('undefined;'); // exclude CSS
            // Check for NaN 
            const has_nan = all_text.includes('NaN');
            // Check for error messages in text
            const has_error_text = all_text.toLowerCase().includes('error') && first.className.indexOf('error') === -1;

            // Check for missing CSS / unstyled
            const bg_color = cs.backgroundColor;
            const font_family = cs.fontFamily;

            return {
                tag: first.tagName,
                classes: first.className.substring(0, 200),
                width: rect.width,
                height: rect.height,
                child_count: first.children.length,
                total_descendants: all_children.length,
                text_length: all_text.length,
                text_preview: all_text.substring(0, 200).replace(/\n/g, ' '),
                has_object_object,
                has_undefined,
                has_nan,
                has_error_text,
                input_count: inputs.length,
                button_count: buttons.length,
                link_count: links.length,
                select_count: selects.length,
                has_role,
                aria_attrs,
                tabindex,
                zero_size_count,
                overflow_count,
                bg_color,
                font_family: font_family.substring(0, 60)
            };
        });

        page.off('console', console_handler);
        page.off('pageerror', error_handler);

        if (!info || info.no_mount) {
            control_issues.push('NO_MOUNT: #control-mount not found');
        } else if (info.empty_mount) {
            control_issues.push('EMPTY: Mount div is empty');
        } else {
            // Size issues
            if (info.width === 0) control_issues.push(`ZERO_WIDTH: Control has 0 width`);
            if (info.height === 0) control_issues.push(`ZERO_HEIGHT: Control has 0 height`);
            if (info.width < 10 && info.height < 10 && info.total_descendants > 0) {
                control_issues.push(`TINY: Control is very small (${info.width}x${info.height})`);
            }

            // Text issues
            if (info.has_object_object) control_issues.push('OBJECT_OBJECT: Renders [object Object]');
            if (info.has_undefined) control_issues.push(`UNDEFINED: Renders "undefined" in text: "${info.text_preview.substring(0, 80)}"`);
            if (info.has_nan) control_issues.push(`NAN: Renders "NaN" in text`);

            // Structure issues
            if (info.zero_size_count > 5) control_issues.push(`ZERO_SIZE_CHILDREN: ${info.zero_size_count} descendants have 0x0 size`);
            if (info.overflow_count > 0) control_issues.push(`OVERFLOW: ${info.overflow_count} elements overflow viewport`);
            if (info.child_count === 0 && info.text_length === 0) control_issues.push('EMPTY_CONTROL: No children and no text');
        }

        // Console issues
        const real_errors = console_msgs.filter(m => m.type === 'error');
        const jsgui_warnings = console_msgs.filter(m => m.type === 'jsgui');
        if (real_errors.length > 0) {
            control_issues.push(`CONSOLE_ERROR: ${real_errors[0].text.substring(0, 120)}`);
        }
        if (jsgui_warnings.length > 0) {
            control_issues.push(`JSGUI_WARN: ${jsgui_warnings[0].text.substring(0, 120)}`);
        }
        if (page_errors.length > 0) {
            control_issues.push(`PAGE_ERROR: ${page_errors[0].substring(0, 120)}`);
        }

        if (control_issues.length > 0) {
            issues.push({ name, issues: control_issues, info });
        }
    }

    await browser.close();

    // Print results
    console.log('═'.repeat(60));
    console.log('  DEEP AUDIT RESULTS');
    console.log('═'.repeat(60));

    if (issues.length === 0) {
        console.log('\n  No issues found! All controls pass.\n');
    } else {
        console.log(`\n  ${issues.length} controls have issues:\n`);
        for (const { name, issues: ctrl_issues, info } of issues) {
            console.log(`  [${name}]`);
            for (const issue of ctrl_issues) {
                console.log(`    - ${issue}`);
            }
            if (info) {
                console.log(`    Size: ${info.width}x${info.height}, ` +
                    `Children: ${info.child_count}, ` +
                    `Descendants: ${info.total_descendants}`);
            }
            console.log('');
        }
    }

    const clean_count = control_names.length - SKIP.size - issues.length;
    console.log(`  Clean: ${clean_count}/${control_names.length - SKIP.size}`);
    console.log(`  Issues: ${issues.length}`);
    console.log(`  Skipped: ${SKIP.size}`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
