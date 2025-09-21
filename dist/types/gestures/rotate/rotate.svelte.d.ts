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
type ReturnRotate<T> = T extends false ? {
    onrotateup?: (gestureEvent: GestureCustomEvent) => void;
    onrotatedown?: (gestureEvent: GestureCustomEvent) => void;
    onrotatemove?: (gestureEvent: GestureCustomEvent) => void;
    onrotate: (e: RotateCustomEvent) => void;
} : T extends true ? {
    onrotateup?: (gestureEvent: GestureCustomEvent) => void;
    onrotatedown?: (gestureEvent: GestureCustomEvent) => void;
    onrotatemove?: (gestureEvent: GestureCustomEvent) => void;
    onrotate: (e: RotateCustomEvent) => void;
    rotate: (node: HTMLElement) => () => void;
} : never;
export declare function useRotate<T extends boolean>(handler: (e: RotateCustomEvent) => void, inputParameters?: () => Partial<RotateParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnRotate<T>;
export declare const rotateComposition: (node: HTMLElement, inputParameters?: Partial<RotateParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=rotate.svelte.d.ts.map