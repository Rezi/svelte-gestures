# Changelog

## 1.0.2

* **Default swipe distance** decreased from `100px` to `60px`
* API events added to the documentation
* `pointerup` in the lib core is now replaced with `lostpointercapture`. It should fix cases where pointerup event has never been called, because of triggering context menu on touch dektop, changing browser tab in middle of swipe etc.
* Improved documentation

## 1.0.0

* Initial release