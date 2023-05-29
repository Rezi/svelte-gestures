import {
  DEFAULT_TOUCH_ACTION,
  getCenterOfTwoPoints,
  setPointerControls,
  type BaseParams,
  type ParametersSwitch,
  type GestureReturnType,
} from './shared';

export type PinchParameters = BaseParams;

function getPointersDistance(activeEvents: PointerEvent[]) {
  return Math.hypot(
    activeEvents[0].clientX - activeEvents[1].clientX,
    activeEvents[0].clientY - activeEvents[1].clientY
  );
}

export function pinch<R extends ParametersSwitch<PinchParameters> = undefined>(
  node: HTMLElement,
  inputParameters?: R
): GestureReturnType<PinchParameters, R> {
  const parameters: PinchParameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };

  const gestureName = 'pinch';

  let prevDistance: number | undefined;
  let initDistance = 0;
  let pinchCenter: { x: number; y: number };

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
      pinchCenter = getCenterOfTwoPoints(node, activeEvents);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 2) {
      const curDistance = getPointersDistance(activeEvents);

      if (prevDistance !== undefined && curDistance !== prevDistance) {
        const scale = curDistance / initDistance;
        node.dispatchEvent(
          new CustomEvent(gestureName, {
            detail: { scale, center: pinchCenter },
          })
        );
      }
      prevDistance = curDistance;
    }

    return false;
  }

  if (parameters.composed) {
    return { onMove, onDown, onUp: null } as GestureReturnType<
      PinchParameters,
      R
    >;
  }

  return setPointerControls(
    gestureName,
    node,
    onMove,
    onDown,
    onUp,
    parameters.touchAction
  ) as GestureReturnType<PinchParameters, R>;
}
