import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type TapParameters = {
    timeframe: number;
} & BaseParams;
export declare function tap(node: HTMLElement, inputParameters?: Partial<TapParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=tap.d.ts.map