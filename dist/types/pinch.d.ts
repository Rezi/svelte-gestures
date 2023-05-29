import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type PinchParameters = BaseParams;
export declare function pinch<R extends ParametersSwitch<PinchParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<PinchParameters, R>;
//# sourceMappingURL=pinch.d.ts.map