import { type BaseParams, type Action, type GestureCustomEvent, SubGestureFunctions } from '../../shared';
export type ScrollParameters = {
    delay: number;
} & BaseParams;
export declare const scroll: Action<HTMLElement, () => Partial<ScrollParameters>, {
    onscroll: (e: CustomEvent) => void;
    onscrolldown: (e: GestureCustomEvent) => void;
    onscrollup: (e: GestureCustomEvent) => void;
    onscrollmove: (e: GestureCustomEvent) => void;
}>;
export declare const scrollComposition: (node: HTMLElement, inputParameters?: Partial<ScrollParameters>) => SubGestureFunctions;
//# sourceMappingURL=scroll.svelte.d.ts.map