# Browser Automation Workflows for Agents

This document outlines effective workflows and best practices for agents performing browser automation and testing, particularly when facing environmental constraints or complex application architectures.

## 1. Environment Validation

Before attempting to launch a browser, always validate the environment. Missing environment variables are a common cause of failure for tools like Puppeteer and Playwright.

*   **Check `$HOME` (Linux/macOS) or `%USERPROFILE%` (Windows)**: Browser automation tools often need to store profiles, caches, or binaries in the user's home directory.
*   **Check `DISPLAY` (Linux)**: If running in a headless environment without X11, ensure you are using `--headless` mode.

**Recommendation:**
If a browser tool fails with "failed to launch", immediately check environment variables.

## 2. Dealing with Server-Side Rendering (SSR) & Activation

A common pitfall (as seen in the `jsgui3-html` Gallery Server) is assuming that HTML rendered by the server is automatically interactive.

*   **Static vs. Active**: Server-side rendered HTML is often just static markup. For interactivity (event listeners), client-side JavaScript must "activate" the HTML.
*   **The "Inert HTML" Symptom**: Controls look correct but do not respond to clicks.
*   **Solution**:
    1.  Verify that client-side bundles are being served (`<script src="...">`).
    2.  Verify that the activation logic (e.g., `jsgui.activate()`) is actually called on the client.
    3.  Check for mismatching IDs or data attributes (e.g., case sensitivity in `data-jsgui-type`).

## 3. Fallback Strategies

If the primary "Browser Tool" is unavailable (e.g., due to environment issues), agents should fall back to programmatic automation using libraries present in the codebase.

*   **Puppeteer / Playwright Scripts**: Write small, standalone Node.js scripts to perform specific verification tasks.
    *   *Pros*: Full control, access to console logs, network intersection.
    *   *Cons*: Requires writing code.
*   **`curl` / `fetch`**: For basic connectivity and HTML content checks.

## 4. Debugging Techniques

When automation scripts fail silently:

1.  **Capture Console Logs**:
    ```javascript
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    ```
    This is critical for detecting client-side errors (e.g., "activate is not defined").

2.  **Dump HTML State**:
    If a selector fails, dump the `outerHTML` of the parent or the `body` to see what the browser actually sees.
    ```javascript
    const html = await page.$eval('body', el => el.outerHTML);
    console.log(html);
    ```

3.  **Visual Proof**:
    Always take screenshots at key steps. Interactive states (hover, active) might not be visible in static HTML dumps.

## 5. Port Management

*   **Avoid Collisions**: When starting test servers, check if the default port is in use or likely to be in use by a background process.
*   **Use Dynamic/Environment Ports**: Allow passing `PORT` via environment variables (e.g., `$env:GALLERY_PORT=4446`) to run parallel tests without killing existing servers.

## Summary of the `jsgui3-html` Gallery Fix

**Problem**: The Gallery Server rendered static HTML. `Color_Picker` looked correct but was inert (no hex updates).
**Root Cause**: No client-side JavaScript bundle was served to "activate" the controls.
**Fix**:
1.  Modified `gallery_server.js` to bundle `jsgui` and all controls using `esbuild`.
2.  Served the bundle at `/client.js`.
3.  Injected `<script src="/client.js">` into the HTML.
4.  Ensured case-insensitive registration of controls so `data-jsgui-type="color_picker"` matched `Color_Picker` class.

**Verification**:
Launched server on port 4446, used Puppeteer to click the hue wheel, verified hex input value changed.
