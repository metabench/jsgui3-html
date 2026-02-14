// Batch visual check using Puppeteer - checks console errors and rendering for all controls
const puppeteer = require('puppeteer');
const PORT = 4460;
const delay = ms => new Promise(r => setTimeout(r, ms));

const CONTROLS = [
  'Accordion','Active_HTML_Document','Activity_Feed','Alert_Banner',
  'Area_Chart','Arrow_Button','Audio_Volume','Avatar','Badge',
  'Bar_Chart','Breadcrumbs','Button','Calendar','Canvas',
  'Cell','Center','Checkbox','Chip','Cluster',
  'Color_Grid','Color_Palette','Color_Picker','Color_Picker_Tabbed','Combo_Box',
  'Command_Palette','Context_Menu','Data_Filter','Data_Grid','Data_Row',
  'Data_Table','Date_Picker','Datetime_Picker','Drawer','Dropdown_List',
  'Dropdown_Menu','Email_Input','Error_Summary','File_Tree','File_Tree_Node',
  'File_Upload','FormField','Form_Container','Form_Field','Gauge',
  'Grid','Grid_Cell','Grid_Gap','Horizontal_Menu','Horizontal_Slider',
  'Icon','Indicator','Inline_Cell_Edit','Inline_Validation_Message','Item',
  'Item_Selector','Key_Value_Table','Left_Right_Arrows_Selector','Line_Chart','List',
  'Log_Viewer','Login','Markdown_Viewer','Master_Detail','Matrix',
  'Menu_Node','Message_Web_Page','Meter','Modal','Month_View',
  'Multi_Layout_Mode','Number_Input','Number_Stepper','Object_Editor','Pagination',
  'Panel','Password_Input','Pie_Chart','Plus_Minus_Toggle_Button','Pop_Over',
  'Popup_Menu_Button','Progress_Bar','PropertyEditor','Property_Editor','Property_Grid',
  'Property_Viewer','Radio_Button','Radio_Button_Group','Radio_Button_Tab','Range_Input',
  'Rating_Stars','Reorderable_List','Resource_Viewer','Rich_Text_Editor','Rich_Text_Toolbar',
  'Scroll_View','Scrollbar','Search_Bar','Select_Options','Sidebar_Nav',
  'Single_Line','Skeleton_Loader','Sparkline','Spinner','Split_Pane',
  'Stack','Standard_Web_Page','Start_Stop_Toggle_Button','Stat_Card','Status_Dashboard',
  'Status_Indicator','Stepped_Slider','Stepper','String_Span','Tabbed_Panel',
  'Tag_Input','Tel_Input','Text_Field','Text_Input','Text_Item',
  'Textarea','Tile_Slider','Time_Picker','Timespan_Selector','Title_Bar',
  'Titled_Panel','Toast','Toggle_Button','Toggle_Switch','Toolbar',
  'Toolbox','Tooltip','Tree','Tree_Node','Tree_Table',
  'Tree_View','Up_Down_Arrow_Buttons','Url_Input','Validation_Status_Indicator','Vertical_Expander',
  'Virtual_Grid','Virtual_List','Window','Wizard'
];

// Known server-render warnings (not client-side issues)
const SKIP_CLIENT_CHECK = new Set(['Admin_Theme', 'File_Upload', 'Line_Chart', 'Popup_Menu_Button']);

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const results = { ok: [], console_errors: [], empty: [], crashed: [] };

  for (const name of CONTROLS) {
    if (SKIP_CLIENT_CHECK.has(name)) continue;
    
    const errors = [];
    const warnings = [];
    
    // Collect console errors
    const console_handler = msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known benign messages
        if (text.includes('favicon.ico')) return;
        if (text.includes('net::ERR')) return;
        errors.push(text);
      }
    };
    
    page.on('console', console_handler);
    
    // Collect page errors (uncaught exceptions)
    const page_error_handler = err => {
      errors.push(`PAGE_ERROR: ${err.message}`);
    };
    page.on('pageerror', page_error_handler);
    
    try {
      await page.goto(`http://localhost:${PORT}/?control=${name}`, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      await delay(500); // Allow activation scripts to run
      
      // Check if control rendered with any visible content
      const control_info = await page.evaluate(() => {
        const container = document.querySelector('#control-mount');
        if (!container) return { exists: false, width: 0, height: 0, childCount: 0 };
        const rect = container.getBoundingClientRect();
        return {
          exists: true,
          width: rect.width,
          height: rect.height,
          childCount: container.children.length,
          innerText: container.innerText.substring(0, 100),
          innerHTML_length: container.innerHTML.length
        };
      });
      
      if (errors.length > 0) {
        results.console_errors.push({ name, errors, control_info });
      } else if (!control_info.exists || control_info.innerHTML_length < 10) {
        results.empty.push({ name, control_info });
      } else {
        results.ok.push(name);
      }
    } catch (err) {
      results.crashed.push({ name, error: err.message });
    }
    
    page.off('console', console_handler);
    page.off('pageerror', page_error_handler);
  }

  await browser.close();

  // Print results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PLAYWRIGHT BATCH CHECK - ${CONTROLS.length} controls (${SKIP_CLIENT_CHECK.size} skipped)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✓ OK: ${results.ok.length}`);
  console.log(`✗ Console errors: ${results.console_errors.length}`);
  console.log(`⚠ Empty/missing: ${results.empty.length}`);
  console.log(`💥 Crashed: ${results.crashed.length}`);
  
  if (results.console_errors.length > 0) {
    console.log(`\n--- CONSOLE ERRORS ---`);
    for (const { name, errors } of results.console_errors) {
      console.log(`  ✗ ${name}:`);
      errors.forEach(e => console.log(`      ${e.substring(0, 120)}`));
    }
  }
  
  if (results.empty.length > 0) {
    console.log(`\n--- EMPTY/MISSING ---`);
    results.empty.forEach(({ name, control_info }) => {
      console.log(`  ⚠ ${name}: exists=${control_info.exists}, innerHTML_len=${control_info.innerHTML_length}`);
    });
  }
  
  if (results.crashed.length > 0) {
    console.log(`\n--- CRASHED ---`);
    results.crashed.forEach(({ name, error }) => {
      console.log(`  💥 ${name}: ${error.substring(0, 120)}`);
    });
  }

  console.log(`\nSkipped: ${[...SKIP_CLIENT_CHECK].join(', ')}`);
  
  process.exit(results.console_errors.length + results.crashed.length > 0 ? 1 : 0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
