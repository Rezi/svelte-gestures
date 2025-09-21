import {
  DEFAULT_DELAY,
  DEFAULT_PRESS_SPREAD,
  type BaseParams,
  type GestureCustomEvent,
  type SubGestureFunctions,
  type ActionType,
  createPointerControls,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

export type PressParameters = {
  timeframe: number;
  triggerBeforeFinished: boolean;
  spread: number;
} & BaseParams;

export type PressPointerEventDetail = {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
};

export type PressCustomEvent = CustomEvent<PressPointerEventDetail>;

const gestureName = 'press' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type PressEvent = Record<
  OnEventType,
  (gestureEvent: PressCustomEvent) => void
>;

type ReturnPress<T> = T extends false
  ? {
      onpressup?: (gestureEvent: GestureCustomEvent) => void;
      onpressdown?: (gestureEvent: GestureCustomEvent) => void;
      onpressmove?: (gestureEvent: GestureCustomEvent) => void;
      onpress: (e: PressCustomEvent) => void;
    }
  : T extends true
  ? {
      onpressup?: (gestureEvent: GestureCustomEvent) => void;
      onpressdown?: (gestureEvent: GestureCustomEvent) => void;
      onpressmove?: (gestureEvent: GestureCustomEvent) => void;
      onpress: (e: PressCustomEvent) => void;
      press: (node: HTMLElement) => () => void;
    }
  : never;

export function usePress<T extends boolean>(
  handler: (e: PressCustomEvent) => void,
  inputParameters?: () => Partial<PressParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >,
  isRaw = false as T
): ReturnPress<T> {
  const { setPointerControls } = createPointerControls();
  const gesturePropName = isRaw ? gestureName : createAttachmentKey();

  return {
    ...baseHandlers,
    [`on${gestureName}` as OnEventType]: handler,
    [gesturePropName]: (node: HTMLElement) => {
      const { onMove, onDown, onUp, parameters, clearTimeoutWrap } = pressBase(
        node,
        inputParameters?.()
      );

      const onSharedDestroy = setPointerControls(
        gestureName,
        node,
        onMove,
        onDown,
        onUp,
        parameters.touchAction,
        parameters.plugins
      );

      return (): void => {
        onSharedDestroy.destroy();
        clearTimeoutWrap();
      };
    },
  } as ReturnPress<T>;
}

export const pressComposition = (
  node: HTMLElement,
  inputParameters?: Partial<PressParameters>
): SubGestureFunctions => {
  const { onMove, onDown, onUp, parameters } = pressBase(node, inputParameters);

  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins,
  };
};

function pressBase(
  node: HTMLElement,
  inputParameters?: Partial<PressParameters>
): {
  onDown: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  onMove: (activeEvents: PointerEvent[], event: PointerEvent) => boolean;
  onUp: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  parameters: PressParameters;
  clearTimeoutWrap: () => void;
} {
  const parameters: PressParameters = {
    composed: false,
    timeframe: DEFAULT_DELAY,
    triggerBeforeFinished: false,
    spread: DEFAULT_PRESS_SPREAD,
    touchAction: 'auto',
    ...inputParameters,
  };

  const initialOncontextmenu = node.oncontextmenu;

  let startTime: number;
  let clientX: number;
  let clientY: number;
  const clientMoved = { x: 0, y: 0 };
  let timeout: ReturnType<typeof setTimeout>;
  let triggeredOnTimeout = false;
  let triggered = false;

  function onDone(eventX: number, eventY: number, event: PointerEvent): void {
    if (
      Math.abs(eventX - clientX) < parameters.spread &&
      Math.abs(eventY - clientY) < parameters.spread &&
      Date.now() - startTime > parameters.timeframe
    ) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(eventX - rect.left);
      const y = Math.round(eventY - rect.top);

      triggered = true;
      node.dispatchEvent(
        new CustomEvent<PressPointerEventDetail>(gestureName, {
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

  function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
    clearTimeout(timeout);
    if (!triggeredOnTimeout) {
      onDone(event.clientX, event.clientY, event);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent): boolean {
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;

    return triggered;
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    // on touch devices, we need to prevent the context menu from showing after long press
    if (event.pointerType === 'touch') {
      node.oncontextmenu = (e): void => {
        e.preventDefault();
      };
    } else {
      node.oncontextmenu = initialOncontextmenu;
    }

    // on touch devices, we need to prevent the default text selection on long press
    node.style.userSelect = event.pointerType === 'touch' ? 'none' : 'auto';

    triggered = false;
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    triggeredOnTimeout = false;
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;

    if (parameters.triggerBeforeFinished) {
      timeout = setTimeout(() => {
        triggeredOnTimeout = true;

        onDone(clientMoved.x, clientMoved.y, event);
      }, parameters.timeframe + 1);
    }
  }

  function clearTimeoutWrap(): void {
    clearTimeout(timeout);
  }

  return { onDown, onMove, onUp, parameters, clearTimeoutWrap };
}
