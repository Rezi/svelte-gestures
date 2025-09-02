export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_PRESS_SPREAD = 4;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 60;
export declare const DEFAULT_TOUCH_ACTION = "none";
export type TouchAction = 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';
export type Coord = {
    x: number;
    y: number;
};
export type Composed = {
    composed: boolean;
};
export type BaseParams = Composed & {
    touchAction: TouchAction | TouchAction[];
    plugins?: GesturePlugin[] | undefined;
};
export type ActionType = 'up' | 'down' | 'move';
export type DispatchEvent = {
    event: PointerEvent;
    pointersCount: number;
    target: HTMLElement;
    x: number;
    y: number;
    attachementNode: HTMLElement;
};
export type GestureCustomEvent = CustomEvent<DispatchEvent>;
export type PointerEventCallback<T> = ((activeEvents: PointerEvent[], event: PointerEvent) => T) | null;
export type PluginEventCallback = (event: DispatchEvent, activeEvents: PointerEvent[]) => void;
export type SubGestureFunctions = {
    onMove: PointerEventCallback<boolean>;
    onUp: PointerEventCallback<void>;
    onDown: PointerEventCallback<void>;
    plugins: GesturePlugin[] | undefined;
};
export type GesturePlugin = {
    onMove: PluginEventCallback;
    onDown: PluginEventCallback;
    onUp: PluginEventCallback;
    onDestroy?: () => void;
    onInit?: (activeEvents: PointerEvent[]) => void;
};
export declare function ensureArray<T>(o: T | T[]): T[];
export declare function addEventListener<ET extends EventTarget, E extends Event>(node: ET, event: string, handler: (this: ET, evt: E) => void): () => void;
export declare function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): Coord;
export declare function removeEvent(event: PointerEvent, activeEvents: PointerEvent[]): PointerEvent[];
export declare function getEventPostionInNode(node: HTMLElement, event: PointerEvent): {
    x: number;
    y: number;
};
export declare function getDispatchEventData(node: HTMLElement, event: PointerEvent, activeEvents: PointerEvent[]): DispatchEvent;
export declare function dispatch(node: HTMLElement, gestureName: string, event: PointerEvent, activeEvents: PointerEvent[], actionType: ActionType): DispatchEvent;
/** Closure needed for creation of peristent state across lifetime of a gesture,
 * Gesture can be destroyed and recreated multiple times when it options change/update
 */
export declare function createPointerControls(): {
    setPointerControls: (gestureName: string, node: HTMLElement, onMoveCallback: PointerEventCallback<boolean>, onDownCallback: PointerEventCallback<void>, onUpCallback: PointerEventCallback<void>, touchAction?: TouchAction | TouchAction[], pluginsArg?: GesturePlugin[]) => {
        destroy: () => void;
    };
};
//# sourceMappingURL=shared.d.ts.map