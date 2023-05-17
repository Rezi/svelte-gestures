# svelte-gestures

3 KB gzipped (you can use just part of those 3 KB) - a collection of gesture recognizers for Svelte. It can be actually used in any framework or native JS as it does not use any specific Svelte syntax at all ;)

##### New in svelte-gestures 1.5:

- New `composedGesture` lets you combine gestures. You can even use it to maintain scrolling behavior on elements with `pan` or `shapeGesture` (see example below)
- New `shapeGesture` lets you define shape/s to be recognized. Just define shapes by coordinates.
- Bugfixes

## installation

`npm install svelte-gestures`

### Language tools types installation (optional)

If you use Svelte language tools (Svelte for VS Code for instance) and you would appreciate seeing return types from svelte-gestures actions `<div on:swipe={fn} >` in your markup, add the following line to your `global.d.ts` :

`/// <reference types="svelte-gestures" />`

if you use the Svelte kit, you already have a `global.d.ts` in `src` folder. Just add this line after

`/// <reference types="@sveltejs/kit" />`

It must be done this way as language tools use global types and a regular npm package cannot expose global types as long as it is used by another package.

## About

It contains the most popular gestures: `pan`, `pinch`, `press`, `rotate`, `swipe`, `tap`. Besides that, it comes with `shapeGesture` which helps with the recognition of custom shapes declared by a set of x and y coordinates.

It also exposes a generic event handling core, which can be extended for your specific gesture implementation (see source code on how gestures are implemented).
Besides above mentioned gestures, there are two more: `composedGesture` and `scroll` gestures:

1. The `composedGesture` let you combine more gestures while using just one pointer EventListener per element. It also lets users switch active gestures on the fly.
2. `scroll` is a custom basic implementation of scrolling for touch devices. It is needed, as by default, when a gesture mode is activated on an Element on a touch device, browser scrolling is turned off for that Element. Unfortunately, the gesture mode needs to be set before the first touch/click is done and cannot be changed while there are active pointers. The `scroll` gesture is made to work with the `composedGesture`.

It uses pointer events under the hood, to make it cross-platform. Gestures will be recognized if done by mouse, touch, stylus etc.

Recognizers are kept as simple as possible but still provide desired basic functionality. They are made in the form of svelte actions with custom event emitters. **Any number of different recognizers can be used on one element**, but it is recommended to use `composedGesture` for combined gestures.

## API events

Except for the main event, each recognizer triggers, three more events with names composed of action name (`pan` | `pinch` | `tap` | `swipe` | `rotate` | `shapeGesture` | `composedGesture`) and event type (`up` | `down` | `move`).

For example `pan` action has for example `panup`, `pandown`, `panmove`. It dispatches `event.`detail` with the following property`{` event: PointerEvent, pointersCount: number , target:HTMLElement}`. First is a native pointer event; the second is the number of active pointers; third is the target Element on which the gesture started (it can be a child of the element on which a gesture is applied)

## Pan

Pan action (on:pan) fires `pan` event:

- `event.detail` object has the following properties
  - `x`, `y` (x,y stand for position within the `element`` on which the action is used)
  - `target` is an EventTarget (HTMLElement) of the pan. The target is recorded when the pan starts.

The `pan` accepts the following options

- `delay` (default value is 300ms)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

on:pan is triggered on the pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter.

[> repl Pan demo](https://svelte.dev/repl/5e8586cb44e54244948f1cd34ee379b3?version=3.38.2)

```html
<script>
  import { pan } from 'svelte-gestures';
  let x;
  let y;
  let target;

  function handler(event) {
    x = event.detail.x;
    y = event.detail.y;
    target = event.detail.target;
  }
</script>

<div
  use:pan="{{delay:300}}"
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

The `pinch` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

[> repl Pinch demo](https://svelte.dev/repl/6f6d34e2b4ab420ab4e192a5046c86b4?version=3.38.2)

```html
<script>
  import { pinch } from 'svelte-gestures';
  let scale;
  let x;
  let y;

  function handler(event) {
    scale = event.detail.scale;
    x = event.detail.center.x;
    y = event.detail.center.y;
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

The `rotate` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

[> repl Rotation demo](https://svelte.dev/repl/498077b73d384910825719cd27254f8c?version=3.38.2)

```html
<script>
  import { rotate } from 'svelte-gestures';
  let rotation;
  let x;
  let y;

  function handler(event) {
    rotation = event.detail.rotation;
    x = event.detail.center.x;
    y = event.detail.center.y;
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

The `swipe` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `minSwipeDistance`: number (default value is *60*px)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

Swipe is fired if the preset distance in the proper direction is done in the preset time.

You can use the [touchAction](https://developer.mozilla.org/en/docs/Web/CSS/touch-action) parameter to control the default behavior of the browser.

For example, if you only use left/right swipe and want to keep the default browser behavior (scrolling) for up/down swipe use `touchAction: 'pan-y'`.

[> repl Swipe demo](https://svelte.dev/repl/f696ca27e6374f2cab1691727409a31d?version=3.38.2)

```html
<script>
import { swipe } from 'svelte-gestures';
let direction;
let target;

function handler(event) {
  direction = event.detail.direction;
  target = event.detail.target;
}
</script>

<div use:swipe={{ timeframe: 300, minSwipeDistance: 60 }} on:swipe={handler} style="width:500px;height:500px;border:1px solid black;">
  direction: {direction}
</div>

```

## Tap

Tap action (on:tap) fires `tap` event:

- `event.detail` object has the following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.

The `pinch` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.

Tap action is fired only when the click/touch is finished within the given `timeframe`.

[> repl Tap demo](https://svelte.dev/repl/98ec4843c217499b9dcdd3bf47a706f0?version=3.38.2)

```html
<script>
import { tap } from 'svelte-gestures';

let x;
let y;
let target;

function handler(event) {
  x = event.detail.x;
  y = event.detail.y;
  target = event.detail.target;
}

</script>
<div use:tap={{ timeframe: 300 }} on:tap={handler} style="width:500px;height:500px;border:1px solid black;">
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

[> repl Press demo](https://svelte.dev/repl/8bef691ad59f4b2285d2b8a6df5d178a?version=3.38.2)

```html
<script>
import { press } from 'svelte-gestures';
let x;
let y;
let target;

function handler(event) {
x = event.detail.x;
y = event.detail.y;
target = event.detail.target
}
</script>
<div use:press={{ timeframe: 300, triggerBeforeFinished: false }} on:press={handler} style="width:500px;height:500px;border:1px solid black;">
  press: {x} {y}
</div>
```

## Shape gesture

ShapeGesture action (on:shapeGesture) fires `shapeGesture` event:

- `event.detail` object has the following properties
  - `score`: number. A number between 0 and 1. The higher the number is, the bigger chance that shape has been recognized.
  - `pattern`: string | null. `name` of pattern with best match. `null` in case there is no match
  - `target`: HTMLElement.

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

[> repl ShapeGesture demo](https://svelte.dev/repl/3634b5a64a74418ebb2ce35ec766a30e?version=3.59.1)

```html
<script>
  import { shapeGesture } from 'svelte-gestures';
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

  function handler(event) {
    result = event.detail;
  }
</script>

<div
  use:shapeGesture="{shapeOptions}"
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

[> repl ComposedGesture demo](https://svelte.dev/repl/bb47278283564ed08e36677d8b43186c?version=3.38.2)

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

[> repl Custom gesture (doubletap) demo](https://svelte.dev/repl/c56082d9d056460d80e53cd71efddefe?version=3.38.2)

```html
<script>
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
</script>
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
