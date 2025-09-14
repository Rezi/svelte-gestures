export const DEFAULT_DELAY = 300; // ms
export const DEFAULT_PRESS_SPREAD = 4; // px
export const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
export const DEFAULT_TOUCH_ACTION = 'none';

export type TouchAction =
  | 'auto'
  | 'none'
  | 'pan-x'
  | 'pan-left'
  | 'pan-right'
  | 'pan-y'
  | 'pan-up'
  | 'pan-down'
  | 'pinch-zoom'
  | 'manipulation'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

export type Coord = { x: number; y: number };
export type Composed = { composed: boolean };

export type BaseParams = Composed & {
  touchAction: TouchAction | TouchAction[];
  plugins?: GesturePlugin[] | undefined;
};

export type ActionType = 'up' | 'down' | 'move';
export type DispatchEvent = {
  event: PointerEvent;
  pointersCount: number;
  target: HTMLElement;
  x: number;
  y: number;
  attachmentNode: HTMLElement;
};

export type GestureCustomEvent = CustomEvent<DispatchEvent>;

export type PointerEventCallback<T> =
  | ((activeEvents: PointerEvent[], event: PointerEvent) => T)
  | null;

export type PluginEventCallback = (
  event: DispatchEvent,
  activeEvents: PointerEvent[]
) => void;

export type SubGestureFunctions = {
  onMove: PointerEventCallback<boolean>;
  onUp: PointerEventCallback<void>;
  onDown: PointerEventCallback<void>;
  plugins: GesturePlugin[] | undefined;
};

export type GesturePlugin = {
  onMove: PluginEventCallback;
  onDown: PluginEventCallback;
  onUp: PluginEventCallback;
  onDestroy?: () => void;
  onInit?: (activeEvents: PointerEvent[]) => void;
};

export function ensureArray<T>(o: T | T[]): T[] {
  if (Array.isArray(o)) return o;
  return [o];
}

export function addEventListener<ET extends EventTarget, E extends Event>(
  node: ET,
  event: string,
  handler: (this: ET, evt: E) => void
): () => void {
  node.addEventListener(event, handler as (evt: Event) => void);
  return () => node.removeEventListener(event, handler as (evt: Event) => void);
}

export function getCenterOfTwoPoints(
  node: HTMLElement,
  activeEvents: PointerEvent[]
): Coord {
  const rect = node.getBoundingClientRect();
  const xDistance = Math.abs(activeEvents[0].clientX - activeEvents[1].clientX);
  const yDistance = Math.abs(activeEvents[0].clientY - activeEvents[1].clientY);
  const minX = Math.min(activeEvents[0].clientX, activeEvents[1].clientX);
  const minY = Math.min(activeEvents[0].clientY, activeEvents[1].clientY);
  const centerX = minX + xDistance / 2;
  const centerY = minY + yDistance / 2;

  const x = Math.round(centerX - rect.left);
  const y = Math.round(centerY - rect.top);

  return { x, y };
}

export function removeEvent(
  event: PointerEvent,
  activeEvents: PointerEvent[]
): PointerEvent[] {
  return activeEvents.filter((activeEvent: PointerEvent) => {
    return event.pointerId !== activeEvent.pointerId;
  });
}

export function getEventPostionInNode(
  node: HTMLElement,
  event: PointerEvent
): { x: number; y: number } {
  const rect = node.getBoundingClientRect();
  return {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(event.clientY - rect.top),
  };
}

export function getDispatchEventData(
  node: HTMLElement,
  event: PointerEvent,
  activeEvents: PointerEvent[]
): DispatchEvent {
  const { x, y } = getEventPostionInNode(node, event);

  const eventData: DispatchEvent = {
    event,
    pointersCount: activeEvents.length,
    target: event.target as HTMLElement,
    x,
    y,
    attachmentNode: node,
  };
  return eventData;
}

export function dispatch(
  node: HTMLElement,
  gestureName: string,
  event: PointerEvent,
  activeEvents: PointerEvent[],
  actionType: ActionType
): DispatchEvent {
  const eventData = getDispatchEventData(node, event, activeEvents);

  node.dispatchEvent(
    new CustomEvent(`${gestureName}${actionType}`, { detail: eventData })
  );

  return eventData;
}

/** Closure needed for creation of peristent state across lifetime of a gesture,
 * Gesture can be destroyed and recreated multiple times when it options change/update
 */
export function createPointerControls(): {
  setPointerControls: (
    gestureName: string,
    node: HTMLElement,
    onMoveCallback: PointerEventCallback<boolean>,
    onDownCallback: PointerEventCallback<void>,
    onUpCallback: PointerEventCallback<void>,
    touchAction?: TouchAction | TouchAction[],
    pluginsArg?: GesturePlugin[]
  ) => {
    destroy: () => void;
  };
} {
  let activeEvents: PointerEvent[] = [];
  let removePointerdownHandler: () => void = () => {};
  let plugins: GesturePlugin[] = [];

  return {
    setPointerControls: (
      gestureName: string,
      node: HTMLElement,
      onMoveCallback: PointerEventCallback<boolean>,
      onDownCallback: PointerEventCallback<void>,
      onUpCallback: PointerEventCallback<void>,
      touchAction: TouchAction | TouchAction[] = DEFAULT_TOUCH_ACTION,
      pluginsArg: GesturePlugin[] = []
    ): {
      destroy: () => void;
    } => {
      node.style.touchAction = ensureArray(touchAction).join(' ');
      plugins = pluginsArg;

      plugins.forEach((plugin) => {
        plugin.onInit?.(activeEvents);
      });

      // this is needed to prevent multiple event handlers being added when gesture is recreated
      if (!activeEvents.length) {
        function handlePointerdown(event: PointerEvent): void {
          activeEvents.push(event);
          const dispatchEvent: DispatchEvent = dispatch(
            node,
            gestureName,
            event,
            activeEvents,
            'down'
          );
          onDownCallback?.(activeEvents, event);
          // in case plugin options is changed we need to run them after change takes place
          setTimeout(() => {
            plugins.forEach((plugin) => {
              plugin.onDown?.(dispatchEvent, activeEvents);
            });
          });

          function onup(e: PointerEvent): void {
            const activeEvenstBefore = activeEvents.length;
            activeEvents = removeEvent(e, activeEvents);
            const eventRemoved = activeEvenstBefore > activeEvents.length;

            if (eventRemoved) {
              if (!activeEvents.length) removeEventHandlers();
              const dispatchEvent: DispatchEvent = dispatch(
                node,
                gestureName,
                e,
                activeEvents,
                'up'
              );
              onUpCallback?.(activeEvents, e);
              // in case plugin options is changed we need to run them after change takes place
              setTimeout(() => {
                plugins.forEach((plugin) => {
                  plugin.onUp?.(dispatchEvent, activeEvents);
                });
              });
            }
          }

          function removeEventHandlers(): void {
            removePointermoveHandler();
            removeLostpointercaptureHandler();
            removePointerUpHandler();
            removePointerLeaveHandler();
          }

          const removePointermoveHandler = addEventListener(
            node,
            'pointermove',
            (e: PointerEvent) => {
              activeEvents = activeEvents.map((activeEvent: PointerEvent) => {
                return e.pointerId === activeEvent.pointerId ? e : activeEvent;
              });
              const dispatchEvent: DispatchEvent = dispatch(
                node,
                gestureName,
                e,
                activeEvents,
                'move'
              );
              onMoveCallback?.(activeEvents, e);

              plugins.forEach((plugin) => {
                plugin.onMove?.(dispatchEvent, activeEvents);
              });
            }
          );

          const removeLostpointercaptureHandler = addEventListener(
            node,
            'lostpointercapture',
            (e: PointerEvent) => {
              onup(e);
            }
          );

          const removePointerUpHandler = addEventListener(
            node,
            'pointerup',
            (e: PointerEvent) => {
              onup(e);
            }
          );
          const removePointerLeaveHandler = addEventListener(
            node,
            'pointerleave',
            (e: PointerEvent) => {
              onup(e);
            }
          );
        }

        removePointerdownHandler = addEventListener(
          node,
          'pointerdown',
          handlePointerdown
        );
      }

      return {
        destroy: (): void => {
          if (!activeEvents.length) {
            removePointerdownHandler();

            plugins.forEach((plugin) => {
              plugin.onDestroy?.();
            });
          }
        },
      };
    },
  };
}
