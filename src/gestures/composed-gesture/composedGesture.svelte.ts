import {
  type SubGestureFunctions,
  setPointerControls,
  type GesturePlugin,
  getDispatchEventData,
  type Action,
  type GestureCustomEvent,
} from '../../shared';

export type ListenerType = 'onDown' | 'onUp' | 'onMove';
export type GenericParamsWithPlugins = Record<string, unknown> & {
  plugins?: GesturePlugin[];
};

export type GestureCallback = (
  register: RegisterFnType,
  node?: HTMLElement
) => (activeEvents: PointerEvent[], event: PointerEvent) => void;

export type ParamsType<F> = F extends (
  node: HTMLElement,
  params: infer P
) => SubGestureFunctions
  ? P
  : never;

export type RegisterFnType = <
  F extends (
    node: HTMLElement,
    params: GenericParamsWithPlugins
  ) => SubGestureFunctions
>(
  gestureFn: F,
  parameters: ParamsType<F>
) => SubGestureFunctions;

export type ComposedGestureFnsWithPlugins = {
  fns: SubGestureFunctions;
  plugins: GesturePlugin[];
};

function callAllByType(
  listenerType: ListenerType,
  composedGestureFnsWithPlugins: ComposedGestureFnsWithPlugins[],
  activeEvents: PointerEvent[],
  event: PointerEvent,
  node: HTMLElement
) {
  composedGestureFnsWithPlugins.forEach(
    (gestureWithPlugin: ComposedGestureFnsWithPlugins) => {
      gestureWithPlugin.fns[listenerType]?.(activeEvents, event);
      gestureWithPlugin.plugins.forEach((plugin: GesturePlugin) => {
        const eventData = getDispatchEventData(node, event, activeEvents);
        plugin[listenerType]?.(eventData, activeEvents);
      });
    }
  );
}

export const composedGesture: Action<
  HTMLElement,
  GestureCallback,
  {
    oncomposedGesture: (e: CustomEvent) => void;
    oncomposedGesturedown: (e: GestureCustomEvent) => void;
    oncomposedGestureup: (e: GestureCustomEvent) => void;
    oncomposedGesturemove: (e: GestureCustomEvent) => void;
  }
> = (node: HTMLElement, gestureCallback: GestureCallback) => {
  $effect(() => {
    const gestureFunctionsWithPlugins: ComposedGestureFnsWithPlugins[] = [];

    function registerGesture<F extends GenericParamsWithPlugins>(
      gestureFn: (node: HTMLElement, params: F) => SubGestureFunctions,
      parameters: F
    ) {
      const subGestureFns = gestureFn(node, { ...parameters, composed: true });

      gestureFunctionsWithPlugins.push({
        fns: subGestureFns,
        plugins: parameters.plugins || [],
      });

      return subGestureFns;
    }

    const onMoveCallback: (
      activeEvents: PointerEvent[],
      event: PointerEvent
    ) => void = gestureCallback(registerGesture, node);

    const gestureName = 'composedGesture';

    function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
      callAllByType(
        'onUp',
        gestureFunctionsWithPlugins,
        activeEvents,
        event,
        node
      );
    }

    function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
      callAllByType(
        'onDown',
        gestureFunctionsWithPlugins,
        activeEvents,
        event,
        node
      );
    }

    function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
      onMoveCallback(activeEvents, event);

      return true;
    }

    return setPointerControls(gestureName, node, onMove, onDown, onUp).destroy;
  });
};
