# svelte-gestures (5.1.0)

3 KB gzipped (you can use just part of those 3 KB) - a collection of gesture recognizers for Svelte. It can be actually used in any framework or native JS as it does not use any specific Svelte syntax at all ;)

##### New in svelte-gestures 5.1.0:

- **Only works with Svelte 5**
- Support for plugins (highlight plugin provided in the library for gesture visualization)
- There are several **breaking changes** with new API. It changes how parameters are passed to gestures. If you want to follow readme and examples for `svelte-gestures` 5.0.7 and older please follow the old [README_5.0.7.md](README_5.0.7.md)

### Migration
For migration from 5.0.7 or older please follow [CHANGELOG.md](CHANGELOG.md)

## installation

**Npm** 
`npm install svelte-gestures`

**Npm Installing from JSR**
`npx jsr add @rezi/svelte-gestures`

**Deno**
`deno add @rezi/svelte-gestures`

Svelte 4 projects should use svelte-gestures version 4, while older Svelte projects should use version 1.5.2 and lower.


## About

It contains the most popular gestures: `pan`, `pinch`, `press`, `rotate`, `swipe`, `tap`. Besides that, it comes with `shapeGesture` which helps with the recognition of custom shapes declared by a set of x and y coordinates.

Library **support additional plugins** which can add extra functionality to gestures. Currently there is highlight gesture plugin provided for gesture visualization.

It also exposes a generic event handling core, which can be extended for your specific gesture implementation (see source code on how gestures are implemented).
Besides above mentioned gestures, there are two more: `composedGesture` and `scroll` gestures:

1. The `composedGesture` let you combine more gestures while using just one pointer EventListener per element. It also lets users switch active gestures on the fly.
2. `scroll` is a custom basic implementation of scrolling for touch devices. It is needed, as by default, when a gesture mode is activated on an Element on a touch device, browser scrolling is turned off for that Element. Unfortunately, the gesture mode needs to be set before the first touch/click is done and cannot be changed while there are active pointers. The `scroll` gesture is made to work with the `composedGesture`.

It uses pointer events under the hood, to make it cross-platform. Gestures will be recognized if done by mouse, touch, stylus etc.

Recognizers are kept as simple as possible but still provide desired basic functionality. They are made in the form of svelte actions with custom event emitters. **Any number of different recognizers can be used on one element**, but it is recommended to use `composedGesture` for combined gestures.

## API events

Except for the main event, each recognizer triggers, three more events with names composed of action name (`pan` | `pinch` | `tap` | `swipe` | `rotate` | `shapeGesture` | `composedGesture`) and event type (`up` | `down` | `move`).

For example `pan` action has for example `panup`, `pandown`, `panmove`. It dispatches `event.detail` with the following property

```
{ 
  event: PointerEvent, 
  pointersCount: number , 
  target:HTMLElement,
  x: number,
  y: number,
} 
```

```html
<script lang="ts">
  import { pan, type PanCustomEvent, type GestureCustomEvent } from 'svelte-gestures';
  let x: number;
  let y: number;
  let target: EventTarget;

  function handler(event: PanCustomEvent) {
    x = event.detail.x;
    y = event.detail.y;
    target = event.detail.target;
	}

  function panDown(gestureEvent: GestureCustomEvent) {
    const { event, pointersCount, target, x, y } = gestureEvent.detail;
  }

  function panMove(gestureEvent: GestureCustomEvent) {
    console.log(gestureEvent.detail);
  }
</script>

<div
  use:pan
  on:pan={handler}
  on:pandown={panDown}
  on:panmove={panMove}
  style="width:500px;height:500px;border:1px solid black;"
></div>

```

 You can import this event type as `GestureCustomEvent`. First is a native pointer event; the second is the number of active pointers; third is the target Element on which the gesture started (it can be a child of the element on which a gesture is applied). `x` and `y` refer to coordinates within the gesture element.

## Pan

Pan action (on:pan) fires `pan` event:

- `event.detail` object has the following properties
  - `x`, `y` (x,y stand for position within the `element`` on which the action is used)
  - `target` is an EventTarget (HTMLElement) of the pan. The target is recorded when the pan starts.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `pan` accepts the following options

- `delay` (default value is 300ms)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, to leave handling of some touch actions to the browser; see [`touch-action` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action). You can pass an array, the values will be joined with spaces.
- `composed` is only applicable when used inside `composedGesture`.

on:pan is triggered on the pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter.

[> repl Pan demo](https://svelte.dev/playground/14f6d9028a57458a8d61cf4dff1f7e3f?version=5.17.0)

```html
<script lang="ts">
  import { pan, type PanCustomEvent } from 'svelte-gestures';
  let x;
  let y;
  let target;
  let pointerType;

  function handler(event: PanCustomEvent) {
    x = event.detail.x;
    y = event.detail.y;
    target = event.detail.target;
    pointerType = event.detail.pointerType;
    
  }
</script>

<div
  use:pan="{()=>({delay:300})}"
  on:pan="{handler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  pan: {x} {y}
</div>
```

## Pinch

Pinch action (on:pinch) fires `pinch` event:

- `event.detail` object has following properties
  - `center`: {x:number; y:number;}}
    - `x` and `y` represent coordinates in `px` of an imaginary center of the pinch gesture. They originate in the top left corner of the element on which pinch is used.
  - `scale`: number. The initial scale after the first two registered points is 1, then it either decreases toward zero as the points get nearer, or grow up as their distance grows.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `pinch` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

[> repl Pinch demo](https://svelte.dev/playground/39ab0a49295c404d9eb569f9e70bea8a?version=5.17.0)

```html
<script lang="ts">
  import { pinch, type PinchCustomEvent } from 'svelte-gestures';
  let scale;
  let x;
  let y;
  let pointerType;

  function handler(event: PinchCustomEvent) {
    scale = event.detail.scale;
    x = event.detail.center.x;
    y = event.detail.center.y;
    pointerType = event.detail.pointerType;
  }
</script>

<div
  use:pinch
  on:pinch="{handler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  pinch scale: {scale} <br />
  center: x {x}, y {y}
</div>
```

## Rotate

Rotate action (on:rotate) fires `rotate` event:

- `event.detail` object has the following properties
  - `center`: {x:number; y:number;}}
    - `x` and `y` represent coordinates in `px` of an imaginary center of the rotation gesture. They originate in the top left corner of the element on which rotation is used.
  - `rotation`: number. Initial rotation after the first two registered points is 0, then it either decreases to -180 as the points rotate anti-clockwise or grows up to 180 as they rotate clockwise.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `rotate` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

[> repl Rotation demo](https://svelte.dev/playground/c7e3dced77bc4ba5ae42d0689cb082fd?version=5.17.0)

```html
<script lang="ts">
  import { rotate, type RotateCustomEvent } from 'svelte-gestures';
  let rotation;
  let x;
  let y;
  let pointerType;

  function handler(event: RotateCustomEvent) {
    rotation = event.detail.rotation;
    x = event.detail.center.x;
    y = event.detail.center.y;
    pointerType = event.detail.pointerType;
  }
</script>
<div
  use:rotate
  on:rotate="{handler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  rotation: {rotation} <br />
  center: x {x}, y {y}
</div>
```

## Swipe

Swipe action (on:swipe) fires `swipe` event:

- `event.detail` object has following properties
  - `direction`: 'top' | 'right' | 'bottom' | 'left'
  - `target`: HTMLElement. The target is recorded when swipe starts.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `swipe` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `minSwipeDistance`: number (default value is *60*px)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

Swipe is fired if the preset distance in the proper direction is done in the preset time.

You can use the [touchAction](https://developer.mozilla.org/en/docs/Web/CSS/touch-action) parameter to control the default behavior of the browser.

For example, if you only use left/right swipe and want to keep the default browser behavior (scrolling) for up/down swipe use `touchAction: 'pan-y'`.

[> repl Swipe demo](https://svelte.dev/playground/024f24d276ea43a394f404d44768af37?version=5.17.0)

```html
<script lang="ts">
import { swipe, type SwipeCustomEvent } from 'svelte-gestures';
let direction;
let target;
let pointerType;

function handler(event: SwipeCustomEvent) {
  direction = event.detail.direction;
  target = event.detail.target;
  pointerType = event.detail.pointerType;
}
</script>

<div 
  use:swipe={()=>({ timeframe: 300, minSwipeDistance: 60 })} 
  on:swipe={handler} 
  style="width:500px;height:500px;border:1px solid black;">
  direction: {direction}
</div>

```

## Tap

Tap action (on:tap) fires `tap` event:

- `event.detail` object has the following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `tap` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

Tap action is fired only when the click/touch is finished within the given `timeframe`.

[> repl Tap demo](https://svelte.dev/playground/ea098032135a4101b07792adb9aaa478?version=5.17.0)

```html
<script lang="ts">
import { tap, type TapCustomEvent } from 'svelte-gestures';

let x;
let y;
let target;
let pointerType;

function handler(event: TapCustomEvent) {
  x = event.detail.x;
  y = event.detail.y;
  target = event.detail.target;
  pointerType = event.detail.pointerType;
}

</script>
<div use:tap={()=>({ timeframe: 300 })} 
  on:tap={handler} 
  style="width:500px;height:500px;border:1px solid black;">
  tap: {x} {y}
</div>
```

## Press

Press action (on:press) fires `press` event:

- `event.detail` object has the following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `press` accepts the following options

- `triggerBeforeFinished`: boolean (default value is `false`). If set to true, the press event is triggered after the given `timeframe`, even if a user still keeps pressing (event hasn't finished).
- `timeframe`:number (default value is *300*ms )
- `spread`: number; (default value is *4*px). If a user moves farther than the `spread` value from the initial touch point, the event is never triggered.
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

Press action is fired only when the click/touch is released after the given `timeframe`. Or when `triggerBeforeFinished` is set to `true`, after given `timeframe` even when click/touch continues.

[> repl Press demo](https://svelte.dev/playground/23dbd6ea91ff44efafad867864a90961?version=5.17.0)

```html
<script lang="ts">
import { press, type PressCustomEvent } from 'svelte-gestures';
let x;
let y;
let target;

function handler(event: PressCustomEvent) {
x = event.detail.x;
y = event.detail.y;
target = event.detail.target
}
</script>
<div use:press={()=>({ timeframe: 300, triggerBeforeFinished: false })} on:press={handler} style="width:500px;height:500px;border:1px solid black;">
  press: {x} {y}
</div>
```

## Shape gesture

ShapeGesture action (on:shapeGesture) fires `shapeGesture` event:

- `event.detail` object has the following properties
  - `score`: number. A number between 0 and 1. The higher the number is, the bigger chance that shape has been recognized.
  - `pattern`: string | null. `name` of pattern with best match. `null` in case there is no match
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `shapeGesture` accepts the following options

- `shapes`: `{
name: string;
points: { x: number; y: number }[];
allowRotation?: boolean (default `false`)
bothDirections?: boolean (default `true`)
}[]`
- `timeframe`:number (default value is *1000*ms ). Time within which the gesture need to be done.
- `threshold`:number (default value is 0.9 ). Possible values are between 0 and 1; The higher the threshold is the more precise the gesture needs to be drawn, to trigger the `shapeGesture` action.
- `nbOfSamplePoints`: number (default 64). The number of points the gesture is converted to before the match is done.
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

`shapeGesture` action is fired only when the click/touch is finished within the given `timeframe` and gesture similarity is above the `threshold`

##### Tips and hints

1. When defining points in a shape, beware that the coordinants system is same as for SVG. **x increases toward right** and **y increases toward bottom** !!
2. `shapeGesture` can accept more shapes at once. It's not only handy to recognize more gestures, but can be used to define more similar shapes with same `name`. For instance if you need to recognize a triangle shape, it is preferable to define several slightly different triangles with same name, rather than defining one triangle shape and lowering the `threshold`.
3. You don't need to care about scale of your shapes, they are always scaled automaticaly for gesture/shape comparison.
4. When `bothDirections` is set to false, order of points matters, even if the shape is closed (circle, suare, etc)

[> repl ShapeGesture demo](https://svelte.dev/playground/e9cb0cd0633a48988df1850f16921097?version=5.17.0)

```html
<script lang="ts">
  import { shapeGesture, type ShapeCustomEvent } from 'svelte-gestures';
  const shapeOptions = {
    threshold: 0.5,
    shapes: [
      {
        name: 'triangle',
        allowRotation: true,
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 100 },
          { x: 100, y: 0 },
          { x: 0, y: 0 },
        ],
      },
      {
        name: 'right-down',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
        ],
      },
      {
        name: 'up-right',
        bothDirections: false,
        points: [
          { x: 0, y: 100 },
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
      },
    ],
  };

  let result;

  function handler(event: ShapeCustomEvent) {
    result = event.detail;
  }
</script>

<div
  use:shapeGesture="{()=>shapeOptions}"
  on:shapeGesture="{handler}"
  style="width:500px;height:500px;background:#ddd;"
>
  {#if result?.score} There is <b>{(result.score * 100).toFixed(0)}%</b> chance
  you have drawn a <b>{result.pattern}</b> shape {/if}
</div>
```

## Composed Gesture

`composedGesture` is a special gesture, which does not listen to any gesture of its own. It rather gives you the power of composing gestures together or switching gestures while a gesture is recorded.

##### Usage

To use `composedGesture`, you need to pass a function definition to the `use:composedGesture`. The function definition should have the following signature:

- `(register: RegisterGestureType) => (activeEvents: PointerEvent[], event: PointerEvent) => boolean`

The `register` parameter is a callback function provided by `composedGesture`, and it has the following signature:

- `(gestureFn: (node: HTMLElement, params: BaseParams) => { onMove: PointerEventCallback<boolean>; onUp: PointerEventCallback<void>; onDown: PointerEventCallback<void>;}, parameters: BaseParams) => void`

Within the function body, you can call the `register` function to add different gestures to the composed gestures. The `register` function accepts two arguments: the first argument is the gesture you want to register, and the second argument is an options object for the gesture.

You can register multiple gestures using the `register` function, and each call to `register` returns an object with `onDown`, `onMove`, and `onUp` properties. The `onDown` and `onUp` functions are automatically executed by `composedGesture`, while the `onMove` function needs to be explicitly triggered by returning a callback function from the option function. This callback function should run all the necessary `onMove` functions for the gestures. You can implement your logic to determine which gesture to execute under which conditions.

##### Example: panning combined with scrolling

Let's use `pan` gesture, but only after the press gesture has been successfully triggered; otherwise, we will trigger the special `scroll` gesture which mimics the default scroll behavior (it is needed, because default scrolling need to be disabled on elements where any kind of swiping gesture is done). The result will be, that a fast swipe over the element will let the user scroll thru as normal, while a move initiated with 100ms press, will end up with panning.

[> repl ComposedGesture demo](https://svelte.dev/playground/2c6c0d305a2c40c08d97b68172ec8634?version=5.17.0)

```html
<script lang="ts">
  import {
    press,
    pan,
    scroll,
    composedGesture,
    type RegisterGestureType,
    type GestureCallback,
  } from 'svelte-gestures';

  let x;
  let y;

  const scrollPan: GestureCallback = (register: RegisterGestureType) => {
    const pressFns = register(press, {
      triggerBeforeFinished: true,
      spread: 10,
      timeframe: 100,
    });
    const scrollFns = register(scroll, { delay: 0 });
    const panFns = register(pan, { delay: 0 });

    return (activeEvents: PointerEvent[], event: PointerEvent) => {
      pressFns.onMove(activeEvents, event) || event.pointerType !== 'touch'
        ? panFns.onMove(activeEvents, event)
        : scrollFns.onMove(activeEvents, event);
    };
  };

  function handler(event) {
    x = event.detail.x;
    y = event.detail.y;
  }
</script>
<div
  use:composedGesture="{scrollPan}"
  on:pan="{handler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  press: {x} {y}
</div>
```

# Plugins

You can pass plugin as parameter to a build in gesture to enhance the gesture functionality. Currently `svelte-gestures` library provide a highlight plugin to visualize a gesture move.

In the following example the plugin options are used in form of $state which enable them to change after each use. On pan up event we simply change the highlighter color to random one.

You are encouraged to create your own plugins. Just follow the source code of the highlight gesture.

[> repl plugins demo](https://svelte.dev/playground/f02cb0b6dec94de6b0d8ce0fe75e61de?version=5.17.0)

```html

<script lang="ts">
  import { pan, type PanCustomEvent, type GestureCustomEvent, highlightPlugin } from '../gestures';
  
  let lineWidth = 8;
  
  let x = $state(0);
  let y = $state(0);
  let target: EventTarget | null = $state(null);
  
  function handler(event: PanCustomEvent) {
    x = event.detail.x;
    y = event.detail.y;
    target = event.detail.target;
  }
  
  function panUp(gestureEvent: GestureCustomEvent) {
    gesturePluginOptions = { color: getColor(), fadeTime: 500, lineWidth };
  }
  
  let gesturePluginOptions = $state({ color: '#00ff00', fadeTime: 500, lineWidth });
  
  const getColor = (): string => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  };
</script>

<div
  use:pan={() => ({ plugins: [highlightPlugin(gesturePluginOptions)] })}
  onpan={handler}
  onpanup={panUp}
  style="width:500px;height:500px;border:1px solid black;max-width:100%;"
>
  pan: {x}
  {y}
  <br />
  target: {target}
</div>



```


# Your own gestures

You are encouraged to define your own custom gestures. There is a `setPointerControls` function exposed by the `svelte-gestures`. It handles all the events registration/deregistration needed for handling gestures; you just need to pass callbacks in it.

```typescript
function setPointerControls(
  gestureName: string,
  node: HTMLElement,
  onMoveCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,
  onDownCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,
  onUpCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void
);
```

You can pass `null` instead of a callback if you don't need to call it in that event. In a double tap example below you do not need any events related to move, as they are irrelevant for tapping.

See how a doubletap custom gesture is implemented:

[> repl Custom gesture (doubletap) demo](https://svelte.dev/playground/ef570f1a05f74e7f82ec7322299118a7?version=5.17.0)

```html
<script lang="ts">
  import { setPointerControls, DEFAULT_DELAY } from 'svelte-gestures';

  let dx;
  let dy;

  function doubletapHandler(event) {
    dx = event.detail.x;
    dy = event.detail.y;
  }

  function doubletap(
    node: HTMLElement,
    parameters: { timeframe: number } = { timeframe: DEFAULT_DELAY }
  ): { destroy: () => void } {
    const gestureName = 'doubletap';
    const spread = 20;

    let startTime: number;
    let clientX: number;
    let clientY: number;
    let tapCount = 0;
    let timeout;

    function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
      if (
        Math.abs(event.clientX - clientX) < spread &&
        Math.abs(event.clientY - clientY) < spread &&
        Date.now() - startTime < parameters.timeframe
      ) {
        if (!tapCount) {
          tapCount++;
        } else {
          const rect = node.getBoundingClientRect();
          const x = Math.round(event.clientX - rect.left);
          const y = Math.round(event.clientY - rect.top);

          node.dispatchEvent(
            new CustomEvent(gestureName, {
              detail: { x, y },
            })
          );

          clearTimeout(timeout);
          tapCount = 0;
        }
      }
    }

    function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
      if (!tapCount) {
        clientX = event.clientX;
        clientY = event.clientY;
        startTime = Date.now();
      }

      timeout = setTimeout(() => {
        tapCount = 0;
      }, parameters.timeframe);
    }
    return setPointerControls(gestureName, node, null, onDown, onUp);
  }
</>
<div
  use:doubletap
  on:doubletap="{doubletapHandler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  double tap me {dx} {dy}
</div>
```

## License

[MIT](LICENSE)
