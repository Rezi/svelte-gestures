'use strict';

import { DEFAULT_DELAY, setPointerControls } from './shared';

export function press(
  node: HTMLElement,
  parameters: { timeframe: number } = { timeframe: DEFAULT_DELAY }
): { destroy: () => void } {
  node.style.userSelect = 'none';
  node.oncontextmenu = (e) => {
    e.preventDefault();
  };

  const gestureName = 'press';

  let startTime: number;
  let clientX: number;
  let clientY: number;

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (
      Math.abs(event.clientX - clientX) < 4 &&
      Math.abs(event.clientY - clientY) < 4 &&
      Date.now() - startTime > parameters.timeframe
    ) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      node.dispatchEvent(
        new CustomEvent(gestureName, {
          detail: { x, y, target: event.target },
        })
      );
    }
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }

  return setPointerControls(gestureName, node, null, onDown, onUp);
}
