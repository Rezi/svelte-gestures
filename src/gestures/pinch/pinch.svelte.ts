import {
  createPointerControls,
  DEFAULT_TOUCH_ACTION,
  getCenterOfTwoPoints,
  type ActionType,
  type BaseParams,
  type Coord,
  type GestureCustomEvent,
  type SubGestureFunctions,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type PinchParameters = BaseParams;

export type PinchPointerEventDetail = {
  scale: number;
  center: Coord;
  pointerType: string;
};

export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;

const gestureName = 'pinch' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PinchEvent = Record<
  OnEventType,
  (gestureEvent: PinchCustomEvent) => void
>;

function getPointersDistance(activeEvents: PointerEvent[]) {
  return Math.hypot(
    activeEvents[0].clientX - activeEvents[1].clientX,
    activeEvents[0].clientY - activeEvents[1].clientY
  );
}

export function usePinch(
  handler: (e: PinchCustomEvent) => void,
  inputParameters?: () => Partial<PinchParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >
) {
  const { setPointerControls } = createPointerControls();

  return {
    ...baseHandlers,
    [`on${gestureName}`]: handler,
    [createAttachmentKey()]: (node: HTMLElement) => {
      const { onMove, onDown, onUp, parameters } = pinchBase(
        node,
        inputParameters?.()
      );

      return setPointerControls(
        gestureName,
        node,
        onMove,
        onDown,
        onUp,
        parameters.touchAction,
        parameters.plugins
      ).destroy;
    },
  };
}

export const pinchComposition = (
  node: HTMLElement,
  inputParameters?: Partial<PinchParameters>
): SubGestureFunctions => {
  const { onMove, onDown, parameters } = pinchBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp: null,
    plugins: parameters.plugins,
  };
};

function pinchBase(
  node: HTMLElement,
  inputParameters?: Partial<PinchParameters>
) {
  const parameters: PinchParameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };

  let prevDistance: number | undefined;
  let initDistance = 0;
  let pinchCenter: Coord;

  function onUp(activeEvents: PointerEvent[]) {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }

  function onDown(activeEvents: PointerEvent[]) {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
      pinchCenter = getCenterOfTwoPoints(node, activeEvents);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 2) {
      const curDistance = getPointersDistance(activeEvents);

      if (prevDistance !== undefined && curDistance !== prevDistance) {
        const scale = curDistance / initDistance;
        node.dispatchEvent(
          new CustomEvent<PinchPointerEventDetail>(gestureName, {
            detail: {
              scale,
              center: pinchCenter,
              pointerType: event.pointerType,
            },
          })
        );
      }
      prevDistance = curDistance;
    }

    return false;
  }

  return {
    onMove,
    onDown,
    onUp,
    parameters,
  };
}
