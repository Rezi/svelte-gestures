export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 60;
export declare const DEFAULT_TOUCH_ACTION = "none";
export declare function getCenterOfTwoPoints(node: HTMLElement, activeEvents: PointerEvent[]): {
    x: number;
    y: number;
};
export declare function setPointerControls(gestureName: string, node: HTMLElement, onMoveCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void, onDownCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void, onUpCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void, touchAction?: string): {
    destroy: () => void;
};
//# sourceMappingURL=shared.d.ts.map