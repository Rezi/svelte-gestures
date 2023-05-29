import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type SwipeParameters = {
    timeframe: number;
    minSwipeDistance: number;
    touchAction: string;
} & BaseParams;
export declare function swipe<R extends ParametersSwitch<SwipeParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<SwipeParameters, R>;
//# sourceMappingURL=swipe.d.ts.map