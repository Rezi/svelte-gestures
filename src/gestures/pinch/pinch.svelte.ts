import {
  DEFAULT_TOUCH_ACTION,
  getCenterOfTwoPoints,
  setPointerControls,
  type BaseParams,
  type Coord,
  type GestureCustomEvent,
  type Action,
  type SubGestureFunctions,
} from '../../shared';

export type PinchParameters = BaseParams;

export type PinchPointerEventDetail = {
  scale: number;
  center: Coord;
  pointerType: string;
};

export type PinchCustomEvent = CustomEvent<PinchPointerEventDetail>;

function getPointersDistance(activeEvents: PointerEvent[]) {
  return Math.hypot(
    activeEvents[0].clientX - activeEvents[1].clientX,
    activeEvents[0].clientY - activeEvents[1].clientY
  );
}

export const pinch: Action<
  HTMLElement,
  () => Partial<PinchParameters>,
  {
    onpinch: (e: PinchCustomEvent) => void;
    onpinchdown: (e: GestureCustomEvent) => void;
    onpinchup: (e: GestureCustomEvent) => void;
    onpinchmove: (e: GestureCustomEvent) => void;
  }
> = (node: HTMLElement, inputParameters?: () => Partial<PinchParameters>) => {
  $effect(() => {
    const { onMove, onDown, onUp, gestureName, parameters } = pinchBase(
      node,
      inputParameters?.()
    );

    return setPointerControls(
      gestureName,
      node,
      onMove,
      onDown,
      onUp,
      parameters.touchAction,
      parameters.plugins
    ).destroy;
  });
};

export const pinchComposition = (
  node: HTMLElement,
  inputParameters?: Partial<PinchParameters>
): SubGestureFunctions => {
  const { onMove, onDown, parameters } = pinchBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp: null,
    plugins: parameters.plugins,
  };
};

function pinchBase(
  node: HTMLElement,
  inputParameters?: Partial<PinchParameters>
) {
  const parameters: PinchParameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };

  const gestureName = 'pinch';

  let prevDistance: number | undefined;
  let initDistance = 0;
  let pinchCenter: Coord;

  function onUp(activeEvents: PointerEvent[]) {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }

  function onDown(activeEvents: PointerEvent[]) {
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
          new CustomEvent<PinchPointerEventDetail>(gestureName, {
            detail: {
              scale,
              center: pinchCenter,
              pointerType: event.pointerType,
            },
          })
        );
      }
      prevDistance = curDistance;
    }

    return false;
  }

  return {
    onMove,
    onDown,
    onUp,
    gestureName,
    parameters,
  };
}
