# E2E Test Suite

End-to-end tests for jsgui3-html dev-examples using Puppeteer.

## Setup

Install dependencies:

```bash
cd test/e2e
npm install
```

## Running Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run specific test file:
```bash
npm run test:e2e:counter
npm run test:e2e:user-form
```

Run in watch mode:
```bash
npm run test:e2e:watch
```

## Test Structure

### Counter Tests (`counter.test.js`)

Comprehensive tests for the enhanced counter example covering:

- **Initial State**: Verifies counter starts at 0, parity is "even", undo/redo disabled
- **Increment Button**: Tests increment functionality and parity updates
- **Decrement Button**: Tests decrement functionality
- **Reset Button**: Tests reset to 0
- **Keyboard Shortcuts**:
  - `↑` (ArrowUp) - Increment
  - `↓` (ArrowDown) - Decrement
  - `R` - Reset
  - `Ctrl+Z` - Undo
  - `Ctrl+Y` - Redo
- **Undo/Redo**: Tests history navigation, button states, keyboard shortcuts
- **History Management**: Tests history display, position tracking, clear history
- **localStorage Persistence**: Tests saving and restoring counter state, history, and undo/redo position
- **Complex Scenarios**: Rapid clicks, mixed input, complex undo/redo sequences

### Test Helpers (`helpers.js`)

Reusable utilities for E2E tests:

- `start_server(example_name, port)` - Start a dev-examples server
- `stop_server(server_process)` - Stop a running server
- `launch_browser(options)` - Launch Puppeteer browser
- `get_text(page, selector)` - Get element text content
- `click_element(page, selector)` - Click an element
- `type_text(page, selector, text)` - Type into input field
- `get_local_storage(page, key)` - Get localStorage value
- `clear_local_storage(page)` - Clear localStorage
- `wait_for_condition(condition, timeout)` - Wait for async condition

## Writing New Tests

1. Create a new test file in `test/e2e/` directory (e.g., `my-example.test.js`)
2. Import test helpers and chai
3. Use Mocha's `describe` and `it` blocks
4. Start server in `before` hook
5. Create fresh page in `beforeEach` hook
6. Write tests using helpers
7. Clean up in `after` and `afterEach` hooks

Example:

```javascript
const { expect } = require('chai');
const { start_server, stop_server, launch_browser, get_text, click_element } = require('./helpers');

describe('My Example E2E Tests', function() {
    this.timeout(30000);
    
    let browser, page, server;
    const PORT = 52002;
    
    before(async function() {
        server = await start_server('my-example', PORT);
        browser = await launch_browser();
    });
    
    after(async function() {
        if (browser) await browser.close();
        if (server) stop_server(server.process);
    });
    
    beforeEach(async function() {
        page = await browser.newPage();
        await page.goto(server.url, { waitUntil: 'networkidle0' });
    });
    
    afterEach(async function() {
        if (page) await page.close();
    });
    
    it('should do something', async function() {
        const text = await get_text(page, '.my-element');
        expect(text).to.equal('Expected Value');
    });
});
```

## Naming Conventions

Follow jsgui3-html naming conventions:

- **Variables/Functions**: `snake_case` (e.g., `start_server`, `get_text`, `server_process`)
- **Classes**: `Camel_Case` (e.g., `Form_Field`, `Property_Editor`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `PORT`, `DEFAULT_TIMEOUT`)

## Troubleshooting

### Server fails to start

- Check that the example directory exists
- Verify `server.js` exists in the example directory
- Ensure port is not already in use
- Check console output for error messages

### Tests timeout

- Increase timeout in test file: `this.timeout(60000)`
- Check selector accuracy
- Verify server is responding
- Use `page.waitForSelector()` with appropriate timeout

### localStorage not persisting

- Ensure localStorage save is debounced (wait 600ms after action)
- Use `page.waitForTimeout(600)` before checking localStorage
- Clear localStorage in `beforeEach` to avoid test pollution

### Browser doesn't close

- Always close browser in `after` hook
- Use `--exit` flag in mocha command to force exit
- Check for hanging promises or async operations

## CI/CD Integration

To run E2E tests in CI:

```bash
# Install dependencies
cd test/e2e && npm install

# Run tests with coverage (if needed)
npm run test:e2e
```

For headless environments, Puppeteer runs in headless mode by default. No additional configuration needed.

## Port Usage

E2E tests use different ports to avoid conflicts:

- Counter tests: `52001`
- User form tests: `52002`
- WYSIWYG tests: `52003`
- Add more as needed...

## Performance

- Each test gets a fresh page to avoid state pollution
- Server starts once per test suite (not per test)
- localStorage cleared before each test
- Browser shared across all tests in a suite
