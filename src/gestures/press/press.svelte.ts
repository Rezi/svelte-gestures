import {
  DEFAULT_DELAY,
  DEFAULT_PRESS_SPREAD,
  setPointerControls,
  type Action,
  type BaseParams,
  type GestureCustomEvent,
  type SubGestureFunctions,
} from '../../shared';

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

export const press: Action<
  HTMLElement,
  () => Partial<PressParameters>,
  {
    onpress: (e: PressCustomEvent) => void;
    onpressdown: (e: GestureCustomEvent) => void;
    onpressup: (e: GestureCustomEvent) => void;
    onpressmove: (e: GestureCustomEvent) => void;
  }
> = (node: HTMLElement, inputParameters?: () => Partial<PressParameters>) => {
  $effect(() => {
    const { onMove, onDown, onUp, parameters, gestureName, clearTimeoutWrap } =
      pressBase(node, inputParameters?.());
    const onSharedDestroy = setPointerControls(
      gestureName,
      node,
      onMove,
      onDown,
      onUp,
      parameters.touchAction
    );

    return () => {
      onSharedDestroy.destroy();
      clearTimeoutWrap();
    };
  });
};

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
) {
  const parameters: PressParameters = {
    composed: false,
    timeframe: DEFAULT_DELAY,
    triggerBeforeFinished: false,
    spread: DEFAULT_PRESS_SPREAD,
    touchAction: 'auto',
    ...inputParameters,
  };

  let initialOncontextmenu = node.oncontextmenu;

  const gestureName = 'press';

  let startTime: number;
  let clientX: number;
  let clientY: number;
  const clientMoved = { x: 0, y: 0 };
  let timeout: ReturnType<typeof setTimeout>;
  let triggeredOnTimeout = false;
  let triggered = false;

  function onDone(eventX: number, eventY: number, event: PointerEvent) {
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

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    clearTimeout(timeout);
    if (!triggeredOnTimeout) {
      onDone(event.clientX, event.clientY, event);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;

    return triggered;
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    // on touch devices, we need to prevent the context menu from showing after long press
    if (event.pointerType === 'touch') {
      node.oncontextmenu = (e) => {
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

  function clearTimeoutWrap() {
    clearTimeout(timeout);
  }

  return { onDown, onMove, onUp, gestureName, parameters, clearTimeoutWrap };
}
