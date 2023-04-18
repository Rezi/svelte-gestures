import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
type PanParameters = {
    delay: number;
} & BaseParams;
export declare function pan(node: HTMLElement, inputParameters?: Partial<PanParameters>): SvelteAction | SubGestureFunctions;
export {};
//# sourceMappingURL=pan.d.ts.map