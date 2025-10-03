# User Form with Server-Side Validation

This example demonstrates a complete form with both client-side and server-side validation using jsgui3-html's MVVM data binding system.

## What It Demonstrates

1. **Form Field Binding**: Two-way data binding between inputs and model
2. **Data Transformation**: Automatic capitalization, trimming, lowercasing
3. **Client-Side Validation**: Immediate feedback on blur
4. **Server-Side Validation**: Additional checks including email blacklist
5. **Async Operations**: Form submission with loading states
6. **Error Display**: Per-field error messages
7. **API Integration**: Using `server.publish()` for backend APIs

## Running the Example

```bash
# From jsgui3-html root directory
node dev-examples/binding/user-form/server.js

# Or from this directory
node server.js
```

Then open: `http://localhost:52001`

## File Structure

- **client.js**: Form control with validation logic
- **server.js**: API endpoints for validation and registration
- **README.md**: This file

## How It Works

### Client-Side Validation

Validation runs when fields lose focus (blur event):

```javascript
this.firstNameInput.on('blur', () => {
    this.validateField('firstName');
});
```

Validation rules check:
- **First/Last Name**: Required, 2-50 characters
- **Email**: Required, valid format
- **Website**: Valid URL format (optional)
- **Terms**: Must be checked

### Server-Side Validation

Additional server checks via API:

```javascript
async validateOnServer() {
    const response = await fetch('/api/validateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data.model.get())
    });
    return await response.json();
}
```

Server-side checks:
- Email blacklist (`spam@example.com`, `fake@test.com`)
- Duplicate email detection
- Additional validation rules
- Business logic validation

### Data Transformation

Input values are automatically transformed:

```javascript
// First/Last name: Capitalize
this.bind('firstName', this.data.model, {
    toView: (value) => value,
    toModel: (value) => this.transforms.string.capitalize(value)
}, this.firstNameInput, 'value');

// Email: Lowercase and trim
this.bind('email', this.data.model, {
    toView: (value) => value,
    toModel: (value) => this.transforms.string.toLowerCase(value.trim())
}, this.emailInput, 'value');
```

### Form Submission Flow

1. **User clicks submit**
2. **Client validation** - Check all fields
3. **Server validation** - `/api/validateUser`
4. **Registration** - `/api/register`
5. **Success/Error** - Display message
6. **Reset** - Clear form after success

### API Endpoints

The server publishes three endpoints:

```javascript
// Validate user data
server.publish('validateUser', (userData) => {
    return validateUser(userData);
});

// Register user
server.publish('register', (userData) => {
    // Validate and save to database
    return { success: true };
});

// Get registered users (debug)
server.publish('getUsers', () => {
    return { count: userDatabase.length, users: [...] };
});
```

All available at `/api/<name>`.

## Test Cases

### ✅ Valid Submission
- First Name: `John`
- Last Name: `Doe`
- Email: `john@example.com`
- Website: `https://johndoe.com` (optional)
- Terms: Checked

### ❌ Blacklisted Email
Try `spam@example.com` - Server rejects it

### ❌ Invalid URL
Try `not-a-url` in website field

### ❌ Missing Required Fields
Leave first name empty - Error appears on blur

### ❌ Invalid Email
Try `notanemail` - Format validation fails

### ❌ Duplicate Email
Submit same email twice - Server detects duplicate

## Validation Architecture

### Two-Layer Validation

1. **Client Layer** (Fast feedback)
   - Runs on blur/change
   - Basic format checking
   - No network required
   - Immediate user feedback

2. **Server Layer** (Authority)
   - Runs on submission
   - Business logic checks
   - Database checks
   - Security validation

### Benefits

- **Fast UX**: Client validation gives immediate feedback
- **Security**: Server validation prevents bypassing
- **Data Quality**: Transformation ensures consistent data
- **User Friendly**: Clear error messages guide users

## Computed Properties

The submit button state is computed from validation:

```javascript
this.computed(() => {
    const errors = this.view.data.model.get('errors') || {};
    const hasErrors = Object.values(errors).some(err => err);
    const submitting = this.view.data.model.get('submitting');
    return !hasErrors && !submitting;
}, (isValid) => {
    if (isValid) {
        this.submitButton.remove_class('disabled');
    } else {
        this.submitButton.add_class('disabled');
    }
});
```

## View Model Pattern

Separates data from UI state:

```javascript
// Data model - user data
this.data.model = new Data_Object({
    firstName: '',
    lastName: '',
    email: '',
    website: '',
    agreeToTerms: false
});

// View model - UI state
this.view.data.model = new Data_Object({
    errors: {},
    touched: {},
    submitting: false,
    submitMessage: null
});
```

## Debug API

Check registered users:

```bash
curl http://localhost:52001/api/getUsers
```

Or open in browser:
```
http://localhost:52001/api/getUsers
```

## Customization Ideas

1. **Add More Fields**: Bio, phone number, address
2. **Password Validation**: Add password field with strength meter
3. **Real Database**: Connect to MongoDB, PostgreSQL, etc.
4. **Email Verification**: Send verification email
5. **Captcha**: Add bot protection
6. **Rate Limiting**: Prevent spam submissions
7. **File Upload**: Add profile picture upload

## Integration Patterns

### With Express Middleware
```javascript
// Add authentication, logging, etc.
server.on('ready', () => {
    server.app.use(expressMiddleware);
});
```

### With Database
```javascript
server.publish('register', async (userData) => {
    await db.collection('users').insertOne(userData);
    return { success: true };
});
```

### With Email Service
```javascript
server.publish('register', async (userData) => {
    await emailService.sendWelcomeEmail(userData.email);
    return { success: true };
});
```

## See Also

- [Counter Example](../counter/) - Simpler data binding example
- [Data Grid Example](../data-grid/) - Data loading from server
- [Data Binding Guide](../../../html-core/DATA_BINDING.md) - Complete API reference
