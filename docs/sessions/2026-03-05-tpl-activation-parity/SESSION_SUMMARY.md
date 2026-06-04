# Session Summary

**Date**: 2026-03-05
**Topic**: Tpl Activation Parity

## Completed
- Exported `tpl` and `template` from the public `html-core` / `jsgui3-html` namespace.
- Extended SSR serialization and activation support for `bind-style`, `bind-visible`, and `bind-list`.
- Improved declarative event activation so bound instance methods serialize correctly.
- Repaired and expanded `test/core/template_binding.test.js` with a real SSR-to-activation regression.
- Refreshed declarative templating docs and the tmp smoke script to match the implementation.
- Added an SVG flow diagram for the templating / activation pipeline and documented the reusable SSR metadata pattern.

## Not Completed
- Full browser E2E coverage for `tpl` activation was not added in this session.

## Follow-ups
- [ ] Add a self-contained Puppeteer `tpl` activation E2E if browser-level coverage becomes necessary.
- [ ] Consider whether bind-list activation should rebuild jsgui child control trees, not just DOM, for richer dynamic templates.

## Lessons Learned
- Public docs for framework entry points need a matching root-export regression test.
- Declarative SSR features need explicit activation metadata coverage or they silently degrade on the client.

## Files Changed
- `html-core/parse-mount.js` - Added public templating helpers, richer SSR metadata, and serializable model-state support.
- `html-core/Data_Model_View_Model_Control.js` - Added runtime tpl activation metadata handling and restored advanced directives during activation.
- `html-core/html-core.js` - Exported `tpl` / `template` on the public namespace.
- `test/core/template_binding.test.js` - Switched to public API coverage and added SSR-to-activation regression checks.
- `tmp/test-tpl-hydration.js` - Refreshed the smoke script to cover current activation behavior.
- `docs/books/declarative-templating/*` - Updated docs to use `tpl` as the canonical public API.
- `docs/books/declarative-templating/tpl-activation-flow.svg` - Added a diagram covering the export, SSR metadata, and activation flow.
- `docs/agi/PATTERNS.md` - Added the declarative SSR metadata / activation pattern.
