import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type TapParameters = {
    timeframe: number;
} & BaseParams;
export declare function tap<R extends ParametersSwitch<TapParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<TapParameters, R>;
//# sourceMappingURL=tap.d.ts.map