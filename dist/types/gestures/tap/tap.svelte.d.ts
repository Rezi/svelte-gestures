import { SubGestureFunctions, type Action, type BaseParams, type GestureCustomEvent } from '../../shared';
export type TapParameters = {
    timeframe: number;
} & BaseParams;
export type TapPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
};
export type TapCustomEvent = CustomEvent<TapPointerEventDetail>;
export declare const tap: Action<HTMLElement, () => Partial<TapParameters>, {
    ontap: (e: TapCustomEvent) => void;
    ontapdown: (e: GestureCustomEvent) => void;
    ontapup: (e: GestureCustomEvent) => void;
    ontapmove: (e: GestureCustomEvent) => void;
}>;
export declare const tapComposition: (node: HTMLElement, inputParameters?: Partial<TapParameters>) => SubGestureFunctions;
//# sourceMappingURL=tap.svelte.d.ts.map