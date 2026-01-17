/**
 * TypeScript types verification test.
 * This file is used to verify the type declarations are valid.
 */

import jsgui, {
    Control,
    Window,
    WindowSpec,
    WindowParams,
    ControlSpec,
    ThemeSpec,
    ThemeParams
} from './html';

// Test 1: Basic Control creation
const basicSpec: ControlSpec = {
    class: 'my-class',
    id: 'my-id'
};

// Test 2: Window with typed params
const windowSpec: WindowSpec = {
    title: 'My Window',
    variant: 'macos',  // Should autocomplete: 'default' | 'macos' | 'windows-11' | 'minimal'
    params: {
        button_position: 'left',  // Should autocomplete: 'left' | 'right'
        button_order: ['close', 'minimize', 'maximize'],
        button_style: 'traffic-light',
        show_minimize: true,
        show_maximize: true,
        show_close: true,
        title_alignment: 'center'
    }
};

// Test 3: Theme spec
const theme: ThemeSpec = {
    name: 'dark',
    extends: 'macos',
    tokens: {
        'window-bg': '#1a1a1a',
        'window-title-bg': '#2d2d2d'
    },
    params: {
        window: {
            button_position: 'left',
            button_style: 'traffic-light'
        },
        button: {
            size: 'medium',
            variant: 'primary'
        }
    }
};

// Test 4: Using jsgui namespace
const div = new jsgui.div({ class: 'container' });
const span = new jsgui.span({ class: 'text' });

// Test 5: Window methods should be typed
declare const win: Window;
win.minimize();  // Returns Promise<void>
win.maximize();  // Returns Promise<void>
win.close();     // Returns void
win.bring_to_front_z();  // Returns void
win.dock_to('left');  // 'left' | 'right' | 'top' | 'bottom' | 'fill'

// Test 6: Window properties should be typed
const titleBar: Control = win.title_bar;
const inner: Control = win.inner;
const enabled: boolean = win.snap_enabled;
const minSize: [number, number] = win.min_size;

console.log('Types verified:', { basicSpec, windowSpec, theme, div, titleBar, inner, enabled, minSize });
