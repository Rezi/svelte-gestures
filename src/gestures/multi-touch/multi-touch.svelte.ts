import {
  type ActionType,
  type BaseParams,
  type GestureCustomEvent,
  type SubGestureFunctions,
  createPointerControls,
  getCenterOfTwoPoints,
  type Coord,
  getEventPostionInNode,
  DEFAULT_TOUCH_ACTION,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type MultiTouchParameters = { touchCount: number } & BaseParams;

export type MultiTouchPointerEventDetail = {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
  coords: Coord[];
};

export type MultiTouchCustomEvent = CustomEvent<MultiTouchPointerEventDetail>;

const gestureName = 'multiTouch' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type MultiTouchEvent = Record<
  OnEventType,
  (gestureEvent: MultiTouchCustomEvent) => void
>;

export function useMultiTouch(
  handler: (e: MultiTouchCustomEvent) => void,
  inputParameters?: () => Partial<MultiTouchParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >
) {
  const { setPointerControls } = createPointerControls();

  return {
    ...baseHandlers,
    [`on${gestureName}`]: handler,
    [createAttachmentKey()]: (node: HTMLElement) => {
      const { onDown, parameters } = multiTouchBase(node, inputParameters?.());

      return setPointerControls(
        gestureName,
        node,
        null,
        onDown,
        null,
        parameters.touchAction,
        parameters.plugins
      ).destroy;
    },
  };
}

export const multiTouchComposition = (
  node: HTMLElement,
  inputParameters?: Partial<MultiTouchParameters>
): SubGestureFunctions => {
  const { onDown, parameters } = multiTouchBase(node, inputParameters);

  return {
    onMove: null,
    onUp: null,
    onDown,
    plugins: parameters.plugins,
  };
};

function multiTouchBase(
  node: HTMLElement,
  inputParameters?: Partial<MultiTouchParameters>
) {
  const parameters: MultiTouchParameters = {
    touchCount: 2,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters,
  };

  let touchCenter: Coord;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 1) {
      target = event.target;
    }

    if (activeEvents.length === parameters.touchCount) {
      const activeEventsForLoop = [...activeEvents, activeEvents[0]];
      const coordsSum = activeEvents.reduce(
        (accu, activeEvent, index) => {
          touchCenter = getCenterOfTwoPoints(node, [
            activeEvent,
            activeEventsForLoop[index + 1],
          ]);
          accu.x += touchCenter.x;
          accu.y += touchCenter.y;
          return accu;
        },
        { x: 0, y: 0 }
      );

      const centerCoords = {
        x: Math.round(coordsSum.x / activeEvents.length),
        y: Math.round(coordsSum.y / activeEvents.length),
      };

      const coords = activeEvents.map((eventN: PointerEvent) =>
        getEventPostionInNode(node, eventN)
      );

      node.dispatchEvent(
        new CustomEvent<MultiTouchPointerEventDetail>(gestureName, {
          detail: {
            ...centerCoords,
            target,
            pointerType: event.pointerType,
            coords,
          },
        })
      );
    }
    return false;
  }

  return { onDown, parameters };
}
