import { SubGestureFunctions, type Action, type BaseParams, type GestureCustomEvent } from '../../shared';
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
type Direction = 'top' | 'right' | 'bottom' | 'left' | null;
export type SwipeCustomEvent = CustomEvent<SwipePointerEventDetail>;
export declare const swipe: Action<HTMLElement, () => Partial<SwipeParameters>, {
    onswipe: (e: SwipeCustomEvent) => void;
    onswipedown: (e: GestureCustomEvent) => void;
    onswipeup: (e: GestureCustomEvent) => void;
    onswipemove: (e: GestureCustomEvent) => void;
}>;
export declare const swipeComposition: (node: HTMLElement, inputParameters?: Partial<SwipeParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=swipe.svelte.d.ts.map