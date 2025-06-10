import {
  DEFAULT_TOUCH_ACTION,
  setPointerControls,
  type ActionType,
  type BaseParams,
  type Coord,
  type GestureCustomEvent,
  type SubGestureFunctions,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

import {
  shapeDetector,
  DEFAULT_NB_OF_SAMPLE_POINTS,
  DEFAULT_THRESHOLD,
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

const gestureName = 'shapeGesture' as const;

type EventTypeName = `on${typeof gestureName}${ActionType}`;

export function useShapeGesture(
  inputParameters: () => Partial<ShapeGestureParameters>,
  handler: (e: ShapeCustomEvent) => void,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >
) {
  return {
    ...baseHandlers,
    [`on${gestureName}`]: handler,
    [createAttachmentKey()]: (node: HTMLElement) => {
      const { onMove, onDown, onUp, parameters } = shapeGestureBase(
        node,
        inputParameters?.()
      );

      return setPointerControls(
        gestureName,
        node,
        onMove,
        onDown,
        onUp,
        parameters.touchAction
      ).destroy;
    },
  };
}

export const shapeGestureComposition = (
  node: HTMLElement,
  inputParameters?: Partial<ShapeGestureParameters>
): SubGestureFunctions => {
  const { onMove, onDown, onUp, parameters } = shapeGestureBase(
    node,
    inputParameters
  );
  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins,
  };
};

function shapeGestureBase(
  node: HTMLElement,
  inputParameters?: Partial<ShapeGestureParameters>
) {
  const parameters: ShapeGestureParameters = {
    composed: false,
    shapes: [],
    threshold: DEFAULT_THRESHOLD,
    timeframe: 1000,
    nbOfSamplePoints: DEFAULT_NB_OF_SAMPLE_POINTS,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters,
  };

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

  return { onDown, onMove, onUp, parameters };
}
