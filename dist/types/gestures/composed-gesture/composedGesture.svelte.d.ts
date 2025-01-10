import { type SubGestureFunctions, type GesturePlugin, type Action, type GestureCustomEvent } from '../../shared';
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
export declare const composedGesture: Action<HTMLElement, GestureCallback, {
    oncomposedGesture: (e: CustomEvent) => void;
    oncomposedGesturedown: (e: GestureCustomEvent) => void;
    oncomposedGestureup: (e: GestureCustomEvent) => void;
    oncomposedGesturemove: (e: GestureCustomEvent) => void;
}>;
//# sourceMappingURL=composedGesture.svelte.d.ts.map