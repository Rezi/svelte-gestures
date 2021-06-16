const DEFAULT_DELAY = 300;
const DEFAULT_MIN_SWIPE_DISTANCE = 100; // in pixels

function addEventListener(node, event, handler) {
  node.addEventListener(event, handler);
  return () => node.removeEventListener(event, handler);
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

function setPointerControls(gestureName, node, onMoveCallback, onDownCallback, onUpCallback) {
  node.style.touchAction = 'none';
  let activeEvents = [];

  function handlePointerdown(event) {
    activeEvents.push(event);
    dispatch(node, gestureName, event, activeEvents, 'down');
    onDownCallback === null || onDownCallback === void 0 ? void 0 : onDownCallback(activeEvents, event);
    const removePointermoveHandler = addEventListener(node, 'pointermove', event => {
      activeEvents = activeEvents.map(activeEvent => {
        return event.pointerId === activeEvent.pointerId ? event : activeEvent;
      });
      dispatch(node, gestureName, event, activeEvents, 'move');
      onMoveCallback === null || onMoveCallback === void 0 ? void 0 : onMoveCallback(activeEvents, event);
    });
    const removePointerupHandler = addEventListener(node, 'pointerup', event => {
      activeEvents = removeEvent(event, activeEvents);

      if (!activeEvents.length) {
        removePointermoveHandler();
        removePointerupHandler();
      }

      dispatch(node, gestureName, event, activeEvents, 'up');
      onUpCallback === null || onUpCallback === void 0 ? void 0 : onUpCallback(activeEvents, event); // onMoveCallback?.(activeEvents, event);
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

  function onDown() {
    startTime = Date.now();
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
            y
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

  function onUp(activeEvents) {
    if (activeEvents.length === 1) {
      prevDistance = null;
    }
  }

  function onDown(activeEvents) {
    if (activeEvents.length === 2) {
      initDistance = getPointersDistance(activeEvents);
    }
  }

  function onMove(activeEvents) {
    if (activeEvents.length === 2) {
      const curDistance = getPointersDistance(activeEvents);

      if (prevDistance !== null && curDistance !== prevDistance) {
        const scale = curDistance / initDistance;
        node.dispatchEvent(new CustomEvent(gestureName, {
          detail: {
            scale
          }
        }));
      }

      prevDistance = curDistance;
    }
  }

  return setPointerControls(gestureName, node, onMove, onDown, onUp);
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
            rotation
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
  minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE
}) {
  const gestureName = 'swipe';
  let startTime;
  let clientX;
  let clientY;

  function onDown(activeEvents, event) {
    clientX = event.clientX;
    clientY = event.clientY;
    startTime = Date.now();
  }

  function onUp(activeEvents, event) {
    if (activeEvents.length === 0 && Date.now() - startTime < parameters.timeframe) {
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
            direction
          }
        }));
      }
    }
  }

  return setPointerControls(gestureName, node, null, onDown, onUp);
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
          y
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

export { DEFAULT_DELAY, DEFAULT_MIN_SWIPE_DISTANCE, pan, pinch, rotate, setPointerControls, swipe, tap };
