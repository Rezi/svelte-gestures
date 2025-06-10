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
type EventTypeName = `on${typeof gestureName}${ActionType}`;
export declare function usePan(inputParameters: () => Partial<PanParameters>, handler: (e: PanCustomEvent) => void, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    onpanmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onpanup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    onpandown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export declare const panComposition: (node: HTMLElement, inputParameters?: Partial<PanParameters>) => SubGestureFunctions;
export {};
//# sourceMappingURL=pan.svelte.d.ts.map