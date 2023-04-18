import {
  DEFAULT_DELAY,
  DEFAULT_MIN_SWIPE_DISTANCE,
  DEFAULT_TOUCH_ACTION,
  setPointerControls,
  type SvelteAction,
  type SubGestureFunctions,
  type BaseParams,
type PointerType,
} from './shared';

type SwipeParameters = {
  timeframe: number;
  minSwipeDistance: number;
  touchAction: string;
} & BaseParams;

export function swipe(
  node: HTMLElement,
  inputParameters?: Partial<SwipeParameters>
): SvelteAction | SubGestureFunctions {
  const parameters: SwipeParameters = {
    timeframe: DEFAULT_DELAY,
    minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    conditionFor: ['all' as PointerType] ,
    ...inputParameters,
  };

  const gestureName = 'swipe';

  let startTime: number;
  let clientX: number;
  let clientY: number;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    if (activeEvents.length === 1) {
      target = event.target;
    }
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (
      event.type === 'pointerup' &&
      activeEvents.length === 0 &&
      Date.now() - startTime < parameters.timeframe
    ) {
      const x = event.clientX - clientX;
      const y = event.clientY - clientY;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      let direction: 'top' | 'right' | 'bottom' | 'left' | null = null;
      if (absX >= 2 * absY && absX > parameters.minSwipeDistance) {
        // horizontal (by *2 we eliminate diagonal movements)
        direction = x > 0 ? 'right' : 'left';
      } else if (absY >= 2 * absX && absY > parameters.minSwipeDistance) {
        // vertical (by *2 we eliminate diagonal movements)
        direction = y > 0 ? 'bottom' : 'top';
      }
      if (direction) {
        node.dispatchEvent(
          new CustomEvent(gestureName, {
            detail: { direction, target },
          })
        );
      }
    }
  }

  if (parameters.composed) {
    return { onMove: null, onDown, onUp };
  }

  return setPointerControls(
    gestureName,
    node,
    null,
    onDown,
    onUp,
    parameters.touchAction
  );
}
