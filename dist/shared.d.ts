export declare const DEFAULT_DELAY = 300;
export declare const DEFAULT_MIN_SWIPE_DISTANCE = 100;
export declare type GestureName = 'pan' | 'pinch' | 'tap' | 'swipe' | 'rotate';
export declare function setPointerControls(gestureName: GestureName, node: HTMLElement, onMoveCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void, onDownCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void, onUpCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void): {
    destroy: () => void;
};
//# sourceMappingURL=shared.d.ts.map