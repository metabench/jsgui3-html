const http = require('http');
const PORT = 4460;
const warnings = ['Line_Chart', 'Login', 'File_Upload', 'Popup_Menu_Button'];

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
    const match = r.body.match(/Instantiation Error:<\/strong>\s*(.+?)\s*<\/div>/);
    console.log(`${name}: ${match ? match[1] : 'no error found'}`);
  }
}
run();
