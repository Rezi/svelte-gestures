import { type ActionType, type BaseParams, type Coord, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type PinchParameters = BaseParams;
export type PinchPointerEventDetail = {
    scale: number;
    center: Coord;
    pointerType: string;
};
export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;
declare const gestureName: "pinch";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PinchEvent = Record<OnEventType, (gestureEvent: PinchCustomEvent) => void>;
type ReturnPinch<T> = T extends false ? {
    onpinchup?: (gestureEvent: GestureCustomEvent) => void;
    onpinchdown?: (gestureEvent: GestureCustomEvent) => void;
    onpinchmove?: (gestureEvent: GestureCustomEvent) => void;
    onpinch: (e: PinchCustomEvent) => void;
} : T extends true ? {
    onpinchup?: (gestureEvent: GestureCustomEvent) => void;
    onpinchdown?: (gestureEvent: GestureCustomEvent) => void;
    onpinchmove?: (gestureEvent: GestureCustomEvent) => void;
    onpinch: (e: PinchCustomEvent) => void;
    pinch: (node: HTMLElement) => () => void;
} : never;
export declare function usePinch<T extends boolean>(handler: (e: PinchCustomEvent) => void, inputParameters?: () => Partial<PinchParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnPinch<T>;
export declare const pinchComposition: (node: HTMLElement, inputParameters?: Partial<PinchParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=pinch.svelte.d.ts.map