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
declare const gestureName: "composedGesture";
type EventTypeName = `on${typeof gestureName}${ActionType}`;
export declare function useComposedGesture(gestureCallback: GestureCallback, baseHandlers?: Partial<Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>>): {
    oncomposedGesturemove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    oncomposedGestureup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
    oncomposedGesturedown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
};
export {};
//# sourceMappingURL=composedGesture.svelte.d.ts.map