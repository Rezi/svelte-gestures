import { type Action, type BaseParams, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
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
export declare const press: Action<HTMLElement, () => Partial<PressParameters>, {
    onpress: (e: PressCustomEvent) => void;
    onpressdown: (e: GestureCustomEvent) => void;
    onpressup: (e: GestureCustomEvent) => void;
    onpressmove: (e: GestureCustomEvent) => void;
}>;
export declare const pressComposition: (node: HTMLElement, inputParameters?: Partial<PressParameters>) => SubGestureFunctions;
//# sourceMappingURL=press.svelte.d.ts.map