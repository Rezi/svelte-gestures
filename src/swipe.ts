'use strict';

import {
  DEFAULT_DELAY,
  DEFAULT_MIN_SWIPE_DISTANCE,
  setPointerControls,
  GestureName,
} from './shared';

export function swipe(
  node: HTMLElement,
  parameters: { timeframe: number; minSwipeDistance: number } = {
    timeframe: DEFAULT_DELAY,
    minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
  }
): { destroy: () => void } {
  const gestureName: GestureName = 'swipe';

  let startTime: number;
  let clientX: number;
  let clientY: number;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (
      activeEvents.length === 0 &&
      Date.now() - startTime < parameters.timeframe
    ) {
      const x = event.clientX - clientX;
      const y = event.clientY - clientY;
      const absX = Math.abs(x);
      const absY = Math.abs(y);

      let direction: 'top' | 'right' | 'bottom' | 'left' = null;
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
            detail: { direction },
          })
        );
      }
    }
  }

  return setPointerControls(gestureName, node, null, onDown, onUp);
}