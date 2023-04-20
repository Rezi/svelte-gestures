'use strict';

const DEFAULT_DELAY = 300; // ms
const DEFAULT_PRESS_SPREAD = 4; // px
const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
const DEFAULT_TOUCH_ACTION = 'none';
function isConditionApplied(conditionFor, event) {
  return conditionFor[0] === 'all' || conditionFor.includes(event.pointerType);
}
function addEventListener(node, event, handler) {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
}
function getCenterOfTwoPoints(node, activeEvents) {
  const rect = node.getBoundingClientRect();
  const xDistance = Math.abs(activeEvents[0].clientX - activeEvents[1].clientX);
  const yDistance = Math.abs(activeEvents[0].clientY - activeEvents[1].clientY);
  const minX = Math.min(activeEvents[0].clientX, activeEvents[1].clientX);
  const minY = Math.min(activeEvents[0].clientY, activeEvents[1].clientY);
  const centerX = minX + xDistance / 2;
  const centerY = minY + yDistance / 2;
  const x = Math.round(centerX - rect.left);
  const y = Math.round(centerY - rect.top);
  return {
    x,
    y
  };
}
function removeEvent(event, activeEvents) {
  return activeEvents.filter(activeEvent => {
    return event.pointerId !== activeEvent.pointerId;
  });
}
function dispatch(node, gestureName, event, activeEvents, actionType) {
  node.dispatchEvent(new CustomEvent(`${gestureName}${actionType}`, {
    detail: {
      event,
      pointersCount: activeEvents.length,
      target: event.target
    }
  }));
}
function setPointerControls(gestureName, node, onMoveCallback, onDownCallback, onUpCallback, touchAction = DEFAULT_TOUCH_ACTION) {
  node.style.touchAction = touchAction;
  let activeEvents = [];
  function handlePointerdown(event) {
    activeEvents.push(event);
    dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback === null || onDownCallback === void 0 ? void 0 : onDownCallback(activeEvents, event);
    const pointerId = event.pointerId;
    function onup(e) {
      if (pointerId === e.pointerId) {
        activeEvents = removeEvent(e, activeEvents);
        if (!activeEvents.length) {
          removeEventHandlers();
        }
        dispatch(node, gestureName, e, activeEvents, 'up');
        onUpCallback === null || onUpCallback === void 0 ? void 0 : onUpCallback(activeEvents, e);
      }
    }
    function removeEventHandlers() {
      removePointermoveHandler();
      removeLostpointercaptureHandler();
      removepointerupHandler();
      removepointerleaveHandler();
    }
    const removePointermoveHandler = addEventListener(node, 'pointermove', e => {
      activeEvents = activeEvents.map(activeEvent => {
        return e.pointerId === activeEvent.pointerId ? e : activeEvent;
      });
      dispatch(node, gestureName, e, activeEvents, 'move');
      onMoveCallback === null || onMoveCallback === void 0 ? void 0 : onMoveCallback(activeEvents, e);
    });
    const removeLostpointercaptureHandler = addEventListener(node, 'lostpointercapture', e => {
      onup(e);
    });
    const removepointerupHandler = addEventListener(node, 'pointerup', e => {
      onup(e);
    });
    const removepointerleaveHandler = addEventListener(node, 'pointerleave', e => {
      activeEvents = [];
      removeEventHandlers();
      dispatch(node, gestureName, e, activeEvents, 'up');
      onUpCallback === null || onUpCallback === void 0 ? void 0 : onUpCallback(activeEvents, e);
    });
  }
  const removePointerdownHandler = addEventListener(node, 'pointerdown', handlePointerdown);
  return {
    destroy: () => {
      removePointerdownHandler();
    }
  };
}
function pan(node, inputParameters) {
  let parameters = {
    delay: DEFAULT_DELAY,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
    conditionFor: ['all'],
    ...inputParameters
  };
  const gestureName = 'pan';
  let startTime;
  let target;
  function onDown(activeEvents, event) {
    startTime = Date.now();
    target = event.target;
  }
  function onMove(activeEvents, event) {
    if (activeEvents.length === 1 && Date.now() - startTime > parameters.delay) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            x,
            y,
            target
          }
        }));
      }
    }
    return true;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp: null
    };
  }
  return {
    ...setPointerControls(gestureName, node, onMove, onDown, null),
    update: updateParameters => {
      parameters = {
        ...parameters,
        ...updateParameters
      };
    }
  };
}
function getPointersDistance(activeEvents) {
  return Math.hypot(activeEvents[0].clientX - activeEvents[1].clientX, activeEvents[0].clientY - activeEvents[1].clientY);
}
function pinch(node, inputParameters) {
  const parameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    conditionFor: ['all'],
    ...inputParameters
  };
  const gestureName = 'pinch';
  let prevDistance;
  let initDistance = 0;
  let pinchCenter;
  function onUp(activeEvents) {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }
  function onDown(activeEvents) {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
      pinchCenter = getCenterOfTwoPoints(node, activeEvents);
    }
  }
  function onMove(activeEvents) {
    if (activeEvents.length === 2) {
      const curDistance = getPointersDistance(activeEvents);
      if (prevDistance !== undefined && curDistance !== prevDistance) {
        const scale = curDistance / initDistance;
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            scale,
            center: pinchCenter
          }
        }));
      }
      prevDistance = curDistance;
    }
    return true;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp: null
    };
  }
  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}
function press(node, inputParameters) {
  const parameters = {
    composed: false,
    conditionFor: ['touch'],
    timeframe: DEFAULT_DELAY,
    triggerBeforeFinished: false,
    spread: DEFAULT_PRESS_SPREAD,
    touchAction: 'auto',
    ...inputParameters
  };
  node.style.userSelect = 'none';
  node.oncontextmenu = e => {
    e.preventDefault();
  };
  const gestureName = 'press';
  let startTime;
  let clientX;
  let clientY;
  const clientMoved = {
    x: 0,
    y: 0
  };
  let timeout;
  let triggeredOnTimeout = false;
  let triggered = false;
  function onDone(eventX, eventY, event) {
    if (Math.abs(eventX - clientX) < parameters.spread && Math.abs(eventY - clientY) < parameters.spread && Date.now() - startTime > parameters.timeframe) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(eventX - rect.left);
      const y = Math.round(eventY - rect.top);
      triggered = true;
      node.dispatchEvent(new CustomEvent(gestureName, {
        detail: {
          x,
          y,
          target: event.target,
          pointerType: event.pointerType
        }
      }));
    }
  }
  function onUp(activeEvents, event) {
    clearTimeout(timeout);
    if (!triggeredOnTimeout) {
      onDone(event.clientX, event.clientY, event);
    }
  }
  function onMove(activeEvents, event) {
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;
    return !isConditionApplied(parameters.conditionFor, event) || triggered;
  }
  function onDown(activeEvents, event) {
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
  const onSharedDestroy = setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction);
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp
    };
  }
  return {
    destroy: () => {
      onSharedDestroy.destroy();
      clearTimeout(timeout);
    }
  };
}
function getPointersAngleDeg(activeEvents) {
  // instead of hell lot of conditions we use an object mapping
  const quadrantsMap = {
    left: {
      top: 360,
      bottom: 180
    },
    right: {
      top: 0,
      bottom: 180
    }
  };
  const width = activeEvents[1].clientX - activeEvents[0].clientX;
  const height = activeEvents[0].clientY - activeEvents[1].clientY;

  /*
  In quadrants 1 and 3 allworks as expected. 
  In quadrants 2 and 4, either height or width is negative,
  so we get negative angle. It is even the other of the two angles.
  As sum in triangle is 180 deg, we can simply sum the negative angle with 90 deg
  and get the right angle's positive value. Then add 90 for each quadrant above 1st.
  This way we dont need to code our own arc cotangent fn (it does not exist in JS)
  */

  const angle = Math.atan(width / height) / (Math.PI / 180);
  const halfQuadrant = width > 0 ? quadrantsMap.right : quadrantsMap.left;
  const quadrantAngleBonus = height > 0 ? halfQuadrant.top : halfQuadrant.bottom;
  return angle + quadrantAngleBonus;
}
function rotate(node, inputParameters) {
  const parameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    conditionFor: ['all'],
    ...inputParameters
  };
  const gestureName = 'rotate';
  let prevAngle;
  let initAngle = 0;
  let rotationCenter;
  function onUp(activeEvents) {
    if (activeEvents.length === 1) {
      prevAngle = undefined;
    }
  }
  function onDown(activeEvents) {
    if (activeEvents.length === 2) {
      activeEvents = activeEvents.sort((a, b) => {
        return a.clientX - b.clientX;
      });
      rotationCenter = getCenterOfTwoPoints(node, activeEvents);
      initAngle = getPointersAngleDeg(activeEvents);
    }
  }
  function onMove(activeEvents) {
    if (activeEvents.length === 2) {
      const curAngle = getPointersAngleDeg(activeEvents);
      if (prevAngle !== undefined && curAngle !== prevAngle) {
        // Make sure we start at zero, doesnt matter what is the initial angle of fingers
        let rotation = curAngle - initAngle;

        // instead of showing 180 - 360, we will show negative -180 - 0
        if (rotation > 180) {
          rotation -= 360;
        }
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            rotation,
            center: rotationCenter
          }
        }));
      }
      prevAngle = curAngle;
    }
    return true;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp
    };
  }
  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}
function swipe(node, inputParameters) {
  const parameters = {
    timeframe: DEFAULT_DELAY,
    minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    conditionFor: ['all'],
    ...inputParameters
  };
  const gestureName = 'swipe';
  let startTime;
  let clientX;
  let clientY;
  let target;
  function onDown(activeEvents, event) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    if (activeEvents.length === 1) {
      target = event.target;
    }
  }
  function onUp(activeEvents, event) {
    if (event.type === 'pointerup' && activeEvents.length === 0 && Date.now() - startTime < parameters.timeframe) {
      const x = event.clientX - clientX;
      const y = event.clientY - clientY;
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      let direction = null;
      if (absX >= 2 * absY && absX > parameters.minSwipeDistance) {
        // horizontal (by *2 we eliminate diagonal movements)
        direction = x > 0 ? 'right' : 'left';
      } else if (absY >= 2 * absX && absY > parameters.minSwipeDistance) {
        // vertical (by *2 we eliminate diagonal movements)
        direction = y > 0 ? 'bottom' : 'top';
      }
      if (direction) {
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            direction,
            target
          }
        }));
      }
    }
  }
  if (parameters.composed) {
    return {
      onMove: null,
      onDown,
      onUp
    };
  }
  return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction);
}
function callAllByType(ListenerType, subGestureFunctions, activeEvents, event) {
  subGestureFunctions.forEach(gesture => {
    var _gesture$ListenerType;
    (_gesture$ListenerType = gesture[ListenerType]) === null || _gesture$ListenerType === void 0 ? void 0 : _gesture$ListenerType.call(gesture, activeEvents, event);
  });
}
function gesture(node, gestureCallback) {
  const gestureFunctions = [];
  function registerGesture(gestureFn, parameters) {
    const subGestureFns = gestureFn(node, {
      ...parameters,
      composed: true
    });
    gestureFunctions.push(subGestureFns);
    return subGestureFns;
  }
  const onMoveCallback = gestureCallback(registerGesture);
  const gestureName = 'gesture';
  function onUp(activeEvents, event) {
    callAllByType('onUp', gestureFunctions, activeEvents, event);
  }
  function onDown(activeEvents, event) {
    callAllByType('onDown', gestureFunctions, activeEvents, event);
  }
  function onMove(activeEvents, event) {
    onMoveCallback(activeEvents, event);
    return true;
  }
  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}
function isScrollMode(event) {
  return event.pointerType === 'touch';
}
function getScrollParent(node, direction) {
  if (!node) {
    return undefined;
  }
  const isElement = node instanceof HTMLElement;
  const overflowY = isElement && window.getComputedStyle(node).overflowY;
  const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
  const directionToDimension = {
    x: 'Width',
    y: 'Height'
  };
  if (isScrollable && node[`scroll${directionToDimension[direction]}`] > node[`client${directionToDimension[direction]}`]) {
    return node;
  } else {
    return getScrollParent(node.parentNode, direction) || document.scrollingElement || document.body;
  }
}
function scroll(node, inputParameters) {
  let parameters = {
    ...{
      delay: DEFAULT_DELAY,
      touchAction: DEFAULT_TOUCH_ACTION,
      conditionFor: ['all'],
      composed: false
    },
    ...inputParameters
  };
  const gestureName = 'scroll';
  let nearestScrollEl = {
    x: undefined,
    y: undefined
  };
  let prevCoords;
  let scrollDelta = {
    x: 0,
    y: 0
  };
  let scrollDirectionPositive = {
    x: true,
    y: true
  };
  function scrollElementTo(el, scrollValue, direction) {
    el === null || el === void 0 ? void 0 : el.scrollBy({
      [direction === 'x' ? 'left' : 'top']: scrollValue,
      behavior: 'auto'
    });
  }
  function onDown(activeEvents, event) {
    nearestScrollEl.y = getScrollParent(node, 'y');
    nearestScrollEl.x = getScrollParent(node, 'x');
    console.log({
      nearestScrollEl
    });
    prevCoords = undefined;
  }
  function onMove(activeEvents, event) {
    if (activeEvents.length === 1 && isScrollMode(event)) {
      if (prevCoords !== undefined) {
        scrollDelta.y = Math.round(prevCoords.y - event.clientY);
        scrollDelta.x = Math.round(prevCoords.x - event.clientX);
        nearestScrollEl.y && scrollElementTo(nearestScrollEl.y, scrollDelta.y, 'y');
        nearestScrollEl.x && scrollElementTo(nearestScrollEl.x, scrollDelta.x, 'x');
      }
      prevCoords = {
        x: event.clientX,
        y: event.clientY
      };
    }
    return true;
  }
  function onUp(activeEvents, event) {
    if (isScrollMode(event)) {
      if (scrollDelta.y || scrollDelta.x) {
        scrollDirectionPositive.y = scrollDelta.y > 0;
        scrollDirectionPositive.x = scrollDelta.x > 0;
        requestAnimationFrame(scrollOutLoop);
      }
    }
  }
  function scrollOutByDirection(direction) {
    if (!scrollDirectionPositive[direction] && scrollDelta[direction] < 0) {
      scrollDelta[direction] += 0.3;
    } else if (scrollDirectionPositive[direction] && scrollDelta[direction] > 0) {
      scrollDelta[direction] -= 0.3;
    } else {
      scrollDelta[direction] = 0;
    }
    if (scrollDelta[direction]) {
      scrollElementTo(nearestScrollEl[direction], scrollDelta[direction], direction);
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
      onDown
    };
  }
  return {
    ...setPointerControls(gestureName, node, onMove, onDown, onUp),
    update: updateParameters => {
      parameters = {
        ...parameters,
        ...updateParameters
      };
    }
  };
}
function tap(node, inputParameters) {
  const parameters = {
    timeframe: DEFAULT_DELAY,
    composed: false,
    conditionFor: ['all'],
    touchAction: 'auto',
    ...inputParameters
  };
  const gestureName = 'tap';
  let startTime;
  let clientX;
  let clientY;
  function onUp(activeEvents, event) {
    if (Math.abs(event.clientX - clientX) < 4 && Math.abs(event.clientY - clientY) < 4 && Date.now() - startTime < parameters.timeframe) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      node.dispatchEvent(new CustomEvent(gestureName, {
        detail: {
          x,
          y,
          target: event.target
        }
      }));
    }
  }
  function onDown(activeEvents, event) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }
  if (parameters.composed) {
    return {
      onMove: null,
      onDown,
      onUp
    };
  }
  return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction);
}
exports.DEFAULT_DELAY = DEFAULT_DELAY;
exports.DEFAULT_MIN_SWIPE_DISTANCE = DEFAULT_MIN_SWIPE_DISTANCE;
exports.DEFAULT_PRESS_SPREAD = DEFAULT_PRESS_SPREAD;
exports.DEFAULT_TOUCH_ACTION = DEFAULT_TOUCH_ACTION;
exports.gesture = gesture;
exports.getCenterOfTwoPoints = getCenterOfTwoPoints;
exports.isConditionApplied = isConditionApplied;
exports.pan = pan;
exports.pinch = pinch;
exports.press = press;
exports.rotate = rotate;
exports.scroll = scroll;
exports.setPointerControls = setPointerControls;
exports.swipe = swipe;
exports.tap = tap;
