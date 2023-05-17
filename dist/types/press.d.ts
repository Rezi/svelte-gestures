import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type PressParameters = {
    timeframe: number;
    triggerBeforeFinished: boolean;
    spread: number;
} & BaseParams;
export declare function press(node: HTMLElement, inputParameters?: Partial<PressParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=press.d.ts.map