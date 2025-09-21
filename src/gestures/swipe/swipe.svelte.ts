import {
  DEFAULT_DELAY,
  DEFAULT_MIN_SWIPE_DISTANCE,
  DEFAULT_TOUCH_ACTION,
  type SubGestureFunctions,
  type BaseParams,
  type GestureCustomEvent,
  type ActionType,
  createPointerControls,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type SwipeParameters = {
  timeframe: number;
  minSwipeDistance: number;
  touchAction: string;
} & BaseParams;

export type SwipePointerEventDetail = {
  direction: Direction;
  target: EventTarget | null;
  pointerType: string;
};

export type Direction = 'top' | 'right' | 'bottom' | 'left' | null;
export type SwipeCustomEvent = CustomEvent<SwipePointerEventDetail>;

const gestureName = 'swipe' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type SwipeEvent = Record<
  OnEventType,
  (gestureEvent: SwipeCustomEvent) => void
>;

type ReturnSwipe<T> = T extends false
  ? {
      onswipeup?: (gestureEvent: GestureCustomEvent) => void;
      onswipedown?: (gestureEvent: GestureCustomEvent) => void;
      onswipemove?: (gestureEvent: GestureCustomEvent) => void;
      onswipe: (e: SwipeCustomEvent) => void;
    }
  : T extends true
  ? {
      onswipeup?: (gestureEvent: GestureCustomEvent) => void;
      onswipedown?: (gestureEvent: GestureCustomEvent) => void;
      onswipemove?: (gestureEvent: GestureCustomEvent) => void;
      onswipe: (e: SwipeCustomEvent) => void;
      swipe: (node: HTMLElement) => () => void;
    }
  : never;

export function useSwipe<T extends boolean>(
  handler: (e: SwipeCustomEvent) => void,
  inputParameters?: () => Partial<SwipeParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >,
  isRaw = false as T
): ReturnSwipe<T> {
  const { setPointerControls } = createPointerControls();
  const gesturePropName = isRaw ? gestureName : createAttachmentKey();

  return {
    ...baseHandlers,
    [`on${gestureName}` as OnEventType]: handler,
    [gesturePropName]: (node: HTMLElement): (() => void) => {
      const { onDown, onUp, parameters } = swipeBase(node, inputParameters?.());

      return setPointerControls(
        gestureName,
        node,
        null,
        onDown,
        onUp,
        parameters.touchAction,
        parameters.plugins
      ).destroy;
    },
  } as ReturnSwipe<T>;
}

export const swipeComposition = (
  node: HTMLElement,
  inputParameters?: Partial<SwipeParameters>
): SubGestureFunctions => {
  const { onDown, onUp, parameters } = swipeBase(node, inputParameters);

  return {
    onMove: null,
    onDown,
    onUp,
    plugins: parameters.plugins,
  };
};

function swipeBase(
  node: HTMLElement,
  inputParameters?: Partial<SwipeParameters>
): {
  onDown: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  onUp: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  parameters: SwipeParameters;
} {
  const parameters: SwipeParameters = {
    timeframe: DEFAULT_DELAY,
    minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };

  let startTime: number;
  let clientX: number;
  let clientY: number;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    if (activeEvents.length === 1) {
      target = event.target;
    }
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
    if (
      event.type === 'pointerup' &&
      activeEvents.length === 0 &&
      Date.now() - startTime < parameters.timeframe
    ) {
      const x = event.clientX - clientX;
      const y = event.clientY - clientY;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      let direction: Direction = null;
      if (absX >= 2 * absY && absX > parameters.minSwipeDistance) {
        // horizontal (by *2 we eliminate diagonal movements)
        direction = x > 0 ? 'right' : 'left';
      } else if (absY >= 2 * absX && absY > parameters.minSwipeDistance) {
        // vertical (by *2 we eliminate diagonal movements)
        direction = y > 0 ? 'bottom' : 'top';
      }
      if (direction) {
        node.dispatchEvent(
          new CustomEvent<SwipePointerEventDetail>(gestureName, {
            detail: { direction, target, pointerType: event.pointerType },
          })
        );
      }
    }
  }
  return { onDown, onUp, parameters };
}
