import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type SwipeParameters = {
    timeframe: number;
    minSwipeDistance: number;
    touchAction: string;
} & BaseParams;
export declare function swipe(node: HTMLElement, inputParameters?: Partial<SwipeParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=swipe.d.ts.map