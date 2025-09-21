import { type ActionType, type BaseParams, type GestureCustomEvent, type SubGestureFunctions } from '../../shared';
export type PanParameters = {
    delay: number;
} & BaseParams;
export type PanPointerEventDetail = {
    x: number;
    y: number;
    target: EventTarget | null;
    pointerType: string;
};
export type PanCustomEvent = CustomEvent<PanPointerEventDetail>;
declare const gestureName: "pan";
type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PanEvent = Record<OnEventType, (gestureEvent: PanCustomEvent) => void>;
type ReturnPan<T> = T extends false ? {
    onpanup?: (gestureEvent: GestureCustomEvent) => void;
    onpandown?: (gestureEvent: GestureCustomEvent) => void;
    onpanmove?: (gestureEvent: GestureCustomEvent) => void;
    onpan: (e: PanCustomEvent) => void;
} : T extends true ? {
    onpanup?: (gestureEvent: GestureCustomEvent) => void;
    onpandown?: (gestureEvent: GestureCustomEvent) => void;
    onpanmove?: (gestureEvent: GestureCustomEvent) => void;
    onpan: (e: PanCustomEvent) => void;
    pan: (node: HTMLElement) => () => void;
} : never;
export declare function usePan<T extends boolean>(handler: (e: PanCustomEvent) => void, inputParameters?: () => Partial<PanParameters>, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>, isRaw?: T): ReturnPan<T>;
export declare const panComposition: (node: HTMLElement, inputParameters?: Partial<PanParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=pan.svelte.d.ts.map