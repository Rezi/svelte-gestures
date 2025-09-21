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
type ReturnComposedGesture<T, GestureEvents> = T extends false ? {
    oncomposedGestureup?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGestureup'] | undefined;
    oncomposedGesturedown?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGesturedown'] | undefined;
    oncomposedGesturemove?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGesturemove'] | undefined;
} : T extends true ? {
    oncomposedGestureup?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGestureup'] | undefined;
    oncomposedGesturedown?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGesturedown'] | undefined;
    oncomposedGesturemove?: (Record<'oncomposedGestureup' | 'oncomposedGesturedown' | 'oncomposedGesturemove', (gestureEvent: GestureCustomEvent) => void> & GestureEvents)['oncomposedGesturemove'] | undefined;
    composedGesture: (node: HTMLElement) => () => void;
} : never;
export declare const gestureName: "composedGesture";
type EventTypeName<T extends string> = `on${T}${ActionType}`;
export declare function callAllByType(listenerType: ListenerType, composedGestureFnsWithPlugins: ComposedGestureFnsWithPlugins[], activeEvents: PointerEvent[], event: PointerEvent, node: HTMLElement): void;
export declare function useComposedGesture<GestureEvents, T extends boolean>(gestureCallback: GestureCallback, baseHandlers?: Partial<Record<EventTypeName<typeof gestureName>, (gestureEvent: GestureCustomEvent) => void> & GestureEvents>, isRaw?: T): ReturnComposedGesture<T, GestureEvents>;
export {};
//# sourceMappingURL=composedGesture.svelte.d.ts.map