import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
type ScrollParameters = {
    delay: number;
} & BaseParams;
export declare function scroll(node: HTMLElement, inputParameters?: Partial<ScrollParameters>): SvelteAction | SubGestureFunctions;
export {};
//# sourceMappingURL=scroll.d.ts.map