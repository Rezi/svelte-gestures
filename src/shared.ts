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
// export type PointerType = 'mouse' | 'touch' | 'pen' | 'all';
export type BaseParams = {
  composed: boolean;
  touchAction: TouchAction;
};

type ActionType = 'up' | 'down' | 'move';

export type SvelteAction = {
  update?: (parameters: any) => void;
  destroy?: () => void;
};

export type PointerEventCallback<T> =
  | ((activeEvents: PointerEvent[], event: PointerEvent) => T)
  | null;

export type SubGestureFunctions = {
  onMove: PointerEventCallback<boolean>;
  onUp: PointerEventCallback<void>;
  onDown: PointerEventCallback<void>;
};

function addEventListener<ET extends EventTarget, E extends Event>(
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
) {
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
  gestureName: string,
  event: PointerEvent,
  activeEvents: PointerEvent[],
  actionType: ActionType
) {
  node.dispatchEvent(
    new CustomEvent(`${gestureName}${actionType}`, {
      detail: {
        event,
        pointersCount: activeEvents.length,
        target: event.target,
      },
    })
  );
}

export function setPointerControls(
  gestureName: string,
  node: HTMLElement,
  onMoveCallback: PointerEventCallback<boolean>,
  onDownCallback: PointerEventCallback<void>,
  onUpCallback: PointerEventCallback<void>,
  touchAction: TouchAction = DEFAULT_TOUCH_ACTION
): {
  destroy: () => void;
} {
  node.style.touchAction = touchAction;
  let activeEvents: PointerEvent[] = [];

  function handlePointerdown(event: PointerEvent) {
    activeEvents.push(event);
    dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback?.(activeEvents, event);
    const pointerId = event.pointerId;

    function onup(e: PointerEvent) {
      if (pointerId === e.pointerId) {
        activeEvents = removeEvent(e, activeEvents);

        if (!activeEvents.length) {
          removeEventHandlers();
        }

        dispatch(node, gestureName, e, activeEvents, 'up');
        onUpCallback?.(activeEvents, e);
      }
    }
    function removeEventHandlers() {
      removePointermoveHandler();
      removeLostpointercaptureHandler();
      removepointerupHandler();
      removepointerleaveHandler();
    }

    const removePointermoveHandler = addEventListener(
      node,
      'pointermove',
      (e: PointerEvent) => {
        activeEvents = activeEvents.map((activeEvent: PointerEvent) => {
          return e.pointerId === activeEvent.pointerId ? e : activeEvent;
        });
        dispatch(node, gestureName, e, activeEvents, 'move');
        onMoveCallback?.(activeEvents, e);
      }
    );

    const removeLostpointercaptureHandler = addEventListener(
      node,
      'lostpointercapture',
      (e: PointerEvent) => {
        onup(e);
      }
    );

    const removepointerupHandler = addEventListener(
      node,
      'pointerup',
      (e: PointerEvent) => {
        onup(e);
      }
    );
    const removepointerleaveHandler = addEventListener(
      node,
      'pointerleave',
      (e: PointerEvent) => {
        activeEvents = [];
        removeEventHandlers();
        dispatch(node, gestureName, e, activeEvents, 'up');
        onUpCallback?.(activeEvents, e);
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
