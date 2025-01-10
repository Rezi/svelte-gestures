'use strict';

const DEFAULT_DELAY = 300; // ms
const DEFAULT_PRESS_SPREAD = 4; // px
const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
const DEFAULT_TOUCH_ACTION = 'none';

// export type PointerType = 'mouse' | 'touch' | 'pen' | 'all';

//export type SvelteAction = () => void;

function ensureArray(o) {
  if (Array.isArray(o)) return o;
  return [o];
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
function callPlugins(plugins, event, activeEvents, node) {
  plugins === null || plugins === void 0 ? void 0 : plugins.forEach(plugin => {
    var _plugin$onMove;
    const eventData = getDispatchEventData(node, event, activeEvents);
    (_plugin$onMove = plugin['onMove']) === null || _plugin$onMove === void 0 ? void 0 : _plugin$onMove.call(plugin, eventData, activeEvents);
  });
}
function getDispatchEventData(node, event, activeEvents) {
  const rect = node.getBoundingClientRect();
  const x = Math.round(event.clientX - rect.left);
  const y = Math.round(event.clientY - rect.top);
  const eventData = {
    event,
    pointersCount: activeEvents.length,
    target: event.target,
    x,
    y
  };
  return eventData;
}
function dispatch(node, gestureName, event, activeEvents, actionType) {
  const eventData = getDispatchEventData(node, event, activeEvents);
  node.dispatchEvent(new CustomEvent(`${gestureName}${actionType}`, {
    detail: eventData
  }));
  return eventData;
}
function setPointerControls(gestureName, node, onMoveCallback, onDownCallback, onUpCallback, touchAction = DEFAULT_TOUCH_ACTION, plugins = []) {
  node.style.touchAction = ensureArray(touchAction).join(' ');
  let activeEvents = [];
  function handlePointerdown(event) {
    activeEvents.push(event);
    const dispatchEvent = dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback === null || onDownCallback === void 0 ? void 0 : onDownCallback(activeEvents, event);
    plugins.forEach(plugin => {
      var _plugin$onDown;
      (_plugin$onDown = plugin.onDown) === null || _plugin$onDown === void 0 ? void 0 : _plugin$onDown.call(plugin, dispatchEvent, activeEvents);
    });
    const pointerId = event.pointerId;
    function onup(e) {
      if (pointerId === e.pointerId) {
        activeEvents = removeEvent(e, activeEvents);
        if (!activeEvents.length) {
          removeEventHandlers();
        }
        const dispatchEvent = dispatch(node, gestureName, e, activeEvents, 'up');
        onUpCallback === null || onUpCallback === void 0 ? void 0 : onUpCallback(activeEvents, e);
        plugins.forEach(plugin => {
          var _plugin$onUp;
          (_plugin$onUp = plugin.onUp) === null || _plugin$onUp === void 0 ? void 0 : _plugin$onUp.call(plugin, dispatchEvent, activeEvents);
        });
      }
    }
    function removeEventHandlers() {
      removePointermoveHandler();
      removeLostpointercaptureHandler();
      removePointerUpHandler();
      removePointerLeaveHandler();
    }
    const removePointermoveHandler = addEventListener(node, 'pointermove', e => {
      activeEvents = activeEvents.map(activeEvent => {
        return e.pointerId === activeEvent.pointerId ? e : activeEvent;
      });
      const dispatchEvent = dispatch(node, gestureName, e, activeEvents, 'move');
      onMoveCallback === null || onMoveCallback === void 0 ? void 0 : onMoveCallback(activeEvents, e);
      plugins.forEach(plugin => {
        var _plugin$onMove2;
        (_plugin$onMove2 = plugin.onMove) === null || _plugin$onMove2 === void 0 ? void 0 : _plugin$onMove2.call(plugin, dispatchEvent, activeEvents);
      });
    });
    const removeLostpointercaptureHandler = addEventListener(node, 'lostpointercapture', e => {
      onup(e);
    });
    const removePointerUpHandler = addEventListener(node, 'pointerup', e => {
      onup(e);
    });
    const removePointerLeaveHandler = addEventListener(node, 'pointerleave', e => {
      activeEvents = [];
      removeEventHandlers();
      const dispatchEvent = dispatch(node, gestureName, e, activeEvents, 'up');
      onUpCallback === null || onUpCallback === void 0 ? void 0 : onUpCallback(activeEvents, e);
      plugins.forEach(plugin => {
        var _plugin$onUp2;
        (_plugin$onUp2 = plugin.onUp) === null || _plugin$onUp2 === void 0 ? void 0 : _plugin$onUp2.call(plugin, dispatchEvent, activeEvents);
      });
    });
  }
  const removePointerdownHandler = addEventListener(node, 'pointerdown', handlePointerdown);
  return {
    destroy: () => {
      removePointerdownHandler();
    }
  };
}
const pan = (node, inputParameters) => {
  $effect(() => {
    const {
      onMove,
      onDown,
      gestureName,
      parameters
    } = panBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, onMove, onDown, null, parameters.touchAction, parameters.plugins).destroy;
  });
};
const panComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    parameters
  } = panBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp: null,
    plugins: parameters.plugins
  };
};
function panBase(node, inputParameters) {
  const parameters = {
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
            target,
            pointerType: event.pointerType
          }
        }));
      }
    }
    return false;
  }
  return {
    onDown,
    onMove,
    gestureName,
    parameters
  };
}
function getPointersDistance(activeEvents) {
  return Math.hypot(activeEvents[0].clientX - activeEvents[1].clientX, activeEvents[0].clientY - activeEvents[1].clientY);
}
const pinch = (node, inputParameters) => {
  $effect(() => {
    const {
      onMove,
      onDown,
      onUp,
      gestureName,
      parameters
    } = pinchBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
  });
};
const pinchComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    parameters
  } = pinchBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp: null,
    plugins: parameters.plugins
  };
};
function pinchBase(node, inputParameters) {
  const parameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
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
  function onMove(activeEvents, event) {
    if (activeEvents.length === 2) {
      const curDistance = getPointersDistance(activeEvents);
      if (prevDistance !== undefined && curDistance !== prevDistance) {
        const scale = curDistance / initDistance;
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            scale,
            center: pinchCenter,
            pointerType: event.pointerType
          }
        }));
      }
      prevDistance = curDistance;
    }
    return false;
  }
  return {
    onMove,
    onDown,
    onUp,
    gestureName,
    parameters
  };
}
const press = (node, inputParameters) => {
  $effect(() => {
    const {
      onMove,
      onDown,
      onUp,
      parameters,
      gestureName,
      clearTimeoutWrap
    } = pressBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    const onSharedDestroy = setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction);
    return () => {
      onSharedDestroy.destroy();
      clearTimeoutWrap();
    };
  });
};
const pressComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    onUp,
    parameters
  } = pressBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins
  };
};
function pressBase(node, inputParameters) {
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
  function clearTimeoutWrap() {
    clearTimeout(timeout);
  }
  return {
    onDown,
    onMove,
    onUp,
    gestureName,
    parameters,
    clearTimeoutWrap
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
  	In quadrants 1 and 3 all works as expected. 
  In quadrants 2 and 4, either height or width is negative,
  so we get negative angle. It is even the other of the two angles.
  As sum in triangle is 180 deg, we can simply sum the negative angle with 90 deg
  and get the right angle's positive value. Then add 90 for each quadrant above 1st.
  This way we don't need to code our own arc cotangent fn (it does not exist in JS)
  	*/

  const angle = Math.atan(width / height) / (Math.PI / 180);
  const halfQuadrant = width > 0 ? quadrantsMap.right : quadrantsMap.left;
  const quadrantAngleBonus = height > 0 ? halfQuadrant.top : halfQuadrant.bottom;
  return angle + quadrantAngleBonus;
}
const rotate = (node, inputParameters) => {
  $effect(() => {
    const {
      gestureName,
      onMove,
      onDown,
      onUp,
      parameters
    } = rotateBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction).destroy;
  });
};
const rotateComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    onUp,
    parameters
  } = rotateBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins
  };
};
function rotateBase(node, inputParameters) {
  const parameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
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
            center: rotationCenter,
            pointerType: event.pointerType
          }
        }));
      }
      prevAngle = curAngle;
    }
    return false;
  }
  return {
    gestureName,
    onMove,
    onDown,
    onUp,
    parameters
  };
}
const swipe = (node, inputParameters) => {
  $effect(() => {
    const {
      onDown,
      onUp,
      parameters,
      gestureName
    } = swipeBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction).destroy;
  });
};
const swipeComposition = (node, inputParameters) => {
  const {
    onDown,
    onUp,
    parameters
  } = swipeBase(node, inputParameters);
  return {
    onMove: null,
    onDown,
    onUp,
    plugins: parameters.plugins
  };
};
function swipeBase(node, inputParameters) {
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
            target,
            pointerType: event.pointerType
          }
        }));
      }
    }
  }
  return {
    onDown,
    onUp,
    parameters,
    gestureName
  };
}
function callAllByType(listenerType, composedGestureFnsWithPlugins, activeEvents, event, node) {
  composedGestureFnsWithPlugins.forEach(gestureWithPlugin => {
    var _gestureWithPlugin$fn, _gestureWithPlugin$fn2;
    (_gestureWithPlugin$fn = (_gestureWithPlugin$fn2 = gestureWithPlugin.fns)[listenerType]) === null || _gestureWithPlugin$fn === void 0 ? void 0 : _gestureWithPlugin$fn.call(_gestureWithPlugin$fn2, activeEvents, event);
    gestureWithPlugin.plugins.forEach(plugin => {
      var _plugin$listenerType;
      const eventData = getDispatchEventData(node, event, activeEvents);
      (_plugin$listenerType = plugin[listenerType]) === null || _plugin$listenerType === void 0 ? void 0 : _plugin$listenerType.call(plugin, eventData, activeEvents);
    });
  });
}
const composedGesture = (node, gestureCallback) => {
  $effect(() => {
    const gestureFunctionsWithPlugins = [];
    function registerGesture(gestureFn, parameters) {
      const subGestureFns = gestureFn(node, {
        ...parameters,
        composed: true
      });
      gestureFunctionsWithPlugins.push({
        fns: subGestureFns,
        plugins: parameters.plugins || []
      });
      return subGestureFns;
    }
    const onMoveCallback = gestureCallback(registerGesture, node);
    const gestureName = 'composedGesture';
    function onUp(activeEvents, event) {
      callAllByType('onUp', gestureFunctionsWithPlugins, activeEvents, event, node);
    }
    function onDown(activeEvents, event) {
      callAllByType('onDown', gestureFunctionsWithPlugins, activeEvents, event, node);
    }
    function onMove(activeEvents, event) {
      onMoveCallback(activeEvents, event);
      return true;
    }
    return setPointerControls(gestureName, node, onMove, onDown, onUp).destroy;
  });
};
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
const shapeGesture = (node, inputParameters) => {
  $effect(() => {
    const {
      onMove,
      onDown,
      onUp,
      parameters,
      gestureName
    } = shapeGestureBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction).destroy;
  });
};
const shapeGestureComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    onUp,
    parameters
  } = shapeGestureBase(node, inputParameters);
  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins
  };
};
function shapeGestureBase(node, inputParameters) {
  const parameters = {
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
          target,
          pointerType: event.pointerType
        }
      }));
    }
  }
  return {
    onDown,
    onMove,
    onUp,
    gestureName,
    parameters
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
const scroll = (node, inputParameters) => {
  $effect(() => {
    const {
      gestureName,
      onMove,
      onDown,
      onUp,
      parameters
    } = scrollBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, onMove, onDown, onUp, parameters.touchAction).destroy;
  });
};
const scrollComposition = (node, inputParameters) => {
  const {
    onMove,
    onDown,
    onUp,
    parameters
  } = scrollBase(node, inputParameters);
  return {
    onMove,
    onUp,
    onDown,
    plugins: parameters.plugins
  };
};
function scrollBase(node, inputParameters) {
  const parameters = {
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
  function onDown() {
    nearestScrollEl.y = getScrollParent(node, 'y');
    nearestScrollEl.x = getScrollParent(node, 'x');
    prevCoords = undefined;
  }
  function onMove(activeEvents, event) {
    if (activeEvents.length === 1 && isScrollMode(event)) {
      if (prevCoords !== undefined) {
        scrollDelta.y = Math.round(prevCoords.y - event.clientY);
        scrollDelta.x = Math.round(prevCoords.x - event.clientX);
        if (nearestScrollEl.y) {
          scrollElementTo(nearestScrollEl.y, scrollDelta.y, 'y');
        }
        if (nearestScrollEl.x) {
          scrollElementTo(nearestScrollEl.x, scrollDelta.x, 'x');
        }
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
    if (nearestScrollEl.x) {
      scrollOutByDirection('x');
    }
    if (nearestScrollEl.y) {
      scrollOutByDirection('y');
    }
  }
  return {
    gestureName,
    onMove,
    onDown,
    onUp,
    parameters
  };
}
const tap = (node, inputParameters) => {
  $effect(() => {
    const {
      onDown,
      onUp,
      parameters,
      gestureName
    } = tapBase(node, inputParameters === null || inputParameters === void 0 ? void 0 : inputParameters());
    return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction).destroy;
  });
};
const tapComposition = (node, inputParameters) => {
  const {
    onDown,
    onUp,
    parameters
  } = tapBase(node, inputParameters);
  return {
    onMove: null,
    onDown,
    onUp,
    plugins: parameters.plugins
  };
};
function tapBase(node, inputParameters) {
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
          target: event.target,
          pointerType: event.pointerType
        }
      }));
    }
  }
  function onDown(activeEvents, event) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }
  return {
    onDown,
    onUp,
    parameters,
    gestureName
  };
}
const highlightPlugin = options => {
  const fallbacks = {
    color: '#00ff00',
    fadeTime: 1000,
    zIndex: 1000000,
    lineWidth: 4
  };
  let canvas = undefined;
  let ctx;
  let offScreenCanvas = undefined;
  let offScreenCtx;
  let fadingRunning = false;
  let animationStepTime = Date.now();
  const pos = {
    x: 0,
    y: 0
  };
  function animate() {
    const now = Date.now();
    const deltaTime = now - animationStepTime;
    if (deltaTime > 100) {
      if (ctx && offScreenCanvas && offScreenCtx && canvas) {
        var _options$fadeTime;
        offScreenCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1 - deltaTime * 3 / ((_options$fadeTime = options.fadeTime) !== null && _options$fadeTime !== void 0 ? _options$fadeTime : fallbacks.fadeTime);
        ctx.drawImage(offScreenCanvas, 0, 0);
        ctx.globalAlpha = 1;
        offScreenCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animationStepTime = now;
    }
    if (fadingRunning) requestAnimationFrame(animate);
  }
  function setPosition(e) {
    pos.x = e.x;
    pos.y = e.y;
  }
  function resize() {
    if (ctx && offScreenCanvas && canvas) {
      ctx.canvas.width = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      offScreenCanvas.width = canvas.width;
      offScreenCanvas.height = canvas.height;
    }
  }
  function draw(e) {
    if (ctx) {
      var _options$lineWidth, _options$color;
      ctx.beginPath();
      ctx.lineWidth = (_options$lineWidth = options.lineWidth) !== null && _options$lineWidth !== void 0 ? _options$lineWidth : fallbacks.lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = (_options$color = options.color) !== null && _options$color !== void 0 ? _options$color : fallbacks.color;
      ctx.moveTo(pos.x, pos.y);
      setPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }
  function onDestroy() {
    var _window$document$getE;
    fadingRunning = false;
    (_window$document$getE = window.document.getElementById('svelte-gestures-highlight-plugin')) === null || _window$document$getE === void 0 ? void 0 : _window$document$getE.remove();
    window.removeEventListener('resize', resize);
  }
  return {
    onMove: dispatchEvent => {
      draw(dispatchEvent.event);
    },
    onDown: dispatchEvent => {
      var _options$zIndex;
      // Reset if already running (could caused by some unexpected browser behavior)
      onDestroy();
      canvas = window.document.createElement('canvas');
      canvas.id = 'svelte-gestures-highlight-plugin';
      ctx = canvas.getContext('2d');
      canvas.style.cssText = `
display: block; 
width: 100dvw;
height: 100dvh;
top: 0;
left: 0;
position: fixed;
pointer-events: none;
z-index: ${(_options$zIndex = options.zIndex) !== null && _options$zIndex !== void 0 ? _options$zIndex : fallbacks.zIndex};
`;
      window.document.body.appendChild(canvas);
      window.addEventListener('resize', resize);
      setPosition(dispatchEvent.event);

      // Create an off-screen canvas
      offScreenCanvas = document.createElement('canvas');
      resize();
      offScreenCtx = offScreenCanvas.getContext('2d');
      fadingRunning = true;
      animate();
    },
    onUp: onDestroy
  };
};
exports.DEFAULT_DELAY = DEFAULT_DELAY;
exports.DEFAULT_MIN_SWIPE_DISTANCE = DEFAULT_MIN_SWIPE_DISTANCE;
exports.DEFAULT_PRESS_SPREAD = DEFAULT_PRESS_SPREAD;
exports.DEFAULT_TOUCH_ACTION = DEFAULT_TOUCH_ACTION;
exports.callPlugins = callPlugins;
exports.composedGesture = composedGesture;
exports.getCenterOfTwoPoints = getCenterOfTwoPoints;
exports.getDispatchEventData = getDispatchEventData;
exports.highlightPlugin = highlightPlugin;
exports.pan = pan;
exports.panComposition = panComposition;
exports.pinch = pinch;
exports.pinchComposition = pinchComposition;
exports.press = press;
exports.pressComposition = pressComposition;
exports.rotate = rotate;
exports.rotateComposition = rotateComposition;
exports.scroll = scroll;
exports.scrollComposition = scrollComposition;
exports.setPointerControls = setPointerControls;
exports.shapeGesture = shapeGesture;
exports.shapeGestureComposition = shapeGestureComposition;
exports.swipe = swipe;
exports.swipeComposition = swipeComposition;
exports.tap = tap;
exports.tapComposition = tapComposition;
