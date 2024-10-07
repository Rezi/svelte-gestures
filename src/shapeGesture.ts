import {
  DEFAULT_TOUCH_ACTION,
  setPointerControls,
  type SvelteAction,
  type SubGestureFunctions,
  type BaseParams,
  type ParametersSwitch,
  type GestureReturnType,
  type Coord,
} from './shared';

import {
  shapeDetector,
  DEFAULT_NB_OF_SAMPLE_POINTS,
  DEFAULT_TRESHOLD,
  type Pattern,
  type Options,
} from './detector';

export type ShapeGestureParameters = {
  shapes: Pattern[];
  timeframe: number;
} & Options &
  BaseParams;

export type ShapePointerEventDetail = {
  score: number;
  pattern: string | null;
  target: EventTarget | null;
  pointerType: string;
};

export type ShapeCustomEvent = CustomEvent<ShapePointerEventDetail>;

export function shapeGesture<
  R extends ParametersSwitch<ShapeGestureParameters> = undefined
>(
  node: HTMLElement,
  inputParameters?: GestureReturnType<ShapeGestureParameters, R>
): SvelteAction | SubGestureFunctions {
  let parameters: ShapeGestureParameters = {
    composed: false,
    shapes: [],
    threshold: DEFAULT_TRESHOLD,
    timeframe: 1000,
    nbOfSamplePoints: DEFAULT_NB_OF_SAMPLE_POINTS,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters,
  };

  const gestureName = 'shapeGesture';

  const detector = shapeDetector(parameters.shapes, { ...parameters });

  let startTime: number;
  let target: EventTarget | null;
  let stroke: Coord[] = [];

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    startTime = Date.now();
    target = event.target;
    stroke = [];
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 1) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);

      stroke.push({ x, y });
    }

    return false;
  }

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    if (stroke.length > 2 && Date.now() - startTime < parameters.timeframe) {
      const detectionResult = detector.detect(stroke);
      node.dispatchEvent(
        new CustomEvent<ShapePointerEventDetail>(gestureName, {
          detail: {
            ...detectionResult,
            target,
            pointerType: event.pointerType,
          },
        })
      );
    }
  }

  if (parameters.composed) {
    return { onMove, onDown, onUp } as GestureReturnType<
      ShapeGestureParameters,
      R
    >;
  }

  return {
    ...setPointerControls(
      gestureName,
      node,
      onMove,
      onDown,
      onUp,
      parameters.touchAction
    ),
    update: (updateParameters: ShapeGestureParameters) => {
      parameters = { ...parameters, ...updateParameters };
    },
  } as GestureReturnType<ShapeGestureParameters, R>;
}
