import {
	DEFAULT_DELAY,
	DEFAULT_TOUCH_ACTION,
	setPointerControls,
	type Action,
	type BaseParams,
	type GestureCustomEvent,
	type SubGestureFunctions
} from '../../shared';
export type PanParameters = { delay: number } & BaseParams;

export type PanPointerEventDetail = {
	x: number;
	y: number;
	target: EventTarget | null;
	pointerType: string;
};

export type PanCustomEvent = CustomEvent<PanPointerEventDetail>;

export const pan: Action<
	HTMLElement,
	() => Partial<PanParameters>,
	{
		onpan: (e: PanCustomEvent) => void;
		onpandown: (e: GestureCustomEvent) => void;
		onpanup: (e: GestureCustomEvent) => void;
		onpanmove: (e: GestureCustomEvent) => void;
	}
> = (node: HTMLElement, inputParameters?: () => Partial<PanParameters>) => {
	$effect(() => {
		const { onMove, onDown, gestureName, parameters } = panBase(node, inputParameters?.());

		return setPointerControls(
			gestureName,
			node,
			onMove,
			onDown,
			null,
			parameters.touchAction,
			parameters.plugins
		).destroy;
	});
};

export const panComposition = (
	node: HTMLElement,
	inputParameters?: Partial<PanParameters>
): SubGestureFunctions => {
	const { onMove, onDown, parameters } = panBase(node, inputParameters);

	return {
		onMove,
		onDown,
		onUp: null,
		plugins: parameters.plugins
	};
};

function panBase(node: HTMLElement, inputParameters?: Partial<PanParameters>) {
	const parameters: PanParameters = {
		delay: DEFAULT_DELAY,
		composed: false,
		touchAction: DEFAULT_TOUCH_ACTION,
		...inputParameters
	};
	const gestureName = 'pan';

	let startTime: number;
	let target: EventTarget | null;

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
					new CustomEvent<PanPointerEventDetail>(gestureName, {
						detail: { x, y, target, pointerType: event.pointerType }
					})
				);
			}
		}

		return false;
	}

	return { onDown, onMove, gestureName, parameters };
}
