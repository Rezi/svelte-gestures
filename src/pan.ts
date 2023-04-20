import {
  DEFAULT_DELAY,
  DEFAULT_TOUCH_ACTION,
  setPointerControls,
  type SvelteAction,
  type SubGestureFunctions,
  type BaseParams,
  type PointerType,
} from './shared';

type PanParameters = { delay: number } & BaseParams;

export function pan(
  node: HTMLElement,
  inputParameters?: Partial<PanParameters>
): SvelteAction | SubGestureFunctions {
  let parameters: PanParameters = {
    delay: DEFAULT_DELAY,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
    conditionFor: ['all' as PointerType],
    ...inputParameters,
  };
  const gestureName = 'pan';

  let startTime: number;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    startTime = Date.now();
    target = event.target;
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
            detail: { x, y, target },
          })
        );
      }
    }

    return true;
  }

  if (parameters.composed) {
    return { onMove, onDown, onUp: null };
  }

  return {
    ...setPointerControls(
      gestureName,
      node,
      onMove,
      onDown,
      null,
      parameters.touchAction
    ),
    update: (updateParameters: PanParameters) => {
      parameters = { ...parameters, ...updateParameters };
    },
  };
}
