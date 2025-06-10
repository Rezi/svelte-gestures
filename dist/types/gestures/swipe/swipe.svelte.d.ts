import { type SubGestureFunctions, type BaseParams, type GestureCustomEvent, type ActionType } from '../../shared';
export type SwipeParameters = {
    timeframe: number;
    minSwipeDistance: number;
    touchAction: string;
} & BaseParams;
export type SwipePointerEventDetail = {
    direction: Direction;
    target: EventTarget | null;
    pointerType: string;
};
export type Direction = 'top' | 'right' | 'bottom' | 'left' | null;
export type SwipeCustomEvent = CustomEvent<SwipePointerEventDetail>;
declare const gestureName: "swipe";
type EventTypeName = `on${typeof gestureName}${ActionType}`;
export declare function useSwipe(inputParameters: () => Partial<SwipeParameters>, handler: (e: SwipeCustomEvent) => void, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onswipemove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onswipeup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onswipedown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const swipeComposition: (node: HTMLElement, inputParameters?: Partial<SwipeParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=swipe.svelte.d.ts.map