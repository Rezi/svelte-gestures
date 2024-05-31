import { type BaseParams, type ParametersSwitch, type GestureReturnType, type Coord } from './shared';
export type RotateParameters = BaseParams;
export type RotatePointerEventDetail = {
    rotation: number;
    center: Coord;
};
export type RotateCustomEvent = CustomEvent<RotatePointerEventDetail>;
export declare function rotate<R extends ParametersSwitch<RotateParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<RotateParameters, R>;
//# sourceMappingURL=rotate.d.ts.map