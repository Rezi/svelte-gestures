import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
export type ScrollParameters = {
    delay: number;
} & BaseParams;
export declare function scroll(node: HTMLElement, inputParameters?: Partial<ScrollParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=scroll.d.ts.map