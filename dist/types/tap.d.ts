import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
type TapParameters = {
    timeframe: number;
} & BaseParams;
export declare function tap(node: HTMLElement, inputParameters?: Partial<TapParameters>): SvelteAction | SubGestureFunctions;
export {};
//# sourceMappingURL=tap.d.ts.map