import { type BaseParams, type Coord, type Action, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type RotateParameters = BaseParams;
export type RotatePointerEventDetail = {
    rotation: number;
    center: Coord;
    pointerType: string;
};
export type RotateCustomEvent = CustomEvent<RotatePointerEventDetail>;
export declare const rotate: Action<HTMLElement, () => Partial<RotateParameters>, {
    onrotate: (e: RotateCustomEvent) => void;
    onrotatedown: (e: GestureCustomEvent) => void;
    onrotateup: (e: GestureCustomEvent) => void;
    onrotatemove: (e: GestureCustomEvent) => void;
}>;
export declare const rotateComposition: (node: HTMLElement, inputParameters?: Partial<RotateParameters>) => SubGestureFunctions;
//# sourceMappingURL=rotate.svelte.d.ts.map