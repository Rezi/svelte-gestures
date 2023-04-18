import {
  DEFAULT_DELAY,
  setPointerControls,
  type SvelteAction,
  type SubGestureFunctions,
  type BaseParams,
} from './shared';

export type TapParameters = {
  timeframe: number;
} & BaseParams;

export function tap(
  node: HTMLElement,
  inputParameters?: Partial<TapParameters>
): SvelteAction | SubGestureFunctions {
  const parameters: TapParameters = {
    timeframe: DEFAULT_DELAY,
    composed: false,
    touchAction: 'auto',
    ...inputParameters,
  };
  const gestureName = 'tap';

  let startTime: number;
  let clientX: number;
  let clientY: number;

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (
      Math.abs(event.clientX - clientX) < 4 &&
      Math.abs(event.clientY - clientY) < 4 &&
      Date.now() - startTime < parameters.timeframe
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
