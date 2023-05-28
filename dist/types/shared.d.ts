export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_PRESS_SPREAD = 4;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 60;
export declare const DEFAULT_TOUCH_ACTION = "none";
export type TouchAction = 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation' | 'inherit' | 'initial' | 'revert' | 'revert-layer' | 'unset';
export type Composed = {
    composed: boolean;
};
export type BaseParams = Composed & {
    touchAction: TouchAction;
};
type PartialParameters<GestureParams> = Partial<GestureParams>;
type PartialParametersWithComposed<GestureParams> = PartialParameters<GestureParams> & Composed;
export type ParametersSwitch<GestureParams> = PartialParameters<GestureParams> | PartialParametersWithComposed<GestureParams> | undefined;
export type GestureReturnType<GestureParams, R extends ParametersSwitch<GestureParams> | undefined> = R extends undefined ? SvelteAction : R extends PartialParametersWithComposed<GestureParams> ? SubGestureFunctions : R extends PartialParameters<GestureParams> ? SvelteAction : never;
export type SvelteAction = {
    update?: (parameters: any) => void;
    destroy?: () => void;
};
export type PointerEventCallback<T> = ((activeEvents: PointerEvent[], event: PointerEvent) => T) | null;
export type SubGestureFunctions = {
    onMove: PointerEventCallback<boolean>;
    onUp: PointerEventCallback<void>;
    onDown: PointerEventCallback<void>;
};
export declare function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): {
    x: number;
    y: number;
};
export declare function setPointerControls(gestureName: string, node: HTMLElement, onMoveCallback: PointerEventCallback<boolean>, onDownCallback: PointerEventCallback<void>, onUpCallback: PointerEventCallback<void>, touchAction?: TouchAction): {
    destroy: () => void;
};
export {};
//# sourceMappingURL=shared.d.ts.map