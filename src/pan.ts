'use strict';

import { DEFAULT_DELAY, setPointerControls } from './shared';

export function pan(
	node: HTMLElement,
	parameters: { delay: number } = { delay: DEFAULT_DELAY }
): { destroy: () => void } {
	const gestureName = 'pan';

	let startTime: number;
	let target: EventTarget;

	function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
		startTime = Date.now();
		target = event.target;
	}

	function onMove(activeEvents: PointerEvent[], event: PointerEvent) {
		if (activeEvents.length === 1 && Date.now() - startTime > parameters.delay) {
			const rect = node.getBoundingClientRect();
			const x = Math.round(event.clientX - rect.left);
			const y = Math.round(event.clientY - rect.top);
			if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
				node.dispatchEvent(
					new CustomEvent(gestureName, {
						detail: { x, y, target }
					})
				);
			}
		}
	}

	return setPointerControls(gestureName, node, onMove, onDown, null);
}
