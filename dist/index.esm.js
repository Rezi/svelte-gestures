const DEFAULT_DELAY = 300;
const DEFAULT_MIN_SWIPE_DISTANCE = 60; // in pixels

const DEFAULT_TOUCH_ACTION = 'none';

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

function dispatch(node, gestureName, event, activeEvents, pointerType) {
  node.dispatchEvent(new CustomEvent(`${gestureName}${pointerType}`, {
    detail: {
      event,
      pointersCount: activeEvents.length
    }
  }));
}

function setPointerControls(gestureName, node, onMoveCallback, onDownCallback, onUpCallback, touchAction = DEFAULT_TOUCH_ACTION) {
  node.style.touchAction = touchAction;
  let activeEvents = [];

  function handlePointerdown(event) {
    activeEvents.push(event);
    dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback?.(activeEvents, event);
    const pointerId = event.pointerId;

    function onup(e) {
      if (pointerId === e.pointerId) {
        activeEvents = removeEvent(e, activeEvents);

        if (!activeEvents.length) {
          removeEventHandlers();
        }

        dispatch(node, gestureName, e, activeEvents, 'up');
        onUpCallback?.(activeEvents, e);
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
      onMoveCallback?.(activeEvents, e);
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
      onUpCallback?.(activeEvents, e);
    });
  }

  const removePointerdownHandler = addEventListener(node, 'pointerdown', handlePointerdown);
  return {
    destroy: () => {
      removePointerdownHandler();
    }
  };
}

function pan(node, parameters = {
  delay: DEFAULT_DELAY
}) {
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
  }

  return setPointerControls(gestureName, node, onMove, onDown, null);
}

function getPointersDistance(activeEvents) {
  return Math.hypot(activeEvents[0].clientX - activeEvents[1].clientX, activeEvents[0].clientY - activeEvents[1].clientY);
}

function pinch(node) {
  const gestureName = 'pinch';
  let prevDistance = null;
  let initDistance = 0;
  let pinchCenter;

  function onUp(activeEvents) {
    if (activeEvents.length === 1) {
      prevDistance = null;
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

      if (prevDistance !== null && curDistance !== prevDistance) {
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
  }

  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}

function press(node, parameters) {
  parameters = {
    timeframe: DEFAULT_DELAY,
    triggerBeforeFinished: false,
    ...parameters
  };
  node.style.userSelect = 'none';

  node.oncontextmenu = e => {
    e.preventDefault();
  };

  const gestureName = 'press';
  let startTime;
  let clientX;
  let clientY;
  let clientMoved = {
    x: 0,
    y: 0
  };
  let timeout;
  let triggeredOnTimeout = false;

  function onUp(activeEvents, event) {
    clearTimeout(timeout);

    if (!triggeredOnTimeout) {
      onDone(event.clientX, event.clientY, event);
    }
  }

  function onMove(activeEvents, event) {
    clientMoved.x = event.clientX;
    clientMoved.y = event.clientY;
  }

  function onDown(activeEvents, event) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
    triggeredOnTimeout = false;

    if (parameters.triggerBeforeFinished) {
      timeout = setTimeout(() => {
        triggeredOnTimeout = true;
        clientMoved.x = event.clientX;
        clientMoved.y = event.clientY;
        onDone(clientMoved.x, clientMoved.y, event);
      }, parameters.timeframe + 1);
    }
  }

  function onDone(eventX, eventY, event) {
    if (Math.abs(eventX - clientX) < 4 && Math.abs(eventY - clientY) < 4 && Date.now() - startTime > parameters.timeframe) {
      const rect = node.getBoundingClientRect();
      const x = Math.round(eventX - rect.left);
      const y = Math.round(eventY - rect.top);
      node.dispatchEvent(new CustomEvent(gestureName, {
        detail: {
          x,
          y,
          target: event.target
        }
      }));
    }
  }

  const onSharedDestroy = setPointerControls(gestureName, node, onMove, onDown, onUp);
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

function rotate(node) {
  const gestureName = 'rotate';
  let prevAngle = null;
  let initAngle = 0;
  let rotationCenter;

  function onUp(activeEvents) {
    if (activeEvents.length === 1) {
      prevAngle = null;
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

      if (prevAngle !== null && curAngle !== prevAngle) {
        // Make sure we start at zero, doesnt matter what is the initial angle of fingers
        let rotation = curAngle - initAngle; // instead of showing 180 - 360, we will show negative -180 - 0

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
  }

  return setPointerControls(gestureName, node, onMove, onDown, onUp);
}

function swipe(node, parameters = {
  timeframe: DEFAULT_DELAY,
  minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
  touchAction: DEFAULT_TOUCH_ACTION
}) {
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

  return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction);
}

function tap(node, parameters = {
  timeframe: DEFAULT_DELAY
}) {
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

  return setPointerControls(gestureName, node, null, onDown, onUp);
}

export { DEFAULT_DELAY, DEFAULT_MIN_SWIPE_DISTANCE, DEFAULT_TOUCH_ACTION, getCenterOfTwoPoints, pan, pinch, press, rotate, setPointerControls, swipe, tap };
