import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type SwipeParameters = {
    timeframe: number;
    minSwipeDistance: number;
    touchAction: string;
} & BaseParams;
export type SwipePointerEventDetail = {
    direction: Direction;
    target: EventTarget | null;
};
type Direction = 'top' | 'right' | 'bottom' | 'left' | null;
export type SwipeCustomEvent = CustomEvent<SwipePointerEventDetail>;
export declare function swipe<R extends ParametersSwitch<SwipeParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<SwipeParameters, R>;
export {};
//# sourceMappingURL=swipe.d.ts.map