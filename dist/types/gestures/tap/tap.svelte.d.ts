import { type SubGestureFunctions, type BaseParams, type GestureCustomEvent, type ActionType } from '../../shared';
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
declare const gestureName: "tap";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type SapEvent = Record<OnEventType, (gestureEvent: TapCustomEvent) => void>;
export declare function useTap(handler: (e: TapCustomEvent) => void, inputParameters?: () => Partial<TapParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    ontapmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const tapComposition: (node: HTMLElement, inputParameters?: Partial<TapParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=tap.svelte.d.ts.map