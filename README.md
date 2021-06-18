# svelte-gestures

1.5 KB gzipped - collection of gesture recognisers for Svelte.

It contains the most popular gestures: `pan`, `pinch`, `rotate`, `swipe`, `tap`. It also exposes generic event handling core, which can be extended for your own specific gesture implementation (see sourcecode how gestures are implemented).

It uses pointer events under the hood, to make it really cross platform. Gestures will be recognized, if done by mouse, touche, stylus etc.

Recognizers are kept as simple as possible, but still providing desired basic functionality. They are made in form of svelte actions with custom event emiters. **Any number of different recognizers can be used on one element**.

## API events

Except main event, each resogniser triggers, three more events with names composed from action name (`pan` | `pinch` | `tap` | `swipe` | `rotate`) and event type (`up` | `down` | `move`). 

For example `pan` action has for example `panup`, `pandown`, `panmove`. It dispatches `event.detail` with following property `{ event: PointerEvent, pointersCount: number }`. First is native pointer event, second is number of active pointers.

## Pan

Pan action fires `pan` event: `event.detail` has `x` and `y` properties (x,y stand for position withing the `element` on which the action is used).

It is triggered on pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter. The `delay` parameter is optional. If used it overwrites 300ms default value. It prevents triggering of tap or swipe gestures when combined on single element.

[> repl Pan demo](https://svelte.dev/repl/5e8586cb44e54244948f1cd34ee379b3?version=3.38.2)

```html
<script>
  import { pan } from 'svelte-gestures';
  let x;
  let y;

  function handler(event) {
    x = event.detail.x;
    y = event.detail.y;
  }
</script>

<div use:pan={{delay:300}} on:pan={handler} style="width:500px;height:500px;border:1px solid black;">
  pan: {x} {y}
</div>
```

## Pinch

Pinch action fires `pinch` event: `event.detail.scale`. Initial scale after first two registered points is 1, then it either decrease toward zero as the points get nearer, or grow up as their distance grows.

[> repl Pinch demo](https://svelte.dev/repl/6f6d34e2b4ab420ab4e192a5046c86b4?version=3.38.2)

```html
<script>
  import { pinch } from 'svelte-gestures';
  let scale;

  function handler(event) {
    scale = event.detail.scale;
  }
</script>

<div use:pinch on:pinch={handler} style="width:500px;height:500px;border:1px solid black;">
  pinch scale: {scale}
</div>
```


## Rotate

Rotate action fires `rotate` event: `event.detail.rotation`. Initial rotation after first two registered points is 0, then it either decrease to -180 as the points rotate anticlockwise, or grow up 180 as they rotate clockwise.

`event.detail.rotation` represents angle between -180 and 180 degrees.

[> repl Rotation demo](https://svelte.dev/repl/498077b73d384910825719cd27254f8c?version=3.38.2)

```html
<script>
  import { rotate } from 'svelte-gestures';
  let rotation;

  function handler(event) {
    rotation = event.detail.rotation;
  }
</script>

<div use:rotate on:rotate={handler} style="width:500px;height:500px;border:1px solid black;">
  rotation: {rotation}
</div>
```

## Swipe

Swipe action fires `swipe` event: `event.detail.direction`. It accepts props as parameter: `{ timeframe: number; minSwipeDistance: number }` with default values 300ms and 60px. Swipe is fired if preset distance in propper direction is done in preset time.

`event.detail.direction` represents direction of swipe: 'top' | 'right' | 'bottom' | 'left' 

[> repl Swipe demo](https://svelte.dev/repl/f696ca27e6374f2cab1691727409a31d?version=3.38.2)

```html
<script>
  import { swipe } from 'svelte-gestures';
  let direction;

  function handler(event) {
    direction = event.detail.direction;
  }
</script>

<div use:swipe={{ timeframe: 300, minSwipeDistance: 60 }} on:swipe={handler} style="width:500px;height:500px;border:1px solid black;">
  direction: {direction}
</div>
```

## Tap

Tap action fires `tap` event: `event.detail` has `x` and `y` properties (x,y stand for position withing the `element` on which the action is used).

Tap action is fired only when the click/touch is finished within the give `timeframe`, the parameter is optional and overwrites defalut value of 300ms.

[> repl Tap demo](https://svelte.dev/repl/98ec4843c217499b9dcdd3bf47a706f0?version=3.38.2)

```html
<script>
  import { tap } from 'svelte-gestures';
  
  let x;
  let y;

  function handler(event) {
    x = event.detail.x;
    y = event.detail.y;
  }
</script>

<div use:tap={{ timeframe: 300 }} on:tap={handler} style="width:500px;height:500px;border:1px solid black;">
  tap: {x} {y}
</div>
```

# Custom gestures

You are encouraged to define your own custom gestures. 

## License

[MIT](LICENSE)