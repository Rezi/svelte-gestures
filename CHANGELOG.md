# Changelog

## 5.0.4

- Stricter type checking added: 
  - strictNullChecks
  - strictFunctionTypes
  - strictBindCallApply
  - strictPropertyInitialization

## 5.0.3

- `x` and `y` added to event detail of up, down and move events
  - Fix for related `GestureCustomEvent` types.

## 5.0.2

- Fixed typescript types for CustomEvents

## 5.0.1

- Added typescript types for CustomEvents
- Support for Svelte 5 syntax, while keeping the old as well. You can use `on:pan` as well as `onpan` now.

## 4.0.2 (only released in JSR)

Fixed missing return type
Support for JSR repository

## 4.0.0

To keep versioning according to Svelte itself, I am moving to version 4 straight away.
The new version supports correct typing for Svelte 4 (while Svelte 3's namespace is svelte.JSX, Svelte 4 uses svelteHTML)
Support for multiple touch-action values added. You can now pass touchAction also as an array.
Thanks to xpengy and ewen-lbh for their contribution.

## 1.5.

Types fix for usage in svelte templates (no params are no required)

## 1.5.1

Types fix for usage in svelte templates

## 1.5.0

- New `composedGesture` lets you combine gestures. You can even use it to maintain scrolling behavior on elements with `pan` or `shapeGesture` (see example below)
- New `shapeGesture` lets you define shape/s to be recognized. Just define shapes by coordinates.
- Bugfixes

## 1.4.1

Press gesture now accepts `triggerBeforeFinished` option. By default, it is set `false`. If set to true, press event is triggered after the given `timeframe`, even if a user still keeps pressing.

## 1.3.8

Documentation added for how to use JSX types (used by language tools to recognize return types of functions returned by svelte HTML markup (on:action etc))

## 1.3.7

Types for svelte language tools added

## 1.3.2

`press` gesture now preventDefault on contextmenu of its element and also adds `style.userSelect = 'none';`

Bug resolved for case when `swipe` gesture reported wrong directions if used on scrollable area.

## 1.3.1

Removing move listener when user leave active element.
When the move capture on active element is lost, `activeEvents` are set to [] and `up` event is triggered.

## 1.3.0

Added `press` gesture.
Gestures `press`, `tap`, `swipe`, `pan` now also emit `target:EventTarget` in the event detail.

## 1.2.2

Fixed TS types location

## 1.2.0

`rotate` and `pinch` actions emit center coordinates of the gesture.

## 1.1.0

Core lib function `setPointerControls` now accept argument, by which one can manually set `touch-action` css property. It is not used in swipe recogniser.

## 1.0.6

- `pointerup` added back alongside `lostpointercapture` so mouse clicks are handled correctly.

## 1.0.2

- **Default swipe distance** decreased from `100px` to `60px`.
- API events added to the documentation.
- `pointerup` in the lib core is now replaced with `lostpointercapture`. It should fix cases where pointerup event has never been called, because of triggering context menu on touch dektop, changing browser tab in middle of swipe etc.
- Custom Gesture implementation example added to the documentation.

## 1.0.1

- Improved documentation

## 1.0.0

- Initial release
