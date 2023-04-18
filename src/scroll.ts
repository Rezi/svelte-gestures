import {
    DEFAULT_DELAY,
    setPointerControls,
    type SvelteAction,
    type SubGestureFunctions,
    type BaseParams,
    type PointerType,
  } from './shared';
  
  type ScrollParameters = {
    delay: number;
  } & BaseParams;
  
  type Direction = 'x' | 'y';
  type ScrollDimension = 'scrollHeight' | 'scrollWidth';
  type ClientDimension = 'clientHeight' | 'clientWidth';
  
  function isScrollMode(event: PointerEvent) {
    return event.pointerType === 'touch';
  }
  
  function getScrollParent(
    node: HTMLElement,
    direction: Direction
  ): HTMLElement | undefined {
    if (!node) {
      return undefined;
    }
  
    const isElement = node instanceof HTMLElement;
    const overflowY = isElement && window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
    const directionToDimension = { x: 'Width', y: 'Height' };
    
    if (isScrollable &&
      (node[`scroll${directionToDimension[direction]}` as ScrollDimension] >
      node[`client${directionToDimension[direction]}` as ClientDimension])
    ) {
      return node;
    } else {
      return getScrollParent(node.parentNode as HTMLElement, direction)  || document.scrollingElement as HTMLElement || document.body;
    }
  }
  
  export function scroll(
    node: HTMLElement,
    inputParameters?: Partial<ScrollParameters>
  ): SvelteAction | SubGestureFunctions {
    let parameters: ScrollParameters = {
      ...{
        delay: DEFAULT_DELAY,
        conditionFor: ['all' as PointerType],
        composed: false,
      },
      ...inputParameters,
    };
    const gestureName = 'scroll';
  
    let nearestScrollEl: {
      x: HTMLElement | undefined;
      y: HTMLElement | undefined;
    } = { x: undefined, y: undefined };
    let prevCoords: { x: number; y: number } | undefined;
    let scrollDelta: { x: number; y: number } = {
      x: 0,
      y: 0,
    };
    let scrollDirectionPositive = { x: true, y: true };
  
    function scrollElementTo(
      el: HTMLElement | undefined,
      scrollValue: number,
      direction: Direction
    ) {
      el?.scrollBy({
        [direction === 'x' ? 'left' : 'top']: scrollValue,
        behavior: 'auto',
      });
    }
  
    function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
      nearestScrollEl.y = getScrollParent(node, 'y');
      nearestScrollEl.x = getScrollParent(node, 'x');
  console.log({nearestScrollEl})
      prevCoords = undefined;
    }
  
    function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
      if (activeEvents.length === 1 && isScrollMode(event)) {
        if (prevCoords !== undefined) {
          scrollDelta.y = Math.round(prevCoords.y - event.clientY);
          scrollDelta.x = Math.round(prevCoords.x - event.clientX);
  
          nearestScrollEl.y &&
            scrollElementTo(nearestScrollEl.y, scrollDelta.y, 'y');
          nearestScrollEl.x &&
            scrollElementTo(nearestScrollEl.x, scrollDelta.x, 'x');
        }
        prevCoords = { x: event.clientX, y: event.clientY };
      }
  
      return true;
    }
  
    function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
      if (isScrollMode(event)) {
        if (scrollDelta.y || scrollDelta.x) {
          scrollDirectionPositive.y = scrollDelta.y > 0;
          scrollDirectionPositive.x = scrollDelta.x > 0;
          requestAnimationFrame(scrollOutLoop);
        }
      }
    }
  
    function scrollOutByDirection(direction: Direction) {
      if (!scrollDirectionPositive[direction] && scrollDelta[direction] < 0) {
        scrollDelta[direction] += 0.3;
      } else if (
        scrollDirectionPositive[direction] &&
        scrollDelta[direction] > 0
      ) {
        scrollDelta[direction] -= 0.3;
      } else {
        scrollDelta[direction] = 0;
      }
  
      if (scrollDelta[direction]) {
        scrollElementTo(
          nearestScrollEl[direction],
          scrollDelta[direction],
          direction
        );
        requestAnimationFrame(scrollOutLoop);
      }
    }
  
    function scrollOutLoop() {
      nearestScrollEl.x && scrollOutByDirection('x');
      nearestScrollEl.y && scrollOutByDirection('y');
    }
  
    if (parameters.composed) {
      return {
        onMove,
        onUp,
        onDown,
      };
    }
  
    return {
      ...setPointerControls(gestureName, node, onMove, onDown, onUp),
      update: (updateParameters: ScrollParameters) => {
        parameters = { ...parameters, ...updateParameters };
      },
    };
  }
  