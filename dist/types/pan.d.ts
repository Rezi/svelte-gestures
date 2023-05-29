import { type ParametersSwitch, type BaseParams, type GestureReturnType } from './shared';
export type PanParameters = {
    delay: number;
} & BaseParams;
export declare function pan<R extends ParametersSwitch<PanParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<PanParameters, R>;
//# sourceMappingURL=pan.d.ts.map