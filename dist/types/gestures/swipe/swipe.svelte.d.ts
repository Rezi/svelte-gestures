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
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type SwipeEvent = Record<OnEventType, (gestureEvent: SwipeCustomEvent) => void>;
export declare function useSwipe(handler: (e: SwipeCustomEvent) => void, inputParameters?: () => Partial<SwipeParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onswipeup?: (gestureEvent: GestureCustomEvent) => void;
    onswipedown?: (gestureEvent: GestureCustomEvent) => void;
    onswipemove?: (gestureEvent: GestureCustomEvent) => void;
    onswipe: (e: SwipeCustomEvent) => void;
};
export declare const swipeComposition: (node: HTMLElement, inputParameters?: Partial<SwipeParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=swipe.svelte.d.ts.map