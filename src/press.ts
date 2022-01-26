'use strict';

import { DEFAULT_DELAY, setPointerControls } from './shared';

export function press(
  node: HTMLElement,
  parameters: { timeframe?: number; triggerBeforeFinished?: boolean }
): { destroy: () => void } {
  parameters = {
    timeframe: DEFAULT_DELAY,
    triggerBeforeFinished: false,
    ...parameters,
  };
  node.style.userSelect = 'none';
  node.oncontextmenu = (e) => {
    e.preventDefault();
  };

  const gestureName = 'press';

  let startTime: number;
  let clientX: number;
  let clientY: number;
  let clientMoved = { x: 0, y: 0 };
  let timeout: any;
  let triggeredOnTimeout = false;

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    clearTimeout(timeout);
    if (!triggeredOnTimeout) {
      onDone(event.clientX, event.clientY, event);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    triggeredOnTimeout = false;

    if (parameters.triggerBeforeFinished) {
      timeout = setTimeout(() => {
        triggeredOnTimeout = true;
        clientMoved.x = event.clientX;
        clientMoved.y = event.clientY;
        onDone(clientMoved.x, clientMoved.y, event);
      }, parameters.timeframe + 1);
    }
  }

  function onDone(eventX: number, eventY: number, event: PointerEvent) {
    if (
      Math.abs(eventX - clientX) < 4 &&
      Math.abs(eventY - clientY) < 4 &&
      Date.now() - startTime > parameters.timeframe
    ) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(eventX - rect.left);
      const y = Math.round(eventY - rect.top);

      node.dispatchEvent(
        new CustomEvent(gestureName, {
          detail: { x, y, target: event.target },
        })
      );
    }
  }

  const onSharedDestroy = setPointerControls(
    gestureName,
    node,
    onMove,
    onDown,
    onUp
  );

  return {
    destroy: () => {
      onSharedDestroy.destroy();
      clearTimeout(timeout);
    },
  };
}
