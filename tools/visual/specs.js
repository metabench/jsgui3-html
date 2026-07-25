/**
 * specs.js — per-control default specs for the visual harness.
 *
 * Base layer: get_default_spec from test/e2e/gallery_server.js (~35 curated
 * specs). Enrichment layer: ENRICHED entries below, for controls whose bare
 * render is a markup-only shell (containers needing children, overlays
 * needing content, value-driven visuals needing a value). Enrichment entries
 * are functions of (jsgui, context) so child controls can be constructed in
 * the page's own context; whatever they return is merged over the gallery
 * spec (enrichment wins per key).
 */
'use strict';

const path = require('path');
const { REPO_ROOT } = require('./css_pipeline');

const gallery = require(path.join(REPO_ROOT, 'test', 'e2e', 'gallery_server.js'));

// Controls whose context-with-spec render is a near-empty shell without
// children or content. Verified spec vocabularies live in each control's
// source file — cite the file when adding an entry.
const ENRICHED = {
    // Verified in the July 2026 review probes:
    Badge: () => ({ text: 'Badge', variant: 'success' }),
    Progress_Bar: () => ({ value: 65 })
};

function get_spec(control_name, jsgui, context) {
    const base = gallery.get_default_spec(control_name) || {};
    const enrich = ENRICHED[control_name];
    if (!enrich) return base;
    return Object.assign({}, base, enrich(jsgui, context) || {});
}

module.exports = { get_spec, ENRICHED };
