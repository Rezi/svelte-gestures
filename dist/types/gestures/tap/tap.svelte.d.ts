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
type ReturnTap<T> = T extends false ? {
    ontapup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontap: (e: TapCustomEvent) => void;
} : T extends true ? {
    ontapup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontapmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    ontap: (e: TapCustomEvent) => void;
    tap: (node: HTMLElement) => () => void;
} : never;
export declare function useTap<T extends boolean>(handler: (e: TapCustomEvent) => void, inputParameters?: () => Partial<TapParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnTap<T>;
export declare const tapComposition: (node: HTMLElement, inputParameters?: Partial<TapParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=tap.svelte.d.ts.map