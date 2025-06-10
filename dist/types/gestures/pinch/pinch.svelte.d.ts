import { type ActionType, type BaseParams, type Coord, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type PinchParameters = BaseParams;
export type PinchPointerEventDetail = {
    scale: number;
    center: Coord;
    pointerType: string;
};
export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;
declare const gestureName: "pinch";
type EventTypeName = `on${typeof gestureName}${ActionType}`;
export declare function usePinch(inputParameters: () => Partial<PinchParameters>, handler: (e: PinchCustomEvent) => void, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onpinchmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onpinchup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onpinchdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const pinchComposition: (node: HTMLElement, inputParameters?: Partial<PinchParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=pinch.svelte.d.ts.map