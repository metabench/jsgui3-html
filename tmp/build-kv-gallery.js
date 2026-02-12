/**
 * Build a self-contained HTML file that inlines all 6 KV-Table SVGs
 * so the user can open it directly in their browser.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SVG_DIR = path.join(__dirname, '..', 'tmp', 'kv-renderings');
const OUT_FILE = path.join(__dirname, '..', 'tmp', 'kv-renderings', 'gallery.html');

const scenarios = [
    { file: 'kv-server-config-light.svg', title: 'Server Configuration', theme: 'Light', desc: 'Server settings with header row, status badges (LIVE, TLS 1.3), and green running indicator.' },
    { file: 'kv-process-info-dark.svg', title: 'Process Information', theme: 'Dark', desc: 'Node.js runtime details: PID, memory, CPU, event loop. No header, 10-row striped layout.' },
    { file: 'kv-env-vars-terminal.svg', title: 'Environment Variables', theme: 'Terminal', desc: 'Green-on-black terminal aesthetic. Copy buttons, environment tag badges, $ env header.' },
    { file: 'kv-database-status-light.svg', title: 'Database Status', theme: 'Light', desc: 'PostgreSQL metrics with WARNING/GOOD badges. Connection pool at 90%, slow query alerts.' },
    { file: 'kv-api-health-dark.svg', title: 'API Health Check', theme: 'Dark', desc: 'Endpoint latency monitoring with OK/SLOW/CRITICAL status badges color-coded by severity.' },
    { file: 'kv-session-warm.svg', title: 'Active Session', theme: 'Warm', desc: 'User session details in amber tones. Copy buttons, role/2FA badges.' },
];

let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Key_Value_Table — SVG Renderings</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 40px 20px;
  }
  h1 {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    text-align: center;
    color: #64748b;
    font-size: 14px;
    margin-bottom: 48px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }
  .card-svg {
    width: 100%;
    display: block;
  }
  .card-info {
    padding: 16px 20px;
    border-top: 1px solid #334155;
  }
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 4px;
  }
  .card-theme {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    margin-left: 8px;
    vertical-align: middle;
  }
  .theme-light    { background: #dbeafe; color: #1d4ed8; }
  .theme-dark     { background: #312e81; color: #a5b4fc; }
  .theme-terminal { background: #064e3b; color: #34d399; }
  .theme-warm     { background: #fef3c7; color: #b45309; }
  .card-desc {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
  }
</style>
</head>
<body>
<h1>Key_Value_Table — Renderings</h1>
<p class="subtitle">6 scenarios × 4 themes — admin dashboard control</p>
<div class="grid">
`;

for (const s of scenarios) {
    const svgContent = fs.readFileSync(path.join(SVG_DIR, s.file), 'utf8');
    const themeClass = `theme-${s.theme.toLowerCase()}`;

    html += `  <div class="card">
    <div class="card-svg">${svgContent}</div>
    <div class="card-info">
      <div class="card-title">${s.title}<span class="card-theme ${themeClass}">${s.theme}</span></div>
      <div class="card-desc">${s.desc}</div>
    </div>
  </div>\n`;
}

html += `</div>
</body>
</html>`;

fs.writeFileSync(OUT_FILE, html);
console.log(`Gallery written to: ${OUT_FILE}`);
console.log(`Size: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
console.log(`\nOpen in browser: file:///${OUT_FILE.replace(/\\/g, '/')}`);
