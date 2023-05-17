import {
  type SvelteAction,
  type SubGestureFunctions,
  setPointerControls,
  type BaseParams,
} from './shared';

type ListenerType = 'onDown' | 'onUp' | 'onMove';

export type GestureCallback = (
  register: RegisterGestureType
) => (activeEvents: PointerEvent[], event: PointerEvent) => boolean;

export type RegisterGestureType = (
  gestureFn: (node: HTMLElement, params: BaseParams) => SubGestureFunctions,
  parameters: BaseParams
) => void;

function callAllByType(
  ListenerType: ListenerType,
  subGestureFunctions: SubGestureFunctions[],
  activeEvents: PointerEvent[],
  event: PointerEvent
) {
  subGestureFunctions.forEach((gesture: SubGestureFunctions) => {
    gesture[ListenerType]?.(activeEvents, event);
  });
}

export function composedGesture(
  node: HTMLElement,
  gestureCallback: GestureCallback
): SvelteAction {
  const gestureFunctions: SubGestureFunctions[] = [];

  function registerGesture(
    gestureFn: (node: HTMLElement, params: BaseParams) => SubGestureFunctions,
    parameters: BaseParams
  ) {
    const subGestureFns = gestureFn(node, { ...parameters, composed: true });
    gestureFunctions.push(subGestureFns);

    return subGestureFns;
  }

  const onMoveCallback: (
    activeEvents: PointerEvent[],
    event: PointerEvent
  ) => boolean = gestureCallback(registerGesture);

  const gestureName = 'composedGesture';

  function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
    callAllByType('onUp', gestureFunctions, activeEvents, event);
  }

  function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
    callAllByType('onDown', gestureFunctions, activeEvents, event);
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    onMoveCallback(activeEvents, event);

    return true;
  }

  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}
