import { type ActionType, type BaseParams, type Coord, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type RotateParameters = BaseParams;
export type RotatePointerEventDetail = {
    rotation: number;
    center: Coord;
    pointerType: string;
};
export type RotateCustomEvent = CustomEvent<RotatePointerEventDetail>;
declare const gestureName: "rotate";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type RotateEvent = Record<OnEventType, (gestureEvent: RotateCustomEvent) => void>;
export declare function useRotate(handler: (e: RotateCustomEvent) => void, inputParameters?: () => Partial<RotateParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onrotatemove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onrotateup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onrotatedown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const rotateComposition: (node: HTMLElement, inputParameters?: Partial<RotateParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=rotate.svelte.d.ts.map