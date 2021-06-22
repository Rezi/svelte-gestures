# Changelog

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
