import {
  DEFAULT_DELAY,
  DEFAULT_TOUCH_ACTION,
  type BaseParams,
  type Coord,
  type GestureCustomEvent,
  type SubGestureFunctions,
  type ActionType,
  createPointerControls,
} from '../../shared';

import { createAttachmentKey } from 'svelte/attachments';

export type ScrollParameters = {
  delay: number;
} & BaseParams;

type Direction = 'x' | 'y';
type ScrollDimension = 'scrollHeight' | 'scrollWidth';
type ClientDimension = 'clientHeight' | 'clientWidth';

const gestureName = 'scroll' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type ScrollEvent = Record<
  OnEventType,
  (gestureEvent: CustomEvent) => void
>;

function isScrollMode(event: PointerEvent) {
  return event.pointerType === 'touch';
}

function getScrollParent(
  node: HTMLElement,
  direction: Direction
): HTMLElement | undefined {
  if (!node) {
    return undefined;
  }

  const isElement = node instanceof HTMLElement;

  const overflowY = isElement && window.getComputedStyle(node).overflowY;
  const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
  const directionToDimension = { x: 'Width', y: 'Height' };

  if (
    isScrollable &&
    node[`scroll${directionToDimension[direction]}` as ScrollDimension] >
      node[`client${directionToDimension[direction]}` as ClientDimension]
  ) {
    return node;
  } else {
    return (
      getScrollParent(node.parentNode as HTMLElement, direction) ||
      (document.scrollingElement as HTMLElement) ||
      document.body
    );
  }
}

export function useScroll(
  handler: (e: CustomEvent) => void,
  inputParameters?: () => Partial<ScrollParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >
) {
  const { setPointerControls } = createPointerControls();

  return {
    ...baseHandlers,
    [`on${gestureName}`]: handler,
    [createAttachmentKey()]: (node: HTMLElement) => {
      const { onMove, onDown, onUp, parameters } = scrollBase(
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

export const scrollComposition = (
  node: HTMLElement,
  inputParameters?: Partial<ScrollParameters>
): SubGestureFunctions => {
  const { onMove, onDown, onUp, parameters } = scrollBase(
    node,
    inputParameters
  );

  return {
    onMove,
    onUp,
    onDown,
    plugins: parameters.plugins,
  };
};

function scrollBase(
  node: HTMLElement,
  inputParameters?: Partial<ScrollParameters>
) {
  const parameters: ScrollParameters = {
    ...{
      delay: DEFAULT_DELAY,
      touchAction: DEFAULT_TOUCH_ACTION,
      composed: false,
    },
    ...inputParameters,
  };

  const nearestScrollEl: {
    x: HTMLElement | undefined;
    y: HTMLElement | undefined;
  } = { x: undefined, y: undefined };
  let prevCoords: Coord | undefined;
  const scrollDelta: Coord = {
    x: 0,
    y: 0,
  };
  const scrollDirectionPositive = { x: true, y: true };

  function scrollElementTo(
    el: HTMLElement | undefined,
    scrollValue: number,
    direction: Direction
  ) {
    el?.scrollBy({
      [direction === 'x' ? 'left' : 'top']: scrollValue,
      behavior: 'auto',
    });
  }

  function onDown() {
    nearestScrollEl.y = getScrollParent(node, 'y');
    nearestScrollEl.x = getScrollParent(node, 'x');

    prevCoords = undefined;
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 1 && isScrollMode(event)) {
      if (prevCoords !== undefined) {
        scrollDelta.y = Math.round(prevCoords.y - event.clientY);
        scrollDelta.x = Math.round(prevCoords.x - event.clientX);

        if (nearestScrollEl.y) {
          scrollElementTo(nearestScrollEl.y, scrollDelta.y, 'y');
        }
        if (nearestScrollEl.x) {
          scrollElementTo(nearestScrollEl.x, scrollDelta.x, 'x');
        }
      }
      prevCoords = { x: event.clientX, y: event.clientY };
    }

    return false;
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (isScrollMode(event)) {
      if (scrollDelta.y || scrollDelta.x) {
        scrollDirectionPositive.y = scrollDelta.y > 0;
        scrollDirectionPositive.x = scrollDelta.x > 0;
        requestAnimationFrame(scrollOutLoop);
      }
    }
  }

  function scrollOutByDirection(direction: Direction) {
    if (!scrollDirectionPositive[direction] && scrollDelta[direction] < 0) {
      scrollDelta[direction] += 0.3;
    } else if (
      scrollDirectionPositive[direction] &&
      scrollDelta[direction] > 0
    ) {
      scrollDelta[direction] -= 0.3;
    } else {
      scrollDelta[direction] = 0;
    }

    if (scrollDelta[direction]) {
      scrollElementTo(
        nearestScrollEl[direction],
        scrollDelta[direction],
        direction
      );
      requestAnimationFrame(scrollOutLoop);
    }
  }

  function scrollOutLoop() {
    if (nearestScrollEl.x) {
      scrollOutByDirection('x');
    }
    if (nearestScrollEl.y) {
      scrollOutByDirection('y');
    }
  }

  return { onMove, onDown, onUp, parameters };
}
