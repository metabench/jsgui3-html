# Consistency and Packaging

Each checklist item should include tests and documentation updates.

## Naming normalization
- [ ] Identify duplicates (e.g., `FormField.js` vs `form_field.js`).
- [ ] Choose canonical file and provide legacy alias exports.
- [ ] Add deprecation note in docs.

## Export stability
- [ ] Define stable public API list in `controls/controls.js`.
- [ ] Mark experimental controls explicitly.
- [ ] Add an export audit checklist for new controls.

## Core vs showcase separation
- [ ] Update docs to clarify core vs showcase controls.
- [ ] Ensure `controls/controls.js` reflects this separation.
