import { type BaseParams, type ParametersSwitch, type GestureReturnType, type Coord } from './shared';
export type PinchParameters = BaseParams;
export type PinchPointerEventDetail = {
    scale: number;
    center: Coord;
};
export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;
export declare function pinch<R extends ParametersSwitch<PinchParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<PinchParameters, R>;
//# sourceMappingURL=pinch.d.ts.map