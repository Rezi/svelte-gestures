import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
type SwipeParameters = {
    timeframe: number;
    minSwipeDistance: number;
    touchAction: string;
} & BaseParams;
export declare function swipe(node: HTMLElement, inputParameters?: Partial<SwipeParameters>): SvelteAction | SubGestureFunctions;
export {};
//# sourceMappingURL=swipe.d.ts.map