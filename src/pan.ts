import {
  DEFAULT_DELAY,
  DEFAULT_TOUCH_ACTION,
  setPointerControls,
  type ParametersSwitch,
  type BaseParams,
  type GestureReturnType,
} from './shared';

export type PanParameters = { delay: number } & BaseParams;

export type PanPointerEventDetail = {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
};

export type PanCustomEvent = CustomEvent<PanPointerEventDetail>;

export function pan<R extends ParametersSwitch<PanParameters> = undefined>(
  node: HTMLElement,
  inputParameters?: R
): GestureReturnType<PanParameters, R> {
  let parameters: PanParameters = {
    delay: DEFAULT_DELAY,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
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
          new CustomEvent<PanPointerEventDetail>(gestureName, {
            detail: { x, y, target, pointerType: event.pointerType },
          })
        );
      }
    }

    return false;
  }

  if (parameters.composed) {
    return { onMove, onDown, onUp: null } as GestureReturnType<
      PanParameters,
      R
    >;
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
  } as GestureReturnType<PanParameters, R>;
}
