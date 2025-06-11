import { type BaseParams, type GestureCustomEvent, type SubGestureFunctions, type ActionType } from '../../shared';
export type ScrollParameters = {
    delay: number;
} & BaseParams;
declare const gestureName: "scroll";
type EventTypeName = `on${typeof gestureName}${ActionType}`;
export declare function useScroll(inputParameters: () => Partial<ScrollParameters>, handler: (e: CustomEvent) => void, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onscrollmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onscrollup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onscrolldown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const scrollComposition: (node: HTMLElement, inputParameters?: Partial<ScrollParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=scroll.svelte.d.ts.map