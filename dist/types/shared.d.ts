export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_PRESS_SPREAD = 4;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 60;
export declare const DEFAULT_TOUCH_ACTION = "none";
export type TouchAction = 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';
export interface ActionReturn<Parameter = undefined, Attributes extends Record<string, unknown> = Record<never, unknown>> {
    update?: (parameter: Parameter) => void;
    destroy?: () => void;
    /**
     * ### DO NOT USE THIS
     * This exists solely for type-checking and has no effect at runtime.
     * Set this through the `Attributes` generic instead.
     */
    $$_attributes?: Attributes;
}
export interface Action<Element = HTMLElement, Parameter = undefined, Attributes extends Record<string, unknown> = Record<never, unknown>> {
    <Node extends Element>(...args: undefined extends Parameter ? [node: Node, parameter?: Parameter] : [node: Node, parameter: Parameter]): void | ActionReturn<Parameter, Attributes>;
}
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
export type DispatchEvent = {
    event: PointerEvent;
    pointersCount: number;
    target: HTMLElement;
    x: number;
    y: number;
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
};
export declare function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): Coord;
export declare function callPlugins(plugins: GesturePlugin[] | undefined, event: PointerEvent, activeEvents: PointerEvent[], node: HTMLElement): void;
export declare function getDispatchEventData(node: HTMLElement, event: PointerEvent, activeEvents: PointerEvent[]): DispatchEvent;
export declare function setPointerControls(gestureName: string, node: HTMLElement, onMoveCallback: PointerEventCallback<boolean>, onDownCallback: PointerEventCallback<void>, onUpCallback: PointerEventCallback<void>, touchAction?: TouchAction | TouchAction[], plugins?: GesturePlugin[]): {
    destroy: () => void;
};
//# sourceMappingURL=shared.d.ts.map