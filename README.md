# svelte-gestures

1.5 KB gzipped - collection of gesture recognisers for Svelte.

## installation

`npm install svelte-gestures`

### Language tools types installation (optional)

If you use Svelte language tools (Svelte for VS Code for instance) and you would appreciate seeing return types from svelte-gestures actions `<div on:swipe={fn} >` in your markup, add following line to your `global.d.ts` :

`/// <reference types="svelte-gestures" />`

if you use svelte kit, you already have a `global.d.ts` in `src` folder. Just add this line after
`/// <reference types="@sveltejs/kit" />`

It must be done this way as language tools use global types and regular npm package cannot expose global types as long as it is used by other package.

## About

It contains the most popular gestures: `pan`, `pinch`, `press`, `rotate`, `swipe`, `tap`. It also exposes generic event handling core, which can be extended for your own specific gesture implementation (see sourcecode how gestures are implemented).

It uses pointer events under the hood, to make it really cross platform. Gestures will be recognized, if done by mouse, touche, stylus etc.

Recognizers are kept as simple as possible, but still providing desired basic functionality. They are made in form of svelte actions with custom event emiters. **Any number of different recognizers can be used on one element**.

## API events

Except main event, each resogniser triggers, three more events with names composed from action name (`pan` | `pinch` | `tap` | `swipe` | `rotate`) and event type (`up` | `down` | `move`).

For example `pan` action has for example `panup`, `pandown`, `panmove`. It dispatches `event.detail` with following property `{ event: PointerEvent, pointersCount: number }`. First is native pointer event, second is number of active pointers.

## Pan

Pan action fires `pan` event: `event.detail` has `x`, `y` and `target` properties (x,y stand for position withing the `element` on which the action is used). `target` is an EventTarget (HTMLElement) of the pan. The target is recorded when pan starts.

It is triggered on pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter. The `delay` parameter is optional. If used it overwrites 300ms default value. It prevents triggering of tap or swipe gestures when combined on single element.

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

Pinch action fires `pinch` event: `event.detail` with properties `{scale:number; center: {x:number; y:number;}}`. Initial scale after first two registered points is 1, then it either decrease toward zero as the points get nearer, or grow up as their distance grows.

`x` and `y` represents coordinates in `px` of an imaginary center of the pinch gesture. They originate in top left corner of the element on which pinch is used.

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

Rotate action fires `rotate` event: `event.detail`. with properties`{rotation:number; center: {x:number;y:number;}}`. Initial rotation after first two registered points is 0, then it either decrease to -180 as the points rotate anticlockwise, or grow up 180 as they rotate clockwise.

`x` and `y` represents coordinates in `px` of an imaginary center of the rotation gesture. They originate in top left corner of the element on which rotate is used.

`event.detail.rotation` represents angle between -180 and 180 degrees.

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

Swipe action fires `swipe` event: `event.detail`. With properties `direction` and target. `target` is an EventTarget (HTMLElement) of the swipe action. The target is recorded when swipe starts.
It accepts props as parameter: `{ timeframe: number; minSwipeDistance: number; touchAction: string }` with default values 300ms, 60px and `none`.
Swipe is fired if preset distance in proper direction is done in preset time.
You can use the [touchAction](https://developer.mozilla.org/en/docs/Web/CSS/touch-action) parameter to control the default behaviour of the browser.
For example if you only use left/right swipe and want to keep the default browser behaviour (scrolling) for up/down swipe use `touchAction: 'pan-y'`.

`event.detail.direction` represents direction of swipe: 'top' | 'right' | 'bottom' | 'left'

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

Tap action fires `tap` event: `event.detail` has `x`, `y` and `target` properties (x,y stand for position withing the `element` on which the action is used). `target` is an EventTarget (HTMLElement) of the tap.

Tap action is fired only when the click/touch is finished within the give `timeframe`, the parameter is optional and overwrites defalut value of 300ms.

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

Press action fires `press` event: `event.detail` has `x`, `y`, `target` properties (x,y stand for position withing the `element` on which the action is used). `target` is an EventTarget (HTMLElement) of the press.

Press action is fired only when the click/touch is finished after the give `timeframe`, the parameter is optional and overwrites defalut value of 300ms.

Another option is `triggerBeforeFinished`. By default it is set to `false`. If set to true, press event is triggered after given `timeframe`, even if user still keeps pressing (event hasn't finished).

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

# Custom gestures

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
