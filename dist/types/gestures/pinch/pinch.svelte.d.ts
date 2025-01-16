import { type BaseParams, type Coord, type GestureCustomEvent, type Action, type SubGestureFunctions } from '../../shared';
export type PinchParameters = BaseParams;
export type PinchPointerEventDetail = {
    scale: number;
    center: Coord;
    pointerType: string;
};
export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;
export declare const pinch: Action<HTMLElement, () => Partial<PinchParameters>, {
    onpinch: (e: PinchCustomEvent) => void;
    onpinchdown: (e: GestureCustomEvent) => void;
    onpinchup: (e: GestureCustomEvent) => void;
    onpinchmove: (e: GestureCustomEvent) => void;
}>;
export declare const pinchComposition: (node: HTMLElement, inputParameters?: Partial<PinchParameters>) => SubGestureFunctions;
//# sourceMappingURL=pinch.svelte.d.ts.map