import {
  DEFAULT_DELAY,
  setPointerControls,
  type BaseParams,
  type ParametersSwitch,
  type GestureReturnType,
} from './shared';

export type TapParameters = {
  timeframe: number;
} & BaseParams;

export type TapPointerEventDetail = {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
};

export type TapCustomEvent = CustomEvent<TapPointerEventDetail>;

export function tap<R extends ParametersSwitch<TapParameters> = undefined>(
  node: HTMLElement,
  inputParameters?: R
): GestureReturnType<TapParameters, R> {
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
        new CustomEvent<TapPointerEventDetail>(gestureName, {
          detail: {
            x,
            y,
            target: event.target,
            pointerType: event.pointerType,
          },
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
    return { onMove: null, onDown, onUp } as GestureReturnType<
      TapParameters,
      R
    >;
  }

  return setPointerControls(
    gestureName,
    node,
    null,
    onDown,
    onUp,
    parameters.touchAction
  ) as GestureReturnType<TapParameters, R>;
}
