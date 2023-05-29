import { type SvelteAction, type SubGestureFunctions, type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
import { type Pattern, type Options } from './detector';
export type ShapeGestureParameters = {
    shapes: Pattern[];
    timeframe: number;
} & Options & BaseParams;
export declare function shapeGesture<R extends ParametersSwitch<ShapeGestureParameters> = undefined>(node: HTMLElement, inputParameters?: GestureReturnType<ShapeGestureParameters, R>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=shapeGesture.d.ts.map