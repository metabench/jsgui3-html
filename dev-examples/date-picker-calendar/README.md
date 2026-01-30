# Date Picker & Calendar Demo

This example demonstrates the Date Picker Progressive and Calendar controls with MVVM data binding support.

## Features

### Date Picker Progressive
- **Progressive Enhancement**: Uses native HTML5 date input as the base
- **Custom Calendar Fallback**: Provides a rich calendar UI when native input is insufficient
- **Dual Sync**: Native input and calendar stay synchronized
- **Range Support**: Min/max date validation
- **Localization**: Supports different locales and date formats

### Calendar Control
- **MVVM Compatible**: Binds to Data_Object models
- **Month Navigation**: Previous/next month controls
- **Date Selection**: Single date selection with visual feedback
- **Customizable**: First day of week, week numbers, etc.
- **Event System**: Fires change events on date selection

### MVVM Data Binding
- Demonstrates binding calendar to a Data_Object
- Model updates automatically propagate to the view
- Supports computed properties and watchers

## Running the Demo

```bash
node server.js
```

Then open http://localhost:52010 in your browser.

## Architecture

### Progressive Enhancement Flow

1. **Server-side**: Renders native HTML5 `<input type="date">` with calendar toggle button
2. **CSS Enhancement**: Styles applied via CSS tokens
3. **Client Activation**: 
   - Attaches event listeners to toggle button
   - Syncs native input with calendar control
   - Enables MVVM data binding

### Control Structure

```
Date_Picker_Progressive
├── Date_Picker (native HTML5 input)
├── Button (calendar toggle)
└── Calendar (custom calendar UI)
    ├── Control (header with navigation)
    └── Month_View (calendar grid)
```

## Code Examples

### Basic Usage

```javascript
const date_picker = new Date_Picker_Progressive({
    context,
    value: '2024-01-15',
    min: '2023-01-01',
    max: '2025-12-31'
});
```

### With MVVM

```javascript
const { Data_Object } = require('lang-tools');

const model = new Data_Object({
    selected_date: new Date()
});

const calendar = new Calendar({
    context,
    data_model: model,
    value_property: 'selected_date',
    value: model.selected_date
});

// Model changes update the calendar
model.selected_date = new Date(2024, 5, 15);
```

### Event Handling

```javascript
date_picker.on('change', e => {
    console.log('Date selected:', e.value);
});

calendar.on('date-click', e => {
    console.log('Date clicked:', e.date);
});
```

## Testing

The demo includes data-test attributes for E2E testing:

- `data-test="date-picker-basic"` - Basic date picker
- `data-test="calendar-standalone"` - Standalone calendar
- `data-test="calendar-mvvm"` - MVVM-bound calendar
- `data-test="date-picker-start"` - Range start picker
- `data-test="date-picker-end"` - Range end picker

## Extension Points

### Custom Date Validation

Override or extend the date validation logic:

```javascript
class My_Date_Picker extends Date_Picker_Progressive {
    _is_date_disabled(date) {
        // Custom logic (e.g., no weekends)
        return date.getDay() === 0 || date.getDay() === 6;
    }
}
```

### Custom Calendar Rendering

Extend the Calendar control to customize date cell rendering:

```javascript
class My_Calendar extends Calendar {
    _render_date_cell(date) {
        // Add badges, tooltips, etc.
    }
}
```

## Browser Compatibility

- **Modern Browsers**: Full functionality with native date input
- **Legacy Browsers**: Graceful fallback to custom calendar
- **Server-Side Rendering**: Full SSR support with client activation

## Related Controls

- `Date_Picker` - Base native HTML5 date input
- `Date_Picker_Dropdown` - Dropdown variant
- `Date_Picker_Inline` - Inline calendar variant
- `Date_Picker_Range` - Date range picker
- `Month_View` - Calendar month grid component
