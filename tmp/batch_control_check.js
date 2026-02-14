// Batch test all gallery controls for server-side rendering errors
const http = require('http');
const PORT = 4460;

const controls = [
  'Accordion','Active_HTML_Document','Activity_Feed','Admin_Theme','Alert_Banner',
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

function fetch_control(name) {
  return new Promise((resolve) => {
    const url = `http://localhost:${PORT}/?control=${name}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ name, status: res.statusCode, size: data.length, has_error_in_body: data.includes('Error:') || data.includes('error:') || data.includes('Cannot ') });
      });
    }).on('error', (err) => {
      resolve({ name, status: 0, size: 0, error: err.message });
    });
  });
}

async function run() {
  console.log(`Testing ${controls.length} controls against http://localhost:${PORT}\n`);
  
  const errors = [];
  const warnings = [];
  const ok = [];
  
  // Process in batches of 10
  for (let i = 0; i < controls.length; i += 10) {
    const batch = controls.slice(i, i + 10);
    const results = await Promise.all(batch.map(fetch_control));
    
    for (const r of results) {
      if (r.status !== 200) {
        errors.push(r);
      } else if (r.has_error_in_body) {
        warnings.push(r);
      } else if (r.size < 500) {
        warnings.push({ ...r, note: 'Very small page - may be empty' });
      } else {
        ok.push(r);
      }
    }
  }
  
  console.log(`=== RESULTS ===`);
  console.log(`✓ OK: ${ok.length}`);
  console.log(`⚠ Warnings: ${warnings.length}`);
  console.log(`✗ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log(`\n--- ERRORS (non-200 status) ---`);
    errors.forEach(e => console.log(`  ✗ ${e.name}: status=${e.status} size=${e.size} ${e.error || ''}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n--- WARNINGS ---`);
    warnings.forEach(w => console.log(`  ⚠ ${w.name}: status=${w.status} size=${w.size} ${w.note || 'error text in body'}`));
  }
  
  // Print OK controls with their sizes for reference
  console.log(`\n--- OK CONTROLS (${ok.length}) ---`);
  ok.sort((a, b) => a.size - b.size);
  ok.forEach(o => console.log(`  ✓ ${o.name}: ${o.size} bytes`));
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
