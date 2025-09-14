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
export declare function usePress(handler: (e: PressCustomEvent) => void, inputParameters?: () => Partial<PressParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onpressup?: (gestureEvent: GestureCustomEvent) => void;
    onpressdown?: (gestureEvent: GestureCustomEvent) => void;
    onpressmove?: (gestureEvent: GestureCustomEvent) => void;
    onpress: (e: PressCustomEvent) => void;
};
export declare const pressComposition: (node: HTMLElement, inputParameters?: Partial<PressParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=press.svelte.d.ts.map