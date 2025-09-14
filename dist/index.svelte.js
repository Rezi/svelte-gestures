'use strict';

const DEFAULT_DELAY = 300; // ms
const DEFAULT_PRESS_SPREAD = 4; // px
const DEFAULT_MIN_SWIPE_DISTANCE = 60; // px
const DEFAULT_TOUCH_ACTION = 'none';
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
function getEventPostionInNode(node, event) {
  const rect = node.getBoundingClientRect();
  return {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(event.clientY - rect.top)
  };
}
function getDispatchEventData(node, event, activeEvents) {
  const {
    x,
    y
  } = getEventPostionInNode(node, event);
  const eventData = {
    event,
    pointersCount: activeEvents.length,
    target: event.target,
    x,
    y,
    attachmentNode: node
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

/** Closure needed for creation of peristent state across lifetime of a gesture,
 * Gesture can be destroyed and recreated multiple times when it options change/update
 */
function createPointerControls() {
  let activeEvents = [];
  let removePointerdownHandler = () => {};
  let plugins = [];
  return {
    setPointerControls: (gestureName, node, onMoveCallback, onDownCallback, onUpCallback, touchAction = DEFAULT_TOUCH_ACTION, pluginsArg = []) => {
      node.style.touchAction = ensureArray(touchAction).join(' ');
      plugins = pluginsArg;
      plugins.forEach(plugin => {
        plugin.onInit?.(activeEvents);
      });

      // this is needed to prevent multiple event handlers being added when gesture is recreated
      if (!activeEvents.length) {
        function handlePointerdown(event) {
          activeEvents.push(event);
          const dispatchEvent = dispatch(node, gestureName, event, activeEvents, 'down');
          onDownCallback?.(activeEvents, event);
          // in case plugin options is changed we need to run them after change takes place
          setTimeout(() => {
            plugins.forEach(plugin => {
              plugin.onDown?.(dispatchEvent, activeEvents);
            });
          });
          function onup(e) {
            const activeEvenstBefore = activeEvents.length;
            activeEvents = removeEvent(e, activeEvents);
            const eventRemoved = activeEvenstBefore > activeEvents.length;
            if (eventRemoved) {
              if (!activeEvents.length) removeEventHandlers();
              const dispatchEvent = dispatch(node, gestureName, e, activeEvents, 'up');
              onUpCallback?.(activeEvents, e);
              // in case plugin options is changed we need to run them after change takes place
              setTimeout(() => {
                plugins.forEach(plugin => {
                  plugin.onUp?.(dispatchEvent, activeEvents);
                });
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
            onMoveCallback?.(activeEvents, e);
            plugins.forEach(plugin => {
              plugin.onMove?.(dispatchEvent, activeEvents);
            });
          });
          const removeLostpointercaptureHandler = addEventListener(node, 'lostpointercapture', e => {
            onup(e);
          });
          const removePointerUpHandler = addEventListener(node, 'pointerup', e => {
            onup(e);
          });
          const removePointerLeaveHandler = addEventListener(node, 'pointerleave', e => {
            onup(e);
          });
        }
        removePointerdownHandler = addEventListener(node, 'pointerdown', handlePointerdown);
      }
      return {
        destroy: () => {
          if (!activeEvents.length) {
            removePointerdownHandler();
            plugins.forEach(plugin => {
              plugin.onDestroy?.();
            });
          }
        }
      };
    }
  };
}
const ATTACHMENT_KEY = '@attach';

/** @import { Action, ActionReturn } from '../action/public' */
/** @import { Attachment } from './public' */

/**
 * Creates an object key that will be recognised as an attachment when the object is spread onto an element,
 * as a programmatic alternative to using `{@attach ...}`. This can be useful for library authors, though
 * is generally not needed when building an app.
 *
 * ```svelte
 * <script>
 * 	import { createAttachmentKey } from 'svelte/attachments';
 *
 * 	const props = {
 * 		class: 'cool',
 * 		onclick: () => alert('clicked'),
 * 		[createAttachmentKey()]: (node) => {
 * 			node.textContent = 'attached!';
 * 		}
 * 	};
 * </script>
 *
 * <button {...props}>click me</button>
 * ```
 * @since 5.29
 */
function createAttachmentKey() {
  return Symbol(ATTACHMENT_KEY);
}
const gestureName$9 = 'pan';
function usePan(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$9}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        parameters
      } = panBase(node, inputParameters?.());
      return setPointerControls(gestureName$9, node, onMove, onDown, null, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
        node.dispatchEvent(new CustomEvent(gestureName$9, {
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
    parameters
  };
}
const gestureName$8 = 'pinch';
function getPointersDistance(activeEvents) {
  return Math.hypot(activeEvents[0].clientX - activeEvents[1].clientX, activeEvents[0].clientY - activeEvents[1].clientY);
}
function usePinch(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$8}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        onUp,
        parameters
      } = pinchBase(node, inputParameters?.());
      return setPointerControls(gestureName$8, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
        node.dispatchEvent(new CustomEvent(gestureName$8, {
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
    parameters
  };
}
const gestureName$7 = 'press';
function usePress(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$7}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        onUp,
        parameters,
        clearTimeoutWrap
      } = pressBase(node, inputParameters?.());
      const onSharedDestroy = setPointerControls(gestureName$7, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins);
      return () => {
        onSharedDestroy.destroy();
        clearTimeoutWrap();
      };
    }
  };
}
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
  const initialOncontextmenu = node.oncontextmenu;
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
      node.dispatchEvent(new CustomEvent(gestureName$7, {
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
    // on touch devices, we need to prevent the context menu from showing after long press
    if (event.pointerType === 'touch') {
      node.oncontextmenu = e => {
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
  return {
    onDown,
    onMove,
    onUp,
    parameters,
    clearTimeoutWrap
  };
}
const gestureName$6 = 'rotate';
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
  const quadrantAngleBonus = height >= 0 ? halfQuadrant.top : halfQuadrant.bottom;
  return angle + quadrantAngleBonus;
}
function useRotate(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$6}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        onUp,
        parameters
      } = rotateBase(node, inputParameters?.());
      return setPointerControls(gestureName$6, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
        if (rotation < -180) rotation += 360;
        node.dispatchEvent(new CustomEvent(gestureName$6, {
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
    onMove,
    onDown,
    onUp,
    parameters
  };
}
const gestureName$5 = 'swipe';
function useSwipe(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$5}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onDown,
        onUp,
        parameters
      } = swipeBase(node, inputParameters?.());
      return setPointerControls(gestureName$5, node, null, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
        node.dispatchEvent(new CustomEvent(gestureName$5, {
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
    parameters
  };
}
const gestureName$4 = 'multiTouch';
function useMultiTouch(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$4}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onDown,
        parameters
      } = multiTouchBase(node, inputParameters?.());
      return setPointerControls(gestureName$4, node, null, onDown, null, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
const multiTouchComposition = (node, inputParameters) => {
  const {
    onDown,
    parameters
  } = multiTouchBase(node, inputParameters);
  return {
    onMove: null,
    onUp: null,
    onDown,
    plugins: parameters.plugins
  };
};
function multiTouchBase(node, inputParameters) {
  const parameters = {
    touchCount: 2,
    composed: false,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters
  };
  let touchCenter;
  let target;
  function onDown(activeEvents, event) {
    if (activeEvents.length === 1) {
      target = event.target;
    }
    if (activeEvents.length === parameters.touchCount) {
      const activeEventsForLoop = [...activeEvents, activeEvents[0]];
      const coordsSum = activeEvents.reduce((accu, activeEvent, index) => {
        touchCenter = getCenterOfTwoPoints(node, [activeEvent, activeEventsForLoop[index + 1]]);
        accu.x += touchCenter.x;
        accu.y += touchCenter.y;
        return accu;
      }, {
        x: 0,
        y: 0
      });
      const centerCoords = {
        x: Math.round(coordsSum.x / activeEvents.length),
        y: Math.round(coordsSum.y / activeEvents.length)
      };
      const coords = activeEvents.map(eventN => getEventPostionInNode(node, eventN));
      node.dispatchEvent(new CustomEvent(gestureName$4, {
        detail: {
          ...centerCoords,
          target,
          pointerType: event.pointerType,
          coords
        }
      }));
    }
    return false;
  }
  return {
    onDown,
    parameters
  };
}
const gestureName$3 = 'composedGesture';
function callAllByType(listenerType, composedGestureFnsWithPlugins, activeEvents, event, node) {
  composedGestureFnsWithPlugins.forEach(gestureWithPlugin => {
    gestureWithPlugin.fns[listenerType]?.(activeEvents, event);
    gestureWithPlugin.plugins.forEach(plugin => {
      const eventData = getDispatchEventData(node, event, activeEvents);
      plugin[listenerType]?.(eventData, activeEvents);
    });
  });
}
function useComposedGesture(gestureCallback, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [createAttachmentKey()]: node => {
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
    }
  };
}
const DEFAULT_THRESHOLD = 0.9;
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
  const patterns = inputPatterns.flatMap(pattern => learn(pattern.name, pattern.points, pattern.allowRotation ?? false, pattern.bothDirections ?? true));
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
const gestureName$2 = 'shapeGesture';
function useShapeGesture(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$2}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        onUp,
        parameters
      } = shapeGestureBase(node, inputParameters?.());
      return setPointerControls(gestureName$2, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
    threshold: DEFAULT_THRESHOLD,
    timeframe: 1000,
    nbOfSamplePoints: DEFAULT_NB_OF_SAMPLE_POINTS,
    touchAction: DEFAULT_TOUCH_ACTION,
    ...inputParameters
  };
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
      node.dispatchEvent(new CustomEvent(gestureName$2, {
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
    parameters
  };
}
const gestureName$1 = 'scroll';
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
function useScroll(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName$1}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onMove,
        onDown,
        onUp,
        parameters
      } = scrollBase(node, inputParameters?.());
      return setPointerControls(gestureName$1, node, onMove, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
    el?.scrollBy({
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
    onMove,
    onDown,
    onUp,
    parameters
  };
}
const gestureName = 'tap';
function useTap(handler, inputParameters, baseHandlers) {
  const {
    setPointerControls
  } = createPointerControls();
  return {
    ...baseHandlers,
    [`on${gestureName}`]: handler,
    [createAttachmentKey()]: node => {
      const {
        onDown,
        onUp,
        parameters
      } = tapBase(node, inputParameters?.());
      return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction, parameters.plugins).destroy;
    }
  };
}
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
    parameters
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
  let ctx = null;
  let offScreenCanvas = undefined;
  let offScreenCtx;
  let fadingRunning = false;
  let animationStepTime = Date.now();
  const pos = {
    x: undefined,
    y: undefined
  };
  function animate() {
    const fadeTime = options.fadeTime ?? fallbacks.fadeTime;
    const now = Date.now();
    const deltaTime = now - animationStepTime;
    if (deltaTime > fadeTime / 20) {
      if (ctx && offScreenCanvas && offScreenCtx && canvas) {
        offScreenCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1 - deltaTime * 3 / fadeTime;
        ctx.drawImage(offScreenCanvas, 0, 0);
        ctx.globalAlpha = 1;
        offScreenCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animationStepTime = now;
    }
    if (fadingRunning) {
      requestAnimationFrame(animate);
    }
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
      ctx.beginPath();
      ctx.lineWidth = options.lineWidth ?? fallbacks.lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = options.color ?? fallbacks.color;
      if (pos.x !== undefined && pos.y !== undefined) {
        ctx.moveTo(pos.x, pos.y);
        setPosition(e);
        ctx.lineTo(pos.x, pos.y);
      } else {
        setPosition(e);
      }
      ctx.stroke();
    }
  }
  function onInit(dispatchEvent) {
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
z-index: ${options.zIndex ?? fallbacks.zIndex};
`;
    window.document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    if (dispatchEvent) {
      setPosition(dispatchEvent.event);
    }

    // Create an off-screen canvas
    offScreenCanvas = document.createElement('canvas');
    resize();
    offScreenCtx = offScreenCanvas.getContext('2d');
    fadingRunning = true;
    animate();
  }
  function onDestroy() {
    fadingRunning = false;
    window.document.getElementById('svelte-gestures-highlight-plugin')?.remove();
    window.removeEventListener('resize', resize);
  }
  return {
    onMove: dispatchEvent => {
      draw(dispatchEvent.event);
    },
    onDown: dispatchEvent => {
      onInit(dispatchEvent);
    },
    onUp: (dispatchEvent, activeEvents) => {
      if (activeEvents.length === 0) {
        onDestroy();
      }
    },
    onDestroy: onDestroy,
    onInit: activeEvents => {
      if (activeEvents.length) {
        pos.x = undefined;
        pos.y = undefined;
        onInit();
      }
    }
  };
};
const touchPointsPlugin = options => {
  const fallbacks = {
    color: '#00ff00',
    zIndex: 1000000,
    size: 100
  };
  let wrapper = undefined;
  function onDestroy() {
    window.document.getElementById('svelte-gestures-touch-plugin')?.remove();
  }
  function rebuildWrapper(activeEvents) {
    // Reset if already running (could caused by some unexpected browser behavior)
    onDestroy();
    wrapper = window.document.createElement('div');
    wrapper.id = 'svelte-gestures-touch-plugin';
    activeEvents.forEach((event, i) => {
      const point = window.document.createElement('div');
      point.id = `svelte-gestures-touch-${i}`;
      point.style.cssText = `
position: absolute;
top: ${event.clientY - (options.size ?? fallbacks.size) / 2}px;
left: ${event.clientX - (options.size ?? fallbacks.size) / 2}px;
width: ${options.size ?? fallbacks.size}px;
height: ${options.size ?? fallbacks.size}px;
border-radius: 50%;
background-color: ${options.color ?? fallbacks.color};
`;
      wrapper?.appendChild(point);
    });
    wrapper.style.cssText = `
display: block; 
width: 100dvw;
height: 100dvh;
top: 0;
left: 0;
position: fixed;
pointer-events: none;
z-index: ${options.zIndex ?? fallbacks.zIndex};
`;
    window.document.body.appendChild(wrapper);
  }
  return {
    onMove: (dispatchEvent, activeEvents) => {
      activeEvents.forEach((event, i) => {
        const point = window.document.getElementById(`svelte-gestures-touch-${i}`);
        if (point) {
          point.style.top = `${event.clientY - (options.size ?? fallbacks.size) / 2}px`;
          point.style.left = `${event.clientX - (options.size ?? fallbacks.size) / 2}px`;
        }
      });
    },
    onDown: (dispatchEvent, activeEvents) => {
      rebuildWrapper(activeEvents);
    },
    onUp: (dispatchEvent, activeEvents) => {
      if (activeEvents.length === 0) {
        onDestroy();
      } else {
        rebuildWrapper(activeEvents);
      }
    },
    onDestroy: onDestroy
  };
};
const vibratePlugin = options => {
  const fallbacks = {
    vibrationSequence: [200] // Default vibration duration in milliseconds
  };
  options = {
    ...fallbacks,
    ...options
  };
  function onDestroy() {
    navigator?.vibrate?.([]);
  }
  return {
    onMove: () => {},
    onDown: () => {
      navigator?.vibrate?.(options.vibrationSequence);
    },
    onUp: (dispatchEvent, activeEvents) => {
      if (activeEvents.length === 0) {
        onDestroy();
      }
    },
    onDestroy: onDestroy
  };
};
exports.DEFAULT_DELAY = DEFAULT_DELAY;
exports.DEFAULT_MIN_SWIPE_DISTANCE = DEFAULT_MIN_SWIPE_DISTANCE;
exports.DEFAULT_PRESS_SPREAD = DEFAULT_PRESS_SPREAD;
exports.DEFAULT_TOUCH_ACTION = DEFAULT_TOUCH_ACTION;
exports.addEventListener = addEventListener;
exports.callAllByType = callAllByType;
exports.createPointerControls = createPointerControls;
exports.dispatch = dispatch;
exports.ensureArray = ensureArray;
exports.gestureName = gestureName$3;
exports.getCenterOfTwoPoints = getCenterOfTwoPoints;
exports.getDispatchEventData = getDispatchEventData;
exports.getEventPostionInNode = getEventPostionInNode;
exports.highlightPlugin = highlightPlugin;
exports.multiTouchComposition = multiTouchComposition;
exports.panComposition = panComposition;
exports.pinchComposition = pinchComposition;
exports.pressComposition = pressComposition;
exports.removeEvent = removeEvent;
exports.rotateComposition = rotateComposition;
exports.scrollComposition = scrollComposition;
exports.shapeGestureComposition = shapeGestureComposition;
exports.swipeComposition = swipeComposition;
exports.tapComposition = tapComposition;
exports.touchPointsPlugin = touchPointsPlugin;
exports.useComposedGesture = useComposedGesture;
exports.useMultiTouch = useMultiTouch;
exports.usePan = usePan;
exports.usePinch = usePinch;
exports.usePress = usePress;
exports.useRotate = useRotate;
exports.useScroll = useScroll;
exports.useShapeGesture = useShapeGesture;
exports.useSwipe = useSwipe;
exports.useTap = useTap;
exports.vibratePlugin = vibratePlugin;
