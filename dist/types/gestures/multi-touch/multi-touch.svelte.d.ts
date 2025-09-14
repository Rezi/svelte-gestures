import { type ActionType, type BaseParams, type GestureCustomEvent, type SubGestureFunctions, type Coord } from '../../shared';
export type MultiTouchParameters = {
    touchCount: number;
} & BaseParams;
export type MultiTouchPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
    coords: Coord[];
};
export type MultiTouchCustomEvent = CustomEvent<MultiTouchPointerEventDetail>;
declare const gestureName: "multiTouch";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type MultiTouchEvent = Record<OnEventType, (gestureEvent: MultiTouchCustomEvent) => void>;
export declare function useMultiTouch(handler: (e: MultiTouchCustomEvent) => void, inputParameters?: () => Partial<MultiTouchParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onmultiTouchup?: (gestureEvent: GestureCustomEvent) => void;
    onmultiTouchdown?: (gestureEvent: GestureCustomEvent) => void;
    onmultiTouchmove?: (gestureEvent: GestureCustomEvent) => void;
    onmultiTouch: (e: MultiTouchCustomEvent) => void;
};
export declare const multiTouchComposition: (node: HTMLElement, inputParameters?: Partial<MultiTouchParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=multi-touch.svelte.d.ts.map