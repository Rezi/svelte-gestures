import { type SvelteAction, type SubGestureFunctions, type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
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
export declare function shapeGesture<R extends ParametersSwitch<ShapeGestureParameters> = undefined>(node: HTMLElement, inputParameters?: GestureReturnType<ShapeGestureParameters, R>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=shapeGesture.d.ts.map