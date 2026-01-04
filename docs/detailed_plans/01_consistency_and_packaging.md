# Consistency and Packaging - Detailed Implementation Plan

## Objective

Normalize naming conventions, eliminate duplicate files, stabilize the public API, and clarify the distinction between core and showcase controls.

## Current State Analysis

### Known Duplicates

Based on codebase inspection, the following duplicates exist:

| File A | File B | Location |
|--------|--------|----------|
| `FormField.js` | `form_field.js` | `controls/organised/1-standard/1-editor/` |
| `PropertyEditor.js` | `property_editor.js` | `controls/organised/1-standard/1-editor/` |

### Naming Convention Inconsistencies

The codebase uses mixed conventions:

- **File names**: Mix of `snake_case`, `kebab-case`, and `CamelCase`
- **Class names**: Generally `Camel_Case` with underscores (e.g., `Text_Input`, `Data_Table`)
- **Variable/method names**: Generally `snake_case`

### Export Structure

`controls/controls.js` serves as the main export point but:
- Lacks explicit categorization (core vs experimental)
- No version stability markers
- Some controls may be missing from exports

---

## Technical Specification

### 1. Naming Convention Standard

**Canonical convention:**

| Element | Convention | Example |
|---------|------------|---------|
| File names | `snake_case.js` | `form_field.js`, `data_table.js` |
| Class names | `Camel_Case` | `Form_Field`, `Data_Table` |
| Methods | `snake_case` | `get_value()`, `set_options()` |
| Properties | `snake_case` | `selected_item`, `is_disabled` |
| CSS classes | `kebab-case` | `.form-field`, `.data-table` |
| Event names | `snake_case` | `value_change`, `item_select` |

### 2. Duplicate Resolution Strategy

For each duplicate pair:

1. **Audit both files** - Determine which has more features/usage
2. **Choose canonical** - Select one as the official implementation
3. **Create alias** - Deprecated alias in the other file
4. **Document deprecation** - Add migration notes

**Alias pattern:**

```javascript
// In deprecated file (e.g., FormField.js)
const Form_Field = require('./form_field');

// Deprecation warning (development only)
if (process.env.NODE_ENV !== 'production') {
    console.warn(
        'DEPRECATED: FormField is deprecated. ' +
        'Use Form_Field from form_field.js instead. ' +
        'This alias will be removed in v1.0.0'
    );
}

module.exports = Form_Field;
```

### 3. Export Stability Markers

Add stability tiers to `controls/controls.js`:

```javascript
// controls/controls.js

// ============================================
// STABLE API - Safe for production use
// ============================================

// Core controls (0-core)
exports.Button = require('./organised/0-core/0-basic/0-native-compositional/button');
exports.Text_Input = require('./organised/0-core/0-basic/0-native-compositional/Text_Input');
exports.Checkbox = require('./organised/0-core/0-basic/0-native-compositional/checkbox');
// ... etc

// Standard controls (1-standard)
exports.Form_Field = require('./organised/1-standard/1-editor/form_field');
exports.Data_Table = require('./organised/1-standard/4-data/data_table');
// ... etc

// ============================================
// EXPERIMENTAL API - May change without notice
// ============================================

exports.experimental = {
    // Showcase controls
    Icon_Library: require('./organised/2-showcase/icon-library'),
    // Lab controls
    // ...
};

// ============================================
// DEPRECATED - Will be removed in next major
// ============================================

exports.deprecated = {
    FormField: require('./organised/1-standard/1-editor/FormField'), // Use Form_Field
    PropertyEditor: require('./organised/1-standard/1-editor/PropertyEditor'), // Use Property_Editor
};
```

### 4. Core vs Showcase Separation

**Categories:**

| Category | Description | Stability | Directory |
|----------|-------------|-----------|-----------|
| Core | Fundamental building blocks | Stable | `0-core/` |
| Standard | Application-ready controls | Stable | `1-standard/` |
| Showcase | Demos and prototypes | Experimental | `2-showcase/` |
| Connected | Server integration | Experimental | `connected/` |
| Lab | Work in progress | Unstable | `lab/` |

---

## Implementation Steps

### Phase 1: Audit and Analysis

**Step 1.1: Generate duplicate inventory**

```bash
# Find potential duplicates by similar names
find controls/ -name "*.js" | xargs -I {} basename {} .js | sort | uniq -di
```

**Step 1.2: Compare duplicate implementations**

For each duplicate pair:
- Line count comparison
- Feature comparison (properties, methods)
- Test coverage comparison
- Import dependency count

**Step 1.3: Document findings**

Create `docs/audits/naming_audit_results.md` with:
- Full duplicate list
- Recommended canonical for each
- Migration complexity rating

### Phase 2: Resolve Duplicates

**Step 2.1: FormField.js / form_field.js**

Decision criteria:
- Which follows naming convention? `form_field.js` (snake_case)
- Which has more features? Audit required
- Which has more imports? Check with grep

Recommended action:
1. Keep `form_field.js` as canonical
2. Convert `FormField.js` to alias
3. Update all internal imports

**Step 2.2: PropertyEditor.js / property_editor.js**

Same process as above.

### Phase 3: Normalize Exports

**Step 3.1: Create export map**

Document every control with its:
- Current export name
- Recommended export name
- Category (core/standard/experimental)
- Breaking change risk

**Step 3.2: Update controls/controls.js**

Restructure with stability tiers and categories.

**Step 3.3: Add TypeScript definitions (optional)**

Create `controls/controls.d.ts` for IDE support:

```typescript
// controls/controls.d.ts
export declare class Button extends Control {
    constructor(spec?: ButtonSpec);
    // ...
}

export declare class Text_Input extends Control {
    constructor(spec?: TextInputSpec);
    value: string;
    // ...
}
```

### Phase 4: Documentation Update

**Step 4.1: Update README.md**

Add section on control categories and stability.

**Step 4.2: Update docs/controls/INDEX.md**

Add stability markers to control index.

**Step 4.3: Create migration guide**

`docs/migrations/naming_normalization.md`:
- Before/after import examples
- Deprecation timeline
- Automated migration script (if feasible)

---

## Code Patterns

### Deprecation Warning Helper

```javascript
// utils/deprecation.js
const warned = new Set();

function deprecation_warning(old_name, new_name, removal_version = '1.0.0') {
    if (process.env.NODE_ENV === 'production') return;
    const key = `${old_name}:${new_name}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
        `[jsgui3-html] DEPRECATED: "${old_name}" is deprecated. ` +
        `Use "${new_name}" instead. ` +
        `This will be removed in v${removal_version}.`
    );
}

module.exports = { deprecation_warning };
```

### Alias File Template

```javascript
// FormField.js (deprecated alias)
'use strict';

const { deprecation_warning } = require('../../../utils/deprecation');
const Form_Field = require('./form_field');

deprecation_warning('FormField', 'Form_Field');

module.exports = Form_Field;
```

### Export Stability Comment Pattern

```javascript
/**
 * @stability stable
 * @since 0.0.150
 * @category core
 */
exports.Button = require('./organised/0-core/0-basic/0-native-compositional/button');
```

---

## Testing Strategy

### Verification Checklist

- [ ] No duplicate exports with different implementations
- [ ] All deprecated aliases emit warnings in development
- [ ] No warnings in production builds
- [ ] TypeScript definitions compile without errors
- [ ] All documentation reflects new names
- [ ] README examples use canonical names

### Regression Tests

```javascript
// test/exports/naming_consistency.test.js

describe('Export naming consistency', () => {
    it('should not export duplicates', () => {
        const controls = require('../../controls/controls');
        const names = Object.keys(controls).filter(k => k !== 'experimental' && k !== 'deprecated');
        const lowerNames = names.map(n => n.toLowerCase());
        const uniqueLower = [...new Set(lowerNames)];
        expect(lowerNames.length).toBe(uniqueLower.length);
    });

    it('should emit deprecation warning for FormField', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();
        process.env.NODE_ENV = 'development';
        require('../../controls/organised/1-standard/1-editor/FormField');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('DEPRECATED'));
        warn.mockRestore();
    });
});
```

---

## Migration Notes

### For Library Users

**Before:**
```javascript
const { FormField, PropertyEditor } = require('jsgui3-html/controls/controls');
```

**After:**
```javascript
const { Form_Field, Property_Editor } = require('jsgui3-html/controls/controls');
```

### Deprecation Timeline

| Version | Action |
|---------|--------|
| 0.0.180 | Add deprecation warnings, create aliases |
| 0.0.190 | Document migration in release notes |
| 1.0.0 | Remove deprecated aliases |

### Automated Migration

Consider providing a codemod:

```javascript
// scripts/migrate-naming.js
// Usage: npx jscodeshift -t migrate-naming.js src/

module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const renames = {
        'FormField': 'Form_Field',
        'PropertyEditor': 'Property_Editor'
    };

    // Transform imports
    root.find(j.ImportSpecifier)
        .filter(p => renames[p.node.imported.name])
        .forEach(p => {
            p.node.imported.name = renames[p.node.imported.name];
        });

    return root.toSource();
};
```

---

## Success Criteria

1. **Zero duplicate exports** - Each control has exactly one canonical export
2. **Consistent naming** - All files follow `snake_case.js` convention
3. **Clear deprecation path** - All deprecated names emit warnings
4. **Documented stability** - Every export has a stability tier
5. **No breaking changes** - Old names still work (with warnings)
