'use strict';

import { DEFAULT_DELAY, setPointerControls } from './shared';

export function hold(
  node: HTMLElement,
  parameters: { timeframe: number } = { timeframe: DEFAULT_DELAY }
): { destroy: () => void } {
  const gestureName = 'hold';

  let startTime: number;
  let timeout: ReturnType<typeof setTimeout>;

  function onDown() {
    startTime = Date.now();
    timeout = setTimeout(() => timeoutReached(), parameters.timeframe);
  }
  function timeoutReached() {
    clearTimeout(timeout);
    node.dispatchEvent(
      new CustomEvent(gestureName, {
        detail: { time: parameters.timeframe },
      })
    );
  }

  return setPointerControls(gestureName, node, null, onDown, null);
}
