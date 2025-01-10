import {
	DEFAULT_DELAY,
	DEFAULT_MIN_SWIPE_DISTANCE,
	DEFAULT_TOUCH_ACTION,
	setPointerControls,
	type Action,
	type BaseParams,
	type GestureCustomEvent
} from '../../shared';

export type SwipeParameters = {
	timeframe: number;
	minSwipeDistance: number;
	touchAction: string;
} & BaseParams;

export type SwipePointerEventDetail = {
	direction: Direction;
	target: EventTarget | null;
	pointerType: string;
};

type Direction = 'top' | 'right' | 'bottom' | 'left' | null;

export type SwipeCustomEvent = CustomEvent<SwipePointerEventDetail>;

export const swipe: Action<
	HTMLElement,
	() => Partial<SwipeParameters>,
	{
		onswipe: (e: SwipeCustomEvent) => void;
		onswipedown: (e: GestureCustomEvent) => void;
		onswipeup: (e: GestureCustomEvent) => void;
		onswipemove: (e: GestureCustomEvent) => void;
	}
> = (node: HTMLElement, inputParameters?: () => Partial<SwipeParameters>) => {
	$effect(() => {
		const { onDown, onUp, parameters, gestureName } = swipeBase(node, inputParameters?.());
		return setPointerControls(gestureName, node, null, onDown, onUp, parameters.touchAction)
			.destroy;
	});
};

export const swipeComposition = (node: HTMLElement, inputParameters?: Partial<SwipeParameters>) => {
	const { onDown, onUp, parameters } = swipeBase(node, inputParameters);

	return {
		onMove: null,
		onDown,
		onUp,
		plugins: parameters.plugins
	};
};

function swipeBase(node: HTMLElement, inputParameters?: Partial<SwipeParameters>) {
	const parameters: SwipeParameters = {
		timeframe: DEFAULT_DELAY,
		minSwipeDistance: DEFAULT_MIN_SWIPE_DISTANCE,
		touchAction: DEFAULT_TOUCH_ACTION,
		composed: false,
		...inputParameters
	};

	const gestureName = 'swipe';

	let startTime: number;
	let clientX: number;
	let clientY: number;
	let target: EventTarget | null;

	function onDown(activeEvents: PointerEvent[], event: PointerEvent) {
		clientX = event.clientX;
		clientY = event.clientY;
		startTime = Date.now();
		if (activeEvents.length === 1) {
			target = event.target;
		}
	}

	function onUp(activeEvents: PointerEvent[], event: PointerEvent) {
		if (
			event.type === 'pointerup' &&
			activeEvents.length === 0 &&
			Date.now() - startTime < parameters.timeframe
		) {
			const x = event.clientX - clientX;
			const y = event.clientY - clientY;
			const absX = Math.abs(x);
			const absY = Math.abs(y);

			let direction: Direction = null;
			if (absX >= 2 * absY && absX > parameters.minSwipeDistance) {
				// horizontal (by *2 we eliminate diagonal movements)
				direction = x > 0 ? 'right' : 'left';
			} else if (absY >= 2 * absX && absY > parameters.minSwipeDistance) {
				// vertical (by *2 we eliminate diagonal movements)
				direction = y > 0 ? 'bottom' : 'top';
			}
			if (direction) {
				node.dispatchEvent(
					new CustomEvent<SwipePointerEventDetail>(gestureName, {
						detail: { direction, target, pointerType: event.pointerType }
					})
				);
			}
		}
	}
	return { onDown, onUp, parameters, gestureName };
}
