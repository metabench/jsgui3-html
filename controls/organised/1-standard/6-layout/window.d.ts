/**
 * jsgui3-html Type Definitions
 * 
 * Window control.
 */

import { Control, BCR } from '../../../../html-core/control';
import { ControlSpec } from '../../../../types/control-spec';
import { WindowParams, WindowVariant } from '../../../../types/theme';

/**
 * Window manager interface for coordinating multiple windows.
 */
export interface WindowManager {
    /** Register a window with the manager */
    register(window: Window): void;
    /** Bring window to front */
    bring_to_front(window: Window): void;
    /** Minimize window */
    minimize(window: Window): void;
    /** Maximize window */
    maximize(window: Window): void;
    /** Close window */
    close(window: Window): void;
    /** Snap window to edges */
    snap(window: Window, options?: SnapOptions): boolean;
    /** Dock window to edge */
    dock(window: Window, edge: DockEdge, options?: DockOptions): void;
    /** Undock window */
    undock(window: Window): void;
}

/**
 * Snap options for window positioning.
 */
export interface SnapOptions {
    /** Distance threshold for snapping */
    threshold?: number;
    /** Size after snapping */
    size?: { [edge: string]: number };
}

/**
 * Dock options for window docking.
 */
export interface DockOptions {
    /** Size when docked */
    size?: { [edge: string]: number };
}

/**
 * Dock edge positions.
 */
export type DockEdge = 'left' | 'right' | 'top' | 'bottom' | 'fill';

/**
 * Window control specification.
 */
export interface WindowSpec extends ControlSpec<WindowParams> {
    /** Window title text */
    title?: string;
    /** Show minimize/maximize/close buttons */
    show_buttons?: boolean;
    /** Enable edge snapping */
    snap?: boolean;
    /** Snap distance threshold in pixels */
    snap_threshold?: number;
    /** Size presets for docked states */
    dock_sizes?: { [edge: string]: number };
    /** Minimum window size [width, height] */
    min_size?: [number, number];
    /** Maximum window size [width, height] */
    max_size?: [number, number];
    /** Resize boundaries (control or rect) */
    resize_bounds?: Control | BCR;
    /** Window manager instance */
    window_manager?: WindowManager;
    /** Alias for window_manager */
    manager?: WindowManager;
    /** Named variant preset */
    variant?: WindowVariant;
    /** Composition parameters (overrides variant) */
    params?: WindowParams;
}

/**
 * Window control - draggable, resizable window container.
 */
export declare class Window extends Control {
    /**
     * Create a new Window.
     * @param spec - Window specification
     */
    constructor(spec?: WindowSpec);

    /** Title bar control */
    readonly title_bar: Control;

    /** Inner content area */
    readonly inner: Control;

    /** Alias for inner */
    readonly ctrl_inner: Control;

    /** Relative container div */
    readonly ctrl_relative: Control;

    /** Minimize button (if show_buttons is true) */
    readonly btn_minimize?: Control;

    /** Maximize button (if show_buttons is true) */
    readonly btn_maximize?: Control;

    /** Close button (if show_buttons is true) */
    readonly btn_close?: Control;

    /** Whether snapping is enabled */
    snap_enabled: boolean;

    /** Snap threshold distance */
    snap_threshold?: number;

    /** Dock size presets */
    dock_sizes?: { [edge: string]: number };

    /** Minimum size constraint */
    min_size: [number, number];

    /** Maximum size constraint */
    max_size?: [number, number];

    /** Resize boundary constraints */
    resize_bounds: Control | BCR | null;

    /** Associated window manager */
    manager: WindowManager | null;

    /** Whether window is currently draggable */
    dragable: boolean;

    /** Position before minimizing (for restore) */
    pre_minimized_pos?: [number, number];

    /** Size before minimizing (for restore) */
    pre_minimized_size?: [number, number];

    /** Position before maximizing (for restore) */
    pre_maximized_pos?: [number, number];

    /** Size before maximizing (for restore) */
    pre_maximized_size?: [number, number];

    /**
     * Minimize the window.
     * Animates to bottom of parent container.
     */
    minimize(): Promise<void>;

    /**
     * Maximize the window.
     * Expands to fill parent container.
     */
    maximize(): Promise<void>;

    /**
     * Close the window.
     * Removes from DOM or delegates to manager.
     */
    close(): void;

    /**
     * Bring window to front (highest z-index).
     */
    bring_to_front_z(): void;

    /**
     * Snap to nearby edges.
     * @param options - Snap options
     * @returns true if snapped
     */
    snap_to_bounds(options?: SnapOptions): boolean;

    /**
     * Dock to a specific edge.
     * @param edge - Edge to dock to
     * @param options - Dock options
     */
    dock_to(edge: DockEdge, options?: DockOptions): void;

    /**
     * Undock and restore previous position/size.
     */
    undock(): void;

    /**
     * Animate position change.
     * @param pos - Target position [x, y]
     */
    glide_to_pos(pos: [number, number]): Promise<void>;

    /** Static CSS styles for Window */
    static css: string;
}

export default Window;
