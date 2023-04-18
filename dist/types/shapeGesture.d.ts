import { type SvelteAction, type SubGestureFunctions, type BaseParams } from './shared';
import { type Pattern, type Options } from './detector';
export type ShapeGestureParameters = {
    shapes: Pattern[];
    timeframe: number;
} & Options & BaseParams;
export declare function shapeGesture(node: HTMLElement, inputParameters?: Partial<ShapeGestureParameters>): SvelteAction | SubGestureFunctions;
//# sourceMappingURL=shapeGesture.d.ts.map