import {
  type ActionType,
  DEFAULT_DELAY,
  DEFAULT_TOUCH_ACTION,
  type BaseParams,
  type GestureCustomEvent,
  type SubGestureFunctions,
  createPointerControls,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type PanParameters = { delay: number } & BaseParams;

export type PanPointerEventDetail = {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
};

export type PanCustomEvent = CustomEvent<PanPointerEventDetail>;

const gestureName = 'pan' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PanEvent = Record<
  OnEventType,
  (gestureEvent: PanCustomEvent) => void
>;

export function usePan(
  handler: (e: PanCustomEvent) => void,
  inputParameters?: () => Partial<PanParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >
): {
  onpanup?: (gestureEvent: GestureCustomEvent) => void;
  onpandown?: (gestureEvent: GestureCustomEvent) => void;
  onpanmove?: (gestureEvent: GestureCustomEvent) => void;
  onpan: (e: PanCustomEvent) => void;
} {
  const { setPointerControls } = createPointerControls();

  return {
    ...baseHandlers,
    [`on${gestureName}` as OnEventType]: handler,
    [createAttachmentKey()]: (node: HTMLElement): (() => void) => {
      const { onMove, onDown, parameters } = panBase(node, inputParameters?.());

      return setPointerControls(
        gestureName,
        node,
        onMove,
        onDown,
        null,
        parameters.touchAction,
        parameters.plugins
      ).destroy;
    },
  };
}

export const panComposition = (
  node: HTMLElement,
  inputParameters?: Partial<PanParameters>
): SubGestureFunctions => {
  const { onMove, onDown, parameters } = panBase(node, inputParameters);

  return {
    onMove,
    onDown,
    onUp: null,
    plugins: parameters.plugins,
  };
};

function panBase(
  node: HTMLElement,
  inputParameters?: Partial<PanParameters>
): {
  onDown: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  onMove: (activeEvents: PointerEvent[], event: PointerEvent) => boolean;
  parameters: PanParameters;
} {
  const parameters: PanParameters = {
    delay: DEFAULT_DELAY,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters,
  };

  let startTime: number;
  let target: EventTarget | null;

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    startTime = Date.now();
    target = event.target;
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent): boolean {
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

  return { onDown, onMove, parameters };
}
