'use strict';

import { DEFAULT_DELAY, setPointerControls, GestureName } from './shared';

export function pan(
  node: HTMLElement,
  parameters: { delay: number } = { delay: DEFAULT_DELAY }
): { destroy: () => void } {
  const gestureName: GestureName = 'pan';

  let startTime: number;

  function onDown() {
    startTime = Date.now();
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (
      activeEvents.length === 1 &&
      Date.now() - startTime > parameters.delay
    ) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        node.dispatchEvent(
          new CustomEvent(gestureName, {
            detail: { x, y },
          })
        );
      }
    }
  }

  return setPointerControls(gestureName, node, onMove, onDown, null);
}
