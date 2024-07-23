import { DOMAttributes } from 'svelte/elements';
import { PanPointerEventDetail } from './src/pan';
import { PinchPointerEventDetail } from './src/pinch';
import { PressPointerEventDetail } from './src/press';
import { RotatePointerEventDetail } from './src/rotate';
import { ShapePointerEventDetail } from './src/shapeGesture';
import { GestureCustomEvent } from './src/shared';
import { SwipePointerEventDetail } from './src/swipe';
import { TapPointerEventDetail } from './src/tap';

declare module 'svelte/elements' {
  // allows for more granular control over what element to add the typings to
  export interface DOMAttributes<T> {
    'on:pan'?: (event: CustomEvent<PanPointerEventDetail>) => void;
    'on:panup'?: (event: GestureCustomEvent) => void;
    'on:pandown'?: (event: GestureCustomEvent) => void;
    'on:panmove'?: (event: GestureCustomEvent) => void;
    'on:pinch'?: (event: CustomEvent<PinchPointerEventDetail>) => void;
    'on:pinchup'?: (event: GestureCustomEvent) => void;
    'on:pinchdown'?: (event: GestureCustomEvent) => void;
    'on:pinchmove'?: (event: GestureCustomEvent) => void;
    'on:rotate'?: (event: CustomEvent<RotatePointerEventDetail>) => void;
    'on:rotateup'?: (event: GestureCustomEvent) => void;
    'on:rotatedown'?: (event: GestureCustomEvent) => void;
    'on:rotatemove'?: (event: GestureCustomEvent) => void;
    'on:swipe'?: (event: CustomEvent<SwipePointerEventDetail>) => void;
    'on:swipeup'?: (event: GestureCustomEvent) => void;
    'on:swipedown'?: (event: GestureCustomEvent) => void;
    'on:swipemove'?: (event: GestureCustomEvent) => void;
    'on:tap'?: (event: CustomEvent<TapPointerEventDetail>) => void;
    'on:tapup'?: (event: GestureCustomEvent) => void;
    'on:tapdown'?: (event: GestureCustomEvent) => void;
    'on:tapmove'?: (event: GestureCustomEvent) => void;
    'on:press'?: (event: CustomEvent<PressPointerEventDetail>) => void;
    'on:pressup'?: (event: GestureCustomEvent) => void;
    'on:pressdown'?: (event: GestureCustomEvent) => void;
    'on:pressmove'?: (event: GestureCustomEvent) => void;
    'on:shapeGesture'?: (event: CustomEvent<ShapePointerEventDetail>) => void;
    'on:shapeGestureup'?: (event: GestureCustomEvent) => void;
    'on:shapeGesturedown'?: (event: GestureCustomEvent) => void;
    'on:shapeGesturemove'?: (event: GestureCustomEvent) => void;
    onpan?: (event: CustomEvent<PanPointerEventDetail>) => void;
    onpanup?: (event: GestureCustomEvent) => void;
    onpandown?: (event: GestureCustomEvent) => void;
    onpanmove?: (event: GestureCustomEvent) => void;
    onpinch?: (event: CustomEvent<PinchPointerEventDetail>) => void;
    onpinchup?: (event: GestureCustomEvent) => void;
    onpinchdown?: (event: GestureCustomEvent) => void;
    onpinchmove?: (event: GestureCustomEvent) => void;
    onrotate?: (event: CustomEvent<RotatePointerEventDetail>) => void;
    onrotateup?: (event: GestureCustomEvent) => void;
    onrotatedown?: (event: GestureCustomEvent) => void;
    onrotatemove?: (event: GestureCustomEvent) => void;
    onswipe?: (event: CustomEvent<SwipePointerEventDetail>) => void;
    onswipeup?: (event: GestureCustomEvent) => void;
    onswipedown?: (event: GestureCustomEvent) => void;
    onswipemove?: (event: GestureCustomEvent) => void;
    ontap?: (event: CustomEvent<TapPointerEventDetail>) => void;
    ontapup?: (event: GestureCustomEvent) => void;
    ontapdown?: (event: GestureCustomEvent) => void;
    ontapmove?: (event: GestureCustomEvent) => void;
    onpress?: (event: CustomEvent<PressPointerEventDetail>) => void;
    onpressup?: (event: GestureCustomEvent) => void;
    onpressdown?: (event: GestureCustomEvent) => void;
    onpressmove?: (event: GestureCustomEvent) => void;
    onshapeGesture?: (event: CustomEvent<ShapePointerEventDetail>) => void;
    onshapeGestureup?: (event: GestureCustomEvent) => void;
    onshapeGesturedown?: (event: GestureCustomEvent) => void;
    onshapeGesturemove?: (event: GestureCustomEvent) => void;
  }
}

export {};
