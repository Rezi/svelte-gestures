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
export declare function useShapeGesture(handler: (e: ShapeCustomEvent) => void, inputParameters?: () => Partial<ShapeGestureParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onshapeGesturemove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onshapeGestureup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onshapeGesturedown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const shapeGestureComposition: (node: HTMLElement, inputParameters?: Partial<ShapeGestureParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=shapeGesture.svelte.d.ts.map