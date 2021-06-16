'use strict';

export const DEFAULT_DELAY = 300;
export const DEFAULT_MIN_SWIPE_DISTANCE = 100; // in pixels
export type GestureName = 'pan' | 'pinch' | 'tap' | 'swipe' | 'rotate';

type PointerType = 'up' | 'down' | 'move';

function addEventListener<ET extends EventTarget, E extends Event>(
  node: ET,
  event: string,
  handler: (this: ET, evt: E) => void
): () => void {
  node.addEventListener(event, handler as (evt: Event) => void);
  return () => node.removeEventListener(event, handler as (evt: Event) => void);
}

function removeEvent(
  event: PointerEvent,
  activeEvents: PointerEvent[]
): PointerEvent[] {
  return activeEvents.filter((activeEvent: PointerEvent) => {
    return event.pointerId !== activeEvent.pointerId;
  });
}

function dispatch(
  node: HTMLElement,
  gestureName: GestureName,
  event: PointerEvent,
  activeEvents: PointerEvent[],
  pointerType: PointerType
) {
  node.dispatchEvent(
    new CustomEvent(`${gestureName}${pointerType}`, {
      detail: { event, pointersCount: activeEvents.length },
    })
  );
}

export function setPointerControls(
  gestureName: GestureName,
  node: HTMLElement,
  onMoveCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,
  onDownCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,
  onUpCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void
): {
  destroy: () => void;
} {
  node.style.touchAction = 'none';
  let activeEvents: PointerEvent[] = [];

  function handlePointerdown(event: PointerEvent) {
    activeEvents.push(event);
    dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback?.(activeEvents, event);

    const removePointermoveHandler = addEventListener(
      node,
      'pointermove',
      (event: PointerEvent) => {
        activeEvents = activeEvents.map((activeEvent: PointerEvent) => {
          return event.pointerId === activeEvent.pointerId
            ? event
            : activeEvent;
        });
        dispatch(node, gestureName, event, activeEvents, 'move');
        onMoveCallback?.(activeEvents, event);
      }
    );

    const removePointerupHandler = addEventListener(
      node,
      'pointerup',
      (event: PointerEvent) => {
        activeEvents = removeEvent(event, activeEvents);

        if (!activeEvents.length) {
          removePointermoveHandler();
          removePointerupHandler();
        }

        dispatch(node, gestureName, event, activeEvents, 'up');
        onUpCallback?.(activeEvents, event);
        // onMoveCallback?.(activeEvents, event);
      }
    );
  }

  const removePointerdownHandler = addEventListener(
    node,
    'pointerdown',
    handlePointerdown
  );

  return {
    destroy: () => {
      removePointerdownHandler();
    },
  };
}
