export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_PRESS_SPREAD = 4;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 60;
export declare const DEFAULT_TOUCH_ACTION = "none";
export type PointerType = 'mouse' | 'touch' | 'pen' | 'all';
export type BaseParams = {
    composed: boolean;
    conditionFor: PointerType[];
};
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
export declare function isConditionApplied(conditionFor: PointerType[], event: PointerEvent): boolean;
export declare function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): {
    x: number;
    y: number;
};
export declare function setPointerControls(gestureName: string, node: HTMLElement, onMoveCallback: PointerEventCallback<boolean>, onDownCallback: PointerEventCallback<void>, onUpCallback: PointerEventCallback<void>, touchAction?: string): {
    destroy: () => void;
};
//# sourceMappingURL=shared.d.ts.map