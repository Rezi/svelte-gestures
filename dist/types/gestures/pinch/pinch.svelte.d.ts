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
export declare function usePinch(handler: (e: PinchCustomEvent) => void, inputParameters?: () => Partial<PinchParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onpinchup?: (gestureEvent: GestureCustomEvent) => void;
    onpinchdown?: (gestureEvent: GestureCustomEvent) => void;
    onpinchmove?: (gestureEvent: GestureCustomEvent) => void;
    onpinch: (e: PinchCustomEvent) => void;
};
export declare const pinchComposition: (node: HTMLElement, inputParameters?: Partial<PinchParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=pinch.svelte.d.ts.map