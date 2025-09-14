import { type BaseParams, type GestureCustomEvent, type SubGestureFunctions, type ActionType } from '../../shared';
export type ScrollParameters = {
    delay: number;
} & BaseParams;
declare const gestureName: "scroll";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type ScrollEvent = Record<OnEventType, (gestureEvent: CustomEvent) => void>;
export declare function useScroll(handler: (e: CustomEvent) => void, inputParameters?: () => Partial<ScrollParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onscrollup?: (gestureEvent: GestureCustomEvent) => void;
    onscrolldown?: (gestureEvent: GestureCustomEvent) => void;
    onscrollmove?: (gestureEvent: GestureCustomEvent) => void;
    onscroll: (e: CustomEvent) => void;
};
export declare const scrollComposition: (node: HTMLElement, inputParameters?: Partial<ScrollParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=scroll.svelte.d.ts.map