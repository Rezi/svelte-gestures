import { type BaseParams, type ParametersSwitch, type GestureReturnType } from './shared';
export type PressParameters = {
    timeframe: number;
    triggerBeforeFinished: boolean;
    spread: number;
} & BaseParams;
export type PressPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
};
export type PressCustomEvent = CustomEvent<PressPointerEventDetail>;
export declare function press<R extends ParametersSwitch<PressParameters> = undefined>(node: HTMLElement, inputParameters?: R): GestureReturnType<PressParameters, R>;
//# sourceMappingURL=press.d.ts.map