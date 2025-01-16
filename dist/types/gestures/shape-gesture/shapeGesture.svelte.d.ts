import { type BaseParams, type GestureCustomEvent, type Action, type SubGestureFunctions } from '../../shared';
import { type Pattern, type Options } from './detector';
export type ShapeGestureParameters = {
    shapes: Pattern[];
    timeframe: number;
} & Options & BaseParams;
export type ShapePointerEventDetail = {
    score: number;
    pattern: string | null;
    target: EventTarget | null;
    pointerType: string;
};
export type ShapeCustomEvent = CustomEvent<ShapePointerEventDetail>;
export declare const shapeGesture: Action<HTMLElement, () => Partial<ShapeGestureParameters>, {
    onshapeGesture: (e: ShapeCustomEvent) => void;
    onshapeGesturedown: (e: GestureCustomEvent) => void;
    onshapeGestureup: (e: GestureCustomEvent) => void;
    onshapeGesturemove: (e: GestureCustomEvent) => void;
}>;
export declare const shapeGestureComposition: (node: HTMLElement, inputParameters?: Partial<ShapeGestureParameters>) => SubGestureFunctions;
//# sourceMappingURL=shapeGesture.svelte.d.ts.map