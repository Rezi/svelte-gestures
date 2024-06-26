import { PanPointerEventDetail } from './src/pan';
import { PinchPointerEventDetail } from './src/pinch';
import { PressPointerEventDetail } from './src/press';
import { RotatePointerEventDetail } from './src/rotate';
import { ShapePointerEventDetail } from './src/shapeGesture';
import { GestureCustomEvent } from './src/shared';
import { SwipePointerEventDetail } from './src/swipe';
import { TapPointerEventDetail } from './src/tap';

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:pan'?: (
      event: CustomEvent<{ x: number; y: number; target: EventTarget & T }>
    ) => void;
    'on:panup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pandown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:panmove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pinch'?: (event: CustomEvent<PinchPointerEventDetail>) => void;
    'on:pinchup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pinchdown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pinchmove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:rotate'?: (event: CustomEvent<RotatePointerEventDetail>) => void;
    'on:rotateup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:rotatedown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:rotatemove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:swipe'?: (event: CustomEvent<SwipePointerEventDetail>) => void;
    'on:swipeup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:swipedown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:swipemove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:tap'?: (event: CustomEvent<TapPointerEventDetail>) => void;
    'on:tapup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:tapdown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:tapmove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:press'?: (event: CustomEvent<PressPointerEventDetail>) => void;
    'on:pressup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pressdown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:pressmove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:shapeGesture'?: (event: CustomEvent<ShapePointerEventDetail>) => void;
    'on:shapeGestureup'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:shapeGesturedown'?: (event: CustomEvent<GestureCustomEvent>) => void;
    'on:shapeGesturemove'?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpan?: (
      event: CustomEvent<{ x: number; y: number; target: EventTarget & T }>
    ) => void;
    onpanup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpandown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpanmove?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpinch?: (event: CustomEvent<PinchPointerEventDetail>) => void;
    onpinchup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpinchdown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpinchmove?: (event: CustomEvent<GestureCustomEvent>) => void;
    onrotate?: (event: CustomEvent<RotatePointerEventDetail>) => void;
    onrotateup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onrotatedown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onrotatemove?: (event: CustomEvent<GestureCustomEvent>) => void;
    onswipe?: (event: CustomEvent<SwipePointerEventDetail>) => void;
    onswipeup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onswipedown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onswipemove?: (event: CustomEvent<GestureCustomEvent>) => void;
    ontap?: (event: CustomEvent<TapPointerEventDetail>) => void;
    ontapup?: (event: CustomEvent<GestureCustomEvent>) => void;
    ontapdown?: (event: CustomEvent<GestureCustomEvent>) => void;
    ontapmove?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpress?: (event: CustomEvent<PressPointerEventDetail>) => void;
    onpressup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpressdown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onpressmove?: (event: CustomEvent<GestureCustomEvent>) => void;
    onshapeGesture?: (event: CustomEvent<ShapePointerEventDetail>) => void;
    onshapeGestureup?: (event: CustomEvent<GestureCustomEvent>) => void;
    onshapeGesturedown?: (event: CustomEvent<GestureCustomEvent>) => void;
    onshapeGesturemove?: (event: CustomEvent<GestureCustomEvent>) => void;
  }
}
