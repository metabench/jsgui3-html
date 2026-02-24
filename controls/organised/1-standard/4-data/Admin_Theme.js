/**
 * Admin_Theme — CSS custom-property theme system for admin dashboard controls.
 *
 * Provides a set of CSS variables (--admin-*) that all admin controls reference.
 * Switch themes by adding `data-admin-theme="<name>"` to any ancestor element,
 * or call Admin_Theme.apply(name) to set it on <html>.
 *
 * Built-in presets:
 *   'vs-default'  — Modern VS Code-inspired light (default)
 *   'vs-dark'     — Dark slate, VS Code dark+
 *   'terminal'    — Green-on-black terminal
 *   'warm'        — Amber/sepia tones
 *   'vs-classic'  — Old Windows 95/2000 Visual Studio style
 *   'vs-aero'     — Windows Vista/7 Aero glass Visual Studio style
 *
 * Usage (server-side, wrap page):
 *   page.add_css(Admin_Theme.css);
 *
 * Usage (client-side, switch theme):
 *   Admin_Theme.apply('vs-dark');
 *
 * Custom theme:
 *   Admin_Theme.define('my-theme', { '--admin-bg': '#222', ... });
 */

const THEMES = {
    // ─── VS Default (modern light) ─────────────────────────────────────
    'vs-default': {
        '--admin-bg': '#f3f3f3',
        '--admin-card-bg': '#ffffff',
        '--admin-border': '#e0e0e0',
        '--admin-border-accent': '#0078d4',

        '--admin-text': '#1e1e1e',
        '--admin-text-secondary': '#616161',
        '--admin-text-muted': '#9e9e9e',

        '--admin-font': "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        '--admin-font-mono': "'Cascadia Code', 'Consolas', 'JetBrains Mono', 'Courier New', monospace",
        '--admin-font-size': '13px',

        '--admin-header-bg': '#f8f8f8',
        '--admin-header-text': '#616161',
        '--admin-stripe-bg': '#f8f8f8',
        '--admin-hover-bg': '#e8e8e8',
        '--admin-select-bg': '#cce5ff',

        '--admin-accent': '#0078d4',
        '--admin-success': '#16825d',
        '--admin-warning': '#c19c00',
        '--admin-danger': '#cd3131',
        '--admin-info': '#3794ff',

        '--admin-success-bg': '#dff6dd',
        '--admin-warning-bg': '#fff4ce',
        '--admin-danger-bg': '#fdd',
        '--admin-info-bg': '#d6ecff',

        '--admin-radius': '4px',
        '--admin-radius-lg': '6px',
        '--admin-shadow': '0 1px 3px rgba(0,0,0,0.08)',
        '--admin-shadow-lg': '0 4px 12px rgba(0,0,0,0.1)',

        '--admin-row-height': '36px',
        '--admin-cell-padding': '8px 12px',
    },

    // ─── VS Dark ───────────────────────────────────────────────────────
    'vs-dark': {
        '--admin-bg': '#1e1e1e',
        '--admin-card-bg': '#252526',
        '--admin-border': '#3c3c3c',
        '--admin-border-accent': '#0078d4',

        '--admin-text': '#d4d4d4',
        '--admin-text-secondary': '#9d9d9d',
        '--admin-text-muted': '#6a6a6a',

        '--admin-font': "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        '--admin-font-mono': "'Cascadia Code', 'Consolas', 'JetBrains Mono', 'Courier New', monospace",
        '--admin-font-size': '13px',

        '--admin-header-bg': '#2d2d2d',
        '--admin-header-text': '#9d9d9d',
        '--admin-stripe-bg': '#2a2a2a',
        '--admin-hover-bg': '#2a2d2e',
        '--admin-select-bg': '#094771',

        '--admin-accent': '#3794ff',
        '--admin-success': '#4ec9b0',
        '--admin-warning': '#cca700',
        '--admin-danger': '#f14c4c',
        '--admin-info': '#3794ff',

        '--admin-success-bg': '#1e3a2f',
        '--admin-warning-bg': '#3a3000',
        '--admin-danger-bg': '#3a1d1d',
        '--admin-info-bg': '#1a3352',

        '--admin-radius': '4px',
        '--admin-radius-lg': '6px',
        '--admin-shadow': '0 1px 3px rgba(0,0,0,0.3)',
        '--admin-shadow-lg': '0 4px 12px rgba(0,0,0,0.4)',

        '--admin-row-height': '36px',
        '--admin-cell-padding': '8px 12px',
    },

    // ─── Terminal ──────────────────────────────────────────────────────
    'terminal': {
        '--admin-bg': '#0c0c0c',
        '--admin-card-bg': '#1a1a2e',
        '--admin-border': '#2a2a4a',
        '--admin-border-accent': '#00ff88',

        '--admin-text': '#e0e0e0',
        '--admin-text-secondary': '#00cc66',
        '--admin-text-muted': '#4a6a5a',

        '--admin-font': "'Cascadia Code', 'Consolas', monospace",
        '--admin-font-mono': "'Cascadia Code', 'Consolas', monospace",
        '--admin-font-size': '12px',

        '--admin-header-bg': '#16162a',
        '--admin-header-text': '#00cc66',
        '--admin-stripe-bg': '#151530',
        '--admin-hover-bg': '#1f1f3f',
        '--admin-select-bg': '#003322',

        '--admin-accent': '#00ff88',
        '--admin-success': '#00ff88',
        '--admin-warning': '#ffcc00',
        '--admin-danger': '#ff4444',
        '--admin-info': '#44aaff',

        '--admin-success-bg': '#003322',
        '--admin-warning-bg': '#332a00',
        '--admin-danger-bg': '#330a0a',
        '--admin-info-bg': '#0a2233',

        '--admin-radius': '2px',
        '--admin-radius-lg': '4px',
        '--admin-shadow': '0 1px 3px rgba(0,255,136,0.05)',
        '--admin-shadow-lg': '0 4px 12px rgba(0,255,136,0.08)',

        '--admin-row-height': '32px',
        '--admin-cell-padding': '6px 12px',
    },

    // ─── VS Classic (old Windows 95/2000 style) ──────────────────────
    'vs-classic': {
        '--admin-bg': '#c0c0c0',
        '--admin-card-bg': '#dfdfdf',
        '--admin-border': '#808080',
        '--admin-border-accent': '#000080',

        '--admin-text': '#000000',
        '--admin-text-secondary': '#404040',
        '--admin-text-muted': '#808080',

        '--admin-font': "'MS Sans Serif', 'Microsoft Sans Serif', 'Tahoma', 'Arial', sans-serif",
        '--admin-font-mono': "'Fixedsys', 'Courier New', 'Courier', monospace",
        '--admin-font-size': '12px',

        '--admin-header-bg': '#000080',
        '--admin-header-text': '#ffffff',
        '--admin-stripe-bg': '#d4d0c8',
        '--admin-hover-bg': '#b6b6b6',
        '--admin-select-bg': '#000080',

        '--admin-accent': '#000080',
        '--admin-success': '#008000',
        '--admin-warning': '#808000',
        '--admin-danger': '#ff0000',
        '--admin-info': '#000080',

        '--admin-success-bg': '#c0e0c0',
        '--admin-warning-bg': '#e0e0a0',
        '--admin-danger-bg': '#ffc0c0',
        '--admin-info-bg': '#c0c0e0',

        '--admin-radius': '0px',
        '--admin-radius-lg': '0px',
        '--admin-shadow': 'inset -1px -1px 0 #404040, inset 1px 1px 0 #ffffff',
        '--admin-shadow-lg': 'inset -2px -2px 0 #404040, inset 2px 2px 0 #ffffff',

        '--admin-row-height': '24px',
        '--admin-cell-padding': '2px 6px',
    },

    // ─── VS Aero (Windows Vista/7 Aero glass style) ────────────────
    'vs-aero': {
        '--admin-bg': '#eef5fd',
        '--admin-card-bg': 'rgba(255, 255, 255, 0.85)',
        '--admin-border': '#a0b4d0',
        '--admin-border-accent': '#3399ff',

        '--admin-text': '#1a1a2e',
        '--admin-text-secondary': '#4a5568',
        '--admin-text-muted': '#8a96a8',

        '--admin-font': "'Segoe UI', 'Tahoma', 'Calibri', -apple-system, BlinkMacSystemFont, sans-serif",
        '--admin-font-mono': "'Consolas', 'Lucida Console', 'Courier New', monospace",
        '--admin-font-size': '12px',

        '--admin-header-bg': 'linear-gradient(to bottom, #dce6f4 0%, #c4d5ea 45%, #b0c4de 50%, #c4d5ea 100%)',
        '--admin-header-text': '#1a1a2e',
        '--admin-stripe-bg': '#f0f5fb',
        '--admin-hover-bg': '#dcebfc',
        '--admin-select-bg': '#cbe4f9',

        '--admin-accent': '#3399ff',
        '--admin-success': '#3aa55d',
        '--admin-warning': '#d69e2e',
        '--admin-danger': '#e53e3e',
        '--admin-info': '#3182ce',

        '--admin-success-bg': '#e6f4ea',
        '--admin-warning-bg': '#fefcbf',
        '--admin-danger-bg': '#fee2e2',
        '--admin-info-bg': '#e0ecf9',

        '--admin-radius': '3px',
        '--admin-radius-lg': '5px',
        '--admin-shadow': '0 1px 4px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
        '--admin-shadow-lg': '0 4px 16px rgba(0,0,0,0.18), 0 0 2px rgba(0,0,0,0.12)',

        '--admin-row-height': '30px',
        '--admin-cell-padding': '4px 8px',
    },

    // ─── Warm ──────────────────────────────────────────────────────────
    'warm': {
        '--admin-bg': '#fefce8',
        '--admin-card-bg': '#fffbeb',
        '--admin-border': '#e5d49b',
        '--admin-border-accent': '#d97706',

        '--admin-text': '#451a03',
        '--admin-text-secondary': '#92400e',
        '--admin-text-muted': '#b89e6a',

        '--admin-font': "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        '--admin-font-mono': "'Cascadia Code', 'Consolas', monospace",
        '--admin-font-size': '13px',

        '--admin-header-bg': '#fef3c7',
        '--admin-header-text': '#b45309',
        '--admin-stripe-bg': '#fef9c3',
        '--admin-hover-bg': '#fde68a',
        '--admin-select-bg': '#fcd34d',

        '--admin-accent': '#d97706',
        '--admin-success': '#16825d',
        '--admin-warning': '#d97706',
        '--admin-danger': '#dc2626',
        '--admin-info': '#2563eb',

        '--admin-success-bg': '#dcfce7',
        '--admin-warning-bg': '#fef3c7',
        '--admin-danger-bg': '#fee2e2',
        '--admin-info-bg': '#dbeafe',

        '--admin-radius': '6px',
        '--admin-radius-lg': '8px',
        '--admin-shadow': '0 1px 3px rgba(146,64,14,0.06)',
        '--admin-shadow-lg': '0 4px 12px rgba(146,64,14,0.1)',

        '--admin-row-height': '36px',
        '--admin-cell-padding': '8px 12px',
    },
};

// Build CSS string with all theme definitions
function build_theme_css() {
    let css = '';

    // Default (vs-default) applied at :root
    const def = THEMES['vs-default'];
    css += ':root,\n[data-admin-theme="vs-default"] {\n';
    for (const [k, v] of Object.entries(def)) {
        css += `  ${k}: ${v};\n`;
    }
    css += '}\n\n';

    // Other themes
    for (const [name, vars] of Object.entries(THEMES)) {
        if (name === 'vs-default') continue;
        css += `[data-admin-theme="${name}"] {\n`;
        for (const [k, v] of Object.entries(vars)) {
            css += `  ${k}: ${v};\n`;
        }
        css += '}\n\n';
    }

    return css;
}

class Admin_Theme {
    /**
     * Apply a theme to the document root.
     * @param {string} name — Theme name: 'vs-default', 'vs-dark', 'terminal', 'warm'
     */
    static apply(name) {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-admin-theme', name);
        }
    }

    /**
     * Get available theme names.
     * @returns {string[]}
     */
    static get themes() {
        return Object.keys(THEMES);
    }

    /**
     * Define a custom theme.
     * @param {string} name — Theme name
     * @param {Object} vars — CSS variable overrides
     */
    static define(name, vars) {
        THEMES[name] = { ...THEMES['vs-default'], ...vars };
        // Rebuild CSS (note: already-injected stylesheets won't update)
        Admin_Theme.css = build_theme_css();
    }

    /**
     * Get the variables for a theme preset.
     * @param {string} name
     * @returns {Object}
     */
    static get_vars(name) {
        return THEMES[name] ? { ...THEMES[name] } : null;
    }
}

Admin_Theme.css = build_theme_css();
Admin_Theme.THEMES = THEMES;

module.exports = Admin_Theme;
