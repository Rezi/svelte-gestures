import {
  getCenterOfTwoPoints,
  setPointerControls,
  DEFAULT_TOUCH_ACTION,
  type BaseParams,
  type Coord,
  type Action,
  type GestureCustomEvent,
  type SubGestureFunctions,
} from '../../shared';

export type RotateParameters = BaseParams;

export type RotatePointerEventDetail = {
  rotation: number;
  center: Coord;
  pointerType: string;
};

export type RotateCustomEvent = CustomEvent<RotatePointerEventDetail>;

function getPointersAngleDeg(activeEvents: PointerEvent[]) {
  const quadrantsMap = {
    left: { top: 360, bottom: 180 },
    right: { top: 0, bottom: 180 },
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
  const quadrantAngleBonus =
    height > 0 ? halfQuadrant.top : halfQuadrant.bottom;

  return angle + quadrantAngleBonus;
}

export const rotate: Action<
  HTMLElement,
  () => Partial<RotateParameters>,
  {
    onrotate: (e: RotateCustomEvent) => void;
    onrotatedown: (e: GestureCustomEvent) => void;
    onrotateup: (e: GestureCustomEvent) => void;
    onrotatemove: (e: GestureCustomEvent) => void;
  }
> = (node: HTMLElement, inputParameters?: () => Partial<RotateParameters>) => {
  $effect(() => {
    const { gestureName, onMove, onDown, onUp, parameters } = rotateBase(
      node,
      inputParameters?.()
    );

    return setPointerControls(
      gestureName,
      node,
      onMove,
      onDown,
      onUp,
      parameters.touchAction
    ).destroy;
  });
};

export const rotateComposition = (
  node: HTMLElement,
  inputParameters?: Partial<RotateParameters>
): SubGestureFunctions => {
  const { onMove, onDown, onUp, parameters } = rotateBase(
    node,
    inputParameters
  );

  return {
    onMove,
    onDown,
    onUp,
    plugins: parameters.plugins,
  };
};

function rotateBase(
  node: HTMLElement,
  inputParameters?: Partial<RotateParameters>
) {
  const parameters: RotateParameters = {
    touchAction: DEFAULT_TOUCH_ACTION,
    composed: false,
    ...inputParameters,
  };
  const gestureName = 'rotate';

  let prevAngle: number | undefined;
  let initAngle = 0;
  let rotationCenter: Coord;

  function onUp(activeEvents: PointerEvent[]) {
    if (activeEvents.length === 1) {
      prevAngle = undefined;
    }
  }

  function onDown(activeEvents: PointerEvent[]) {
    if (activeEvents.length === 2) {
      activeEvents = activeEvents.sort((a, b) => {
        return a.clientX - b.clientX;
      });

      rotationCenter = getCenterOfTwoPoints(node, activeEvents);
      initAngle = getPointersAngleDeg(activeEvents);
    }
  }

  function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
    if (activeEvents.length === 2) {
      const curAngle = getPointersAngleDeg(activeEvents);

      if (prevAngle !== undefined && curAngle !== prevAngle) {
        // Make sure we start at zero, doesnt matter what is the initial angle of fingers
        let rotation = curAngle - initAngle;

        // instead of showing 180 - 360, we will show negative -180 - 0
        if (rotation > 180) {
          rotation -= 360;
        }

        node.dispatchEvent(
          new CustomEvent<RotatePointerEventDetail>(gestureName, {
            detail: {
              rotation,
              center: rotationCenter,
              pointerType: event.pointerType,
            },
          })
        );
      }
      prevAngle = curAngle;
    }

    return false;
  }

  return { gestureName, onMove, onDown, onUp, parameters };
}
