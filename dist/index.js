'use strict';

const DEFAULT_DELAY = 300; // ms
const DEFAULT_PRESS_SPREAD = 4; // px
const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
const DEFAULT_TOUCH_ACTION = 'none';

// export type PointerType = 'mouse' | 'touch' | 'pen' | 'all';

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
    return false;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp: null
    };
  }
  return {
    ...setPointerControls(gestureName, node, onMove, onDown, null, parameters.touchAction),
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
    ...inputParameters
  };
  const gestureName = 'pinch';
  let prevDistance;
  let initDistance = 0;
  let pinchCenter;
  function onUp(activeEvents, event) {
    if (activeEvents.length === 1) {
      prevDistance = undefined;
    }
  }
  function onDown(activeEvents, event) {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
      pinchCenter = getCenterOfTwoPoints(node, activeEvents);
    }
  }
  function onMove(activeEvents, event) {
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
    return false;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp: null
    };
  }
  return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction);
}
function press(node, inputParameters) {
  const parameters = {
    composed: false,
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
    return triggered;
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
    ...inputParameters
  };
  const gestureName = 'rotate';
  let prevAngle;
  let initAngle = 0;
  let rotationCenter;
  function onUp(activeEvents, event) {
    if (activeEvents.length === 1) {
      prevAngle = undefined;
    }
  }
  function onDown(activeEvents, event) {
    if (activeEvents.length === 2) {
      activeEvents = activeEvents.sort((a, b) => {
        return a.clientX - b.clientX;
      });
      rotationCenter = getCenterOfTwoPoints(node, activeEvents);
      initAngle = getPointersAngleDeg(activeEvents);
    }
  }
  function onMove(activeEvents, event) {
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
    return false;
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp
    };
  }
  return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction);
}
function swipe(node, inputParameters) {
  const parameters = {
    timeframe: DEFAULT_DELAY,
    minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
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
function composedGesture(node, gestureCallback) {
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
  const gestureName = 'composedGesture';
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
const DEFAULT_TRESHOLD = 0.9;
const DEFAULT_NB_OF_SAMPLE_POINTS = 64;
const PHI = (Math.sqrt(5.0) - 1) / 2;
const ANGLE_RANGE_RAD = deg2Rad(45.0);
const ANGLE_PRECISION_RAD = deg2Rad(2.0);
function deg2Rad(d) {
  return d * Math.PI / 180;
}
function getDistance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function distanceAtBestAngle(pattern, points, center) {
  let fromAngleRad = -ANGLE_RANGE_RAD;
  let toAngleRad = ANGLE_RANGE_RAD;
  let angleOne = PHI * fromAngleRad + (1.0 - PHI) * toAngleRad;
  let distanceOne = distanceAtAngle(pattern, angleOne, points, center);
  let angleTwo = (1.0 - PHI) * fromAngleRad + PHI * toAngleRad;
  let distanceTwo = distanceAtAngle(pattern, angleTwo, points, center);
  while (Math.abs(toAngleRad - fromAngleRad) > ANGLE_PRECISION_RAD) {
    if (distanceOne < distanceTwo) {
      toAngleRad = angleTwo;
      angleTwo = angleOne;
      distanceTwo = distanceOne;
      angleOne = PHI * fromAngleRad + (1.0 - PHI) * toAngleRad;
      distanceOne = distanceAtAngle(pattern, angleOne, points, center);
    } else {
      fromAngleRad = angleOne;
      angleOne = angleTwo;
      distanceOne = distanceTwo;
      angleTwo = (1.0 - PHI) * fromAngleRad + PHI * toAngleRad;
      distanceTwo = distanceAtAngle(pattern, angleTwo, points, center);
    }
  }
  return Math.min(distanceOne, distanceTwo);
}
function distanceAtAngle(pattern, angle, points, center) {
  const strokePoints = rotateBy(angle, points, center);
  const d = strokePoints.reduce((accu, sPoint, i) => {
    return accu += getDistance(sPoint, pattern.points[i]);
  }, 0);
  return d / strokePoints.length;
}
function rotateBy(angle, points, center) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map(point => {
    return {
      x: (point.x - center.x) * cos - (point.y - center.y) * sin + center.x,
      y: (point.x - center.x) * sin + (point.y - center.y) * cos + center.y
    };
  });
}
function shapeDetector(inputPatterns, options = {}) {
  const threshold = options.threshold || 0;
  const NUMBER_OF_SAMPLE_POINTS = options.nbOfSamplePoints || DEFAULT_NB_OF_SAMPLE_POINTS;
  const SQUARE_SIZE = 250;
  const HALF_SQUARE_DIAGONAL = Math.sqrt(SQUARE_SIZE ** 2 + SQUARE_SIZE ** 2) / 2;
  const patterns = inputPatterns.flatMap(pattern => {
    var _pattern$allowRotatio, _pattern$bothDirectio;
    return learn(pattern.name, pattern.points, (_pattern$allowRotatio = pattern.allowRotation) !== null && _pattern$allowRotatio !== void 0 ? _pattern$allowRotatio : false, (_pattern$bothDirectio = pattern.bothDirections) !== null && _pattern$bothDirectio !== void 0 ? _pattern$bothDirectio : true);
  });
  function getStroke(points, name, allowRotation) {
    points = resample();
    const center = getCenterPoint();
    if (allowRotation) {
      points = rotateBy(-indicativeAngle(center), points, center);
    }
    points = scaleToSquare();
    points = translateToOrigin(getCenterPoint());
    return {
      name,
      points,
      center: {
        x: 0,
        y: 0
      },
      allowRotation
    };
    function resample() {
      let localDistance, q;
      let distance = 0;
      const interval = strokeLength() / (NUMBER_OF_SAMPLE_POINTS - 1);
      const newPoints = [points[0]];
      for (let i = 1; i < points.length; i++) {
        localDistance = getDistance(points[i - 1], points[i]);
        if (distance + localDistance >= interval) {
          q = {
            x: points[i - 1].x + (interval - distance) / localDistance * (points[i].x - points[i - 1].x),
            y: points[i - 1].y + (interval - distance) / localDistance * (points[i].y - points[i - 1].y)
          };
          newPoints.push(q);
          points.splice(i, 0, q);
          distance = 0;
        } else {
          distance += localDistance;
        }
      }
      if (newPoints.length === NUMBER_OF_SAMPLE_POINTS - 1) {
        newPoints.push(points[points.length - 1]);
      }
      return newPoints;
    }
    function scaleToSquare() {
      const box = {
        minX: +Infinity,
        maxX: -Infinity,
        minY: +Infinity,
        maxY: -Infinity,
        width: 0,
        height: 0
      };
      points.forEach(point => {
        box.minX = Math.min(box.minX, point.x);
        box.minY = Math.min(box.minY, point.y);
        box.maxX = Math.max(box.maxX, point.x);
        box.maxY = Math.max(box.maxY, point.y);
      });
      box.width = box.maxX - box.minX;
      box.height = box.maxY - box.minY;
      return points.map(point => {
        return {
          x: point.x * (SQUARE_SIZE / box.width),
          y: point.y * (SQUARE_SIZE / box.height)
        };
      });
    }
    function translateToOrigin(center) {
      return points.map(point => ({
        x: point.x - center.x,
        y: point.y - center.y
      }));
    }
    function getCenterPoint() {
      const centre = points.reduce((acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
      }, {
        x: 0,
        y: 0
      });
      centre.x /= points.length;
      centre.y /= points.length;
      return centre;
    }
    function indicativeAngle(center) {
      return Math.atan2(center.y - points[0].y, center.x - points[0].x);
    }
    function strokeLength() {
      let d = 0;
      for (let i = 1; i < points.length; i++) {
        d += getDistance(points[i - 1], points[i]);
      }
      return d;
    }
  }
  function detect(points, patternName = '') {
    const strokeRotated = getStroke(points, patternName, true);
    const strokeUnrotated = getStroke(points, patternName, false);
    let bestDistance = +Infinity;
    let bestPattern = null;
    let bestScore = 0;
    patterns.forEach(pattern => {
      if (pattern.name.indexOf(patternName) > -1) {
        const distance = pattern.allowRotation ? distanceAtBestAngle(pattern, strokeRotated.points, strokeRotated.center) : distanceAtAngle(pattern, 0, strokeUnrotated.points, strokeUnrotated.center);
        const score = 1.0 - distance / HALF_SQUARE_DIAGONAL;
        if (distance < bestDistance && score > threshold) {
          bestDistance = distance;
          bestPattern = pattern.name;
          bestScore = score;
        }
      }
    });
    return {
      pattern: bestPattern,
      score: bestScore
    };
  }
  function learn(name, points, allowRotation, bothDirections) {
    const response = [getStroke([...points], name, allowRotation)];
    if (bothDirections) {
      response.push(getStroke([...points.reverse()], name, allowRotation));
    }
    return response;
  }
  return {
    detect
  };
}
function shapeGesture(node, inputParameters) {
  let parameters = {
    composed: false,
    shapes: [],
    threshold: DEFAULT_TRESHOLD,
    timeframe: 1000,
    nbOfSamplePoints: DEFAULT_NB_OF_SAMPLE_POINTS,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters
  };
  const gestureName = 'shapeGesture';
  const detector = shapeDetector(parameters.shapes, {
    ...parameters
  });
  let startTime;
  let target;
  let stroke = [];
  function onDown(activeEvents, event) {
    startTime = Date.now();
    target = event.target;
    stroke = [];
  }
  function onMove(activeEvents, event) {
    if (activeEvents.length === 1) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(event.clientX - rect.left);
      const y = Math.round(event.clientY - rect.top);
      stroke.push({
        x,
        y
      });
    }
    return false;
  }
  function onUp(activeEvents, event) {
    if (stroke.length > 2 && Date.now() - startTime < parameters.timeframe) {
      const detectionResult = detector.detect(stroke);
      node.dispatchEvent(new CustomEvent(gestureName, {
        detail: {
          ...detectionResult,
          target
        }
      }));
    }
  }
  if (parameters.composed) {
    return {
      onMove,
      onDown,
      onUp
    };
  }
  return {
    ...setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction),
    update: updateParameters => {
      parameters = {
        ...parameters,
        ...updateParameters
      };
    }
  };
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
      composed: false
    },
    ...inputParameters
  };
  const gestureName = 'scroll';
  const nearestScrollEl = {
    x: undefined,
    y: undefined
  };
  let prevCoords;
  const scrollDelta = {
    x: 0,
    y: 0
  };
  const scrollDirectionPositive = {
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
    return false;
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
    ...setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction),
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
exports.composedGesture = composedGesture;
exports.getCenterOfTwoPoints = getCenterOfTwoPoints;
exports.pan = pan;
exports.pinch = pinch;
exports.press = press;
exports.rotate = rotate;
exports.scroll = scroll;
exports.setPointerControls = setPointerControls;
exports.shapeGesture = shapeGesture;
exports.swipe = swipe;
exports.tap = tap;
