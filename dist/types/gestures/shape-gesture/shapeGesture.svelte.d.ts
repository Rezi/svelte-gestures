import { type ActionType, type BaseParams, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
import { type Pattern, type Options } from './detector';
export type ShapeGestureParameters = {
    shapes: Pattern[];
    timeframe: number;
} & Options & BaseParams;
export type ShapePointerEventDetail = {
    score: number;
    pattern: string | null;
    target: EventTarget | null;
    pointerType: string;
};
export type ShapeCustomEvent = CustomEvent<ShapePointerEventDetail>;
declare const gestureName: "shapeGesture";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type ShapeEvent = Record<OnEventType, (gestureEvent: ShapeCustomEvent) => void>;
type ReturnShapeGesture<T> = T extends false ? {
    onshapeGestureup?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesturedown?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesturemove?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesture: (e: ShapeCustomEvent) => void;
} : T extends true ? {
    onshapeGestureup?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesturedown?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesturemove?: (gestureEvent: GestureCustomEvent) => void;
    onshapeGesture: (e: ShapeCustomEvent) => void;
    shapeGesture: (node: HTMLElement) => () => void;
} : never;
export declare function useShapeGesture<T extends boolean>(handler: (e: ShapeCustomEvent) => void, inputParameters?: () => Partial<ShapeGestureParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnShapeGesture<T>;
export declare const shapeGestureComposition: (node: HTMLElement, inputParameters?: Partial<ShapeGestureParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=shapeGesture.svelte.d.ts.map