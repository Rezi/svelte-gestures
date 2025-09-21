import {
  DEFAULT_DELAY,
  type SubGestureFunctions,
  type BaseParams,
  type GestureCustomEvent,
  type ActionType,
  createPointerControls,
} from '../../shared';
import { createAttachmentKey } from 'svelte/attachments';

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

const gestureName = 'tap' as const;

type OnEventType = `on${typeof gestureName}`;
type EventTypeName = `${OnEventType}${ActionType}`;
export type SapEvent = Record<
  OnEventType,
  (gestureEvent: TapCustomEvent) => void
>;
type ReturnTap<T> = T extends false
  ? {
      ontapup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontapdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontapmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontap: (e: TapCustomEvent) => void;
    }
  : T extends true
  ? {
      ontapup?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontapdown?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontapmove?: ((gestureEvent: GestureCustomEvent) => void) | undefined;
      ontap: (e: TapCustomEvent) => void;
      tap: (node: HTMLElement) => () => void;
    }
  : never;

export function useTap<T extends boolean>(
  handler: (e: TapCustomEvent) => void,
  inputParameters?: () => Partial<TapParameters>,
  baseHandlers?: Partial<
    Record<EventTypeName, (gestureEvent: GestureCustomEvent) => void>
  >,
  isRaw = false as T
): ReturnTap<T> {
  const { setPointerControls } = createPointerControls();
  const gesturePropName = isRaw ? gestureName : createAttachmentKey();

  return {
    ...baseHandlers,
    [`on${gestureName}` as OnEventType]: handler,
    [gesturePropName]: (node: HTMLElement): (() => void) => {
      const { onDown, onUp, parameters } = tapBase(node, inputParameters?.());

      return setPointerControls(
        gestureName,
        node,
        null,
        onDown,
        onUp,
        parameters.touchAction,
        parameters.plugins
      ).destroy;
    },
  } as ReturnTap<T>;
}

export const tapComposition = (
  node: HTMLElement,
  inputParameters?: Partial<TapParameters>
): SubGestureFunctions => {
  const { onDown, onUp, parameters } = tapBase(node, inputParameters);
  return {
    onMove: null,
    onDown,
    onUp,
    plugins: parameters.plugins,
  };
};

function tapBase(
  node: HTMLElement,
  inputParameters?: Partial<TapParameters>
): {
  onDown: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  onUp: (activeEvents: PointerEvent[], event: PointerEvent) => void;
  parameters: TapParameters;
} {
  const parameters: TapParameters = {
    timeframe: DEFAULT_DELAY,
    composed: false,
    touchAction: 'auto',
    ...inputParameters,
  };

  let startTime: number;
  let clientX: number;
  let clientY: number;

  function onUp(activeEvents: PointerEvent[], event: PointerEvent): void {
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

  function onDown(activeEvents: PointerEvent[], event: PointerEvent): void {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }

  return { onDown, onUp, parameters };
}
