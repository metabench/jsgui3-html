// Check warning controls for actual error content
const http = require('http');
const PORT = 4460;

const warnings = [
  'Admin_Theme', 'Audio_Volume', 'Chip', 'File_Upload', 'Line_Chart',
  'Login', 'Menu_Node', 'Popup_Menu_Button', 'Radio_Button_Group', 'Timespan_Selector'
];

function fetch_control(name) {
  return new Promise((resolve) => {
    http.get(`http://localhost:${PORT}/?control=${name}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ name, body: data }));
    }).on('error', (err) => resolve({ name, error: err.message }));
  });
}

async function run() {
  for (const name of warnings) {
    const r = await fetch_control(name);
    if (r.error) {
      console.log(`\n=== ${name} === FETCH ERROR: ${r.error}`);
      continue;
    }
    // Extract error-like text
    const body = r.body;
    const lines = body.split('\n');
    const error_lines = lines.filter(l => 
      /error:/i.test(l) || /cannot /i.test(l) || /exception/i.test(l) || /stack/i.test(l)
    );
    console.log(`\n=== ${name} (${body.length} bytes) ===`);
    if (error_lines.length > 0) {
      error_lines.slice(0, 5).forEach(l => console.log(`  ${l.trim().substring(0, 200)}`));
    }
    // Also check for visible content - look for the control wrapper
    const has_control_div = body.includes('class="jsgui');
    const has_error_display = body.includes('Server error') || body.includes('Error rendering');
    console.log(`  Has jsgui class: ${has_control_div}`);
    console.log(`  Has error display: ${has_error_display}`);
    
    // Extract the body content between <body> tags
    const body_match = body.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (body_match) {
      const inner = body_match[1].trim();
      // Show first meaningful 300 chars
      const meaningful = inner.replace(/<script[\s\S]*?<\/script>/g, '').trim();
      console.log(`  Body preview: ${meaningful.substring(0, 300)}`);
    }
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
