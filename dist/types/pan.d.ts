import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type PanParameters = {
    delay: number;
} & BaseParams;
export declare function pan(node: HTMLElement, inputParameters?: Partial<PanParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=pan.d.ts.map