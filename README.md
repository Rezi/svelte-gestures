# svelte-gestures

3 KB gzipped (you can use just part of those 3 KB) - a collection of gesture recognizers for Svelte ;)

### BREAKING CHANGES in svelte-gestures 5.2.1:

- **Now works as Svelte Attachments** (see new example and documentation)
- **Only works with Svelte 5**
- Support for plugins (highlight plugin provided in the library for gesture visualization)
- Multi touch gesture added
- Touch point plugin for pointer highlighting added
- Experimental vibrate plugin added
- There are several **breaking changes** with new API. It changes how parameters are passed to gestures. If you want to follow readme and examples for `svelte-gestures` 5.1.4 and older please follow the old [README_5.1.4.md](README_5.1.4.md)

### Migration

For migration from 5.1.4 or older please follow [CHANGELOG.md](CHANGELOG.md)

## installation

**Npm**
`npm install svelte-gestures`

**Npm Installing from JSR**
`npx jsr add @rezi/svelte-gestures`

**Deno**
`deno add @rezi/svelte-gestures`

Svelte 4 projects should use svelte-gestures version 4, while older Svelte projects should use version 1.5.2 and lower.

## About

It contains the most popular gestures: `pan`, `pinch`, `press`, `rotate`, `swipe`, `tap`, `multitouch`. Besides that, it comes with `shapeGesture` which helps with the recognition of custom shapes declared by a set of x and y coordinates.

Library **support additional plugins** which can add extra functionality to gestures. Currently there are `highlight` and `touch-point` gestures plugins for gesture visualization and experimental `vibrate` gesture for haptic feedback on mobile devices (works rather badly in most of browsers and phones)

It also exposes a generic event handling core, which can be extended for your specific gesture implementation (see source code on how gestures are implemented).
Besides above mentioned gestures, there are two more: `composedGesture` and `scroll` gestures:

1. The `composedGesture` let you combine more gestures while using just one pointer EventListener per element. It also lets users switch active gestures on the fly.
2. `scroll` is a custom basic implementation of scrolling for touch devices. It is needed, as by default, when a gesture mode is activated on an Element on a touch device, browser scrolling is turned off for that Element. Unfortunately, the gesture mode needs to be set before the first touch/click is done and cannot be changed while there are active pointers. The `scroll` gesture is made to work with the `composedGesture`.

It uses pointer events under the hood, to make it cross-platform. Gestures will be recognized if done by mouse, touch, stylus etc.

Recognizers are kept as simple as possible but still provide desired basic functionality. They are made in the form of svelte attachments with custom event emitters. **Any number of different recognizers can be used on one element**, but it is recommended to use `useComposedGesture` attachment for combined gestures.

## Usage example

```html
<script lang="ts">
	import { useSwipe, type SwipeCustomEvent, type GestureCustomEvent } from 'svelte-gestures';
	let direction: string | null = $state(null);
	let pointerType: string = $state('');;
	let target: HTMLElement | null = $state(null);;

	function handler(event: SwipeCustomEvent) {
		direction = event.detail.direction;
		pointerType = event.detail.pointerType;
		target = event.detail.target as HTMLElement;
	}
</script>
<section
	{...useSwipe(handler, () => ({ timeframe: 300, minSwipeDistance: 50, touchAction: 'none' }))}>
		<div>swipe direction: {direction}</div>
		<div>pointerType {pointerType}</div>
		<div>target: {target?.tagName}</div>
</section>
```

For complete code example (including `up`, `down` and `move` handlers) see [REPL example of swipe gesture](https://svelte.dev/playground/516febec0d1d4fd5a5a5b9c95bf27536?version=latest)

## API events

Except for the main event, each recognizer triggers, three more events with names composed of gesture name (`pan` | `pinch` | `tap` | `swipe` | `rotate` | `shapeGesture` | `composedGesture`) and event type (`up` | `down` | `move`).

For example `usePan` attachment has for example `onpanup`, `onpandown`, `onpanmove`. It dispatches `event.detail` with the following property

```ts
{
  event: PointerEvent,
  pointersCount: number ,
  target:HTMLElement,
  x: number,
  y: number,
  attachmentNode: HTMLElement;
}
```

You can import this event type as `GestureCustomEvent`.

- `event` a native pointer event; the
- `pointersCount` is the number of active pointers;
- `target` is the target Element on which the gesture started (it can be a child of the element on which a gesture is applied).
- `x` and `y` refer to coordinates within the gesture element.
- `attachmentNode` is the element on which the attachment is applied

## Gesture arguments

All basic gestures follow the same pattern. A gesture attachment starts with **use** for instance **usePan**, it accept 3 arguments:

1. Handler for the gesture main event.Handle is triggered when pan gesture is recognized
2. A function which returns gesture options object. The function wrapper allow the options to be changed on the fly.
3. Object with three extra event handles. In case of pan gesture Object with `onpanup`, `onpandown`, `onpanmove` properties which hold handler functions for those events.
4. isRaw `boolean`. Defaults to `false`. If set to `true`, the usePan function returns the main pan function in form under property name `pan` instead of regular attachment key (`createAttachmentKey()`). It is useful when `@attach` syntax i needed like on `svelte:body` element on which spread properties are not allowed. Also can be handy for attaching handler programmatically by addEventListener().

Example for `isRaw` true.

```ts
<script lang="ts">
...

const { swipe, onswipe, onswipedown, onswipemove, onswipeup } = useSwipe(
  handler,
  () => ({ timeframe: 300, minSwipeDistance: 50, touchAction: 'none' }),
  {
    onswipemove: moveHandler,
    onswipeup: upHandler,
    onswipedown: downHandler
  },
  true
);
</script>

<svelte:body {@attach swipe} {onswipe} {onswipedown} {onswipemove} {onswipeup} />
```

## Pan

Pan attachment (usePan) fires `PanCustomEvent` event:

- `event.detail` object has the following properties
  - `x`, `y` (x,y stand for position within the `element`` on which the action is used)
  - `target` is an EventTarget (HTMLElement) of the pan. The target is recorded when the pan starts.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `usePan` accepts the following options

- `delay` (default value is 300ms)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, to leave handling of some touch actions to the browser; see [`touch-action` on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action). You can pass an array, the values will be joined with spaces.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

pan gesture is triggered on the pointer (mouse, touch, etc.) move. But not earlier than `delay` parameter.

[> REPL Pan demo](https://svelte.dev/playground/d428fc718d5b4961aec00c5805d7a9b2?version=5.38.10)

## Pinch

Pinch attachment (usePinch) fires `pinch` event:

- `event.detail` object has following properties
  - `center`: {x:number; y:number;}
    - `x` and `y` represent coordinates in `px` of an imaginary center of the pinch gesture. They originate in the top left corner of the element on which pinch is used.
  - `scale`: number. The initial scale after the first two registered points is 1, then it either decreases toward zero as the points get nearer, or grow up as their distance grows.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `pinch` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

[> REPL Pinch demo](https://svelte.dev/playground/f4b41023122648b9bb4220757011fab2?version=5.38.10)

## Rotate

Rotate attachment (useRotate) fires `rotate` event:

- `event.detail` object has the following properties
  - `center`: {x:number; y:number;}
    - `x` and `y` represent coordinates in `px` of an imaginary center of the rotation gesture. They originate in the top left corner of the element on which rotation is used.
  - `rotation`: number. Initial rotation after the first two registered points is 0, then it either decreases to -180 as the points rotate anti-clockwise or grows up to 180 as they rotate clockwise.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `rotate` accepts the following options

- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

[> REPL Rotation demo](https://svelte.dev/playground/73fa7558e3e74961b1f880e61bf8c230?version=latest)

## Swipe

Swipe attachment (useSwipe) fires `swipe` event:

- `event.detail` object has following properties
  - `direction`: 'top' | 'right' | 'bottom' | 'left'
  - `target`: HTMLElement. The target is recorded when swipe starts.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `swipe` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `minSwipeDistance`: number (default value is *60*px)
- `touchAction` (defaults value is `none`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

Swipe is fired if the preset distance in the proper direction is done in the preset time.

You can use the [touchAction](https://developer.mozilla.org/en/docs/Web/CSS/touch-action) parameter to control the default behavior of the browser.

For example, if you only use left/right swipe and want to keep the default browser behavior (scrolling) for up/down swipe use `touchAction: 'pan-y'`.

[> REPL Swipe demo](https://svelte.dev/playground/516febec0d1d4fd5a5a5b9c95bf27536?version=latest)

## Tap

Tap is activated once pointer is released withing a timeframe

Tap attachment (useTap) fires `tap` event:

- `event.detail` object has the following properties
  - `x`: number. X coordinate
  - `y`: number. Y coordinate
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.

The `tap` accepts the following options

- `timeframe`:number (default value is *300*ms )
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

Tap action is fired only when the click/touch is finished within the given `timeframe`.

[> REPL Tap demo](https://svelte.dev/playground/9f866512984c4fa589f67db4570e77e1?version=5.38.10)

## Press

Press event is activated once pointer is down for certain time

Press attachment (usePress) fires `press` event:

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
- `plugins` os an array of plugins to be applied

Press action is fired only when the click/touch is released after the given `timeframe`. Or when `triggerBeforeFinished` is set to `true`, after given `timeframe` even when click/touch continues.

[> REPL Press demo](https://svelte.dev/playground/fc5c6e4fcaed4d41983c56b125299954?version=latest)

## Multitouch

Press attachment (useMultiTouch) fires `multiTouch` event:

- `event.detail` object has the following properties
  - `x`: number. X coordinate (center of the multitouch)
  - `y`: number. Y coordinate (center of the multitouch)
  - `target`: HTMLElement.
  - `pointerType`: 'touch' | 'mouse' | 'pen'.
  - `coords`: Array<{x:number; y:number;}>
    - `x` and `y` coordinates in `px` of all touch points. They originate in the top left corner of the element on which multiTouch is used.

The `multiTouch` accepts the following options

- `touchCount`:number (defaults to 2) How many pointer events are needed to trigger the multiTouch event
- `touchAction` (defaults value is `auto`) Apply css _touch-action_ style, letting the browser know which type of gesture is controlled by the browser and your program respectively.
- `composed` is only applicable when used inside `composedGesture`.
- `plugins` os an array of plugins to be applied

[> REPL Multitouch](https://svelte.dev/playground/f68a93d2f9a84d029541261911f335d3?version=5.38.10)

## Shape gesture

ShapeGesture attachment (useShapeGesture) fires `shapeGesture` event:

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
- `plugins` os an array of plugins to be applied

`shapeGesture` event is fired only when the click/touch is finished within the given `timeframe` and gesture similarity is above the `threshold`

##### Tips and hints

1. When defining points in a shape, beware that the coordinates system is same as for SVG. **x increases toward right** and **y increases toward bottom** !!
2. `shapeGesture` can accept more shapes at once. It's not only handy to recognize more gestures, but can be used to define more similar shapes with same `name`. For instance if you need to recognize a triangle shape, it is preferable to define several slightly different triangles with same name, rather than defining one triangle shape and lowering the `threshold`.
3. You don't need to care about scale of your shapes, they are always scaled automatically for gesture/shape comparison.
4. When `bothDirections` is set to false, order of points matters, even if the shape is closed (circle, square, etc)

[> REPL ShapeGesture demo](https://svelte.dev/playground/755c187e795c47039f16d429c101cfec?version=latest)

## Composed Gesture

`composedGesture` is a special gesture, which does not listen to any gesture of its own. It rather gives you the power of composing gestures together or switching gestures while a gesture is recorded.

##### Usage

To use `composedGesture`, you need to pass a function definition to the `useComposedGesture`. The function definition should have the following signature:

- `(register: RegisterFnType) => (activeEvents: PointerEvent[], event: PointerEvent) => boolean`

The `register` parameter is a callback function provided by `composedGesture`

Within the function body, you can call the `register` function to add different gestures to the composed gestures. The `register` function accepts two arguments: the first argument is the gesture you want to register, and the second argument is an options object for the gesture.

You can register multiple gestures using the `register` function, and each call to `register` returns an object with `onDown`, `onMove`, and `onUp` properties. The `onDown` and `onUp` functions are automatically executed by `composedGesture`, while the `onMove` function needs to be explicitly triggered by returning a callback function from the option function. This callback function should run all the necessary `onMove` functions for the gestures. You can implement your logic to determine which gesture to execute under which conditions.

##### Example: panning combined with scrolling

Let's use `pan` gesture, but only after the press gesture has been successfully triggered; otherwise, we will trigger the special `scroll` gesture which mimics the default scroll behavior (it is needed, because default scrolling need to be disabled on elements where any kind of swiping gesture is done). The result will be, that a fast swipe over the element will let the user scroll thru as normal, while a move initiated with 100ms press, will end up with panning.

You can see in the repl that there are registered 3 basic gestures and their onMove function is called based on our defined logic. The trick is that every base gesture returns `true` from its onMove function when the gesture's main event has been triggered (most of gestures trigger main event after onUp, but for instance `press` gesture can trigger before release. We are leveraging that fact in the composed gesture example)

[> REPL ComposedGesture demo](https://svelte.dev/playground/7fe83c2f2f604f2b9325e58c6f3f4e46?version=latest)

# Plugins

You can pass plugin as parameter to a build in gesture to enhance the gesture functionality. Currently `svelte-gestures` library provides `highlight` and `touch-point` gestures plugins for gesture visualization and experimental `vibrate` gesture for haptic feedback on mobile devices (works rather badly in most of browsers and phones).

Plugin is kind of a side effect to a gesture. You cannot modify a gesture by plugin. Plugin is meant for visual/audio/haptic enhancement of a gesture.

You are encouraged to create your own plugins. Just follow the source code of the highlight gesture.

Plugin is a function which accepts options as only argument and returns object with following signature:

```ts
{
    onMove: PluginEventCallback;
    onDown: PluginEventCallback;
    onUp: PluginEventCallback;
    onDestroy?: () => void;
    onInit?: (activeEvents: PointerEvent[]) => void;
}
```

## Highlight plugin

Leaves fading out trace after pointers. If multiple pointers are highlighted they are all connected by lines

In the following example the plugin options are used in form of $state which enable them to change after each use. On pan up event we simply change the highlighter color to random one.

Highlight plugin options:

```ts
{
  color?: string;
  fadeTime?: number;
  zIndex?: number;
  lineWidth?: number;
}
```

[> REPL Highlight plugins demo](https://svelte.dev/playground/3489ba2605254436853e0c0130eb160e?version=latest)

## Touch points plugin

Show colored circles around touch points.

Touch points plugin options:

```ts
{
  color?: string;
  zIndex?: number;
  size?: number;
}
```

[> REPL Touch points plugins demo](https://svelte.dev/playground/1eeafbd250eb4a8899d7f9e432d2ad57?version=latest)

## Vibrate plugin (experimental)

Vibrate a haptic sequence while gesture is executed

Vibrate plugin options:

```ts
{
  vibrationSequence: number[];
}
```

Vibration sequence is the same as the argument of [navigator.vibrate](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate) function.

[> REPL Vibrate plugins demo](https://svelte.dev/playground/8d3bd627beb046009a02f6c907d27eb7?version=latest)

# Your own gestures

You are encouraged to define your own custom gestures. There is a `createPointerControls` function exposed by the `svelte-gestures`. It handles all the events registration/deregistration needed for handling gestures.
It is a closure which returns a `setPointerControls` function.

Your custom attachment needs to return this `setPointerControls` function. You need to pass your own callbacks to it, which makes it your unique gesture. See source code of basic gestures to better understand how to create your won one.

```typescript
function setPointerControls: (
  gestureName: string,
  node: HTMLElement,
  onMoveCallback: PointerEventCallback<boolean>,
  onDownCallback: PointerEventCallback<void>,
  onUpCallback: PointerEventCallback<void>,
  touchAction?: TouchAction | TouchAction[],
  pluginsArg?: GesturePlugin[]
) => {
  destroy: () => void;
};
```

You can pass `null` instead of a `PointerEventCallback` if you don't need to call it in that event. In a double tap example below you do not need any events related to move, as they are irrelevant for tapping.

See how an example doubletap gesture is implemented:

[> REPL Custom gesture (doubletap) demo](https://svelte.dev/playground/6733e5e424fc4863b412717790c3e68b?version=latest)

## License

[MIT](LICENSE)
