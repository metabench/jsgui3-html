/**
 * Batch compose rename: compose_*() → compose() for controls that still
 * use the old naming convention.
 *
 * For controls where compose_xxx is called only from the constructor
 * (and nowhere else internally), we do a simple rename.
 * For List, compose_list() is called from multiple places — still rename
 * but keep all call-sites updated.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'controls', 'organised');

const renames = [
    // [relative path from BASE, old method name]
    ['1-standard/6-layout/accordion.js', 'compose_accordion'],
    ['1-standard/4-data/data_table.js', 'compose_table'],
    ['1-standard/4-data/Tree_View.js', 'compose_tree'],
    ['1-standard/6-layout/stepper.js', 'compose_stepper'],
    ['1-standard/5-ui/alert_banner.js', 'compose_alert'],
    ['1-standard/1-editor/form_container.js', 'compose_form'],
    ['1-standard/0-viewer/Property_Viewer.js', 'compose_viewer'],
    ['1-standard/0-viewer/Resource_Viewer.js', 'compose_viewer'],
    ['1-standard/2-misc/left-right-arrows-selector.js', 'compose_lras'],
    ['0-core/0-basic/1-compositional/scrollbar.js', 'compose_scrollbar'],
    ['0-core/0-basic/1-compositional/list.js', 'compose_list'],
    ['1-standard/6-layout/app/multi-layout-mode.js', 'compose_mlm'],
];

let total_changed = 0;
let total_replacements = 0;

for (const [rel, old_name] of renames) {
    const fp = path.join(BASE, rel);
    if (!fs.existsSync(fp)) {
        console.log(`  SKIP: ${rel} — file not found`);
        continue;
    }
    const src = fs.readFileSync(fp, 'utf8');
    // Replace all occurrences: method definition and call sites
    const re = new RegExp(old_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = src.match(re);
    if (!matches || matches.length === 0) {
        console.log(`  SKIP: ${rel} — '${old_name}' not found`);
        continue;
    }
    const updated = src.replace(re, 'compose');
    fs.writeFileSync(fp, updated);
    console.log(`  ✓ ${rel}: ${old_name} → compose (${matches.length} occurrences)`);
    total_changed++;
    total_replacements += matches.length;
}

console.log(`\nDone: ${total_changed} files changed, ${total_replacements} total replacements`);
