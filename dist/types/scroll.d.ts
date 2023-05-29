import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type ScrollParameters = {
    delay: number;
} & BaseParams;
export declare function scroll<R extends ParametersSwitch<ScrollParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<ScrollParameters, R>;
//# sourceMappingURL=scroll.d.ts.map