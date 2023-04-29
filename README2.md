# svelte-gestures

3 KB gzipped - collection of gesture recognisers for Svelte.

## installation

`npm install svelte-gestures`

### Language tools types installation (optional)

If you use Svelte language tools (Svelte for VS Code for instance) and you would appreciate seeing return types from svelte-gestures actions `<div on:swipe={fn} >` in your markup, add following line to your `global.d.ts` :

`/// <reference types="svelte-gestures" />`

if you use svelte kit, you already have a `global.d.ts` in `src` folder. Just add this line after

`/// <reference types="@sveltejs/kit" />`

It must be done this way as language tools use global types and regular npm package cannot expose global types as long as it is used by other package.

## About

It contains the most popular gestures: `pan`, `pinch`, `press`, `rotate`, `swipe`, `tap`.

It also exposes generic event handling core, which can be extended for your own specific gesture implementation (see sourcecode how gestures are implemented).

Beside above mentioned gestures, there are two more `gesture` and `scroll` 'gestures'.

1. The `gesture` let you combine more gestures together while using just one pointer EventListener per elmenent. It also let user to switch active gestures on the fly.
2. `scroll` is custom basic implementation of scrolling for touch devices. It is needed, as by default, when a gesture mode is activated on an Element on a touch device, browser scrolling is turned off for that Element. Unfortunately the gesture mode need to be set before first touch/click is done and cannot be changed wile there are active ponters. This `scroll` is made to work with the combined `gesture`.

It uses pointer events under the hood, to make it really cross platform. Gestures will be recognized, if done by mouse, touche, stylus etc.

Recognizers are kept as simple as possible, but still providing desired basic functionality. They are made in form of svelte actions with custom event emiters. **Any number of different recognizers can be used on one element**, but it is recomended to use `gesture` for combined gestures.

## API events

Except main event, each resogniser triggers, three more events with names composed from action name (`pan` | `pinch` | `tap` | `swipe` | `rotate`) and event type (`up` | `down` | `move`).

For example `pan` action has for example `panup`, `pandown`, `panmove`. It dispatches `event.detail` with following property `{ event: PointerEvent, pointersCount: number , target:HTMLElement}`. First is native pointer event; second is number of active pointers; third is the target of the up/down/move target (it can be child of element on which a gesture is applied)

## Pan

Pan action (on:pan) fires `pan` event:

- `event.detail` object has following properties
  - `x`, `y` (x,y stand for position withing the `element` on which the action is used)
  - `target` is an EventTarget (HTMLElement) of the pan. The target is recorded when pan starts.

Pan accepts the following options

- `delay` (default values is 300ms)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

on:pan is triggered on pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter.

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
    - `x` and `y` represent coordinates in `px` of an imaginary center of the pinch gesture. They originate in top left corner of the element on which pinch is used.
  - `scale`: number. Initial scale after first two registered points is 1, then it either decreases toward zero as the points get nearer or grows up as their distance grows.

Pinch accepts following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

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

- `event.detail` object has following properties
  - `center`: {x:number; y:number;}}
    - `x` and `y` represents coordinates in `px` of an imaginary center of the rotation gesture. They originate in top left corner of the element on which rotate is used.
  - `rotation`: number. Initial rotation after first two registered points is 0, then it either decrease to -180 as the points rotate anticlockwise, or grow up 180 as they rotate clockwise.

Pinch accepts following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

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

Pinch accepts following options

- `timeframe`:number (default value is *300*ms )
- `minSwipeDistance`: number (default value is *60*px)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

Swipe is fired if preset distance in proper direction is done in preset time.

You can use the [touchAction](https://developer.mozilla.org/en/docs/Web/CSS/touch-action) parameter to control the default behaviour of the browser.

For example if you only use left/right swipe and want to keep the default browser behaviour (scrolling) for up/down swipe use `touchAction: 'pan-y'`.

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

- `event.detail` object has following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.

Pinch accepts following options

- `timeframe`:number (default value is *300*ms )
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

Tap action is fired only when the click/touch is finished within the give `timeframe`.

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

- `event.detail` object has following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

Press accepts following options

- `triggerBeforeFinished`: boolean (default value is `false`). If set to true, press event is triggered after given `timeframe`, even if user still keeps pressing (event hasn't finished).
- `timeframe`:number (default value is *300*ms )
- `spread`: number; (default value is *4*px). If user move farer than the `spread` value from the initial touch point, the event is never triggered.
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by browser and your program respectively.
- `composed` and `conditionFor` are only applicable when used inside combined `gesture`.

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

## Gesture

`gesture` is special gesture, which does not listen to any gesture of its own. It rather give you power of composing gestures together or turning off/switching gestures while gesture is recorded.

`use:gesture` accepts one option, which is a function definition:
`(register: RegisterGestureType) => (activeEvents: PointerEvent[], event: PointerEvent) => boolean`
_RegisterGestureType_ has following signature: `(gestureFn: (node: HTMLElement, params: BaseParams) => { onMove: PointerEventCallback<boolean>; onUp: PointerEventCallback<void>;  onDown: PointerEventCallback<void>;} , parameters: BaseParams) => void`

As you can see above the option function, comes with `register` callback function. By calling `register(press, {triggerBeforeFinished: true})` it will add press gesture to the composed gestures (first argument), with its own options (second argument). You can register multiple gestures thiws way. Earch of the `register` function calls return object with `onDown`, `onMove` and `onUp` properties with corresponding function callbacks. The `onDown` and `onUp` functions are executed automatically by the `gesture`, `onMove` function is not. In order to execute it when pointer is moving, you need to return a callback function from the option function, which then run all needed onMove functions. Within these callback you can apply your own logic about which gesture is executed under which condition etc. Moreover each gesture's onMove function return a boolean. Gestures which can finish while pointer is still down (`press` gesture) return `false` until the `press` event is emited. This way you can toggle between gestures based on whether press has been done successfully.

`use:gesture` does not trigger any action on its won.

The above description is quite complicated so lets check two examples.

1. In first we use `pan` gesture, but only after press gesture has been succesfully triggered; otherwise we will trigger special `scroll` gesture which mimic scrolling behavior (it is needed, because default scrolling is disabled on elements where any kind of swiping gesture is registered). The result will be, that fast swipe over the element will let user scroll thru as normal, while swipe initiated with 100ms tocuh without move, will end up with panning.
2. In second example, we will switch from panning to regular scrolling after user pan 100px down

##### Example 1 (panning or scrolling)

```html
<script lang="ts">
  import {
    press,
    pan,
    scroll,
    gesture,
    type RegisterGestureType,
    type GestureCallback,
  } from 'svelte-gestures';

  let toggle = true;
  let x;
  let y;
  let gestureEl;

  const scrollPan: GestureCallback = (register: RegisterGestureType) => {
    const pressFns = register(press, {
      triggerBeforeFinished: true,
      spread: 10,
      timeframe: 100,
    });
    const scrollFns = register(scroll, { delay: 0 });
    const panFns = register(pan, { delay: 0 });

    return (activeEvents: PointerEvent[], event: PointerEvent) => {
      pressFns.onMove(activeEvents, event)
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
  use:gesture="{scrollPan}"
  on:pan="{handler}"
  style="width:500px;height:500px;border:1px solid black;"
>
  press: {x} {y}
</div>
```

# Your own gestures

You are encouraged to define your own custom gestures. There is a `setPointerControls` function exposed by the `svelte-gestures`. It handle all the events registration/deregistration needed for handling gestures; you just need to pass callbacks in it.

```typescript
function setPointerControls(
  gestureName: string,

  node: HTMLElement,

  onMoveCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,

  onDownCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void,

  onUpCallback: (activeEvents: PointerEvent[], event: PointerEvent) => void
);
```

You can pass `null` instead of a callback if you dont need to call it in that event. In double tap example below you actually do not need any events related to move, as they are irrelevant for tapping.

See how doubletap custome gesture is implemented:

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
