# Session Summary: Markdown viewer tables

**Date**: 2026-07-19
**Status**: Complete and deployed through the jsgui3 docs viewer

## Result

`Markdown_Viewer` now recognises bounded GitHub-style tables and renders
semantic, responsive HTML without reintroducing the parser-progress failure
fixed earlier in the day. It handles alignment markers, escaped pipe
characters, inline code, header scope, and narrow-screen scrolling while
leaving ordinary pipe-delimited prose unchanged.

The public documentation viewer at <http://141.144.193.218:52001/> uses the
updated control. Its component guide currently renders 13 tables with no page
overflow at a 390-pixel viewport.

## Files

- `controls/organised/1-standard/0-viewer/Markdown_Viewer.js`
- `test/controls/markdown_viewer.test.js`
- `controls/README.md`
- `docs/sessions/SESSIONS_HUB.md`

## Checks

- Markdown viewer unit tests: 6/6 passing.
- Documentation viewer owner tests: 16/16 passing.
- Public route and asset sweep: 182/182 passing.
- Public desktop/mobile Chromium checks: activation complete, semantic tables
  present, zero horizontal overflow, zero console errors or warnings.

## Follow-up

A complete CommonMark/GFM implementation remains intentionally out of scope.
If more syntax is added, keep each construct bounded by focused parser tests
and the progress invariant.
