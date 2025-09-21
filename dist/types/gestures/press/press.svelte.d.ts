import { type BaseParams, type GestureCustomEvent, type SubGestureFunctions, type ActionType } from '../../shared';
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
declare const gestureName: "press";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PressEvent = Record<OnEventType, (gestureEvent: PressCustomEvent) => void>;
type ReturnPress<T> = T extends false ? {
    onpressup?: (gestureEvent: GestureCustomEvent) => void;
    onpressdown?: (gestureEvent: GestureCustomEvent) => void;
    onpressmove?: (gestureEvent: GestureCustomEvent) => void;
    onpress: (e: PressCustomEvent) => void;
} : T extends true ? {
    onpressup?: (gestureEvent: GestureCustomEvent) => void;
    onpressdown?: (gestureEvent: GestureCustomEvent) => void;
    onpressmove?: (gestureEvent: GestureCustomEvent) => void;
    onpress: (e: PressCustomEvent) => void;
    press: (node: HTMLElement) => () => void;
} : never;
export declare function usePress<T extends boolean>(handler: (e: PressCustomEvent) => void, inputParameters?: () => Partial<PressParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnPress<T>;
export declare const pressComposition: (node: HTMLElement, inputParameters?: Partial<PressParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=press.svelte.d.ts.map