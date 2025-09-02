import { type SubGestureFunctions, type GesturePlugin, type GestureCustomEvent, type ActionType } from '../../shared';
export type ListenerType = 'onDown' | 'onUp' | 'onMove';
export type GenericParamsWithPlugins = Record<string, unknown> & {
    plugins?: GesturePlugin[];
};
export type GestureCallback = (register: RegisterFnType, node?: HTMLElement) => (activeEvents: PointerEvent[], event: PointerEvent) => void;
export type ParamsType<F> = F extends (node: HTMLElement, params: infer P) => SubGestureFunctions ? P : never;
export type RegisterFnType = <F extends (node: HTMLElement, params: GenericParamsWithPlugins) => SubGestureFunctions>(gestureFn: F, parameters: ParamsType<F>) => SubGestureFunctions;
export type ComposedGestureFnsWithPlugins = {
    fns: SubGestureFunctions;
    plugins: GesturePlugin[];
};
export declare const gestureName: "composedGesture";
type EventTypeName<T extends string> = `on${T}${ActionType}`;
export declare function callAllByType(listenerType: ListenerType, composedGestureFnsWithPlugins: ComposedGestureFnsWithPlugins[], activeEvents: PointerEvent[], event: PointerEvent, node: HTMLElement): void;
export declare function useComposedGesture<GestureEvents>(gestureCallback: GestureCallback, baseHandlers?: Partial<Record<EventTypeName<typeof gestureName>, (gestureEvent: GestureCustomEvent) => void> & GestureEvents>): {
    oncomposedGesturemove?: (Record<"oncomposedGesturemove" | "oncomposedGestureup" | "oncomposedGesturedown", (gestureEvent: GestureCustomEvent) => void> & GestureEvents)["oncomposedGesturemove"] | undefined;
    oncomposedGestureup?: (Record<"oncomposedGesturemove" | "oncomposedGestureup" | "oncomposedGesturedown", (gestureEvent: GestureCustomEvent) => void> & GestureEvents)["oncomposedGestureup"] | undefined;
    oncomposedGesturedown?: (Record<"oncomposedGesturemove" | "oncomposedGestureup" | "oncomposedGesturedown", (gestureEvent: GestureCustomEvent) => void> & GestureEvents)["oncomposedGesturedown"] | undefined;
};
export {};
//# sourceMappingURL=composedGesture.svelte.d.ts.map