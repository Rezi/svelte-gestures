import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type TapParameters = {
    timeframe: number;
} & BaseParams;
export type TapPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
};
export type TapCustomEvent = CustomEvent<TapPointerEventDetail>;
export declare function tap<R extends ParametersSwitch<TapParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<TapParameters, R>;
//# sourceMappingURL=tap.d.ts.map