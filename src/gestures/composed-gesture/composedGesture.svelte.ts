import {
  type SubGestureFunctions,
  type GesturePlugin,
  getDispatchEventData,
  type GestureCustomEvent,
  type ActionType,
  createPointerControls,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

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

export const gestureName = 'composedGesture' as const;

type EventTypeName<T extends string> = `on${T}${ActionType}`;

export function callAllByType(
  listenerType: ListenerType,
  composedGestureFnsWithPlugins: ComposedGestureFnsWithPlugins[],
  activeEvents: PointerEvent[],
  event: PointerEvent,
  node: HTMLElement
): void {
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

export function useComposedGesture<GestureEvents>(
  gestureCallback: GestureCallback,
  baseHandlers?: Partial<
    Record<
      EventTypeName<typeof gestureName>,
      (gestureEvent: GestureCustomEvent) => void
    > &
      GestureEvents
  >
): {
  oncomposedGestureup?:
    | (Record<
        | 'oncomposedGestureup'
        | 'oncomposedGesturedown'
        | 'oncomposedGesturemove',
        (gestureEvent: GestureCustomEvent) => void
      > &
        GestureEvents)['oncomposedGestureup']
    | undefined;
  oncomposedGesturedown?:
    | (Record<
        | 'oncomposedGestureup'
        | 'oncomposedGesturedown'
        | 'oncomposedGesturemove',
        (gestureEvent: GestureCustomEvent) => void
      > &
        GestureEvents)['oncomposedGesturedown']
    | undefined;
  oncomposedGesturemove?:
    | (Record<
        | 'oncomposedGestureup'
        | 'oncomposedGesturedown'
        | 'oncomposedGesturemove',
        (gestureEvent: GestureCustomEvent) => void
      > &
        GestureEvents)['oncomposedGesturemove']
    | undefined;
  [attach: symbol]: (node: HTMLElement) => () => void;
} {
  const { setPointerControls } = createPointerControls();

  return {
    ...baseHandlers,
    [createAttachmentKey()]: (node: HTMLElement): (() => void) => {
      const gestureFunctionsWithPlugins: ComposedGestureFnsWithPlugins[] = [];

      function registerGesture<F extends GenericParamsWithPlugins>(
        gestureFn: (node: HTMLElement, params: F) => SubGestureFunctions,
        parameters: F
      ): SubGestureFunctions {
        const subGestureFns = gestureFn(node, {
          ...parameters,
          composed: true,
        });

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

      function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
        callAllByType(
          'onUp',
          gestureFunctionsWithPlugins,
          activeEvents,
          event,
          node
        );
      }

      function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
        callAllByType(
          'onDown',
          gestureFunctionsWithPlugins,
          activeEvents,
          event,
          node
        );
      }

      function onMove(
        activeEvents: PointerEvent[],
        event: PointerEvent
      ): boolean {
        onMoveCallback(activeEvents, event);

        return true;
      }

      return setPointerControls(gestureName, node, onMove, onDown, onUp)
        .destroy;
    },
  };
}
